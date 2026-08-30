// DAAS - Global Price Comparison Platform
// Main JavaScript File

// Mock Product Database
const mockProducts = [
    {
        id: 1,
        name: "iPhone 15 Pro Max",
        description: "هاتف ذكي بذاكرة 256 جيجابايت - إصدار عالمي",
        prices: [
            { store: "amazon", price: 999, currency: "USD", link: "https://amazon.com", rating: 4.8, reviews: 1250 },
            { store: "ebay", price: 950, currency: "USD", link: "https://ebay.com", rating: 4.6, reviews: 890 },
            { store: "aliexpress", price: 899, currency: "USD", link: "https://aliexpress.com", rating: 4.2, reviews: 2100 }
        ],
        image: "https://via.placeholder.com/300x300?text=iPhone+15+Pro",
        category: "smartphones",
        condition: "new"
    },
    {
        id: 2,
        name: "Samsung Galaxy S24 Ultra",
        description: "هاتف ذكي بمعالج Snapdragon 8 Gen 3",
        prices: [
            { store: "amazon", price: 1199, currency: "USD", link: "https://amazon.com", rating: 4.7, reviews: 980 },
            { store: "ebay", price: 1150, currency: "USD", link: "https://ebay.com", rating: 4.5, reviews: 650 },
            { store: "aliexpress", price: 1099, currency: "USD", link: "https://aliexpress.com", rating: 4.3, reviews: 1800 }
        ],
        image: "https://via.placeholder.com/300x300?text=Samsung+S24",
        category: "smartphones",
        condition: "new"
    },
    {
        id: 3,
        name: "MacBook Pro 16\"",
        description: "حاسوب محمول بمعالج M3 Max وذاكرة 36 جيجابايت",
        prices: [
            { store: "amazon", price: 2499, currency: "USD", link: "https://amazon.com", rating: 4.9, reviews: 2150 },
            { store: "ebay", price: 2400, currency: "USD", link: "https://ebay.com", rating: 4.8, reviews: 1200 },
            { store: "aliexpress", price: 2350, currency: "USD", link: "https://aliexpress.com", rating: 4.4, reviews: 890 }
        ],
        image: "https://via.placeholder.com/300x300?text=MacBook+Pro",
        category: "laptops",
        condition: "new"
    }
];

// Global State
let currentProducts = [];
let currentFilters = {
    searchQuery: '',
    priceMin: 0,
    priceMax: Infinity,
    stores: ['amazon', 'ebay', 'aliexpress'],
    condition: 'all',
    sort: 'price_asc',
    currency: 'USD',
    language: 'ar'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    displayProducts(mockProducts);
});

// Event Listeners
function initializeEventListeners() {
    // Search
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    // Filters
    document.getElementById('sortSelect').addEventListener('change', applyFilters);
    document.getElementById('priceMin').addEventListener('change', applyFilters);
    document.getElementById('priceMax').addEventListener('change', applyFilters);
    
    document.querySelectorAll('.store-filter').forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });

    document.querySelectorAll('input[name="condition"]').forEach(radio => {
        radio.addEventListener('change', applyFilters);
    });

    // Settings
    document.getElementById('languageSelect').addEventListener('change', (e) => {
        currentFilters.language = e.target.value;
    });

    document.getElementById('currencySelect').addEventListener('change', (e) => {
        currentFilters.currency = e.target.value;
    });
}

// Search Function
function performSearch() {
    const searchQuery = document.getElementById('searchInput').value;
    if (searchQuery.trim() === '') return;
    
    currentFilters.searchQuery = searchQuery;
    applyFilters();
}

// Apply Filters
function applyFilters() {
    let filtered = mockProducts;

    // Search filter
    if (currentFilters.searchQuery) {
        filtered = filtered.filter(product => 
            product.name.includes(currentFilters.searchQuery) || 
            product.description.includes(currentFilters.searchQuery)
        );
    }

    // Store filter
    const selectedStores = Array.from(document.querySelectorAll('.store-filter:checked')).map(cb => cb.value);
    filtered = filtered.filter(product => 
        product.prices.some(p => selectedStores.includes(p.store))
    );

    // Condition filter
    const selectedCondition = document.querySelector('input[name="condition"]:checked').value;
    if (selectedCondition !== 'all') {
        filtered = filtered.filter(p => p.condition === selectedCondition);
    }

    // Price filter
    const priceMin = parseFloat(document.getElementById('priceMin').value) || 0;
    const priceMax = parseFloat(document.getElementById('priceMax').value) || Infinity;
    filtered = filtered.filter(product => {
        const minPrice = Math.min(...product.prices.map(p => p.price));
        return minPrice >= priceMin && minPrice <= priceMax;
    });

    // Sorting
    const sortBy = document.getElementById('sortSelect').value;
    filtered.sort((a, b) => {
        const minPriceA = Math.min(...a.prices.map(p => p.price));
        const minPriceB = Math.min(...b.prices.map(p => p.price));
        
        if (sortBy === 'price_asc') return minPriceA - minPriceB;
        if (sortBy === 'price_desc') return minPriceB - minPriceA;
        if (sortBy === 'rating') {
            const ratingA = a.prices[0]?.rating || 0;
            const ratingB = b.prices[0]?.rating || 0;
            return ratingB - ratingA;
        }
    });

    currentProducts = filtered;
    displayProducts(filtered);
}

// Display Products
function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    const resultCount = document.getElementById('resultCount');
    
    resultCount.textContent = products.length;
    
    if (products.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-12"><p class="text-gray-500 text-lg">لم يتم العثور على نتائج</p></div>';
        return;
    }

    grid.innerHTML = products.map((product, index) => createProductCard(product, index)).join('');
}

// Create Product Card
function createProductCard(product, index) {
    const cheapestOffer = [...product.prices].sort((a, b) => a.price - b.price)[0];
    const isBestPrice = index === 0;

    return `
        <div class="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between product-card">
            <div>
                <div class="bg-gray-100 rounded-xl h-44 w-full flex items-center justify-center text-gray-400 mb-4 relative overflow-hidden">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">
                    ${isBestPrice ? '<span class="best-price-ribbon">الأقل سعراً</span>' : ''}
                </div>
                <span class="text-xs font-bold text-blue-600 tracking-wide uppercase">${product.category}</span>
                <h3 class="font-bold text-gray-800 text-base mt-1 mb-2 line-clamp-2">${product.name}</h3>
                <p class="text-gray-600 text-sm mb-3 line-clamp-2">${product.description}</p>
            </div>

            <div>
                <!-- أرخص سعر -->
                <div class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p class="text-xs text-gray-600 mb-1">أرخص سعر من:</p>
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-2xl text-green-600">${cheapestOffer.price} ${cheapestOffer.currency}</span>
                        <span class="text-xs font-semibold text-gray-700 uppercase">${cheapestOffer.store}</span>
                    </div>
                </div>

                <!-- التقييم -->
                <div class="mb-4 flex items-center gap-2">
                    <span class="rating-stars">${'★'.repeat(Math.floor(cheapestOffer.rating))}</span>
                    <span class="text-sm font-bold text-gray-700">${cheapestOffer.rating}</span>
                    <span class="text-xs text-gray-500">(${cheapestOffer.reviews} تقييم)</span>
                </div>

                <!-- عرض الأسعار من المتاجر الأخرى -->
                <div class="mb-4">
                    <p class="text-xs font-bold text-gray-700 mb-2">أسعار أخرى:</p>
                    <div class="space-y-1">
                        ${product.prices.filter(p => p !== cheapestOffer).map(offer => `
                            <div class="flex justify-between text-xs text-gray-600">
                                <span>${offer.store}</span>
                                <span>${offer.price} ${offer.currency}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- زر الشراء -->
                <a href="${cheapestOffer.link}?aff=daas" target="_blank" class="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition text-center block text-sm">
                    اشتري الآن من ${cheapestOffer.store}
                </a>
            </div>
        </div>
    `;
}

// Reset Filters
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('sortSelect').value = 'price_asc';
    document.getElementById('priceMin').value = '';
    document.getElementById('priceMax').value = '';
    
    document.querySelectorAll('.store-filter').forEach(cb => cb.checked = true);
    document.querySelector('input[name="condition"][value="all"]').checked = true;
    
    currentFilters = {
        searchQuery: '',
        priceMin: 0,
        priceMax: Infinity,
        stores: ['amazon', 'ebay', 'aliexpress'],
        condition: 'all',
        sort: 'price_asc',
        currency: 'USD',
        language: 'ar'
    };
    
    displayProducts(mockProducts);
}

// Currency Conversion Helper
function convertCurrency(price, fromCurrency, toCurrency) {
    const rates = {
        'USD': 1,
        'EUR': 0.92,
        'SAR': 3.75,
        'AED': 3.67
    };
    
    const priceInUSD = price / rates[fromCurrency];
    return priceInUSD * rates[toCurrency];
}