// static/js/order.js
document.addEventListener('DOMContentLoaded', () => {
    const orderForm = document.getElementById('catering-order-form');
    const menuItemSelectionDiv = document.getElementById('menu-item-selection');
    const estimateDisplayDiv = document.getElementById('estimate-display');
    const estimatedPriceSpan = document.getElementById('estimated-price');
    const messageBox = document.getElementById('message-box');

    let allMenuItems = {}; // Stores all fetched menu items for quick lookup {id: {item_data}}

    /**
     * Shows a message box with a given message and type (success/error).
     * @param {string} message - The message to display.
     * @param {'success'|'error'} type - The type of message.
     */
    function showMessageBox(message, type) {
        messageBox.textContent = message;
        messageBox.className = `message-box show ${type}`; // Add show and type class
        setTimeout(() => {
            messageBox.className = `message-box`; // Hide after 3 seconds
        }, 3000);
    }

    /**
     * Fetches menu data from the Flask API to populate the order form.
     */
    async function fetchAndRenderMenuForForm() {
        try {
            const response = await fetch('/api/menu');
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
            }
            const menuData = await response.json();
            
            menuItemSelectionDiv.innerHTML = ''; // Clear "Loading menu items..."

            // Populate allMenuItems for easy lookup later
            for (const categoryName in menuData) {
                menuData[categoryName].forEach(item => {
                    allMenuItems[item.name] = name;
                });
            }

            for (const categoryName in menuData) {
                const categoryItems = menuData[categoryName];

                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'mb-6'; // Margin bottom for separation

                categoryDiv.innerHTML = `
                    <h3 class="text-xl font-semibold text-gray-700 mb-3">${categoryName}</h3>
                    <div class="space-y-2">
                        <!-- Menu items for this category will go here -->
                    </div>
                `;
                menuItemSelectionDiv.appendChild(categoryDiv);

                const categoryItemsContainer = categoryDiv.querySelector('div.space-y-2');

                if (categoryItems.length === 0) {
                    categoryItemsContainer.innerHTML = `<p class="text-gray-500 italic text-sm">No items available in this category yet.</p>`;
                } else {
                    categoryItems.forEach(item => {
                        const itemRow = document.createElement('div');
                        itemRow.className = 'menu-item-row';
                        itemRow.innerHTML = `
                            <label class="flex items-center space-x-3 cursor-pointer flex-grow">
                                <input type="checkbox" name="menuItem" value=${item.name} class="h-5 w-5 text-blue-600 rounded focus:ring-blue-500">
                                <span class="text-gray-800 font-medium">${item.name}</span>
                                <span class="text-gray-600 text-sm ml-2">($${item.price.toFixed(2)} ea)</span>
                            </label>
                            <input type="number" name="quantity-${item.name}" min="0" value="0" class="quantity-input input-field ml-4" disabled>
                        `;
                        categoryItemsContainer.appendChild(itemRow);
                    });
                }
            }
            addEventListenersToMenuItems(); // Attach listeners after rendering
        } catch (error) {
            console.error("Error fetching menu for form:", error);
            menuItemSelectionDiv.innerHTML = `
                <div class="text-center text-red-600 p-4 bg-red-100 rounded-lg">
                    <p class="font-bold">Failed to load menu items for the form.</p>
                    <p>Please try again later.</p>
                    <p class="text-sm text-red-500">Error: ${error.message}</p>
                </div>
            `;
        }
    }

    /**
     * Adds event listeners to checkboxes and quantity inputs for dynamic behavior.
     */
    function addEventListenersToMenuItems() {
        document.querySelectorAll('input[name="menuItem"]').forEach(checkbox => {
            const quantityInput = checkbox.closest('.menu-item-row').querySelector('.quantity-input');
            
            // Enable/disable quantity input based on checkbox state
            checkbox.addEventListener('change', () => {
                quantityInput.disabled = !checkbox.checked;
                if (checkbox.checked) {
                    quantityInput.focus();
                }
            });

            // Ensure quantity is valid when changed manually
            quantityInput.addEventListener('change', () => {
                if (parseInt(quantityInput.value) < 1) {
                    quantityInput.value = 0;
                }
            });
        });
    }

    /**
     * Handles form submission to get the price estimate.
     * @param {Event} event - The form submit event.
     */
    orderForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        const formData = new FormData(orderForm);
        const selectedItems = [];
        const otherDetails = {};

        // Process general form fields
        for (const [key, value] of formData.entries()) {
            // Check if it's a menu item checkbox or quantity input
            if (key === 'menuItem') {
                const itemName = value;
                const quantity = parseInt(formData.get(`quantity-${itemName}`));
                
                // Only add if the checkbox was checked and quantity is valid
                if (document.querySelector(`input[name="menuItem"][value=${itemName}]`).checked && quantity > 0) {
                    selectedItems.push({ name: itemName, quantity: quantity });
                }
            } else if (!key.startsWith('quantity-')) { // Avoid processing quantity inputs separately
                otherDetails[key] = value;
            }
        }

        if (selectedItems.length === 0) {
            showMessageBox("Please select at least one menu item to get an estimate.", "error");
            return;
        }

        const requestPayload = {
            items: selectedItems,
            other_details: otherDetails
        };

        try {
            const response = await fetch('/api/estimate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestPayload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            estimatedPriceSpan.textContent = `$${result.total_estimate.toFixed(2)}`;
            estimateDisplayDiv.classList.remove('hidden'); // Show the estimate display
            showMessageBox("Estimate calculated successfully!", "success");

        } catch (error) {
            console.error("Error getting estimate:", error);
            estimateDisplayDiv.classList.add('hidden'); // Hide estimate on error
            showMessageBox(`Failed to get estimate: ${error.message}`, "error");
        }
    });

    // Initialize: Fetch and render menu items for the form
    fetchAndRenderMenuForForm();
});

