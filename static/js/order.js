// static/js/order.js
document.addEventListener('DOMContentLoaded', () => {
    const orderForm = document.getElementById('catering-order-form');
    const menuItemSelectionDiv = document.getElementById('menu-item-selection');
    const barItemSelectionDiv = document.getElementById('bar-item-selection'); // NEW
    const equipmentItemSelectionDiv = document.getElementById('equipment-item-selection'); // NEW
    const estimateDisplayDiv = document.getElementById('estimate-display');
    const estimatedPriceSpan = document.getElementById('estimated-price');
    const messageBox = document.getElementById('message-box');

    // NEW: Elements for detailed breakdown
    const detailedEstimateBreakdownDiv = document.getElementById('detailed-estimate-breakdown');
    const itemizedListDiv = document.getElementById('itemized-list');
    const estimateSubtotalSpan = document.getElementById('estimate-subtotal');
    const estimateServiceFeeSpan = document.getElementById('estimate-service-fee');
    const estimateSalesTaxSpan = document.getElementById('estimate-sales-tax');
    const estimateTotalSpan = document.getElementById('total-price');
    const estimateSubmissionButton = document.getElementById('submit-for-review');

    // NEW: Get references to the new radio buttons
    const barServiceRadios = document.querySelectorAll('input[name="barService"]');
    const equipmentRentalRadios = document.querySelectorAll('input[name="equipmentRental"]');

    // Stores all fetched items {name: {item_data, type}}
    let allItemsData = {};

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
     * Fetches items from a given API endpoint and renders them into a specified container.
     * @param {string} apiPath - The API endpoint (e.g., '/api/menu').
     * @param {HTMLElement} containerDiv - The HTML element to render items into.
     * @param {string} itemType - The type of item ('menu', 'bar', 'equipment').
     */
    async function fetchAndRenderItems(apiPath, containerDiv, itemType) {
        try {
            const response = await fetch(apiPath);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
            }
            const data = await response.json();

            containerDiv.innerHTML = ''; // Clear loading message

            if (Object.keys(data).length === 0) {
                containerDiv.innerHTML = `
                    <p class="text-center text-gray-500 italic">No ${itemType} items available yet.</p>
                `;
                return;
            }

            for (const categoryName in data) {
                const categoryItems = data[categoryName];

                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'mb-6';

                categoryDiv.innerHTML = `
                    <h3 class="text-xl font-semibold text-gray-700 mb-3">${categoryName}</h3>
                    <div class="space-y-2">
                        </div>
                `;
                containerDiv.appendChild(categoryDiv);

                const categoryItemsContainer = categoryDiv.querySelector('div.space-y-2');

                if (categoryItems.length === 0) {
                    categoryItemsContainer.innerHTML = `<p class="text-gray-500 italic text-sm">No items available in this category yet.</p>`;
                } else {
                    categoryItems.forEach(item => {
                        // Store full item data including its type for easy lookup later
                        const effectivePrice = item.price !== undefined ? item.price : item.rental_price_per_day;
                        allItemsData[item.name] = { ...item, type: itemType, effectivePrice: effectivePrice };

                        const itemRow = document.createElement('div');
                        const name = item.name.replace(/"/g, '---');
                        itemRow.className = 'menu-item-row';
                        itemRow.innerHTML = `
                            <label class="flex items-center space-x-3 cursor-pointer flex-grow">
                                <input type="checkbox"
                                       name="${itemType}Item"
                                       value="${item.name}"
                                       data-item-type="${itemType}"
                                       data-item-name="${name}"
                                       class="h-5 w-5 text-blue-600 rounded focus:ring-blue-500">
                                <span class="text-gray-800 font-medium">${item.name}</span>
                                <span class="text-gray-600 text-sm ml-2">
                                    ($${item.price ? item.price.toFixed(2) : item.rental_price_per_day.toFixed(2)}
                                    ${itemType === 'equipment' ? 'ea' : 'ea'})
                                </span>
                            </label>
                            <input type="number"
                                   name="quantity-${itemType}-${item.name}"
                                   min="0" value="0"
                                   class="quantity-input input-field ml-4" disabled>
                        `;
                        categoryItemsContainer.appendChild(itemRow);
                    });
                }
            }
            addEventListenersToItemCheckboxes(); // Add listeners after all items are rendered
        } catch (error) {
            console.error(`Error fetching ${itemType} items for form:`, error);
            containerDiv.innerHTML = `
                <div class="text-center text-red-600 p-4 bg-red-100 rounded-lg">
                    <p class="font-bold">Failed to load ${itemType} items for the form.</p>
                    <p>Please try again later.</p>
                    <p class="text-sm text-red-500">Error: ${error.message}</p>
                </div>
            `;
        }
    }

    /**
     * Adds event listeners to all newly rendered checkboxes and quantity inputs.
     */
    function addEventListenersToItemCheckboxes() {
        document.querySelectorAll('input[name$="Item"]').forEach(checkbox => { // Selects inputs where name ends with "Item"
            const itemName = checkbox.value;
            const itemType = checkbox.dataset.itemType; // Get the item type from data attribute
            const quantityInput = document.querySelector(`input[name="quantity-${itemType}-${itemName}"]`);

            if (quantityInput) { // Ensure quantity input exists for this checkbox
                checkbox.addEventListener('change', () => {
                    quantityInput.disabled = !checkbox.checked;
                    if (checkbox.checked) {
                        quantityInput.focus();
                    }
                });

                quantityInput.addEventListener('change', () => {
                    if (parseInt(quantityInput.value) < 0) {
                        quantityInput.value = 0;
                    }
                });
            }
        });
    }

    /**
     * Toggles visibility of a section based on a radio button's value.
     * @param {NodeListOf<HTMLInputElement>} radios - The radio button group.
     * @param {HTMLElement} sectionDiv - The div to show/hide.
     * @param {string} showValue - The value of the radio button that should show the section.
     */
    function setupSectionToggle(radios, sectionDiv, showValue) {
        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value === showValue) {
                    sectionDiv.classList.remove('hidden');
                } else {
                    sectionDiv.classList.add('hidden');
                    // Optionally uncheck items when section is hidden
                    sectionDiv.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
                        checkbox.checked = false;
                        const itemName = checkbox.value;
                        const itemType = checkbox.dataset.itemType;
                        const quantityInput = document.querySelector(`input[name="quantity-${itemType}-${itemName}"]`);
                        if(quantityInput) quantityInput.disabled = true;
                    });
                }
            });
        });
    }

    // Setup toggles for bar and equipment sections
    setupSectionToggle(barServiceRadios, barItemSelectionDiv, 'yes');
    setupSectionToggle(equipmentRentalRadios, equipmentItemSelectionDiv, 'yes');


    /**
     * Handles form submission to get the price estimate.
     * @param {Event} event - The form submit event.
     */
    let requestPayload = {};
    orderForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        const formData = new FormData(orderForm);
        const selectedItems = [];
        const otherDetails = {};

        // Iterate over all form entries
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('menuItem') || key.startsWith('barItem') || key.startsWith('equipmentItem')) {
                // This is a checkbox for a menu, bar, or equipment item
                const itemName = value; // The item's name is the value of the checkbox
                const itemType = document.querySelector(`input[name="${key}"][value="${itemName}"]`).dataset.itemType; // Get type from data-item-type
                const itemRealName = document.querySelector(`input[name="${key}"][value="${itemName}"]`).dataset.itemName; // Get type from data-item-type
                const quantity = parseInt(formData.get(`quantity-${itemType}-${itemName}`)); // Get quantity for this specific item type and name

                if (document.querySelector(`input[name="${key}"][value="${itemName}"]`).checked && quantity > 0) {
                    selectedItems.push({ name: itemRealName.replace('---', '"'), quantity: quantity, type: itemType });
                }
            } else if (!key.startsWith('quantity-')) { // Avoid processing quantity inputs separately
                otherDetails[key] = value;
            }
        }

        if (selectedItems.length === 0) {
            showMessageBox("Please select at least one item (food, bar, or equipment) to get an estimate.", "error");
            return;
        }

        requestPayload.items = selectedItems;
        requestPayload.other_details = otherDetails;

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

            // Display detailed breakdown
            estimateSubtotalSpan.textContent = `$${result.subtotal.toFixed(2)}`;
            estimateServiceFeeSpan.textContent = `$${result.service_fee.toFixed(2)}`;
            estimateSalesTaxSpan.textContent = `$${result.sales_tax.toFixed(2)}`;
            estimateTotalSpan.textContent = `$${result.total_estimate.toFixed(2)}`;

            itemizedListDiv.innerHTML = ''; // Clear previous items

            // Group items by category for display
            const categorizedItems = {};
            result.selections.forEach(item => {
                if (!categorizedItems[item.category]) {
                    categorizedItems[item.category] = [];
                }
                categorizedItems[item.category].push(item);
            });

            for (const category in categorizedItems) {
                const categoryHeading = document.createElement('h4');
                categoryHeading.className = 'font-semibold text-gray-700 mt-4 mb-2 first:mt-0';
                categoryHeading.textContent = category;
                itemizedListDiv.appendChild(categoryHeading);

                const ul = document.createElement('ul');
                ul.className = 'list-none p-0 m-0 text-sm';
                categorizedItems[category].forEach(item => {
                    const li = document.createElement('li');
                    // Ensure the price displayed is per item, not total for the line
                    const unitPrice = item.price;
                    li.innerHTML = `
                        <span>${item.name} x ${item.quantity}</span>
                        <span>$${(unitPrice * item.quantity).toFixed(2)}</span>
                    `;
                    ul.appendChild(li);
                });
                itemizedListDiv.appendChild(ul);
            }
            detailedEstimateBreakdownDiv.classList.remove('hidden'); // Show the detailed section

            showMessageBox("Estimate calculated successfully!", "success");

        } catch (error) {
            console.error("Error getting estimate:", error);
            estimateDisplayDiv.classList.add('hidden'); // Hide estimate on error
            showMessageBox(`Failed to get estimate: ${error.message}`, "error");
        }

    });

    estimateSubmissionButton.addEventListener('click', async (event) => {
        event.preventDefault(); // Prevent default form submission

        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestPayload)
            });
            const result = await response.json();


            if (response.ok) {
                alert('Submission successful: ' + result.message);
            }
            else {
                alert('Submission failed: ' + result.error);
                console.error('Server error:', result);
            }

        } catch (error) {
            console.error('Error getting estimate:', error);
            alert('Submission failed. Please check console for details.')
        }



    });



    // Initialize: Fetch and render all items for their respective sections
    fetchAndRenderItems('/api/menu', menuItemSelectionDiv, 'menu');
    fetchAndRenderItems('/api/bar_items', barItemSelectionDiv, 'bar');
    fetchAndRenderItems('/api/equipment', equipmentItemSelectionDiv, 'equipment');
});

