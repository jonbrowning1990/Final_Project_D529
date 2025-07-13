-- Create database
-- Since using sqlite, this was in practice accomplished through the Python command 'conn = sqlite3.connect('catering_sqlite.db')'
-- Effectively this is the equivalent of:
CREATE DATABASE catering_sqlite.db;

-- Next, the table creation queries which were executed through a sqlite cursor object:

CREATE TABLE IF NOT EXISTS equipment (
  `name` VARCHAR(100) NOT NULL,
  `cost_per_item` FLOAT NOT NULL,
  `category` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`name`))
  

CREATE TABLE IF NOT EXISTS bar_items (
  `name` VARCHAR(50) NOT NULL,
  `cost_per_item` FLOAT NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `serving_container` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`name`),
  CONSTRAINT `fk_bar_item_container`
    FOREIGN KEY (`serving_container`)
    REFERENCES `equipment` (`name`))
    
CREATE TABLE IF NOT EXISTS labor_cost (
  `role` VARCHAR(45) NOT NULL,
  `cost_per_hour` FLOAT NOT NULL,
  PRIMARY KEY (`role`))
  
CREATE TABLE IF NOT EXISTS menu_items (
  `name` VARCHAR(100) NOT NULL,
  `course` VARCHAR(45) NOT NULL,
  `prep_time` INT NOT NULL,
  `cook_time` INT NOT NULL,
  `serving_container` VARCHAR(100) NULL DEFAULT NULL,
  `serving_utensil` VARCHAR(100) NULL DEFAULT NULL,
  `oven` TINYINT NOT NULL,
  `fridge` TINYINT NOT NULL,
  `cost_per_item` FLOAT NOT NULL,
  PRIMARY KEY (`name`),
  CONSTRAINT `fk_menu_items_container`
    FOREIGN KEY (`serving_container`)
    REFERENCES `equipment` (`name`),
  CONSTRAINT `fk_menu_items_utensil`
    FOREIGN KEY (`serving_utensil`)
    REFERENCES `equipment` (`name`))

CREATE TABLE IF NOT EXISTS `menu_item_ingredients` (
  `menu_item` VARCHAR(100) NOT NULL,
  `menu_item_ingredient` VARCHAR(250) NOT NULL,
  `quantity` FLOAT NOT NULL,
  `production_amount` INT NOT NULL,
  PRIMARY KEY (`menu_item`, `menu_item_ingredient`),
  CONSTRAINT `fk_menu_item_ingredients_menu_item`
    FOREIGN KEY (`menu_item`)
    REFERENCES `menu_items` (`name`))
    ON DELETE CASCADE
    ON UPDATE CASCADE


-- Next, the tables were populated with their data.

-- equipment

INSERT INTO equipment(name, cost_per_item, category) VALUES ('Wood Chiavari Chair', 2.97, 'Chairs'), ('Ghost Chair With Arms', 4.93, 'Chairs'), ('Industrial Metal Chair with Arms', 4.99, 'Chairs'), ('Farmhouse Cross Back Chair', 3.4, 'Chairs'), ('King Louis Chair', 7.47, 'Chairs'), ('Titan Plastic Folding Chair', 0.9, 'Chairs'), ('Titan Aluminum Plastic Folding Chair', 1.35, 'Chairs'), ('Wood Folding Chair', 1.77, 'Chairs'), ('French Bistro Folding Chair', 2.0, 'Chairs'), ("60'' Round Wood Folding Table (Seats 5-6)", 8.67, 'Tables'), ("72'' Round Wood Folding Table (Seats 8-10)", 11.47, 'Tables'), ("60'' Round Plastic Folding Table (Seats 5-6)", 9.22, 'Tables'), ("72'' Round Plastic Folding Table (Seats 8-10)", 13.62, 'Tables'), ("Plastic Folding Table - 8'x30'' banquet (Seats 8-10)", 7.5, 'Tables'), ("Plastic Folding Table - 6' x 30'' Banquet (Seats 6-8)", 4.97, 'Tables'), ("Wood Folding Table - 8'x30'' banquet (Seats 8-10)", 10.56, 'Tables'), ("Wood Folding Table - 6' x 30'' Banquet (Seats 6-8)", 6.74, 'Tables'), ("Farmhouse Folding Farm Table - 8'x40'' - Rustic - H-Legs (Seats 8-12)", 27.02, 'Tables'), ("Industrial Metal Cocktail Table 30'' Square", 15.7, 'Cocktail Tables'), ("Cocktail table - 24'' Wood Round", 12.85, 'Cocktail Tables'), ("Cocktail table - 30'' Wood Round", 13.25, 'Cocktail Tables'), ("Cocktail table - 36'' Wood Round", 13.85, 'Cocktail Tables'), ("Cocktail table - 30'' Wood Square", 12.95, 'Cocktail Tables'), ("Cocktail table - 36'' Wood Square", 13.15, 'Cocktail Tables'), ('Tablecloths (Black, White, Ivory, Navy, Grey)', 10.0, 'Table Linens'), ('Table Runners (Black, White, Ivory, Navy, Grey)', 8.0, 'Table Linens'), ('Sun Umbrella', 20.0, 'Extras'), ("Small Stage (5' x 10')", 500.0, 'Extras'), ("Large Stage (10' x 15')", 1000.0, 'Extras'), ("Small Dance Floor (12' Square)", 250.0, 'Extras'), ("Large Dance Floor (20' Square)", 500.0, 'Extras'), ('Podium', 75.0, 'Extras'), ("Plastic Dinner Plate-10''", 0.3, 'Tableware'), ("Plastic Salad/Dessert Plate- 6''", 0.15, 'Tableware'), ('Porcelain Dinner Plate-10"', 1.5, 'Tableware'), ('Porcelain Salad/Dessert Plate 6"', 1.0, 'Tableware'), ('Plastic Fork', 0.1, 'Tableware'), ('Plastic Knive', 0.1, 'Tableware'), ('Dinner Fork-Stainless (10pk)', 0.5, 'Tableware'), ('Dinner Knife-Stainless (10pk)', 0.5, 'Tableware'), ('Plastic Cups 12oz', 0.2, 'Tableware'), ('Plastic Wine Cups 9oz', 0.15, 'Tableware'), ('Beer Pilsner Glass', 1.5, 'Tableware'), ('Champagne Flute', 2.5, 'Tableware'), ('Red Wine-12oz.', 1.5, 'Tableware'), ('Water Goblets', 1.5, 'Tableware'), ('White Wine-11oz', 1.5, 'Tableware'), ('Old Fashioned Glass', 2.5, 'Tableware'), ('Oven', 400.0, 'Tableware'), ('Refrigerator', 300.0, 'Tableware'), ("12 '' Oval Ceramic Platter", 2.42, 'Serving'), ('18" x 5" Rectangular Ceramic Serving Platter', 4.85, 'Serving'), ('Rectangular Chafing Dish', 23.28, 'Serving'), ('Round Chafing Dish', 17.2, 'Serving'), ('Serving Spoon', 1.35, 'Serving'), ('Serving Fork', 1.35, 'Serving'), ('Spatula', 1.5, 'Serving'), ('Appetizer Tongs', 1.5, 'Serving'), ('Serving Tongs', 1.82, 'Serving'), ('Salad Serving Bowl', 3.9, 'Serving')'

-- menu_items

INSERT INTO menu_items(name, course, prep_time, cook_time, serving_container,	serving_utensil, oven, fridge, cost_per_item) VALUES ('Baked Chicken Wings with Thai Peanut Sauce', 'Appetizers', 40, 50, "12 '' Oval Ceramic Platter", 'Appetizer Tongs', 1, 0, 2.49), ('Homemade Chorizo Meatballs in Cilantro Masa Cups', 'Appetizers', 10, 28, "12 '' Oval Ceramic Platter", 'Appetizer Tongs', 1, 0, 0.99), ('Bruschetta Caprese', 'Appetizers', 10, 10, "12 '' Oval Ceramic Platter", 'Appetizer Tongs', 0, 1, 1.49), ('Beet-Pickled Quail Eggs', 'Appetizers', 20, 10, "12 '' Oval Ceramic Platter", 'Appetizer Tongs', 0, 1, 1.99), ('Fried Green Tomato Tacos', 'Appetizers', 20, 20, "12 '' Oval Ceramic Platter", 'Appetizer Tongs', 0, 0, 2.49), ('Chinese Sticky Rice Prawn Parcels', 'Appetizers', 20, 15, "12 '' Oval Ceramic Platter", 'Appetizer Tongs', 1, 0, 2.49), ('Ham Jalapeno Green Onion Quesadilla', 'Appetizers', 5, 10, "12 '' Oval Ceramic Platter", 'Appetizer Tongs', 1, 0, 1.99), ('Rosemary Parmesan Focaccia', 'Breads', 10, 10, '18" x 5" Rectangular Ceramic Serving Platter', 'Serving Tongs', 1, 0, 2.49), ('Buttermilk Cornbread', 'Breads', 10, 20, '18" x 5" Rectangular Ceramic Serving Platter', 'Serving Tongs', 1, 0, 2.99), ('Cheese Garlic Biscuits', 'Breads', 10, 20, '18" x 5" Rectangular Ceramic Serving Platter', 'Serving Tongs', 1, 0, 2.49), ('Basil-Buttered French Bread', 'Breads', 10, 10, '18" x 5" Rectangular Ceramic Serving Platter', 'Serving Tongs', 1, 0, 3.49), ('Tiramisu (Serves 10)', 'Desserts', 15, 3, "12 '' Oval Ceramic Platter", 'Spatula', 0, 1, 19.99), ('Triple Chocolate Cookies', 'Desserts', 15, 15, "12 '' Oval Ceramic Platter", 'Appetizer Tongs', 0, 0, 2.49), ('Sweet Cherry Pie (Serves 8)', 'Desserts', 15, 30, 'Porcelain Dinner Plate-10"', 'Spatula', 1, 0, 14.99), ('Toasted-Pecan Pie (Serves 8)', 'Desserts', 15, 30, 'Porcelain Dinner Plate-10"', 'Spatula', 1, 0, 14.99), ('Almond Biscotti', 'Desserts', 45, 15, "12 '' Oval Ceramic Platter", 'Appetizer Tongs', 0, 0, 1.99), ('French Meringues', 'Desserts', 5, 10, "12 '' Oval Ceramic Platter", 'Appetizer Tongs', 0, 0, 2.99), ('Soft Sugar Cookies', 'Desserts', 30, 20, "12 '' Oval Ceramic Platter", 'Appetizer Tongs', 0, 0, 2.49), ('Fresh Persimmon Cake (Serves 10)', 'Desserts', 10, 15, "12 '' Oval Ceramic Platter", 'Spatula', 1, 0, 24.99), ('Honey-Mustard Pork Tenderloin with Kale', 'Main Dishes', 30, 45, 'Rectangular Chafing Dish', 'Serving Tongs', 1, 0, 27.99), ('Baked Chicken Bean and Cheese Empanadas', 'Main Dishes', 30, 30, 'Rectangular Chafing Dish', 'Serving Tongs', 1, 0, 19.99), ('Ricotta and Spinach Stuffed Manicotti', 'Main Dishes', 30, 45, 'Rectangular Chafing Dish', 'Serving Spoon', 1, 0, 22.99), ('Ricotta Fettuccine Alfredo with Broccoli', 'Main Dishes', 30, 20, 'Rectangular Chafing Dish', 'Serving Tongs', 1, 1, 21.99), ('Italian Pot Roast with Artichokes and Potatoes', 'Main Dishes', 30, 60, 'Rectangular Chafing Dish', 'Serving Tongs', 1, 0, 29.99), ('Veal Ravioli with Walnut Sauce', 'Main Dishes', 30, 20, 'Rectangular Chafing Dish', 'Serving Tongs', 1, 0, 32.99), ('Teriyaki Salmon with Cucumber Salad', 'Main Dishes', 30, 20, 'Rectangular Chafing Dish', 'Spatula', 1, 1, 34.99), ('Chicken Tikka Masala', 'Main Dishes', 30, 30, 'Rectangular Chafing Dish', 'Serving Spoon', 1, 0, 23.99), ('Quiche Lorraine', 'Main Dishes', 30, 40, 'Rectangular Chafing Dish', 'Spatula', 1, 0, 21.99), ('Indian Almond Chicken with Peas', 'Main Dishes', 30, 40, 'Rectangular Chafing Dish', 'Serving Spoon', 1, 0, 26.99), ('Mexican Baked Spaghetti Squash', 'Main Dishes', 30, 35, 'Rectangular Chafing Dish', 'Serving Spoon', 1, 0, 21.99), ('Risotto With Lemon And Sun Dried Tomatoes', 'Main Dishes', 15, 40, 'Rectangular Chafing Dish', 'Serving Tongs', 1, 0, 22.99), ('Red Cabbage, Cranberry, and Apple Slaw', 'Salads', 15, 5, 'Salad Serving Bowl', 'Serving Tongs', 0, 1, 7.99), ('Quinoa Salad with Grilled Scallions, Favas and Dates', 'Salads', 15, 5, 'Salad Serving Bowl', 'Serving Spoon', 0, 1, 6.99), ('Mixed Greens with Smoked Gouda', 'Salads', 15, 5, 'Salad Serving Bowl', 'Serving Tongs', 0, 1, 7.99), ('Crunchy Romaine Toss', 'Salads', 15, 5, 'Salad Serving Bowl', 'Serving Tongs', 0, 1, 6.99), ('Panzanella', 'Salads', 15, 5, 'Salad Serving Bowl', 'Serving Spoon', 0, 1, 5.99), ('Mediterranean Chopped Salad with Tomatoes, Peppers, Feta, and Basil', 'Salads', 15, 5, 'Salad Serving Bowl', 'Serving Tongs', 0, 1, 8.99), ('Cucumber Salad', 'Salads', 15, 5, 'Salad Serving Bowl', 'Serving Spoon', 0, 1, 6.99), ('Green Beans with Roasted Tomatoes and Cumin', 'Side Dishes', 10, 20, 'Round Chafing Dish', 'Serving Tongs', 1, 0, 4.99), ('Elote, or Mexican Grilled Corn', 'Side Dishes', 5, 30, 'Round Chafing Dish', 'Serving Tongs', 1, 0, 4.99), ('Glazed Root Vegetables', 'Side Dishes', 10, 30, 'Round Chafing Dish', 'Serving Spoon', 1, 0, 3.99), ('Roasted New Potatoes', 'Side Dishes', 5, 40, 'Round Chafing Dish', 'Serving Spoon', 1, 0, 3.99), ('Best Ever Boston Baked Beans', 'Side Dishes', 10, 30, 'Round Chafing Dish', 'Serving Spoon', 1, 0, 4.99), ('Cilantro Serrano Mexican Rice', 'Side Dishes', 10, 20, 'Round Chafing Dish', 'Serving Spoon', 1, 0, 3.99), ('Grilled Fresh Artichokes', 'Side Dishes', 20, 45, 'Round Chafing Dish', 'Serving Tongs', 1, 0, 7.99), ('Pineapple Fried Rice', 'Side Dishes', 10, 20, 'Round Chafing Dish', 'Serving Spoon', 1, 0, 4.99)

-- Menu_item_ingredients is a table with 509 entries so to keep the query less long in this file I include the first and last values and skip the rest.
-- In practice when creating the sqlite database, I loaded this table with the .to_sql functionality of the pandas DataFrame.

INSERT INTO menu_item_ingredients (menu_item, menu_item_ingredient, quantity, production_amount) VALUES (\'Baked Chicken Wings with Thai Peanut Sauce\', \'cloves garlic, peeled and roughly chopped\', 2.0, 40), ......., (\'Pineapple Fried Rice\', \'Salt to taste\', 0.0, 5)'

-- bar_items

INSERT INTO bar_items (name, cost_per_item, category, serving_container) VALUES ('Coke 2L Bottle', 5.48, 'Soft Drinks', 'Plastic Cups 12oz'), ('Diet Coke 2L Bottle', 5.48, 'Soft Drinks', 'Plastic Cups 12oz'), ('Sprite 2L Bottle', 5.48, 'Soft Drinks', 'Plastic Cups 12oz'), ('Dr. Pepper 2L Bottle', 5.28, 'Soft Drinks', 'Plastic Cups 12oz'), ('Fanta 2L Bottle', 3.76, 'Soft Drinks', 'Plastic Cups 12oz'), ('Modelo 12 Pack Bottles', 32.84, 'Beer', 'Beer Pilsner Glass'), ('Budweiser 12 Pack Bottles', 26.24, 'Beer', 'Beer Pilsner Glass'), ('Bud Light 12 Pack Bottles', 26.24, 'Beer', 'Beer Pilsner Glass'), ('Heineken 12 Pack Bottles', 32.88, 'Beer', 'Beer Pilsner Glass'), ('Lagunitas 12 Pack Bottles', 33.68, 'Beer', 'Beer Pilsner Glass'), ('Sierra Nevada 12 Pack Bottles', 39.46, 'Beer', 'Beer Pilsner Glass'), ('Barefoot Chardonnay 750 mL Bottle', 11.92, 'Wine', 'White Wine-11oz'), ('Apothic Red Blend 750 mL Bottle', 18.24, 'Wine', 'Red Wine-12oz.'), ('La Crema Pinor Noir 750 mL Bottle', 45.96, 'Wine', 'Red Wine-12oz.'), ('Yellow Tail Reisling 750 mL Bottle', 19.74, 'Wine', 'White Wine-11oz'), ('Kirkland Chianti 750 mL Bottle', 17.98, 'Wine', 'Red Wine-12oz.'), ('Cupcake Pinot Grigio 750 mL Bottle', 17.66, 'Wine', 'White Wine-11oz'), ('Bollinger Champagne 750 mL Bottle', 65.8, 'Wine', 'Champagne Flute'), ("Jack Daniel's Whiskey 750 mL Bottle", 35.96, 'Liquor', 'Old Fashioned Glass'), ('Smirnoff Vodka 750 mL Bottle', 39.74, 'Liquor', 'Old Fashioned Glass'), ('Bacardi Rum 750 mL Bottle', 39.96, 'Liquor', 'Old Fashioned Glass'), ('Patron Tequila 750 mL Bottle', 70.24, 'Liquor', 'Old Fashioned Glass'), ('Tanquerey Gin 750 mL Bottle', 47.68, 'Liquor', 'Old Fashioned Glass')'

-- labor_cost

INSERT INTO labor_cost (role, cost_per_hour) VALUES ('Manager', 50), ('Server', 25), ('Bartender', 35), ('Event Chef', 40), ('Prep Chef', 30)

-- Queries used in the most basic form of the app, which calculates price of selected food items (Plan to add functionality for bar items, event set-up/tableware/add-ons, other event details).

-- Query to get menu information to display menu:
SELECT name, cost_per_item AS price, course FROM menu_items ORDER BY name

-- Select price from menu_items table for selected items:
SELECT cost_per_item AS price FROM menu_items WHERE name = ? -- Run each time for selected item

-- Future query functionality will need to be added to app for various purposes:

-- For example, to update menu item price, :
UPDATE menu_items SET cost_per_item = ? WHERE name = ?

-- DELETE menu item and associated ingredients by cascade (similar query can be used for bar item or equipment):
DELETE FROM menu_items WHERE name = ?

-- Add menu item 
INSERT INTO menu_items VALUES (new_item_name, new_item_course, ...)

-- Add ingredients for new menu_item
INSERT INTO menu_item_ingredients VALUES (menu_item, ingredient, quantity, production_amount)

-- Get ingredients list
SELECT i.menu_item, menu_item_ingredient, i.quantity * (? / i.production_amount)
FROM menu_items AS m LEFT JOIN menu_item_ingredients AS i
WHERE i.menu_item = ? 
-- The first ? will be the value for amount of given menu item the customer selects, and the second ? in the where clause will be the selected menu item. The customer will select different amounts for each menu item so this query will be run for all the different items selected to get the full ingredients list, and this information will be stored in the JSON object generated for the estimate and stored in a MongoDB collection.

-- Generating a full equipment list will involve querying the bar_items and menu_items tables to get the serving equipment for selected menu items, and adding this to the equipment selected by the customer. This information will be in the MongoDB collection for a given estimate.
