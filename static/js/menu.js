// static/js/menu.js
document.addEventListener('DOMContentLoaded', () => {
    const menuItemsListDiv = document.getElementById('menu-items-list');

    /**
     * Fetches menu items from the Flask API and renders them on the page.
     */
    async function fetchAndRenderMenuItems() {
        try {
            const response = await fetch('/api/menu');
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
            }
            const menuData = await response.json();

            menuItemsListDiv.innerHTML = ''; // Clear "Loading menu offerings..."

            if (Object.keys(menuData).length === 0) {
                menuItemsListDiv.innerHTML = `
                    <p class="text-center text-gray-500 text-xl py-10">
                        No menu items available at the moment. Please check back later!
                    </p>
                `;
                return;
            }

            for (const categoryName in menuData) {
                const categoryItems = menuData[categoryName];

                const categorySection = document.createElement('div');
                categorySection.className = 'category-section';

                categorySection.innerHTML = `
                    <h2 class="category-title">${categoryName}</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Items for this category will go here -->
                    </div>
                `;
                menuItemsListDiv.appendChild(categorySection);

                const itemsGrid = categorySection.querySelector('div.grid');

                if (categoryItems.length === 0) {
                    itemsGrid.innerHTML = `<p class="text-gray-500 italic text-sm text-center col-span-full">No items available in this category yet.</p>`;
                } else {
                    categoryItems.forEach(item => {
                        const itemCard = document.createElement('div');
                        itemCard.className = 'item-card';
                        itemCard.innerHTML = `
                            <div>
                                <h3 class="item-name">${item.name}</h3>
                            </div>
                            <span class="item-price">$${item.price.toFixed(2)}</span>
                        `;
                        itemsGrid.appendChild(itemCard);
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching menu items:", error);
            menuItemsListDiv.innerHTML = `
                <div class="text-center text-red-600 p-4 bg-red-100 rounded-lg">
                    <p class="font-bold">Failed to load menu items.</p>
                    <p>Please try again later.</p>
                    <p class="text-sm text-red-500">Error: ${error.message}</p>
                    <p class="text-sm text-red-500">Error: ${error.message}</p>
                </div>
            `;
        }
    }

    // Call the function to fetch and render equipment when the page loads
    fetchAndRenderMenuItems();
});