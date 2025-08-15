document.addEventListener('DOMContentLoaded', () => {
    const mainOptionRadios = document.querySelectorAll('input[name="mainOption"]');
    const itemDetailsContainer = document.getElementById('itemDetailsContainer');


    function displayItemDetails(detailsObject, selectedCategory) {
        itemDetailsContainer.innerHTML = ''; // Clear previous details

        if (!detailsObject || Object.keys(detailsObject).length === 0) {
            itemDetailsContainer.innerHTML = '<p class="loading-message">No details available for this item.</p>';
            return;
        }

        const detailsHeading = document.createElement('h3');
        detailsHeading.textContent = `Details for New ${selectedCategory} Item`.replace(/_/g, ' ');
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
        submitButton.textContent = 'Submit New Item';
        submitButton.className = 'submit-button'; // Add a class for styling
        submitButton.addEventListener('click', async () => {

            const updatedData = {};
            const inputFields = itemDetailsContainer.querySelectorAll('input[type="text"]');

            inputFields.forEach(input => {
                const originalKey = input.dataset.originalKey;
                updatedData[originalKey] = input.value;
            });

            console.log('Submitting new Item:', { category: selectedCategory, updates: updatedData });

            try {
                const url = '/api/submit_new_item';
                const response = await fetch(url, {
                    method: 'POST', // This is a POST request
                    headers: {
                        'Content-Type': 'application/json' // Tell the server we're sending JSON
                    },
                    body: JSON.stringify({ // Convert the JavaScript object to a JSON string
                        category: selectedCategory,
                        updates: updatedData,
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
                console.error('There was a problem submitting new item:', error);
                alert('Failed to submit new item. Please check console for details.');
            }
        });

        itemDetailsContainer.appendChild(submitButton); // Append the button to the container
    }

    // Add event listeners to the main option radio buttons
    mainOptionRadios.forEach(radio => {
        radio.addEventListener('change', async (event) => {
            const selectedCategory = event.target.value;
            console.log(`Fetching items for category: ${selectedCategory}`);
            itemDetailsContainer.innerHTML = '<p class="loading-message">Click on an category above to enter new item details.</p>'; // Clear details on category change
            try {

                const response = await fetch(`/api/enter_data?category=${selectedCategory}`)

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                displayItemDetails(data, selectedCategory);

            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
                itemDetailsContainer.innerHTML = `<p style="color: red;">Failed to load items. Please try again. (Error: ${error.message})</p>`;
            }
        });
    });

    // Initialize the container in case no option is pre-selected (though usually one is by default or cleared)
});
