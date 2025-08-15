document.addEventListener('DOMContentLoaded', () => {
    const mainOptionRadios = document.querySelectorAll('input[name="mainOption"]');
    const secondarySelectionContainer = document.getElementById('secondarySelectionContainer');



    function displaySecondaryOptions(fetchedItems, categoryName) {
        secondarySelectionContainer.innerHTML = ''; // Clear previous content

        if (!fetchedItems || fetchedItems.length === 0) {
            secondarySelectionContainer.innerHTML = `<p>Choose a category to see items.</p>`;
            return;
        }

        const heading = document.createElement('h3');
        const singularCategory = categoryName.endsWith('s') ? categoryName.slice(0, -1) : categoryName;
        heading.textContent = `Select an Item:`;

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

                secondarySelectionContainer.dataset.currentItemName = clickedItemName;
                secondarySelectionContainer.dataset.currentItemCategory = clickedItemCategory;

                alert(`You chose: ${item.name}!`); // For demonstration
            });
            itemListDiv.appendChild(itemDiv);
        });

        secondarySelectionContainer.appendChild(heading);
        secondarySelectionContainer.appendChild(itemListDiv);

        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit Deletion';
        submitButton.className = 'submit-button'; // Add a class for styling
        submitButton.addEventListener('click', async () => {
            const currentItemName = secondarySelectionContainer.dataset.currentItemName;
            const currentItemCategory = secondarySelectionContainer.dataset.currentItemCategory;

            if (!currentItemName || !currentItemCategory) {
                alert('Error: Could not determine item to update.');
                return;
            }

            try {
                const url = `/api/delete_item?category=${currentItemCategory}&item_name=${currentItemName}`;

                const response = await fetch(url);

                const result = await response.json();

                if (response.ok) {
                    alert('Deletion successful: ' + result.message);
                    console.log('Server response:', result);
                    // Optionally re-fetch details to confirm update, or update UI directly
                    // You might want to remove the 'selected' class and clear details here
                    // if the user should re-select an item after update.
                } else {
                    alert('Deletion failed: ' + result.error);
                    console.error('Server error:', result);
                }

            } catch (error) {
                console.error('There was a problem submitting deletion:', error);
                alert('Failed to submit updates. Please check console for details.');
            }
        });


        secondarySelectionContainer.appendChild(submitButton);
    }


    // Add event listeners to the main option radio buttons
    mainOptionRadios.forEach(radio => {
        radio.addEventListener('change', async (event) => {
            const selectedCategory = event.target.value;
            console.log(`Fetching items for category: ${selectedCategory}`);
            secondarySelectionContainer.innerHTML = '<p class="loading-message">Loading items from API...</p>';
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
