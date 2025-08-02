README.txt

## Acknowledgements - Code suggestions provided by Google Gemini 2.5 Flash

Queries used to help write base HTML and Javascript code for web app. I am not an experience web developer so I have have limited knowledge in the ins and outs of HTML and Javascript.
I am better at reviewing, re-purposing, and updating code in order to make it work for my needs. AI is helping me to design the web application code to be integrated with my database, but all of the database design, data, and queries work is my own:

Below are the queries I made and the dates of those queries.

06/29/2025

How could I design a simple web application that allows users to choose from products stored in an SQL database to produce price estimates for their orders? 

06/29/2025

I would want a web page where a customer could view a catering menu offerings (stored in SQL database) on one page,
then on another they could fill out a form of questions about what they would like to order,
including some questions about which menu items (sorted by appetizer, main course, salad, desert, etc.) and how many of each,
in order to produce a price estimate. How would I create these pages?

07/09/2025

How can I change this chunk to make it work with item name instead of item id  // Process general form fields

        for (const [key, value] of formData.entries()) {

            // Check if it's a menu item checkbox or quantity input

            if (key === 'menuItem') {

                const itemName = parseInt(value);

                const quantity = parseInt(formData.get(`quantity-${itemName}`));



                // Only add if the checkbox was checked and quantity is valid

                if (document.querySelector(`input[name="menuItem"][value="${itemName}"]`).checked && quantity > 0) {

                    selectedItems.push({ name: itemName, quantity: quantity });

                }

            } else if (!key.startsWith('quantity-')) { // Avoid processing quantity inputs separately

                otherDetails[key] = value;

            }

        }

07/24/2025

As this is a catering company app, I also have options for bar items and event equipment in addition to food items that can be offered. I have separate SQL tables in my database for these items. I would like to have three separate pages listing the company's offerings;
- one for the menu items, similar to what we have already created, which gets the menu items and prices from the menu_items SQLite table, grouped by course
- one for the bar items, which gets the items and prices from a bar_items SQLite table, grouped by category
- one for the equipment offerings, which gets the items and prices from the equipment offerings table, grouped by category
How can I create the necessary html, javascript, and flask code for this?
- one for the bar items,

07/24/2025

I would like to integrate the bar items and equipment into the order form. I would like to include some other questions, the answers to which will affect what items are available on the order form. Some of these questions will be:
1. What is the end time of your event? (This question should go at the beginning, right after the start time question.)
2. Would you like bar service at your event? (If yes, then bar options will be made visible. This question should appear after the menu selections.)
3. Will you need to rent any equipment, such as tables, chairs, cocktail tables, dance floor, podium, etc? (If yes, equipment rental options are made visible)
4. Does your venue have a kitchen with an industrial refrigerator and oven, or will those need to be provided?

07/26/2025

I need help with the JavaScript and HTML code for a page where a user selects between three options and then based on that selection,
different items appear for further selection.

07/26/2025

How could I make the radio.addEventListener send the event.target.value to fetch request

07/26/2025

I would like to include html and javascript so that when an item is clicked,
the event listener sends another api request with that item's name and category to @app.route('get_item_details'),
and then displays text boxes that can be edited for all of the json object fields that are returned.

07/26/2025

I am fetching from a Flask app api, specifically the '/api/update_category' with a get_items() function.
How do I send the event.target.value to the api and what can I use the get_items() function to read it and send back a response?

07/26/2025

How can I write the radio.addEventListener function to fetch a request from the @app.route('/api/update_category', methods=['GET']) in my app.py file?

07/26/2025

I would like to include html and javascript so that when an item is clicked,
the event listener sends another api request with that item's name and category to @app.route('get_item_details'),
and then displays text boxes that can be edited for all of the json object fields that are returned.

07/27/2025

How would I add a submit button at the bottom of the itemDetailsContainer for the user to submit the updated inputs and their labels to @app.route('/api/submit_update')?
