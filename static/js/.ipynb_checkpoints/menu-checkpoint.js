// static/js/menu.js
document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('menu-container');

    /**
     * Fetches menu data from the Flask API.
     * @returns {Promise<Object>} A promise that resolves to the categorized menu data.
     */
    async function fetchMenu() {
        try {
            const response = await fetch('/api/menu');
            if (!response.ok) {
                // If the HTTP status is not 2xx, throw an error
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
            }
            const menuData = await response.json();
            return menuData;
        } catch (error) {
            console.error("Error fetching menu:", error);
            menuContainer.innerHTML = `
                <div class="text-center text-red-600 p-4 bg-red-100 rounded-lg">
                    <p class="font-bold">Failed to load menu.</p>
                    <p>Please try refreshing the page or contact support.</p>
                    <p class="text-sm text-red-500">Error: ${error.message}</p>
                </div>
            `;
            return null; // Return null to indicate failure
        }
    }

    /**
     * Renders the fetched menu data into the HTML.
     * @param {Object} menuData - The categorized menu data.
     */
    function renderMenu(menuData) {
        if (!menuData) {
            return; // Don't render if data is null (fetch failed)
        }

        menuContainer.innerHTML = ''; // Clear "Loading menu..." message

        // Loop through each category and create a section for it
        for (const categoryName in menuData) {
            const categoryItems = menuData[categoryName];

            const categorySection = document.createElement('div');
            categorySection.className = 'mb-8'; // Margin bottom for separation

            categorySection.innerHTML = `
                <h2 class="text-3xl font-semibold text-gray-700 mb-4 border-b-2 border-blue-500 pb-2">${categoryName}</h2>
                <div class="menu-grid">
                    <!-- Menu items for this category will go here -->
                </div>
            `;
            menuContainer.appendChild(categorySection);

            const menuGrid = categorySection.querySelector('.menu-grid');

            if (categoryItems.length === 0) {
                menuGrid.innerHTML = `<p class="text-gray-500 italic">No items available in this category yet.</p>`;
            } else {
                // Loop through items within the category and create cards
                categoryItems.forEach(item => {
                    const itemCard = document.createElement('div');
                    itemCard.className = 'menu-item-card'; // Reusing custom CSS class
                    itemCard.innerHTML = `
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">${item.name}</h3>
                        <p class="text-lg font-bold text-blue-600 mt-auto">$${item.price.toFixed(2)} per serving</p>
                    `;
                    menuGrid.appendChild(itemCard);
                });
            }
        }
    }

    // Fetch and render the menu when the page loads
    fetchMenu().then(menuData => {
        if (menuData) {
            renderMenu(menuData);
        }
    });
});

