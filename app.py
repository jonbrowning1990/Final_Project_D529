from flask import Flask, jsonify, request, render_template
import sqlite3
import os
import pandas as pd
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from bson.objectid import ObjectId

app = Flask(__name__)

# Ensure that json items that are commuincated through API maintain their order
app.json.sort_keys = False

DATABASE = 'catering_sqlite.db'
uri = "mongodb+srv://owner:owner_password@cateringapp.ier9wmu.mongodb.net/?retryWrites=true&w=majority&appName=CateringApp"
# Database initialization and sqlite connection functions

def get_db_connection():
    # Gets SQLite database connection
    conn = sqlite3.connect(DATABASE)
    conn.execute("PRAGMA foreign_keys = 1") #Enfore foreign keys
    conn.row_factory = sqlite3.Row
    return conn

def get_mongo_db_connection():
    client = MongoClient(uri, server_api=ServerApi('1'))
    return client

def init_db():
    """Initializes the database schema and populates with sample data."""
    if not os.path.exists(DATABASE):
        print(f"Creating database: {DATABASE}")
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""CREATE TABLE IF NOT EXISTS equipment (
  `name` VARCHAR(100) NOT NULL,
  `cost_per_item` FLOAT NOT NULL,
  `category` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`name`))""")

        cursor.execute("""CREATE TABLE IF NOT EXISTS bar_items (
  `name` VARCHAR(50) NOT NULL,
  `cost_per_item` FLOAT NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `serving_container` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`name`),
  FOREIGN KEY(`serving_container`) REFERENCES `equipment` (`name`))""")

        cursor.execute("""CREATE TABLE IF NOT EXISTS labor_cost (
  `role` VARCHAR(45) NOT NULL,
  `cost_per_hour` FLOAT NOT NULL,
  PRIMARY KEY (`role`))""")

        cursor.execute("""CREATE TABLE IF NOT EXISTS menu_items (
  `name` VARCHAR(100) NOT NULL,
  `course` VARCHAR(45) NOT NULL,
  `prep_time` INT NOT NULL,
  `cook_time` INT NOT NULL,
  `serving_container` VARCHAR(100) NOT NULL,
  `serving_utensil` VARCHAR(100) NOT NULL,
  `oven` TINYINT NOT NULL,
  `fridge` TINYINT NOT NULL,
  `cost_per_item` FLOAT NOT NULL,
  PRIMARY KEY (`name`),
  FOREIGN KEY (`serving_container`) REFERENCES `equipment` (`name`),
  FOREIGN KEY (`serving_utensil`) REFERENCES `equipment` (`name`))""")

        cursor.execute("""CREATE TABLE IF NOT EXISTS `menu_item_ingredients` (
  `menu_item` VARCHAR(100) NOT NULL,
  `menu_item_ingredient` VARCHAR(250) NOT NULL,
  `quantity` FLOAT NOT NULL,
  `production_amount` INT NOT NULL,
  PRIMARY KEY (`menu_item`, `menu_item_ingredient`),
  FOREIGN KEY (`menu_item`) REFERENCES `menu_items` (`name`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)""")

        cursor.execute("""INSERT INTO equipment(name, cost_per_item, category) VALUES ('Wood Chiavari Chair', 2.97, 'Chairs'), ('Ghost Chair With Arms', 4.93, 'Chairs'), ('Industrial Metal Chair with Arms', 4.99, 'Chairs'), ('Farmhouse Cross Back Chair', 3.4, 'Chairs'), ('King Louis Chair', 7.47, 'Chairs'), ('Titan Plastic Folding Chair', 0.9, 'Chairs'), ('Titan Aluminum Plastic Folding Chair', 1.35, 'Chairs'), ('Wood Folding Chair', 1.77, 'Chairs'), ('French Bistro Folding Chair', 2.0, 'Chairs'), ("60'' Round Wood Folding Table (Seats 5-6)", 8.67, 'Tables'), ("72'' Round Wood Folding Table (Seats 8-10)", 11.47, 'Tables'), ("60'' Round Plastic Folding Table (Seats 5-6)", 9.22, 'Tables'), ("72'' Round Plastic Folding Table (Seats 8-10)", 13.62, 'Tables'), ("Plastic Folding Table - 8'x30'' banquet (Seats 8-10)", 7.5, 'Tables'), ("Plastic Folding Table - 6' x 30'' Banquet (Seats 6-8)", 4.97, 'Tables'), ("Wood Folding Table - 8'x30'' banquet (Seats 8-10)", 10.56, 'Tables'), ("Wood Folding Table - 6' x 30'' Banquet (Seats 6-8)", 6.74, 'Tables'), ("Farmhouse Folding Farm Table - 8'x40'' - Rustic - H-Legs (Seats 8-12)", 27.02, 'Tables'), ("Industrial Metal Cocktail Table 30'' Square", 15.7, 'Cocktail Tables'), ("Cocktail table - 24'' Wood Round", 12.85, 'Cocktail Tables'), ("Cocktail table - 30'' Wood Round", 13.25, 'Cocktail Tables'), ("Cocktail table - 36'' Wood Round", 13.85, 'Cocktail Tables'), ("Cocktail table - 30'' Wood Square", 12.95, 'Cocktail Tables'), ("Cocktail table - 36'' Wood Square", 13.15, 'Cocktail Tables'), ('Tablecloths (Black, White, Ivory, Navy, Grey)', 10.0, 'Table Linens'), ('Table Runners (Black, White, Ivory, Navy, Grey)', 8.0, 'Table Linens'), ('Sun Umbrella', 20.0, 'Extras'), ("Small Stage (5' x 10')", 500.0, 'Extras'), ("Large Stage (10' x 15')", 1000.0, 'Extras'), ("Small Dance Floor (12' Square)", 250.0, 'Extras'), ("Large Dance Floor (20' Square)", 500.0, 'Extras'), ('Podium', 75.0, 'Extras'), ("Plastic Dinner Plate-10''", 0.3, 'Tableware'), ("Plastic Salad/Dessert Plate- 6''", 0.15, 'Tableware'), ('Porcelain Dinner Plate-10"', 1.5, 'Tableware'), ('Porcelain Salad/Dessert Plate 6"', 1.0, 'Tableware'), ('Plastic Fork', 0.1, 'Tableware'), ('Plastic Knive', 0.1, 'Tableware'), ('Dinner Fork-Stainless (10pk)', 0.5, 'Tableware'), ('Dinner Knife-Stainless (10pk)', 0.5, 'Tableware'), ('Plastic Cups 12oz', 0.2, 'Tableware'), ('Plastic Wine Cups 9oz', 0.15, 'Tableware'), ('Beer Pilsner Glass', 1.5, 'Tableware'), ('Champagne Flute', 2.5, 'Tableware'), ('Red Wine-12oz.', 1.5, 'Tableware'), ('Water Goblets', 1.5, 'Tableware'), ('White Wine-11oz', 1.5, 'Tableware'), ('Old Fashioned Glass', 2.5, 'Tableware'), ('Oven', 400.0, 'Kitchen'), ('Refrigerator', 300.0, 'Kitchen'), ("12 '' Oval Ceramic Platter", 2.42, 'Serving'), ('18" x 5" Rectangular Ceramic Serving Platter', 4.85, 'Serving'), ('Rectangular Chafing Dish', 23.28, 'Serving'), ('Round Chafing Dish', 17.2, 'Serving'), ('Serving Spoon', 1.35, 'Serving'), ('Serving Fork', 1.35, 'Serving'), ('Spatula', 1.5, 'Serving'), ('Appetizer Tongs', 1.5, 'Serving'), ('Serving Tongs', 1.82, 'Serving'), ('Salad Serving Bowl', 3.9, 'Serving')""")

        cursor.execute("""INSERT INTO bar_items (name, cost_per_item, category, serving_container) VALUES ('Coke 2L Bottle', 5.48, 'Soft Drinks', 'Plastic Cups 12oz'), ('Diet Coke 2L Bottle', 5.48, 'Soft Drinks', 'Plastic Cups 12oz'), ('Sprite 2L Bottle', 5.48, 'Soft Drinks', 'Plastic Cups 12oz'), ('Dr. Pepper 2L Bottle', 5.28, 'Soft Drinks', 'Plastic Cups 12oz'), ('Fanta 2L Bottle', 3.76, 'Soft Drinks', 'Plastic Cups 12oz'), ('Modelo 12 Pack Bottles', 32.84, 'Beer', 'Beer Pilsner Glass'), ('Budweiser 12 Pack Bottles', 26.24, 'Beer', 'Beer Pilsner Glass'), ('Bud Light 12 Pack Bottles', 26.24, 'Beer', 'Beer Pilsner Glass'), ('Heineken 12 Pack Bottles', 32.88, 'Beer', 'Beer Pilsner Glass'), ('Lagunitas 12 Pack Bottles', 33.68, 'Beer', 'Beer Pilsner Glass'), ('Sierra Nevada 12 Pack Bottles', 39.46, 'Beer', 'Beer Pilsner Glass'), ('Barefoot Chardonnay 750 mL Bottle', 11.92, 'Wine', 'White Wine-11oz'), ('Apothic Red Blend 750 mL Bottle', 18.24, 'Wine', 'Red Wine-12oz.'), ('La Crema Pinor Noir 750 mL Bottle', 45.96, 'Wine', 'Red Wine-12oz.'), ('Yellow Tail Reisling 750 mL Bottle', 19.74, 'Wine', 'White Wine-11oz'), ('Kirkland Chianti 750 mL Bottle', 17.98, 'Wine', 'Red Wine-12oz.'), ('Cupcake Pinot Grigio 750 mL Bottle', 17.66, 'Wine', 'White Wine-11oz'), ('Bollinger Champagne 750 mL Bottle', 65.8, 'Wine', 'Champagne Flute'), ("Jack Daniel's Whiskey 750 mL Bottle", 35.96, 'Liquor', 'Old Fashioned Glass'), ('Smirnoff Vodka 750 mL Bottle', 39.74, 'Liquor', 'Old Fashioned Glass'), ('Bacardi Rum 750 mL Bottle', 39.96, 'Liquor', 'Old Fashioned Glass'), ('Patron Tequila 750 mL Bottle', 70.24, 'Liquor', 'Old Fashioned Glass'), ('Tanquerey Gin 750 mL Bottle', 47.68, 'Liquor', 'Old Fashioned Glass')""")

        cursor.execute("INSERT INTO labor_cost (role, cost_per_hour) VALUES ('Manager', 50), ('Server', 25), ('Bartender', 35), ('Event Chef', 40), ('Prep Chef', 30)")

        cursor.execute("""INSERT INTO menu_items(name, course, prep_time, cook_time, serving_container,	serving_utensil, oven, 
    fridge, cost_per_item) VALUES ('Baked Chicken Wings with Thai Peanut Sauce', 'Appetizers', 40, 50, "12 '' Oval Ceramic Platter", 'Appetizer Tongs', 1, 0, 2.49), ('Homemade Chorizo Meatballs in Cilantro Masa Cups', 'Appetizers', 10, 28, "12 '' Oval Ceramic Platter", 'Appetizer Tongs', 1, 0, 0.99), ('Bruschetta Caprese', 'Appetizers', 10, 10, "12 '' Oval Ceramic Platter", 'Appetizer Tongs', 0, 1, 1.49), ('Beet-Pickled Quail Eggs', 'Appetizers', 20, 10, "12 '' Oval Ceramic Platter", 'Appetizer Tongs', 0, 1, 1.99), ('Fried Green Tomato Tacos', 'Appetizers', 20, 20, "12 '' Oval Ceramic Platter", 'Appetizer Tongs', 0, 0, 2.49), ('Chinese Sticky Rice Prawn Parcels', 'Appetizers', 20, 15, "12 '' Oval Ceramic Platter", 'Appetizer Tongs', 1, 0, 2.49), ('Ham Jalapeno Green Onion Quesadilla', 'Appetizers', 5, 10, "12 '' Oval Ceramic Platter", 'Appetizer Tongs', 1, 0, 1.99), ('Rosemary Parmesan Focaccia', 'Breads', 10, 10, '18" x 5" Rectangular Ceramic Serving Platter', 'Serving Tongs', 1, 0, 2.49), ('Buttermilk Cornbread', 'Breads', 10, 20, '18" x 5" Rectangular Ceramic Serving Platter', 'Serving Tongs', 1, 0, 2.99), ('Cheese Garlic Biscuits', 'Breads', 10, 20, '18" x 5" Rectangular Ceramic Serving Platter', 'Serving Tongs', 1, 0, 2.49), ('Basil-Buttered French Bread', 'Breads', 10, 10, '18" x 5" Rectangular Ceramic Serving Platter', 'Serving Tongs', 1, 0, 3.49), ('Tiramisu (Serves 10)', 'Desserts', 15, 3, "12 '' Oval Ceramic Platter", 'Spatula', 0, 1, 19.99), ('Triple Chocolate Cookies', 'Desserts', 15, 15, "12 '' Oval Ceramic Platter", 'Appetizer Tongs', 0, 0, 2.49), ('Sweet Cherry Pie (Serves 8)', 'Desserts', 15, 30, 'Porcelain Dinner Plate-10"', 'Spatula', 1, 0, 14.99), ('Toasted-Pecan Pie (Serves 8)', 'Desserts', 15, 30, 'Porcelain Dinner Plate-10"', 'Spatula', 1, 0, 14.99), ('Almond Biscotti', 'Desserts', 45, 15, "12 '' Oval Ceramic Platter", 'Appetizer Tongs', 0, 0, 1.99), ('French Meringues', 'Desserts', 5, 10, "12 '' Oval Ceramic Platter", 'Appetizer Tongs', 0, 0, 2.99), ('Soft Sugar Cookies', 'Desserts', 30, 20, "12 '' Oval Ceramic Platter", 'Appetizer Tongs', 0, 0, 2.49), ('Fresh Persimmon Cake (Serves 10)', 'Desserts', 10, 15, "12 '' Oval Ceramic Platter", 'Spatula', 1, 0, 24.99), ('Honey-Mustard Pork Tenderloin with Kale', 'Main Dishes', 30, 45, 'Rectangular Chafing Dish', 'Serving Tongs', 1, 0, 27.99), ('Baked Chicken Bean and Cheese Empanadas', 'Main Dishes', 30, 30, 'Rectangular Chafing Dish', 'Serving Tongs', 1, 0, 19.99), ('Ricotta and Spinach Stuffed Manicotti', 'Main Dishes', 30, 45, 'Rectangular Chafing Dish', 'Serving Spoon', 1, 0, 22.99), ('Ricotta Fettuccine Alfredo with Broccoli', 'Main Dishes', 30, 20, 'Rectangular Chafing Dish', 'Serving Tongs', 1, 1, 21.99), ('Italian Pot Roast with Artichokes and Potatoes', 'Main Dishes', 30, 60, 'Rectangular Chafing Dish', 'Serving Tongs', 1, 0, 29.99), ('Veal Ravioli with Walnut Sauce', 'Main Dishes', 30, 20, 'Rectangular Chafing Dish', 'Serving Tongs', 1, 0, 32.99), ('Teriyaki Salmon with Cucumber Salad', 'Main Dishes', 30, 20, 'Rectangular Chafing Dish', 'Spatula', 1, 1, 34.99), ('Chicken Tikka Masala', 'Main Dishes', 30, 30, 'Rectangular Chafing Dish', 'Serving Spoon', 1, 0, 23.99), ('Quiche Lorraine', 'Main Dishes', 30, 40, 'Rectangular Chafing Dish', 'Spatula', 1, 0, 21.99), ('Indian Almond Chicken with Peas', 'Main Dishes', 30, 40, 'Rectangular Chafing Dish', 'Serving Spoon', 1, 0, 26.99), ('Mexican Baked Spaghetti Squash', 'Main Dishes', 30, 35, 'Rectangular Chafing Dish', 'Serving Spoon', 1, 0, 21.99), ('Risotto With Lemon And Sun Dried Tomatoes', 'Main Dishes', 15, 40, 'Rectangular Chafing Dish', 'Serving Tongs', 1, 0, 22.99), ('Red Cabbage, Cranberry, and Apple Slaw', 'Salads', 15, 5, 'Salad Serving Bowl', 'Serving Tongs', 0, 1, 7.99), ('Quinoa Salad with Grilled Scallions, Favas and Dates', 'Salads', 15, 5, 'Salad Serving Bowl', 'Serving Spoon', 0, 1, 6.99), ('Mixed Greens with Smoked Gouda', 'Salads', 15, 5, 'Salad Serving Bowl', 'Serving Tongs', 0, 1, 7.99), ('Crunchy Romaine Toss', 'Salads', 15, 5, 'Salad Serving Bowl', 'Serving Tongs', 0, 1, 6.99), ('Panzanella', 'Salads', 15, 5, 'Salad Serving Bowl', 'Serving Spoon', 0, 1, 5.99), ('Mediterranean Chopped Salad with Tomatoes, Peppers, Feta, and Basil', 'Salads', 15, 5, 'Salad Serving Bowl', 'Serving Tongs', 0, 1, 8.99), ('Cucumber Salad', 'Salads', 15, 5, 'Salad Serving Bowl', 'Serving Spoon', 0, 1, 6.99), ('Green Beans with Roasted Tomatoes and Cumin', 'Side Dishes', 10, 20, 'Round Chafing Dish', 'Serving Tongs', 1, 0, 4.99), ('Elote, or Mexican Grilled Corn', 'Side Dishes', 5, 30, 'Round Chafing Dish', 'Serving Tongs', 1, 0, 4.99), ('Glazed Root Vegetables', 'Side Dishes', 10, 30, 'Round Chafing Dish', 'Serving Spoon', 1, 0, 3.99), ('Roasted New Potatoes', 'Side Dishes', 5, 40, 'Round Chafing Dish', 'Serving Spoon', 1, 0, 3.99), ('Best Ever Boston Baked Beans', 'Side Dishes', 10, 30, 'Round Chafing Dish', 'Serving Spoon', 1, 0, 4.99), ('Cilantro Serrano Mexican Rice', 'Side Dishes', 10, 20, 'Round Chafing Dish', 'Serving Spoon', 1, 0, 3.99), ('Grilled Fresh Artichokes', 'Side Dishes', 20, 45, 'Round Chafing Dish', 'Serving Tongs', 1, 0, 7.99), ('Pineapple Fried Rice', 'Side Dishes', 10, 20, 'Round Chafing Dish', 'Serving Spoon', 1, 0, 4.99)
    """)

        menu_items_ingredients = pd.read_csv('ingredients_finished.csv')
        menu_items_ingredients = menu_items_ingredients.drop_duplicates(subset=['Menu_Item', 'Ingredient'])
        menu_items_ingredients.columns = ['menu_item', 'menu_item_ingredient', 'quantity', 'production_amount']

        menu_items_ingredients.to_sql('menu_item_ingredients', conn, if_exists='append', index=False)

        conn.close()


# Rendering pages
@app.route('/')
def index():
    """Renders the main menu page."""
    return render_template('menu.html')

@app.route('/order')
def order_page():
    """Renders the order form page."""
    return render_template('order.html')

@app.route('/bar')
def bar_page():
    """Renders the bar items page."""
    return render_template('bar_items.html')

@app.route('/equipment')
def equipment_page():
    """Renders the equipment offerings page."""
    return render_template('equipment.html')

@app.route('/update')
def update_page():
    """Renders the upddate offerings page."""
    return render_template('update.html')

@app.route('/delete')
def delete_page():
    """Renders the delete offerings page."""
    return render_template('delete.html')

@app.route('/add')
def add_page():
    """Renders the add offerings page."""
    return render_template('add.html')

@app.route('/owner')
def owner():
    """Renders the owner home page."""
    return render_template('owner.html')

@app.route('/display')
def display():
    """Renders the display estimate page."""
    return render_template('display.html')

@app.route('/inspect')
def inspect():
    """Renders the inspect estimate page."""
    return render_template('inspect.html')

@app.route('/ingredientslist')
def ingredients_list():
    """Renders the ingredients list page."""
    return render_template('ingredientslist.html')

@app.route('/equipmentlist')
def equipment_list():
    """Renders the ingredients list page."""
    return render_template('equipmentlist.html')

# API functions that allow for inputs to be used for SQLite database queries with desired results returned
@app.route('/api/menu', methods=['GET'])
def get_menu():
    """
    API endpoint to getch all menu items, categorized
    """
    conn = get_db_connection()
    
    
    # Fetch all menu items

    menu_items = conn.execute('SELECT name, cost_per_item AS price, course FROM menu_items').fetchall()
    
    categories = ['Appetizers','Salads','Breads','Main Dishes', 'Side Dishes','Desserts']

    # Organize menu items by category
    categorized_menu = {cat: [] for cat in categories}
    for item in menu_items:
        # Find the category name for the current item
        for cat in categories:
            if cat == item['course']:
                categorized_menu[cat].append(dict(item))
                break
    
    return jsonify(categorized_menu)

@app.route('/api/bar_items', methods=['GET'])
def get_bar_items():
    """
    API endpoint to fetch all bar items, categorized.
    Returns: JSON object where keys are category names and values are lists of bar items.
    """
    conn = get_db_connection()

    bar_items = conn.execute('SELECT name, cost_per_item AS price, category FROM bar_items').fetchall()
    
    categories = ['Beer', 'Wine', 'Liquor', 'Soft Drinks']
    categorized_bar_items = {cat: [] for cat in categories}
    for item in bar_items:
        for cat in categories:
            if cat == item['category']:
                categorized_bar_items[cat].append(dict(item))
                break
    return jsonify(categorized_bar_items)

@app.route('/api/equipment', methods=['GET'])
def get_equipment():
    """
    API endpoint to fetch equipment items, categorized.
    Returns: JSON object where keys are category names and values are lists of bar items.
    """
    conn = get_db_connection()
    categories = ['Chairs', 'Tables', 'Cocktail Tables', 'Table Linens', 'Tableware','Extras']
    equipment_items = conn.execute('SELECT name, cost_per_item AS price, category FROM equipment').fetchall()
    conn.close()

    categorized_equipment = {cat: [] for cat in categories}
    for item in equipment_items:
        for cat in categories:
            if cat == item['category']:
                categorized_equipment[cat].append(dict(item))
                break
    return jsonify(categorized_equipment)

@app.route('/api/estimate', methods=['POST'])
def get_estimate():
    """
    API endpoint to get estimate data.
    Returns: JSON object with pricing (subtotals, tax, fees) and user selections to render detailed estimate
    """

    order_data = request.json
    print(order_data)
    selected_items = order_data.get('items', [])
    other_details = order_data.get('other_details')
    
    subtotal = 0.0
    conn = get_db_connection()
    table_mapper = {'menu': 'menu_items', 'bar': 'bar_items', 'equipment': 'equipment'}
    selection_list = []
    oven, fridge = (False, False)

    try:
        for item in selected_items:
            item_name = item.get('name')
            quantity = item.get('quantity')
            item_type = item.get('type')
            # Get correct table to map to
            item_table = table_mapper[item_type]

            if not isinstance(item_name, str) or not isinstance(quantity, int) or quantity <= 0:
                return jsonify({"error": "Invalid item name or quantity."}), 400

            # Retrieve price from the database
            # Logic to deal with quotation bug
            price_query = ''
            if "'" in item_name:
                price_query = f'SELECT name, cost_per_item AS price FROM {item_table} WHERE name = "{item_name}"'
            else:
                price_query = f"SELECT name, cost_per_item AS price FROM {item_table} WHERE name LIKE '{item_name}%'"
            cursor = conn.execute(price_query)
            product = cursor.fetchone()

            selection_list.append(
                {'name': product['name'], 'quantity': quantity, 'category': item_type.capitalize(), 'price': product['price']})

            if product:
                subtotal += product['price'] * quantity
            else:
                return jsonify({"error": f"Menu item with name {item_name} not found."}), 404


            if item_type == 'menu':
                oven_fridge_yes_no = conn.execute(f'SELECT oven, fridge FROM menu_items WHERE name = "{item_name}"').fetchone()
                if oven_fridge_yes_no['oven'] == 1:
                    oven = True
                if oven_fridge_yes_no['fridge'] == 1:
                    fridge = True

        if (oven and other_details['venueKitchen'] == 'no'):
            oven_price = conn.execute('SELECT cost_per_item AS price FROM equipment WHERE name = "Oven"').fetchone()
            selection_list.append({'name': 'Oven', 'quantity': 1, 'category': 'Kitchen', 'price': oven_price['price']})
            subtotal += oven_price['price']
        if fridge and other_details['venueKitchen'] == 'no':
            fridge_price = conn.execute('SELECT cost_per_item AS price FROM equipment WHERE name = "Refrigerator"').fetchone()
            selection_list.append({'name': 'Refrigerator', 'quantity': 1, 'category': 'Kitchen', 'price': fridge_price['price']})
            subtotal += fridge_price['price']

    except Exception as e:
        # Generic error handling for database issues or unexpected data
        return jsonify({"error": f"{print(selected_items)} An error occurred during estimation: {str(e)}"}), 500
    finally:
        conn.close()

    # - Service fees, delivery fees based on location
    service_fee = subtotal * 0.15
    # - Tax calculation
    sales_tax = (subtotal + service_fee) * 0.05
    # - Total
    total_estimate = subtotal + service_fee + sales_tax

    return jsonify({"subtotal": round(subtotal, 2), "total_estimate": round(total_estimate, 2),
                    "service_fee": round(service_fee, 2), "sales_tax": round(sales_tax, 2), "selections": selection_list})

@app.route('/api/submit', methods=['POST'])
def submit_estimate():
    order_data = request.json
    print(order_data)
    if order_data:
        client = get_mongo_db_connection()
        try:
            db = client.CateringApp
            collection = db.Estimate_Submissions
            _id = collection.insert_one(order_data)
            id_string = str(_id.inserted_id)
        except Exception as e:
            # Error handling
            return jsonify({"error": f"An error occurred during update: {str(e)}"}), 500
        finally:
            client.close()
    return jsonify({"message": f"Estimate ID - {id_string}"})

@app.route('/api/retrieval', methods=['POST'])
def estimate_retrieval():
    form_data = request.json
    print(form_data)
    id_num = form_data['idNumber']
    client = get_mongo_db_connection()
    print(id_num)
    try:
        db = client.CateringApp
        collection = db.Estimate_Submissions
        estimate = collection.find_one(ObjectId(id_num))
        estimate['_id'] = str(estimate['_id'])
        print(estimate)
        return jsonify(estimate)
    except Exception as e:
        # Error handling
        return jsonify({"error": f"An error occurred during retrieval: {str(e)}"}), 500
    finally:
        client.close()

@app.route('/api/ingredientslist', methods=['POST'])
def get_ingredients_list():
    form_data = request.json
    print(form_data)
    id_num = form_data['idNumber']
    client = get_mongo_db_connection()
    print(id_num)
    try:
        db = client.CateringApp
        collection = db.Estimate_Submissions
        estimate = collection.find_one(ObjectId(id_num))
        foods_and_quantities = [(item['name'], item['quantity']) for item in estimate['items'] if item['type'] == 'menu']
        ingredient_list = {}
        conn = get_db_connection()
        cursor = conn.cursor()
        for item in foods_and_quantities:
            records = cursor.execute(f'''SELECT  ROUND(mii.quantity * {item[1]} / mii.production_amount, 2) AS quantity, mii.menu_item_ingredient AS ingredient FROM menu_items 
                                                LEFT JOIN menu_item_ingredients AS mii ON menu_items.name = mii.menu_item 
                                                WHERE menu_items.name = "{item[0]}"''')
            ingredient_list[f'(MAKE {item[1]}): ' + item[0]] = [{'quantity': x[0], 'ingredient': x[1]} for x in records]
        print(ingredient_list)
        return jsonify(ingredient_list)
    except Exception as e:
        # Error handling
        return jsonify({"error": f"An error occurred during retrieval: {str(e)}"}), 500
    finally:
        client.close()
        conn.close()

@app.route('/api/equipmentlist', methods=['POST'])
def get_equipment_list():
    form_data = request.json
    id_num = form_data['idNumber']
    client = get_mongo_db_connection()
    try:
        db = client.CateringApp
        collection = db.Estimate_Submissions
        estimate = collection.find_one(ObjectId(id_num))
        conn = get_db_connection()
        cursor = conn.cursor()
        print(estimate)
        menu_items = [(item['name'], item['quantity']) for item in estimate['items'] if item['type'] == 'menu']
        bar_items = [(item['name'], item['quantity']) for item in estimate['items'] if item['type'] == 'bar']
        equipment_items = [(item['name'], item['quantity']) for item in estimate['items'] if
                           item['type'] == 'equipment']
        menu_equipment = []
        for item in menu_items:
            container = cursor.execute(f'''SELECT  1, mi.serving_container, e.category FROM menu_items AS mi
                                                INNER JOIN equipment AS e ON mi.serving_container = e.name WHERE mi.name = "{item[0]}"''')
            menu_equipment.append(list(container)[0])
            utensil = cursor.execute(f'''SELECT  1, mi.serving_utensil, e.category FROM menu_items AS mi
                                                INNER JOIN equipment AS e ON mi.serving_utensil = e.name WHERE mi.name = "{item[0]}"''')
            menu_equipment.append(list(utensil)[0])

        bar_equipment = []
        for item in bar_items:
            container = cursor.execute(f'''SELECT 
                                        CASE WHEN bi.category = 'Beer' THEN {item[1]} * 12
                                             WHEN bi.category = 'Wine' THEN {item[1]} * 5
                                             WHEN bi.category = 'Liquor' THEN {item[1]} * 20
                                             ELSE {item[1]} * 10
                                             END AS quantity,
                                             bi.serving_container AS serving_container,
                                             e.category FROM bar_items AS bi
                                                INNER JOIN equipment AS e ON bi.serving_container = e.name WHERE bi.name = "{item[0]}"''')
            bar_equipment.append(list(container)[0])

        equipment = []
        for item in equipment_items:
            container = cursor.execute(
                f'''SELECT {item[1]}, name, category FROM equipment WHERE name = "{item[0].replace('"', '""')}"''')
            equipment.append(list(container)[0])

        equipment_dict = {}
        for item in menu_equipment + bar_equipment + equipment:
            if item[2] not in equipment_dict:
                equipment_dict[item[2]] = []
                equipment_dict[item[2]].append({'name': item[1], 'quantity': item[0]})
            else:
                if item[1] not in [x['name'] for x in equipment_dict[item[2]]]:
                    equipment_dict[item[2]].append({'name': item[1], 'quantity': item[0]})
                else:
                    equipment_dict[item[2]] = [
                        {'quantity': x['quantity'] + item[0], 'name': x['name']} if item[1] == x['name'] else x for x in
                        equipment_dict[item[2]]]
        print(equipment_dict)
        return jsonify(equipment_dict)
    except Exception as e:
        # Error handling
        return jsonify({"error": f"An error occurred during retrieval: {str(e)}"}), 500
    finally:
        client.close()
        conn.close()

@app.route('/api/update_category', methods=['GET'])
def get_items_by_category():
    """
    API endpoint to  getitems in each category for update.
    Returns: JSON object with items for selected category
    """
    
    table_selection = request.args.get('category')
    print(table_selection)
    conn = get_db_connection()

    if table_selection == 'menu_items':
        items = conn.execute(f'SELECT name, course FROM {table_selection} ORDER BY course').fetchall()
        items = [{'name': x['name'], 'category':x['course']} for x in items]
    else:
        items = conn.execute(f'SELECT name, category FROM {table_selection} ORDER BY category').fetchall()
        items = [{'name': x['name'], 'category': x['category']} for x in items]
    print(items)
    conn.close()

    return jsonify(items)

@app.route('/api/get_item_details', methods=['GET'])
def get_item_details():
    """
    API endpoint to get item details for update of selected item.
    Returns: JSON object with keys and values of fields of the selected item's table.
    In the case of menu items being updated, fields and values of the menu item in the menu_item table
    as well as all ingredients and quantities in the menu_item_ingredients table are included.
    """
    
    table_selection = request.args.get('category')
    item_name = request.args.get('item_name')
    conn = get_db_connection()

    # Menu items requires separate treatment as updating items involves updating both the menu_items and menu_item_ingredients tables
    if table_selection == 'menu_items':
        menu_item_details = conn.execute(f'''SELECT * FROM menu_items WHERE name = "{item_name}"''').fetchone()
        ingredient_details = conn.execute(f'''SELECT mii.menu_item_ingredient, mii.quantity, mii.production_amount FROM menu_items 
                                        LEFT JOIN menu_item_ingredients AS mii ON menu_items.name = mii.menu_item 
                                        WHERE menu_items.name = "{item_name}"''').fetchall()
        items_quantities = sum([list(entry)[1::-1] for entry in ingredient_details], []) # Get list of all ingredient entries
        labels = ingredient_details[0].keys()[1::-1] * len(ingredient_details) # Get list of all ingredient keys
        labels = [labels[x] + '_' + str(x // 2 + 1) for x in range(len(labels))] # Add _n to all ingredient keys corresponding to number of ingredient
        production = [('production_amount', ingredient_details[0]['production_amount'])] # Get production amount
        ingredients_list_json = production + list(zip(labels, items_quantities))
        menu_items_list_json = list(zip(menu_item_details.keys(), list(menu_item_details)))
        full_list_json = dict(menu_items_list_json + ingredients_list_json)
        conn.close()
        print(full_list_json)
        return jsonify(full_list_json)

    # Bar items and equipment items are easier to update
    else:
        price_query = f'SELECT * FROM {table_selection} WHERE name = "{item_name.replace('"', '""')}"'
        item_details = conn.execute(price_query).fetchone()
        conn.close()
        items_list_json = dict(zip(item_details.keys(), list(item_details)))
        print(items_list_json)
        return jsonify(items_list_json)


@app.route('/api/submit_update',  methods=['POST'])
def submit_update():
    """
    API endpoint to update item details in database for selected item.
    Returns: JSON object with message of either successful update or error
    Includes functionality where owner can end menu item ingredient with a + or a - to either add a new ingredient or delete ingredient
    """
    update_data = request.get_json()
    category = update_data.get('category')
    updates = update_data.get('updates')
    original_name = update_data.get('item_name')

    conn = get_db_connection()
    
    # bar_items or equipment query
    if category != 'menu_items':
        try:
            values_list = [x[0] + ' = "' + str(x[1].replace('"', '""')) + '"'  for x in updates.items()]
            values_clause = ', '.join(values_list)
            print(f'UPDATE {category} SET {values_clause} WHERE name = "{original_name.replace('"', '""')}"')
            conn.execute(f'UPDATE {category} SET {values_clause} WHERE name = "{original_name.replace('"', '""')}"')
            return jsonify({'message': 'Success'})
        except Exception as e:
            # Error handling
            return jsonify({"error": f"An error occurred during update: {str(e)}"}), 500
        finally:
            conn.commit()
            conn.close()
    else:
        try:
            # menu_items table query values
            menu_items_updates = [update[0] + ' = "' + str(update[1].replace('"', '""')) + '"' for update in list(updates.items())[0:9]]
            menu_items_values_clause = ', '.join(menu_items_updates)
            update_clause = f'UPDATE menu_items SET {menu_items_values_clause} WHERE name = "{original_name}"'
            print(update_clause)
            # menu_item_ingredients queries which will delete current items and re-add updated ones, with option to add/remove ingredients
            # First generate the values of each column
            quantities = ['"' + str(update[1]) + '"' for update in list(updates.items())[10::2]]
            ingredients = ['"' + str(update[1]) + '"' for update in list(updates.items())[11::2]]
            production = ['"' + updates['production_amount'] + '"' for x in range(len(quantities))]
            menu_item = ['"' + updates['name'] + '"' for x in range(len(quantities))]
            
            #Python code to get insert new ingredient in + is entered at end of ingredient or delete old ingredient if - is entered
            for (x, ingredient) in enumerate(ingredients.copy()):
                if ingredient[-2:] == '+"':
                    ingredients[x] = ingredients[x][:-2] + '"'
                    ingredients = ingredients[:x+1] + ['"New ingredient"',] + ingredients[x+1:]
                    quantities = quantities[:x+1] + ['0'] + quantities[x+1:]
                    production = production + production[:1]
                    menu_item = menu_item + menu_item[:1]
                elif ingredient[-2:] == '-"':
                    ingredients = ingredients[:x] + ingredients[1+x:]
                    quantities = quantities[:x] + quantities[1+x:]
                    production = production[:-1]
                    menu_item = menu_item[:-1]
                else:
                    pass

            # Next string together entire query
            update_query = 'INSERT INTO menu_item_ingredients (menu_item, quantity, menu_item_ingredient, production_amount) VALUES ' + ''.join(
                ["(" + menu_item[x] + ', ' + quantities[x] + ', ' + ingredients[x] + ', ' + production[x] + ")," for x in range(len(quantities))])[:-1]
            print(update_query)
            
            # Now execute three queries: update menu_items, delete old menu_item_ingredients, add back in menu_item_ingredients
            conn.execute(f'UPDATE menu_items SET {menu_items_values_clause} WHERE name = "{original_name}"')
            conn.execute(f'DELETE FROM menu_item_ingredients WHERE menu_item = "{updates['name']}"') #Name should be updated already by on cascade requirement
            conn.execute(update_query)
            conn.commit()
            return jsonify({'message': f'Updates to {original_name} have been successfully submitted'})
        except Exception as e:
            # Error handling
            return jsonify({"error": f"An error occurred during update: {str(e)}"}), 500
        finally:
            conn.close()

@app.route('/api/delete_item', methods=['GET'])
def delete_item():
    """
    API endpoint to delete items selected item from database.
    Returns: Message stating if deletion was successfully completed or if an error occured
    """
    table_selection = request.args.get('category')
    item_name = request.args.get('item_name')
    conn = get_db_connection()
    try:
        conn.execute(f'DELETE FROM {table_selection} WHERE name = "{item_name}"')
        conn.commit()
        conn.close()
        return jsonify({'message': f'{item_name} has been successfully deleted'})
    except Exception as e:
        conn.close()
        return jsonify({"error": f"An error occurred during deletion: {str(e)}"}), 500

@app.route('/api/enter_data', methods=['GET'])
def enter_data():
    """
    API endpoint to render item blank item attributes for new item creation.
    Returns: JSON object with values of blank item attributes and keys of column names.
    """
    table_selection = request.args.get('category')
    conn = get_db_connection()

    row = conn.execute(f'SELECT * FROM {table_selection}').fetchone()
    full_list_entries = dict(zip(row.keys(), ['' for c in range(len(row.keys()))]))
    
    conn.close()

    return jsonify(full_list_entries)

@app.route('/api/submit_new_item', methods=['POST'])
def submit_new_item():
    """
    API endpoint to create new item with values entered.
    Returns: Message stating whether item was successfully entered or if error occured.
    """
    update_data = request.get_json()
    category = update_data.get('category')
    updates = update_data.get('updates')
    conn = get_db_connection()

    if category == 'menu_items':
        try:
            conn.execute(f'''INSERT INTO menu_items VALUES ("{updates['name']}", "{updates['course']}", "{updates['prep_time']}",
                "{updates['cook_time']}", "{updates['serving_container']}", "{updates['serving_utensil']}", "{updates['oven']}",
                "{updates['fridge']}", "{updates['cost_per_item']}")''')
            conn.commit()
            conn.close()
            return jsonify({'message': f'{updates['name']} has been successfully entered'})

        except Exception as e:
            conn.close()
            return jsonify({"error": f"An error occurred during entry: {str(e)}"}), 500

    elif category == 'bar_items':
        try:
            print(f'''INSERT INTO bar_items VALUES ("{updates['name']}", "{updates['cost_per_item']}", "{updates['category']}", "{updates['serving_container']}")''')
            conn.execute(f'''INSERT INTO bar_items VALUES ("{updates['name']}", "{updates['cost_per_item']}", "{updates['category']}", "{updates['serving_container']}")''')
            conn.commit()
            conn.close()
            return jsonify({'message': f'{updates['name']} has been successfully entered'})

        except Exception as e:
            conn.close()
            return jsonify({"error": f"An error occurred during entry: {str(e)}"}), 500

    else:
        try:
            conn.execute(f'''INSERT INTO equipment VALUES ("{updates['name']}", "{updates['cost_per_item']}", "{updates['category']}")''')
            conn.commit()
            conn.close()
            return jsonify({'message': f'{updates['name']} has been successfully entered'})

        except Exception as e:
            conn.close()
            return jsonify({"error": f"An error occurred during entry: {str(e)}"}), 500


# --- Main execution block ---
if __name__ == '__main__':
    # Initialize the database when the app starts
    init_db()
    # Run the Flask development server
    # debug=True allows for automatic reloading on code changes and provides a debugger
    app.run(debug=True, port=5000)
