// ============================================
// SECURITY UTILITIES
// ============================================

// HTML escape function to prevent XSS attacks
function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Sanitize search input - remove potentially dangerous characters
function sanitizeSearchInput(input) {
    if (typeof input !== 'string') return '';
    // Remove HTML tags and limit length
    return input.replace(/<[^>]*>/g, '').trim().substring(0, 100);
}

// Validate cart item structure
function isValidCartItem(item) {
    return (
        item &&
        typeof item === 'object' &&
        typeof item.id === 'number' &&
        typeof item.name === 'string' &&
        typeof item.description === 'string' &&
        typeof item.price === 'number' &&
        typeof item.emoji === 'string' &&
        typeof item.quantity === 'number' &&
        item.quantity > 0 &&
        item.quantity <= 99 &&
        item.price > 0 &&
        item.price <= 10000 &&
        item.name.length <= 100 &&
        item.description.length <= 500
    );
}

// Validate that cart item matches a real product
function validateCartAgainstProducts(cartItem) {
    const product = products.find(p => p.id === cartItem.id);
    if (!product) return false;
    // Ensure cart item data matches actual product (prevent price tampering)
    return (
        cartItem.name === product.name &&
        cartItem.price === product.price &&
        cartItem.emoji === product.emoji
    );
}

// ============================================
// CONFIGURATION
// ============================================

const WHATSAPP_PHONE_NUMBER = '923343601488';

// Debounce function to limit how often a function can run
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// PRODUCT DATA
// ============================================

// Product Data
const products = [
    {
        id: 1,
        name: "Lavender Dreams",
        description: "Calming lavender soap with essential oils",
        price: 350,
        emoji: "💜",
        vegan: true
    },
    {
        id: 2,
        name: "Honey Oat",
        description: "Moisturizing honey and oatmeal blend",
        price: 400,
        emoji: "🍯",
        vegan: false
    },
    {
        id: 3,
        name: "Mint Fresh",
        description: "Refreshing peppermint and tea tree",
        price: 380,
        emoji: "🌿",
        vegan: true
    },
    {
        id: 4,
        name: "Rose Garden",
        description: "Luxurious rose petals and shea butter",
        price: 450,
        emoji: "🌹",
        vegan: true
    },
    {
        id: 5,
        name: "Citrus Burst",
        description: "Energizing orange and lemon zest",
        price: 370,
        emoji: "🍊",
        vegan: true
    },
    {
        id: 6,
        name: "Charcoal Detox",
        description: "Deep cleansing activated charcoal",
        price: 420,
        emoji: "⚫",
        vegan: true
    },
    {
        id: 7,
        name: "Coconut Cream",
        description: "Nourishing coconut oil and vanilla",
        price: 390,
        emoji: "🥥",
        vegan: true
    },
    {
        id: 8,
        name: "Aloe Vera Bliss",
        description: "Soothing aloe vera and cucumber",
        price: 410,
        emoji: "🌵",
        vegan: true
    }
];

// ============================================
// CUSTOMER REVIEWS DATA
// ============================================

const reviews = [
    {
        id: 1,
        name: "Ayesha Khan",
        rating: 5,
        text: "The Lavender Dreams soap is absolutely divine! My skin feels so soft and the scent lasts all day. Best soap I've ever used.",
        date: "January 2026"
    },
    {
        id: 2,
        name: "Sarah Ahmed",
        rating: 5,
        text: "I ordered the Rose Garden soap and I'm in love! The packaging was eco-friendly and the soap lathers beautifully.",
        date: "December 2025"
    },
    {
        id: 3,
        name: "Fatima Rizvi",
        rating: 4,
        text: "Great quality soaps with natural ingredients. The Honey Oat is my favorite - it's so moisturizing for dry skin.",
        date: "January 2026"
    },
    {
        id: 4,
        name: "Hira Malik",
        rating: 5,
        text: "Finally found soaps that don't irritate my sensitive skin! The Aloe Vera Bliss is gentle yet effective. Highly recommend.",
        date: "November 2025"
    },
    {
        id: 5,
        name: "Zainab Hussain",
        rating: 4,
        text: "The Charcoal Detox soap has done wonders for my oily skin. Love that it's all natural and cruelty-free too!",
        date: "December 2025"
    },
    {
        id: 6,
        name: "Mariam Siddiqui",
        rating: 5,
        text: "Bought these as gifts and everyone loved them! The quality is outstanding and the scents are just perfect.",
        date: "January 2026"
    }
];

// Cart State
let cart = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    renderReviews();
    loadCartFromStorage();
    updateCartUI();
    initScrollAnimations();

    // Add debounced search functionality for products page
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const debouncedFilter = debounce(filterProducts, 300); // 300ms delay
        searchInput.addEventListener('input', debouncedFilter);
    }

    // Add event listeners for filter dropdowns (CSP-compliant, no inline handlers)
    const priceFilter = document.getElementById('priceFilter');
    if (priceFilter) {
        priceFilter.addEventListener('change', filterProducts);
    }

    const veganFilter = document.getElementById('veganFilter');
    if (veganFilter) {
        veganFilter.addEventListener('change', filterProducts);
    }

    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.addEventListener('change', filterProducts);
    }

    // CSP-compliant event listeners for navigation and cart buttons
    const hamburger = document.getElementById('hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', toggleCart);
    }

    // Also support the old class-based cart button selector
    const cartBtnByClass = document.querySelector('.cart-btn');
    if (cartBtnByClass && cartBtnByClass !== cartBtn) {
        cartBtnByClass.addEventListener('click', toggleCart);
    }

    const closeCartBtn = document.getElementById('closeCartBtn');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', toggleCart);
    }

    // Also support close button by class
    const closeBtnByClass = document.querySelector('.cart-sidebar .close-btn');
    if (closeBtnByClass && closeBtnByClass !== closeCartBtn) {
        closeBtnByClass.addEventListener('click', toggleCart);
    }

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkoutWhatsApp);
    }

    // Also support checkout button by class
    const checkoutBtnByClass = document.querySelector('.btn-checkout');
    if (checkoutBtnByClass && checkoutBtnByClass !== checkoutBtn) {
        checkoutBtnByClass.addEventListener('click', checkoutWhatsApp);
    }

    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.addEventListener('click', toggleCart);
    }
});

// Load Products
function loadProducts() {
    renderProducts(products);
}

// Render Products (used by both load and filter)
function renderProducts(productList) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    productsGrid.innerHTML = '';

    productList.forEach((product, index) => {
        // Create product card using DOM methods for security (prevents XSS)
        const productCard = document.createElement('div');
        productCard.className = `product-card animate-on-scroll animate-fade-up stagger-${(index % 3) + 1}`;
        productCard.dataset.id = product.id;

        // Add vegan tag if product is vegan
        if (product.vegan) {
            const veganTag = document.createElement('span');
            veganTag.className = 'vegan-tag';
            veganTag.textContent = '🌱 Vegan';
            veganTag.setAttribute('aria-label', 'Vegan product');
            productCard.appendChild(veganTag);
        }

        const productImage = document.createElement('div');
        productImage.className = 'product-image';
        productImage.textContent = product.emoji;

        const productInfo = document.createElement('div');
        productInfo.className = 'product-info';

        const productName = document.createElement('h3');
        productName.className = 'product-name';
        productName.textContent = product.name;

        const productDescription = document.createElement('p');
        productDescription.className = 'product-description';
        productDescription.textContent = product.description;

        const productFooter = document.createElement('div');
        productFooter.className = 'product-footer';

        const productPrice = document.createElement('span');
        productPrice.className = 'product-price';
        productPrice.textContent = `Rs. ${product.price}`;

        const addCartBtn = document.createElement('button');
        addCartBtn.className = 'btn-add-cart';
        addCartBtn.textContent = 'Add to Cart';
        addCartBtn.setAttribute('aria-label', `Add ${product.name} to cart`);
        addCartBtn.addEventListener('click', () => addToCart(product.id));

        productFooter.appendChild(productPrice);
        productFooter.appendChild(addCartBtn);

        productInfo.appendChild(productName);
        productInfo.appendChild(productDescription);
        productInfo.appendChild(productFooter);

        productCard.appendChild(productImage);
        productCard.appendChild(productInfo);

        productsGrid.appendChild(productCard);
    });

    // Update results count
    const resultsCount = document.getElementById('resultsCount');
    const noResults = document.getElementById('noResults');

    if (resultsCount) {
        if (productList.length === products.length) {
            resultsCount.textContent = `Showing all ${productList.length} products`;
        } else {
            resultsCount.textContent = `Showing ${productList.length} of ${products.length} products`;
        }
    }

    if (noResults) {
        noResults.style.display = productList.length === 0 ? 'block' : 'none';
    }

    // Observe newly rendered cards for scroll animations
    initScrollAnimations();
}

// ============================================
// RENDER REVIEWS
// ============================================

function renderStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating ? '\u2605' : '\u2606';
    }
    return stars;
}

function renderReviews() {
    const reviewsGrid = document.getElementById('reviewsGrid');
    if (!reviewsGrid) return;

    reviews.forEach((review, index) => {
        const card = document.createElement('div');
        card.className = `review-card animate-on-scroll animate-fade-up stagger-${(index % 3) + 1}`;
        card.setAttribute('role', 'listitem');

        const stars = document.createElement('div');
        stars.className = 'review-stars';
        stars.textContent = renderStarRating(review.rating);
        stars.setAttribute('aria-label', `${review.rating} out of 5 stars`);

        const text = document.createElement('p');
        text.className = 'review-text';
        text.textContent = review.text;

        const footer = document.createElement('div');
        footer.className = 'review-footer';

        const author = document.createElement('span');
        author.className = 'review-author';
        author.textContent = review.name;

        const date = document.createElement('span');
        date.className = 'review-date';
        date.textContent = review.date;

        footer.appendChild(author);
        footer.appendChild(date);

        card.appendChild(stars);
        card.appendChild(text);
        card.appendChild(footer);

        reviewsGrid.appendChild(card);
    });
}

// Filter Products
function filterProducts() {
    const searchInput = document.getElementById('searchInput');
    const priceFilter = document.getElementById('priceFilter');
    const veganFilter = document.getElementById('veganFilter');
    const sortFilter = document.getElementById('sortFilter');

    // Get values (with defaults for pages without filter controls)
    // Sanitize search input to prevent XSS
    const rawSearchTerm = searchInput ? searchInput.value : '';
    const searchTerm = sanitizeSearchInput(rawSearchTerm).toLowerCase();
    const priceRange = priceFilter ? priceFilter.value : 'all';
    const veganOnly = veganFilter ? veganFilter.value : 'all';
    const sortBy = sortFilter ? sortFilter.value : 'default';

    // Debug logging
    console.log('Filter triggered:', { searchTerm, priceRange, veganOnly, sortBy });

    // Start with all products
    let filteredProducts = [...products];

    // Apply search filter
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }

    // Apply vegan filter
    if (veganOnly !== 'all') {
        if (veganOnly === 'vegan') {
            filteredProducts = filteredProducts.filter(product => product.vegan === true);
        } else if (veganOnly === 'non-vegan') {
            filteredProducts = filteredProducts.filter(product => product.vegan === false);
        }
    }

    // Apply price filter
    if (priceRange !== 'all') {
        filteredProducts = filteredProducts.filter(product => {
            switch (priceRange) {
                case 'low':
                    return product.price < 380;
                case 'mid':
                    return product.price >= 380 && product.price <= 420;
                case 'high':
                    return product.price > 420;
                default:
                    return true;
            }
        });
    }

    // Apply sorting
    if (sortBy !== 'default') {
        filteredProducts.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });
    }

    renderProducts(filteredProducts);
}

// Add to Cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCartToStorage();
    updateCartUI();

    // Show cart
    toggleCart();
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartUI();
}

// Update Quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCartToStorage();
            updateCartUI();
        }
    }
}

// Update Cart UI
function updateCartUI() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const totalAmount = document.getElementById('totalAmount');

    // Update count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalAmount.textContent = `Rs. ${total}`;

    // Clear cart items container
    cartItems.innerHTML = '';

    // Update cart items using safe DOM methods (prevents XSS)
    if (cart.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'empty-cart';
        emptyMsg.textContent = 'Your cart is empty';
        cartItems.appendChild(emptyMsg);
    } else {
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';

            const cartItemInfo = document.createElement('div');
            cartItemInfo.className = 'cart-item-info';

            const cartItemName = document.createElement('div');
            cartItemName.className = 'cart-item-name';
            cartItemName.textContent = `${item.emoji} ${item.name}`;

            const cartItemPrice = document.createElement('div');
            cartItemPrice.className = 'cart-item-price';
            cartItemPrice.textContent = `Rs. ${item.price}`;

            const cartItemQuantity = document.createElement('div');
            cartItemQuantity.className = 'cart-item-quantity';

            const minusBtn = document.createElement('button');
            minusBtn.className = 'qty-btn';
            minusBtn.textContent = '-';
            minusBtn.setAttribute('aria-label', `Decrease quantity of ${item.name}`);
            minusBtn.addEventListener('click', () => updateQuantity(item.id, -1));

            const quantitySpan = document.createElement('span');
            quantitySpan.textContent = item.quantity;
            quantitySpan.setAttribute('aria-label', `Quantity: ${item.quantity}`);

            const plusBtn = document.createElement('button');
            plusBtn.className = 'qty-btn';
            plusBtn.textContent = '+';
            plusBtn.setAttribute('aria-label', `Increase quantity of ${item.name}`);
            plusBtn.addEventListener('click', () => updateQuantity(item.id, 1));

            cartItemQuantity.appendChild(minusBtn);
            cartItemQuantity.appendChild(quantitySpan);
            cartItemQuantity.appendChild(plusBtn);

            cartItemInfo.appendChild(cartItemName);
            cartItemInfo.appendChild(cartItemPrice);
            cartItemInfo.appendChild(cartItemQuantity);

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = 'Remove';
            removeBtn.setAttribute('aria-label', `Remove ${item.name} from cart`);
            removeBtn.addEventListener('click', () => removeFromCart(item.id));

            cartItem.appendChild(cartItemInfo);
            cartItem.appendChild(removeBtn);

            cartItems.appendChild(cartItem);
        });
    }
}

// Toggle Cart
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    const cartBtn = document.querySelector('.cart-btn');

    const isOpening = !cartSidebar.classList.contains('active');

    cartSidebar.classList.toggle('active');
    overlay.classList.toggle('active');

    // Update ARIA attributes
    if (cartSidebar) {
        cartSidebar.setAttribute('aria-hidden', !isOpening);
    }
    if (cartBtn) {
        cartBtn.setAttribute('aria-expanded', isOpening);
    }

    if (isOpening) {
        // Store the element that opened the cart for later focus restoration
        cartSidebar.dataset.lastFocus = document.activeElement?.id || '';

        // Focus the close button when cart opens
        const closeBtn = cartSidebar.querySelector('.close-btn');
        if (closeBtn) {
            setTimeout(() => closeBtn.focus(), 100);
        }

        // Add focus trap
        document.addEventListener('keydown', handleCartFocusTrap);

        // Close cart on Escape key
        document.addEventListener('keydown', handleCartEscape);
    } else {
        // Remove focus trap
        document.removeEventListener('keydown', handleCartFocusTrap);
        document.removeEventListener('keydown', handleCartEscape);

        // Restore focus to the element that opened the cart
        const lastFocusId = cartSidebar.dataset.lastFocus;
        if (lastFocusId) {
            const lastFocusEl = document.getElementById(lastFocusId);
            if (lastFocusEl) {
                lastFocusEl.focus();
            }
        } else if (cartBtn) {
            cartBtn.focus();
        }
    }
}

// Handle Escape key to close cart
function handleCartEscape(e) {
    if (e.key === 'Escape') {
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar && cartSidebar.classList.contains('active')) {
            toggleCart();
        }
    }
}

// Focus trap for cart sidebar
function handleCartFocusTrap(e) {
    if (e.key !== 'Tab') return;

    const cartSidebar = document.getElementById('cartSidebar');
    if (!cartSidebar || !cartSidebar.classList.contains('active')) return;

    // Get all focusable elements in the cart
    const focusableElements = cartSidebar.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // If shift+tab on first element, go to last
    if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
    }
    // If tab on last element, go to first
    else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
    }
}

// WhatsApp Checkout
function checkoutWhatsApp() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    // Build order message
    let message = '🛒 *New Order from Bint-e-Samin Soaps*\n\n';
    message += '📦 *Order Details:*\n';
    message += '━━━━━━━━━━━━━━━━\n';

    cart.forEach(item => {
        message += `\n${item.emoji} *${item.name}*\n`;
        message += `   Qty: ${item.quantity}\n`;
        message += `   Price: Rs. ${item.price} each\n`;
        message += `   Subtotal: Rs. ${item.price * item.quantity}\n`;
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += '\n━━━━━━━━━━━━━━━━\n';
    message += `💰 *Total: Rs. ${total}*\n\n`;
    message += 'Please confirm your order and provide delivery details.';

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);

    // WhatsApp link (using config variable)
    const whatsappURL = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodedMessage}`;

    // Open WhatsApp
    window.open(whatsappURL, '_blank');
}

// Local Storage Functions with error handling and validation
function saveCartToStorage() {
    try {
        localStorage.setItem('soapCart', JSON.stringify(cart));
    } catch (error) {
        // Handle localStorage errors (quota exceeded, private browsing, etc.)
        console.warn('Unable to save cart to localStorage:', error.message);
        // Optionally notify user
        if (error.name === 'QuotaExceededError') {
            console.warn('Storage quota exceeded. Cart will not persist.');
        }
    }
}

function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('soapCart');
        if (savedCart) {
            const parsedCart = JSON.parse(savedCart);

            // Validate that parsedCart is an array
            if (!Array.isArray(parsedCart)) {
                console.warn('Invalid cart data format. Resetting cart.');
                cart = [];
                localStorage.removeItem('soapCart');
                return;
            }

            // Validate and filter each cart item
            const validatedCart = parsedCart.filter(item => {
                // Check basic structure
                if (!isValidCartItem(item)) {
                    console.warn('Invalid cart item structure:', item);
                    return false;
                }

                // Validate against actual products (prevent price tampering)
                if (!validateCartAgainstProducts(item)) {
                    console.warn('Cart item does not match product data:', item);
                    return false;
                }

                return true;
            });

            cart = validatedCart;

            // If some items were invalid, save the cleaned cart
            if (validatedCart.length !== parsedCart.length) {
                saveCartToStorage();
            }
        }
    } catch (error) {
        // Handle JSON parse errors or localStorage access errors
        console.warn('Error loading cart from localStorage:', error.message);
        cart = [];
        // Try to clear corrupted data
        try {
            localStorage.removeItem('soapCart');
        } catch (e) {
            // Ignore if we can't remove it
        }
    }
}

// Smooth Scroll for Navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile Menu Toggle
function toggleMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');

    // Update ARIA attributes for accessibility
    const isExpanded = hamburger.classList.contains('active');
    hamburger.setAttribute('aria-expanded', isExpanded);
}

// Close mobile menu when clicking on a link
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const hamburger = document.getElementById('hamburger');
            const navLinksContainer = document.getElementById('navLinks');
            if (hamburger && navLinksContainer) {
                hamburger.classList.remove('active');
                navLinksContainer.classList.remove('active');
            }
        });
    });

    // Add touch event support for hamburger menu on mobile
    const hamburger = document.getElementById('hamburger');
    if (hamburger) {
        hamburger.addEventListener('touchend', (e) => {
            e.preventDefault();
            toggleMobileMenu();
        });
    }

    // FAQ Accordion functionality
    initAccordion();
});

// ============================================
// FAQ ACCORDION
// ============================================

function initAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(function(header) {
        header.addEventListener('click', function(e) {
            e.preventDefault();
            toggleAccordion(this);
        });
    });
}

function toggleAccordion(button) {
    const accordionItem = button.parentElement;
    const content = button.nextElementSibling;
    const icon = button.querySelector('.accordion-icon');
    const isExpanded = button.getAttribute('aria-expanded') === 'true';

    // Close all other accordion items in the same category
    const category = accordionItem.closest('.accordion');
    if (category) {
        category.querySelectorAll('.accordion-item').forEach(function(item) {
            if (item !== accordionItem) {
                item.classList.remove('active');
                const itemHeader = item.querySelector('.accordion-header');
                const itemContent = item.querySelector('.accordion-content');
                const itemIcon = item.querySelector('.accordion-icon');
                if (itemHeader) itemHeader.setAttribute('aria-expanded', 'false');
                if (itemContent) itemContent.setAttribute('aria-hidden', 'true');
                if (itemIcon) itemIcon.textContent = '+';
            }
        });
    }

    // Toggle current item
    if (isExpanded) {
        accordionItem.classList.remove('active');
        button.setAttribute('aria-expanded', 'false');
        if (content) content.setAttribute('aria-hidden', 'true');
        if (icon) icon.textContent = '+';
    } else {
        accordionItem.classList.add('active');
        button.setAttribute('aria-expanded', 'true');
        if (content) content.setAttribute('aria-hidden', 'false');
        if (icon) icon.textContent = '−';
    }
}

// ============================================
// SCROLL ANIMATIONS (Intersection Observer)
// ============================================

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (!animatedElements.length) return;

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    animatedElements.forEach(function(el) {
        observer.observe(el);
    });
}
