// static/js/order.js
document.addEventListener('DOMContentLoaded', () => {
    const messageBox = document.getElementById('message-box');
    const estimateDisplayDiv = document.getElementById('estimate-display');
    const estimatedPriceSpan = document.getElementById('estimated-price');
    const ingredientListButton = document.getElementById('ingredient-list-generation');
    const equipmentListButton = document.getElementById('equipment-list-generation');

    // NEW: Elements for detailed breakdown
    const detailedEstimateBreakdownDiv = document.getElementById('detailed-estimate-breakdown');
    const itemizedListDiv = document.getElementById('itemized-list');
    const estimateSubtotalSpan = document.getElementById('estimate-subtotal');
    const estimateServiceFeeSpan = document.getElementById('estimate-service-fee');
    const estimateSalesTaxSpan = document.getElementById('estimate-sales-tax');
    const estimateTotalSpan = document.getElementById('total-price');
    const idForm = document.getElementById('id-submission-form');

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

    idForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission
        const formData = new FormData(idForm);
        const formObject = Object.fromEntries(formData);
        let retrieval = {}

        try {
            const response = await fetch('/api/retrieval', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formObject)
            });
            const result = await response.json();
            retrieval = result


            if (response.ok) {
                alert('Retrieval Successful');
            }
            else {
                alert('Estimate lookup failed: ' + result.error);
                console.error('Server error:', result);
            }


        } catch (error) {
            console.error('Error getting estimate:', error);
            alert('Estimate lookup failed.')
        }

        try {
            const response = await fetch('/api/estimate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(retrieval)
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
    ingredientListButton.addEventListener('click', async (event) => {
        event.preventDefault();

        const formData = new FormData(idForm);
        const formObject = Object.fromEntries(formData);
        window.location.href = `ingredientslist?idNumber=${formObject.idNumber}`;
    });

    equipmentListButton.addEventListener('click', async (event) => {
        event.preventDefault();

        const formData = new FormData(idForm);
        const formObject = Object.fromEntries(formData);
        window.location.href = `equipmentlist?idNumber=${formObject.idNumber}`;
    });


});

