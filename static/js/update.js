document.addEventListener('DOMContentLoaded', () => {
    const mainOptionRadios = document.querySelectorAll('input[name="mainOption"]');
    const secondarySelectionContainer = document.getElementById('secondarySelectionContainer');
    const itemDetailsContainer = document.getElementById('itemDetailsContainer'); // New reference



    function displaySecondaryOptions(fetchedItems, categoryName) {
        secondarySelectionContainer.innerHTML = ''; // Clear previous content

        if (!fetchedItems || fetchedItems.length === 0) {
            secondarySelectionContainer.innerHTML = `<p>Choose a category to see items.</p>`;
            return;
        }

        const heading = document.createElement('h3');
        const singularCategory = categoryName.endsWith('s') ? categoryName.slice(0, -1) : categoryName;
        heading.textContent = `Select ${singularCategory}:`.replace(/_/g, ' ');

        const itemListDiv = document.createElement('div');
        itemListDiv.className = 'item-list';

        fetchedItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item-option';
            itemDiv.dataset.itemName = item.name;
            itemDiv.dataset.itemCategory = categoryName;
            itemDiv.innerHTML = `<strong>${item.name}</strong>`;

            itemDiv.addEventListener('click', async () => {
                const currentlySelected = itemListDiv.querySelector('.item-option.selected');
                if (currentlySelected) {
                    currentlySelected.classList.remove('selected');
                }
                itemDiv.classList.add('selected');

                const clickedItemName = itemDiv.dataset.itemName;
                const clickedItemCategory = itemDiv.dataset.itemCategory;

                itemDetailsContainer.dataset.currentItemName = clickedItemName;
                itemDetailsContainer.dataset.currentItemCategory = clickedItemCategory;


                console.log(`Fetching details for: ${item.name} from ${categoryName}`);
                itemDetailsContainer.innerHTML = '<p class="loading-message">Loading item details...</p>'; // Show loading message

                try {
                    const url = `/api/get_item_details?category=${clickedItemCategory}&item_name=${clickedItemName}`;

                    const response = await fetch(url);

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const itemDetails = await response.json();

                    // Display the fetched details in editable text boxes
                    displayItemDetails(itemDetails);

                } catch (error) {
                    console.error('There was a problem fetching item details:', error);
                    itemDetailsContainer.innerHTML = `<p class="error-message">Failed to load item details. (Error: ${error.message})</p>`;
                }

                alert(`You chose: ${item.name}!`); // For demonstration
            });
            itemListDiv.appendChild(itemDiv);
        });

        secondarySelectionContainer.appendChild(heading);
        secondarySelectionContainer.appendChild(itemListDiv);
    }

    function displayItemDetails(detailsObject) {
        itemDetailsContainer.innerHTML = ''; // Clear previous details

        if (!detailsObject || Object.keys(detailsObject).length === 0) {
            itemDetailsContainer.innerHTML = '<p class="loading-message">No details available for this item.</p>';
            return;
        }

        const detailsHeading = document.createElement('h3');
        detailsHeading.textContent = `Details for ${detailsObject.name || 'Selected Item'}`; // Use item name if available
        itemDetailsContainer.appendChild(detailsHeading);

        for (const key in detailsObject) {
            if (Object.prototype.hasOwnProperty.call(detailsObject, key)) {
                const value = detailsObject[key];

                const fieldDiv = document.createElement('div');
                fieldDiv.className = 'detail-field';

                const label = document.createElement('label');
                label.textContent = key.replace(/_/g, ' '); // Replace underscores with spaces for readability
                label.setAttribute('for', `detail-${key}`); // Associate label with input

                const input = document.createElement('input');
                input.type = 'text';
                input.id = `detail-${key}`;
                input.name = `detail-${key}`;
                input.value = value; // Pre-fill with current value
                input.readOnly = false; // Make it editable (default for text input, but explicit)
                input.dataset.originalKey = key;

                fieldDiv.appendChild(label);
                fieldDiv.appendChild(input);
                itemDetailsContainer.appendChild(fieldDiv);
            }
        }
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit Updates';
        submitButton.className = 'submit-button'; // Add a class for styling
        submitButton.addEventListener('click', async () => {
            const currentItemName = itemDetailsContainer.dataset.currentItemName;
            const currentItemCategory = itemDetailsContainer.dataset.currentItemCategory;

            if (!currentItemName || !currentItemCategory) {
                alert('Error: Could not determine item to update.');
                return;
            }

            const updatedData = {};
            const inputFields = itemDetailsContainer.querySelectorAll('input[type="text"]');

            inputFields.forEach(input => {
                const originalKey = input.dataset.originalKey;
                updatedData[originalKey] = input.value;
            });

            console.log('Submitting updates:', { category: currentItemCategory, updates: updatedData });

            try {
                const url = '/api/submit_update';
                const response = await fetch(url, {
                    method: 'POST', // This is a POST request
                    headers: {
                        'Content-Type': 'application/json' // Tell the server we're sending JSON
                    },
                    body: JSON.stringify({ // Convert the JavaScript object to a JSON string
                        category: currentItemCategory,
                        updates: updatedData,
                        item_name : currentItemName
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Update successful: ' + result.message);
                    console.log('Server response:', result);
                    // Optionally re-fetch details to confirm update, or update UI directly
                    // You might want to remove the 'selected' class and clear details here
                    // if the user should re-select an item after update.
                } else {
                    alert('Update failed: ' + result.error);
                    console.error('Server error:', result);
                }

            } catch (error) {
                console.error('There was a problem submitting updates:', error);
                alert('Failed to submit updates. Please check console for details.');
            }
        });

        itemDetailsContainer.appendChild(submitButton); // Append the button to the container
    }

    // Add event listeners to the main option radio buttons
    mainOptionRadios.forEach(radio => {
        radio.addEventListener('change', async (event) => {
            const selectedCategory = event.target.value;
            console.log(`Fetching items for category: ${selectedCategory}`);
            secondarySelectionContainer.innerHTML = '<p class="loading-message">Loading items from API...</p>';
            itemDetailsContainer.innerHTML = '<p class="loading-message">Click on an item above to view its details.</p>'; // Clear details on category change
            try {

                const response = await fetch(`/api/update_category?category=${selectedCategory}`)

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                displaySecondaryOptions(data, selectedCategory);

            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
                secondarySelectionContainer.innerHTML = `<p style="color: red;">Failed to load items. Please try again. (Error: ${error.message})</p>`;
            }
        });
    });

    // Initialize the container in case no option is pre-selected (though usually one is by default or cleared)
    displaySecondaryOptions(null); // Or you could check if any radio is checked initially
});
