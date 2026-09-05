import mysql from "mysql2/promise";
import { Shop, ShopMenuItem, ShopCategory } from "@/types/shop";
import { DEFAULT_SHOPS } from "@/data/default-shops";

const DB_HOST = process.env.MYSQL_HOST || "localhost";
const DB_PORT = parseInt(process.env.MYSQL_PORT || "3306", 10);
const DB_USER = process.env.MYSQL_USER || "root";
const DB_PASSWORD = process.env.MYSQL_PASSWORD ?? "";
const DB_NAME = process.env.MYSQL_DATABASE || "digitalmenu";
const USE_SSL = process.env.MYSQL_SSL === "true" || DB_HOST.includes("tidbcloud.com");

const sslConfig = USE_SSL ? { minVersion: "TLSv1.2", rejectUnauthorized: true } : undefined;

let pool: mysql.Pool | null = null;
let isInitialized = false;

// Get or initialize MySQL connection pool
export function getDbPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      ssl: sslConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

// Auto-provision MySQL Database, Tables & Initial Seed
export async function ensureDatabaseAndTables(): Promise<void> {
  if (isInitialized) return;

  try {
    // Connect directly with Pool
    const db = getDbPool();

    // 1. Shops Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`shops\` (
        \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`tagline\` VARCHAR(255) NOT NULL,
        \`owner_name\` VARCHAR(255) DEFAULT '',
        \`phone\` VARCHAR(50) NOT NULL,
        \`timings\` VARCHAR(255) NOT NULL,
        \`established_year\` VARCHAR(20) DEFAULT '2021',
        \`cuisine_type\` VARCHAR(100) NOT NULL,
        \`theme\` VARCHAR(50) DEFAULT 'emerald',
        \`features\` JSON,
        \`is_deleted\` TINYINT(1) DEFAULT 0,
        \`visitors_count\` INT DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Auto-migrate columns if they don't exist
    try {
      await db.query("ALTER TABLE `shops` ADD COLUMN `is_deleted` TINYINT(1) DEFAULT 0;");
    } catch (_) { }
    try {
      await db.query("ALTER TABLE `shops` ADD COLUMN `visitors_count` INT DEFAULT 0;");
    } catch (_) { }

    // 2. Categories Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`categories\` (
        \`id\` VARCHAR(100) NOT NULL,
        \`shop_id\` VARCHAR(100) NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`description\` TEXT,
        \`order_index\` INT DEFAULT 0,
        PRIMARY KEY (\`id\`, \`shop_id\`),
        INDEX idx_shop_cat (\`shop_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Menu Items Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`menu_items\` (
        \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
        \`shop_id\` VARCHAR(100) NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`description\` TEXT,
        \`price\` DECIMAL(10,2) NOT NULL,
        \`category_id\` VARCHAR(100) NOT NULL,
        \`image\` VARCHAR(1000) DEFAULT '',
        \`is_veg\` TINYINT(1) DEFAULT 1,
        \`is_bestseller\` TINYINT(1) DEFAULT 0,
        \`is_spicy\` TINYINT(1) DEFAULT 0,
        \`is_chef_special\` TINYINT(1) DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_shop_items (\`shop_id\`),
        INDEX idx_category (\`category_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Shop Visitors Table (Unique Browser Deduplication)
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`shop_visitors\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`shop_id\` VARCHAR(100) NOT NULL,
        \`visitor_hash\` VARCHAR(255) NOT NULL,
        \`ip_address\` VARCHAR(100) DEFAULT '',
        \`user_agent\` VARCHAR(500) DEFAULT '',
        \`visited_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY idx_shop_unique_vis (\`shop_id\`, \`visitor_hash\`),
        INDEX idx_shop_vis (\`shop_id\`),
        CONSTRAINT fk_visitors_shop FOREIGN KEY (\`shop_id\`) REFERENCES \`shops\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Step 3: Check if shops table is empty, if so, seed DEFAULT_SHOPS
    const [rows] = await db.query<mysql.RowDataPacket[]>("SELECT COUNT(*) as count FROM \`shops\`");
    const count = rows[0]?.count || 0;

    if (count === 0) {
      console.log("Seeding default Indian shops to MySQL database...");
      for (const shop of DEFAULT_SHOPS) {
        await insertFullShop(shop);
      }
      console.log("Seeding to MySQL completed successfully!");
    }

    isInitialized = true;
  } catch (error) {
    console.error("MySQL Database initialization error:", error);
    throw error;
  }
}

// Helper to insert a full shop with its categories and items
async function insertFullShop(shop: Shop) {
  const db = getDbPool();

  // Insert shop
  await db.query(
    `INSERT INTO \`shops\` (\`id\`, \`name\`, \`tagline\`, \`owner_name\`, \`phone\`, \`timings\`, \`established_year\`, \`cuisine_type\`, \`theme\`, \`features\`)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`), \`tagline\` = VALUES(\`tagline\`)`,
    [
      shop.id,
      shop.name,
      shop.tagline,
      shop.ownerName || "",
      shop.phone,
      shop.timings,
      shop.establishedYear || "2021",
      shop.cuisineType,
      shop.theme || "emerald",
      JSON.stringify(shop.features || []),
    ]
  );

  // Batch INSERT categories (one round-trip instead of N)
  if (shop.categories.length > 0) {
    const catPlaceholders = shop.categories.map(() => "(?, ?, ?, ?, ?)").join(", ");
    const catValues: any[] = [];
    shop.categories.forEach((cat, i) => {
      catValues.push(cat.id, shop.id, cat.name, cat.description || "", i);
    });
    await db.query(
      `INSERT INTO \`categories\` (\`id\`, \`shop_id\`, \`name\`, \`description\`, \`order_index\`)
       VALUES ${catPlaceholders}
       ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`)`,
      catValues
    );
  }

  // Batch INSERT items (one round-trip instead of N)
  if (shop.items.length > 0) {
    const itemPlaceholders = shop.items.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ");
    const itemValues: any[] = [];
    for (const item of shop.items) {
      itemValues.push(
        item.id, shop.id, item.name, item.description, item.price,
        item.category, item.image,
        item.isVeg ? 1 : 0,
        item.isBestseller ? 1 : 0,
        item.isSpicy ? 1 : 0,
        item.isChefSpecial ? 1 : 0,
      );
    }
    await db.query(
      `INSERT INTO \`menu_items\` (\`id\`, \`shop_id\`, \`name\`, \`description\`, \`price\`, \`category_id\`, \`image\`, \`is_veg\`, \`is_bestseller\`, \`is_spicy\`, \`is_chef_special\`)
       VALUES ${itemPlaceholders}
       ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`), \`price\` = VALUES(\`price\`)`,
      itemValues
    );
  }
}

// 1. Get all shops with nested categories and items from MySQL
export async function getAllShopsFromDb(): Promise<Shop[]> {
  await ensureDatabaseAndTables();
  const db = getDbPool();

  const [shopRows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT * FROM `shops` ORDER BY `created_at` ASC"
  );
  const [catRows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT * FROM `categories` ORDER BY `order_index` ASC"
  );
  const [itemRows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT * FROM `menu_items` ORDER BY `created_at` DESC"
  );

  return shopRows.map((s) => {
    let features: string[] = [];
    try {
      features = typeof s.features === "string" ? JSON.parse(s.features) : s.features || [];
    } catch {
      features = [];
    }

    const shopCategories: ShopCategory[] = catRows
      .filter((c) => c.shop_id === s.id)
      .map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description || "",
      }));

    const shopItems: ShopMenuItem[] = itemRows
      .filter((i) => i.shop_id === s.id)
      .map((i) => ({
        id: i.id,
        name: i.name,
        description: i.description || "",
        price: Number(i.price),
        category: i.category_id,
        image: i.image || "",
        isVeg: Boolean(i.is_veg),
        isBestseller: Boolean(i.is_bestseller),
        isSpicy: Boolean(i.is_spicy),
        isChefSpecial: Boolean(i.is_chef_special),
      }));

    return {
      id: s.id,
      name: s.name,
      tagline: s.tagline,
      ownerName: s.owner_name || "",
      phone: s.phone,
      timings: s.timings,
      establishedYear: s.established_year || "2021",
      cuisineType: s.cuisine_type,
      theme: s.theme || "emerald",
      features,
      categories: shopCategories,
      items: shopItems,
      createdAt: s.created_at ? new Date(s.created_at).toISOString() : new Date().toISOString(),
      isDeleted: Boolean(s.is_deleted),
      visitorsCount: Number(s.visitors_count || 0),
    };
  });
}

// 2. Get single shop by ID — direct targeted queries (no full table scan)
export async function getShopFromDb(shopId: string): Promise<Shop | null> {
  await ensureDatabaseAndTables();
  const db = getDbPool();

  const [shopRows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT * FROM `shops` WHERE `id` = ? LIMIT 1",
    [shopId]
  );
  if (!shopRows || shopRows.length === 0) return null;

  const s = shopRows[0];

  const [catRows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT * FROM `categories` WHERE `shop_id` = ? ORDER BY `order_index` ASC",
    [shopId]
  );

  const [itemRows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT * FROM `menu_items` WHERE `shop_id` = ? ORDER BY `created_at` DESC",
    [shopId]
  );

  let features: string[] = [];
  try {
    features = typeof s.features === "string" ? JSON.parse(s.features) : s.features || [];
  } catch {
    features = [];
  }

  return {
    id: s.id,
    name: s.name,
    tagline: s.tagline,
    ownerName: s.owner_name || "",
    phone: s.phone,
    timings: s.timings,
    establishedYear: s.established_year || "2021",
    cuisineType: s.cuisine_type,
    theme: s.theme || "emerald",
    features,
    categories: (catRows as mysql.RowDataPacket[]).map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description || "",
    })),
    items: (itemRows as mysql.RowDataPacket[]).map((i) => ({
      id: i.id,
      name: i.name,
      description: i.description || "",
      price: Number(i.price),
      category: i.category_id,
      image: i.image || "",
      isVeg: Boolean(i.is_veg),
      isBestseller: Boolean(i.is_bestseller),
      isSpicy: Boolean(i.is_spicy),
      isChefSpecial: Boolean(i.is_chef_special),
    })),
    createdAt: s.created_at ? new Date(s.created_at).toISOString() : new Date().toISOString(),
    isDeleted: Boolean(s.is_deleted),
    visitorsCount: Number(s.visitors_count || 0),
  };
}

// 3. Create a new shop in MySQL
export async function createShopInDb(
  shopData: Omit<Shop, "id" | "createdAt" | "items"> & { id?: string; initialItems?: ShopMenuItem[] }
): Promise<Shop> {
  await ensureDatabaseAndTables();
  const db = getDbPool();

  const uniqueId = shopData.id?.trim() || `SHP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const newShop: Shop = {
    ...shopData,
    id: uniqueId,
    items: shopData.initialItems || [],
    createdAt: new Date().toISOString(),
    isDeleted: false,
    visitorsCount: 0,
  };

  await insertFullShop(newShop);
  return newShop;
}

// 4. Update shop details in MySQL
export async function updateShopInDb(shopId: string, data: Partial<Shop>): Promise<void> {
  await ensureDatabaseAndTables();
  const db = getDbPool();

  const fields: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) { fields.push("`name` = ?"); values.push(data.name); }
  if (data.tagline !== undefined) { fields.push("`tagline` = ?"); values.push(data.tagline); }
  if (data.ownerName !== undefined) { fields.push("`owner_name` = ?"); values.push(data.ownerName); }
  if (data.phone !== undefined) { fields.push("`phone` = ?"); values.push(data.phone); }
  if (data.timings !== undefined) { fields.push("`timings` = ?"); values.push(data.timings); }
  if (data.cuisineType !== undefined) { fields.push("`cuisine_type` = ?"); values.push(data.cuisineType); }
  if (data.establishedYear !== undefined) { fields.push("`established_year` = ?"); values.push(data.establishedYear); }
  if (data.theme !== undefined) { fields.push("`theme` = ?"); values.push(data.theme); }
  if (data.features !== undefined) { fields.push("`features` = ?"); values.push(JSON.stringify(data.features)); }
  if (data.isDeleted !== undefined) { fields.push("`is_deleted` = ?"); values.push(data.isDeleted ? 1 : 0); }

  if (fields.length > 0) {
    values.push(shopId);
    await db.query(`UPDATE \`shops\` SET ${fields.join(", ")} WHERE \`id\` = ?`, values);
  }
}

// 5. Soft Delete shop from MySQL
export async function softDeleteShopInDb(shopId: string): Promise<void> {
  await ensureDatabaseAndTables();
  const db = getDbPool();
  await db.query("UPDATE `shops` SET `is_deleted` = 1 WHERE `id` = ?", [shopId]);
}

// 6. Restore shop from MySQL
export async function restoreShopInDb(shopId: string): Promise<void> {
  await ensureDatabaseAndTables();
  const db = getDbPool();
  await db.query("UPDATE `shops` SET `is_deleted` = 0 WHERE `id` = ?", [shopId]);
}

// 7. Record Unique Real-time Shop Visitor (Deduplicated per browser)
export async function recordUniqueShopVisitorInDb(
  shopId: string,
  visitorHash: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ count: number; isNewVisitor: boolean }> {
  await ensureDatabaseAndTables();
  const db = getDbPool();

  // Attempt to insert unique visitor (ignores duplicate visitor_hash for this shop)
  const [insertResult] = await db.query<mysql.ResultSetHeader>(
    `INSERT IGNORE INTO \`shop_visitors\` (\`shop_id\`, \`visitor_hash\`, \`ip_address\`, \`user_agent\`)
     VALUES (?, ?, ?, ?)`,
    [shopId, visitorHash, ipAddress || "", userAgent || ""]
  );

  const isNewVisitor = insertResult.affectedRows > 0;

  if (isNewVisitor) {
    // Atomic increment — one query, no correlated subquery scan
    await db.query(
      "UPDATE `shops` SET `visitors_count` = `visitors_count` + 1 WHERE `id` = ?",
      [shopId]
    );
  }

  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT `visitors_count` FROM `shops` WHERE `id` = ?",
    [shopId]
  );

  return {
    count: Number(rows[0]?.visitors_count || 0),
    isNewVisitor,
  };
}

// 8. Hard Delete shop from MySQL
export async function deleteShopInDb(shopId: string): Promise<void> {
  await ensureDatabaseAndTables();
  const db = getDbPool();

  await db.query("DELETE FROM `menu_items` WHERE `shop_id` = ?", [shopId]);
  await db.query("DELETE FROM `categories` WHERE `shop_id` = ?", [shopId]);
  await db.query("DELETE FROM `shops` WHERE `id` = ?", [shopId]);
}

// 6. Add dish to MySQL
export async function addItemInDb(shopId: string, itemData: Omit<ShopMenuItem, "id">): Promise<ShopMenuItem> {
  await ensureDatabaseAndTables();
  const db = getDbPool();

  const itemId = `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newItem: ShopMenuItem = {
    ...itemData,
    id: itemId,
  };

  await db.query(
    `INSERT INTO \`menu_items\` (\`id\`, \`shop_id\`, \`name\`, \`description\`, \`price\`, \`category_id\`, \`image\`, \`is_veg\`, \`is_bestseller\`, \`is_spicy\`, \`is_chef_special\`)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newItem.id,
      shopId,
      newItem.name,
      newItem.description,
      newItem.price,
      newItem.category,
      newItem.image,
      newItem.isVeg ? 1 : 0,
      newItem.isBestseller ? 1 : 0,
      newItem.isSpicy ? 1 : 0,
      newItem.isChefSpecial ? 1 : 0,
    ]
  );

  return newItem;
}

// 7. Update dish in MySQL
export async function updateItemInDb(itemId: string, itemData: Partial<ShopMenuItem>): Promise<void> {
  await ensureDatabaseAndTables();
  const db = getDbPool();

  const fields: string[] = [];
  const values: any[] = [];

  if (itemData.name !== undefined) { fields.push("`name` = ?"); values.push(itemData.name); }
  if (itemData.description !== undefined) { fields.push("`description` = ?"); values.push(itemData.description); }
  if (itemData.price !== undefined) { fields.push("`price` = ?"); values.push(itemData.price); }
  if (itemData.category !== undefined) { fields.push("`category_id` = ?"); values.push(itemData.category); }
  if (itemData.image !== undefined) { fields.push("`image` = ?"); values.push(itemData.image); }
  if (itemData.isVeg !== undefined) { fields.push("`is_veg` = ?"); values.push(itemData.isVeg ? 1 : 0); }
  if (itemData.isBestseller !== undefined) { fields.push("`is_bestseller` = ?"); values.push(itemData.isBestseller ? 1 : 0); }
  if (itemData.isSpicy !== undefined) { fields.push("`is_spicy` = ?"); values.push(itemData.isSpicy ? 1 : 0); }
  if (itemData.isChefSpecial !== undefined) { fields.push("`is_chef_special` = ?"); values.push(itemData.isChefSpecial ? 1 : 0); }

  if (fields.length > 0) {
    values.push(itemId);
    await db.query(`UPDATE \`menu_items\` SET ${fields.join(", ")} WHERE \`id\` = ?`, values);
  }
}

// 8. Delete dish from MySQL
export async function deleteItemInDb(itemId: string): Promise<void> {
  await ensureDatabaseAndTables();
  const db = getDbPool();

  await db.query("DELETE FROM `menu_items` WHERE `id` = ?", [itemId]);
}

// 9. Add category to MySQL
export async function addCategoryInDb(shopId: string, category: ShopCategory): Promise<void> {
  await ensureDatabaseAndTables();
  const db = getDbPool();

  await db.query(
    `INSERT INTO \`categories\` (\`id\`, \`shop_id\`, \`name\`, \`description\`)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`)`,
    [category.id, shopId, category.name, category.description || ""]
  );
}

// 10. Delete category from MySQL
export async function deleteCategoryInDb(shopId: string, categoryId: string): Promise<void> {
  await ensureDatabaseAndTables();
  const db = getDbPool();

  await db.query("DELETE FROM `menu_items` WHERE `shop_id` = ? AND `category_id` = ?", [shopId, categoryId]);
  await db.query("DELETE FROM `categories` WHERE `shop_id` = ? AND `id` = ?", [shopId, categoryId]);
}
