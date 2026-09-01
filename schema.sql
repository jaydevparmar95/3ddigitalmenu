-- ==============================================================================
-- 3D Digital Menu - Complete MySQL Database Schema & Seed Script
-- Compatible with MySQL 8.0+, MariaDB, AWS TiDB Cloud, and PlanetScale
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `digitalmenu` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `digitalmenu`;

-- Drop existing tables if re-initializing
DROP TABLE IF EXISTS `menu_items`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `shops`;

-- ------------------------------------------------------------------------------
-- 1. Table Structure for `shops`
-- ------------------------------------------------------------------------------
CREATE TABLE `shops` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `tagline` VARCHAR(255) NOT NULL,
  `owner_name` VARCHAR(255) DEFAULT '',
  `phone` VARCHAR(50) NOT NULL,
  `timings` VARCHAR(255) NOT NULL,
  `established_year` VARCHAR(20) DEFAULT '2021',
  `cuisine_type` VARCHAR(100) NOT NULL,
  `theme` VARCHAR(50) DEFAULT 'emerald',
  `features` JSON,
  `is_deleted` TINYINT(1) DEFAULT 0,
  `visitors_count` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. Table Structure for `categories`
-- ------------------------------------------------------------------------------
CREATE TABLE `categories` (
  `id` VARCHAR(100) NOT NULL,
  `shop_id` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `order_index` INT DEFAULT 0,
  PRIMARY KEY (`id`, `shop_id`),
  INDEX `idx_shop_cat` (`shop_id`),
  CONSTRAINT `fk_categories_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. Table Structure for `menu_items`
-- ------------------------------------------------------------------------------
CREATE TABLE `menu_items` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `shop_id` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL,
  `category_id` VARCHAR(100) NOT NULL,
  `image` VARCHAR(1000) DEFAULT '',
  `is_veg` TINYINT(1) DEFAULT 1,
  `is_bestseller` TINYINT(1) DEFAULT 0,
  `is_spicy` TINYINT(1) DEFAULT 0,
  `is_chef_special` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_shop_items` (`shop_id`),
  INDEX `idx_category` (`category_id`),
  CONSTRAINT `fk_items_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. Table Structure for `shop_visitors` (Unique Browser Tracking & Deduplication)
-- ------------------------------------------------------------------------------
CREATE TABLE `shop_visitors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `shop_id` VARCHAR(100) NOT NULL,
  `visitor_hash` VARCHAR(255) NOT NULL,
  `ip_address` VARCHAR(100) DEFAULT '',
  `user_agent` VARCHAR(500) DEFAULT '',
  `visited_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `idx_shop_unique_vis` (`shop_id`, `visitor_hash`),
  INDEX `idx_shop_vis` (`shop_id`),
  CONSTRAINT `fk_visitors_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==============================================================================
-- SEED DATA: 4 AUTHENTIC INDIAN RESTAURANTS
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PIZZA WORLD (pizza-world)
-- ------------------------------------------------------------------------------
-- INSERT INTO `shops` (`id`, `name`, `tagline`, `owner_name`, `phone`, `timings`, `established_year`, `cuisine_type`, `theme`, `features`)
-- VALUES (
--   'pizza-world',
--   'Pizza World',
--   'Artisanal Woodfired Kitchen',
--   'Rajesh Sharma',
--   '+91 98765 43210',
--   '11:00 AM – 11:30 PM (All 7 Days)',
--   '2021',
--   'Woodfired Pizzeria',
--   'emerald',
--   '["48-Hour Slow Fermented Sourdough", "100% Real Dairy Mozzarella", "Stone Baked Hot at 450°C"]'
-- );

-- INSERT INTO `categories` (`id`, `shop_id`, `name`, `description`, `order_index`) VALUES
-- ('starters', 'pizza-world', 'Garlic Breads & Sides', 'Freshly baked buttery sides with authentic herbs and dip', 0),
-- ('veg-pizzas', 'pizza-world', 'Classic Veg Pizzas', 'Farm fresh vegetables with signature marinara and mozzarella', 1),
-- ('paneer-special', 'pizza-world', 'Paneer & Cheese Burst', 'Gourmet spiced paneer cubes and molten cheese crusts', 2),
-- ('nonveg-pizzas', 'pizza-world', 'Chicken & Non-Veg Pizzas', 'Succulent roasted chicken tikka and spicy pepper chicken', 3),
-- ('pastas-beverages', 'pizza-world', 'Pastas & Beverages', 'Creamy penne pasta and refreshing Italian mocktails', 4),
-- ('desserts', 'pizza-world', 'Desserts & Thickshakes', 'Decadent chocolate lava cake and artisanal thickshakes', 5);

-- INSERT INTO `menu_items` (`id`, `shop_id`, `name`, `description`, `price`, `category_id`, `image`, `is_veg`, `is_bestseller`, `is_spicy`, `is_chef_special`) VALUES
-- ('pw-1', 'pizza-world', 'Cheese Stuffed Garlic Bread', 'Freshly baked loaf loaded with melted mozzarella cheese, roasted garlic butter, and oregano seasoning.', 149.00, 'starters', 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=400&q=90', 1, 1, 0, 0),
-- ('pw-2', 'pizza-world', 'Paneer Tikka Stuffed Garlic Bread', 'Filled with spicy tandoori paneer tikka cubes, crunchy green capsicum, onion, and gooey cheese.', 179.00, 'starters', 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?auto=format&fit=crop&w=400&q=90', 1, 0, 1, 0),
-- ('pw-3', 'pizza-world', 'Peri-Peri Masala Fries', 'Crispy hot golden French fries generously tossed in spicy peri-peri masala seasoning with cheese dip.', 129.00, 'starters', 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=400&q=90', 1, 0, 1, 0),
-- ('pw-4', 'pizza-world', 'Crispy Chicken Poppers & Dip', 'Golden crunchy seasoned chicken bites served with house special hot garlic mayonnaise dip.', 199.00, 'starters', 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=400&q=90', 0, 1, 0, 0),
-- ('pw-5', 'pizza-world', 'Double Cheese Margherita (Cheese Burst)', 'Classic Italian delight with double layer of molten mozzarella, aromatic basil, and slow-simmered tomato sauce.', 249.00, 'veg-pizzas', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=90', 1, 1, 0, 1),
-- ('pw-6', 'pizza-world', 'Farmhouse Supreme Pizza', 'Crunchy bell peppers, golden sweet corn, sliced button mushrooms, black olives, and juicy red tomatoes.', 299.00, 'veg-pizzas', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=90', 1, 1, 0, 0),
-- ('pw-7', 'pizza-world', 'Spicy Mexican Fiesta Pizza', 'Spicy Mexican herb seasoning, jalapenos, crunchy onion, crisp capsicum, and golden sweet corn.', 319.00, 'veg-pizzas', 'https://images.unsplash.com/photo-1573821663912-569905455b1c?auto=format&fit=crop&w=400&q=90', 1, 0, 1, 0),
-- ('pw-8', 'pizza-world', 'Tandoori Paneer Tikka Pizza', 'Marinated tandoori cottage cheese cubes, red paprika, crisp capsicum, onion, and spiced mint drizzle.', 349.00, 'paneer-special', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=90', 1, 1, 1, 1),
-- ('pw-9', 'pizza-world', 'Paneer Makhani Cheese Burst', 'Rich creamy Punjabi makhani sauce base topped with soft spiced paneer cubes and molten cheese burst crust.', 389.00, 'paneer-special', 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=400&q=90', 1, 1, 0, 0),
-- ('pw-10', 'pizza-world', 'Paneer Peri-Peri Delight', 'Spicy peri-peri marinated paneer cubes, golden sweet corn, red paprika, and creamy garlic drizzle.', 369.00, 'paneer-special', 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=400&q=90', 1, 0, 1, 0),
-- ('pw-11', 'pizza-world', 'Butter Chicken Tikka Pizza', 'Tender roasted chicken tikka pieces simmered in makhani gravy, green capsicum, onion, and mozzarella.', 399.00, 'nonveg-pizzas', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=400&q=90', 0, 1, 1, 1),
-- ('pw-12', 'pizza-world', 'Chicken Pepperoni Classic', 'Generous topping of premium smoked chicken pepperoni slices layered over bubbling rich mozzarella.', 429.00, 'nonveg-pizzas', 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=400&q=90', 0, 1, 0, 0),
-- ('pw-13', 'pizza-world', 'Spicy Fiery Chicken Pizza', 'Hot peri-peri grilled chicken, spicy red paprika, jalapenos, and melted sharp cheese.', 389.00, 'nonveg-pizzas', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=90', 0, 0, 1, 0),
-- ('pw-14', 'pizza-world', 'Creamy White Sauce Cheesy Pasta', 'Penne pasta tossed in velvety garlic Alfredo cream sauce with bell peppers, sweet corn, and mozzarella.', 229.00, 'pastas-beverages', 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=400&q=90', 1, 1, 0, 0),
-- ('pw-15', 'pizza-world', 'Spicy Arrabiata Red Sauce Pasta', 'Tangy slow-simmered Italian plum tomato sauce with garlic, chili flakes, black olives, and fresh herbs.', 219.00, 'pastas-beverages', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=90', 1, 0, 1, 0),
-- ('pw-16', 'pizza-world', 'Fresh Mint Mojito Cooler', 'Chilled sparkling soda infused with freshly muddled mint leaves, lime juice, and sweet cane sugar.', 119.00, 'pastas-beverages', 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=400&q=90', 1, 0, 0, 0),
-- ('pw-17', 'pizza-world', 'Molten Choco Lava Cake', 'Warm chocolate sponge cake with a decadent erupting center of rich molten dark Belgian chocolate fudge.', 139.00, 'desserts', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=90', 1, 1, 0, 1),
-- ('pw-18', 'pizza-world', 'Death by Chocolate Brownie Sundae', 'Fudgy walnut brownie topped with rich vanilla ice cream, hot chocolate fudge, and roasted nuts.', 169.00, 'desserts', 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=90', 1, 0, 0, 0),
-- ('pw-19', 'pizza-world', 'Nutella Belgian Thickshake', 'Thick creamy milkshake blended with pure Nutella hazelnut spread, dark chocolate chips, and whipped cream.', 179.00, 'desserts', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=90', 1, 1, 0, 0);


-- -- ------------------------------------------------------------------------------
-- -- 2. ROYAL CHINESE WOK (royal-chinese)
-- -- ------------------------------------------------------------------------------
-- INSERT INTO `shops` (`id`, `name`, `tagline`, `owner_name`, `phone`, `timings`, `established_year`, `cuisine_type`, `theme`, `features`)
-- VALUES (
--   'royal-chinese',
--   'Royal Chinese Wok',
--   'Authentic Indo-Chinese Kitchen',
--   'Chen & Sunita Roy',
--   '+91 98111 22334',
--   '12:00 PM – 11:00 PM (All 7 Days)',
--   '2019',
--   'Indo-Chinese & Momos',
--   'crimson',
--   '["High Flame Volcanic Wok Tossed", "Fresh In-House Dimsum Dough", "Authentic Szechuan Chili Oil"]'
-- );

-- INSERT INTO `categories` (`id`, `shop_id`, `name`, `description`, `order_index`) VALUES
-- ('soups-starters', 'royal-chinese', 'Soups & Crispy Starters', 'Crispy spring rolls, soups, and crunchy wok starters', 0),
-- ('momos-dimsums', 'royal-chinese', 'Steamed & Fried Momos', 'Fresh steamed and kurkure fried handmade momos', 1),
-- ('noodles-rice', 'royal-chinese', 'Wok Noodles & Fried Rice', 'High flame tossed Hakka noodles and Szechuan rice', 2),
-- ('gravies-mains', 'royal-chinese', 'Szechuan Gravies & Mains', 'Rich Manchurian, chili paneer, and garlic gravies', 3);

-- INSERT INTO `menu_items` (`id`, `shop_id`, `name`, `description`, `price`, `category_id`, `image`, `is_veg`, `is_bestseller`, `is_spicy`, `is_chef_special`) VALUES
-- ('rc-1', 'royal-chinese', 'Crispy Veg Spring Rolls', 'Golden fried rolls stuffed with crunchy cabbage, carrots, and sweet chili dip.', 169.00, 'soups-starters', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=90', 1, 1, 0, 0),
-- ('rc-2', 'royal-chinese', 'Crispy Honey Chili Potato', 'Fried potato fingers glazed in sweet honey chili sauce, sesame seeds, and spring onion.', 189.00, 'soups-starters', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=90', 1, 0, 1, 0),
-- ('rc-3', 'royal-chinese', 'Chicken Lollipop Szechuan', 'Crispy fried frenched chicken wings tossed in fiery homemade garlic Szechuan sauce.', 249.00, 'soups-starters', 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400&q=90', 0, 1, 1, 0),
-- ('rc-4', 'royal-chinese', 'Hot & Sour Chicken Soup', 'Thick spicy and sour broth packed with shredded chicken, mushrooms, and bamboo shoots.', 149.00, 'soups-starters', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=400&q=90', 0, 0, 1, 0),
-- ('rc-5', 'royal-chinese', 'Steamed Paneer Cheese Momos', 'Delicate dumplings filled with spiced cottage cheese, corn, and spicy red dip.', 159.00, 'momos-dimsums', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=90', 1, 1, 0, 0),
-- ('rc-6', 'royal-chinese', 'Kurkure Chicken Fried Momos', 'Crunchy crumb-coated fried chicken momos served with creamy mayonnaise.', 189.00, 'momos-dimsums', 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=400&q=90', 0, 1, 0, 0),
-- ('rc-7', 'royal-chinese', 'Szechuan Pan-Fried Veg Momos', 'Pan-seared vegetable dumplings glazed in spicy Szechuan gravy and spring onions.', 169.00, 'momos-dimsums', 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=400&q=90', 1, 0, 1, 0),
-- ('rc-8', 'royal-chinese', 'Classic Veg Hakka Noodles', 'Wok-tossed noodles with shredded cabbage, bell peppers, carrots, and light soy sauce.', 179.00, 'noodles-rice', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=400&q=90', 1, 1, 0, 0),
-- ('rc-9', 'royal-chinese', 'Chili Garlic Chicken Noodles', 'Spicy wok noodles tossed with tender chicken strips, burnt garlic, and fresh red chilies.', 219.00, 'noodles-rice', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=90', 0, 0, 1, 0),
-- ('rc-10', 'royal-chinese', 'Szechuan Veg Fried Rice', 'Fluffy basmati rice stir-fried with farm fresh veggies and authentic spicy Szechuan sauce.', 189.00, 'noodles-rice', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=400&q=90', 1, 0, 1, 0),
-- ('rc-11', 'royal-chinese', 'Veg Manchurian Gravy', 'Fried vegetable balls simmered in rich ginger-garlic and dark soya coriander sauce.', 199.00, 'gravies-mains', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=90', 1, 1, 0, 0),
-- ('rc-12', 'royal-chinese', 'Chili Paneer Gravy', 'Fried paneer cubes tossed with crunchy capsicum, onions, and spicy green chili gravy.', 239.00, 'gravies-mains', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=400&q=90', 1, 0, 1, 0),
-- ('rc-13', 'royal-chinese', 'Chili Chicken Gravy', 'Tender chicken pieces simmered in spicy soy chili sauce with onions and fresh peppers.', 269.00, 'gravies-mains', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=400&q=90', 0, 1, 1, 0);


-- -- ------------------------------------------------------------------------------
-- -- 3. MUMBAI VADAPAV CENTER (mumbai-vadapav)
-- -- ------------------------------------------------------------------------------
-- INSERT INTO `shops` (`id`, `name`, `tagline`, `owner_name`, `phone`, `timings`, `established_year`, `cuisine_type`, `theme`, `features`)
-- VALUES (
--   'mumbai-vadapav',
--   'Mumbai Vadapav Center',
--   'Authentic Street Snacks & Cutting Chai',
--   'Sachin Kadam',
--   '+91 99223 34455',
--   '08:00 AM – 10:00 PM (All 7 Days)',
--   '2015',
--   'Mumbai Street Food',
--   'terracotta',
--   '["Original Lasun Khobra Chutney", "Soft Fresh Ladi Pav Daily", "Spiced Masala Cutting Chai"]'
-- );

-- INSERT INTO `categories` (`id`, `shop_id`, `name`, `description`, `order_index`) VALUES
-- ('signature-vadapav', 'mumbai-vadapav', 'Signature Vadapavs', 'Hot crispy batata vadas in soft ladi pav', 0),
-- ('pav-bhaji-misal', 'mumbai-vadapav', 'Misal & Pav Delicacies', 'Spicy Kolhapuri misal and buttery pav bhaji', 1),
-- ('crispy-bhajias', 'mumbai-vadapav', 'Hot Bhajias & Farsan', 'Piping hot onion kanda and moong dal bhajias', 2),
-- ('chai-beverages', 'mumbai-vadapav', 'Chai & Chilled Drinks', 'Special masala cutting chai and kokum coolers', 3);

-- INSERT INTO `menu_items` (`id`, `shop_id`, `name`, `description`, `price`, `category_id`, `image`, `is_veg`, `is_bestseller`, `is_spicy`, `is_chef_special`) VALUES
-- ('mv-1', 'mumbai-vadapav', 'Classic Mumbai Vadapav', 'Golden fried spiced potato vada inside fresh pav with garlic chutney and green chili.', 25.00, 'signature-vadapav', 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=400&q=90', 1, 1, 0, 0),
-- ('mv-2', 'mumbai-vadapav', 'Amul Butter Cheese Vadapav', 'Hot crispy vadapav toasted in rich Amul butter and loaded with grated processed cheese.', 45.00, 'signature-vadapav', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=90', 1, 1, 0, 0),
-- ('mv-3', 'mumbai-vadapav', 'Schezwan Mayo Vadapav', 'Crispy batata vada layered with spicy Schezwan sauce and creamy eggless mayonnaise.', 35.00, 'signature-vadapav', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=90', 1, 0, 1, 0),
-- ('mv-4', 'mumbai-vadapav', 'Ulta Vadapav Special', 'Pav stuffed with spiced potato filling, dipped in besan batter and deep-fried golden.', 40.00, 'signature-vadapav', 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=400&q=90', 1, 0, 0, 0),
-- ('mv-5', 'mumbai-vadapav', 'Kolhapuri Kat Misal Pav', 'Sprouted moth bean curry in fiery spicy red rassa, topped with farsan and lemon.', 89.00, 'pav-bhaji-misal', 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=400&q=90', 1, 1, 1, 0),
-- ('mv-6', 'mumbai-vadapav', 'Special Butter Pav Bhaji', 'Mashed vegetable curry cooked on tawa with secret spices and dollops of butter.', 119.00, 'pav-bhaji-misal', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=90', 1, 1, 0, 0),
-- ('mv-7', 'mumbai-vadapav', 'Dabeli with Sweet Chutney', 'Spicy potato mix in pav garnished with pomegranate, roasted peanuts, and fine sev.', 30.00, 'pav-bhaji-misal', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=90', 1, 0, 0, 0),
-- ('mv-8', 'mumbai-vadapav', 'Crispy Kanda Bhajia (Onion Pakoda)', 'Thinly sliced onion fritters deep fried with carom seeds and green chilies.', 50.00, 'crispy-bhajias', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=90', 1, 1, 0, 0),
-- ('mv-9', 'mumbai-vadapav', 'Moong Dal Bhajia with Fried Chilies', 'Airy light yellow lentil dumplings served piping hot with green mint chutney.', 60.00, 'crispy-bhajias', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=90', 1, 0, 0, 0),
-- ('mv-10', 'mumbai-vadapav', 'Special Masala Cutting Chai', 'Strong brewed tea simmered with fresh ginger, cardamom, and whole spices.', 15.00, 'chai-beverages', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=90', 1, 1, 0, 0),
-- ('mv-11', 'mumbai-vadapav', 'Kokum Sharbat Cooler', 'Traditional sweet and tangy cooling drink made from wild coastal kokum fruit.', 30.00, 'chai-beverages', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=90', 1, 0, 0, 0);


-- -- ------------------------------------------------------------------------------
-- -- 4. DELHI PAKODI & CHAAT CORNER (delhi-pakodi)
-- -- ------------------------------------------------------------------------------
-- INSERT INTO `shops` (`id`, `name`, `tagline`, `owner_name`, `phone`, `timings`, `established_year`, `cuisine_type`, `theme`, `features`)
-- VALUES (
--   'delhi-pakodi',
--   'Delhi Pakodi & Chaat Corner',
--   'Famous Purani Dilli Street Flavors',
--   'Harishankar Gupta',
--   '+91 97110 55667',
--   '10:30 AM – 10:30 PM (All 7 Days)',
--   '2012',
--   'Pakodi, Chaat & Sweets',
--   'sapphire',
--   '["Pure Desi Ghee Preparations", "Authentic Hing & Saunth Chutneys", "Freshly Fried Crunchy Pakodis"]'
-- );

-- INSERT INTO `categories` (`id`, `shop_id`, `name`, `description`, `order_index`) VALUES
-- ('special-pakodis', 'delhi-pakodi', 'Famous Crispy Pakodis', 'Desi ghee fried paneer, mix veg, and mirchi pakodis', 0),
-- ('delhi-chaats', 'delhi-pakodi', 'Dilli Ki Mashhoor Chaat', 'Aloo tikki, puchka pani puri, and dahi bhalla', 1),
-- ('mithai-desserts', 'delhi-pakodi', 'Traditional Sweets', 'Hot desi ghee jalebi rabri and gulab jamun', 2);

-- INSERT INTO `menu_items` (`id`, `shop_id`, `name`, `description`, `price`, `category_id`, `image`, `is_veg`, `is_bestseller`, `is_spicy`, `is_chef_special`) VALUES
-- ('dp-1', 'delhi-pakodi', 'Malai Paneer Stuffed Pakodi', 'Thick fresh paneer slabs stuffed with green mint chutney and fried in spiced besan.', 120.00, 'special-pakodis', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=90', 1, 1, 0, 0),
-- ('dp-2', 'delhi-pakodi', 'Mix Veg Assorted Pakodi Platter', 'Assortment of potato, cauliflower, spinach, and onion fritters with chatpata masala.', 90.00, 'special-pakodis', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=90', 1, 0, 0, 0),
-- ('dp-3', 'delhi-pakodi', 'Bhavnagri Mirchi Vada Pakodi', 'Big green mild peppers stuffed with spiced mashed potato and fried golden.', 40.00, 'special-pakodis', 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=400&q=90', 1, 0, 1, 0),
-- ('dp-4', 'delhi-pakodi', 'Dilli Special Aloo Tikki Chaat', 'Crispy fried potato patties topped with sweet curd, spicy mint, and tangy tamarind saunth.', 70.00, 'delhi-chaats', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=90', 1, 1, 0, 0),
-- ('dp-5', 'delhi-pakodi', 'Kolkata Style Puchka / Pani Puri (6 Pcs)', 'Crispy semolina puris filled with spicy mashed potato and dipped in tangy mint pani.', 40.00, 'delhi-chaats', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=90', 1, 1, 1, 0),
-- ('dp-6', 'delhi-pakodi', 'Dahi Bhalla Papdi Chaat', 'Soft lentil dumplings and crispy papdis drenched in thick sweet yoghurt and roasted cumin.', 80.00, 'delhi-chaats', 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=400&q=90', 1, 0, 0, 0),
-- ('dp-7', 'delhi-pakodi', 'Hot Desi Ghee Jalebi with Rabri', 'Crispy coiled jalebis soaked in saffron sugar syrup and topped with chilled creamy rabri.', 90.00, 'mithai-desserts', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=90', 1, 1, 0, 0),
-- ('dp-8', 'delhi-pakodi', 'Gulab Jamun (2 Pcs)', 'Soft milk solid dumplings fried and steeped in cardamom rose water syrup.', 50.00, 'mithai-desserts', 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=400&q=90', 1, 0, 0, 0);

-- -- ==============================================================================
-- -- END OF SCHEMA AND SEED DATA
-- -- ==============================================================================
