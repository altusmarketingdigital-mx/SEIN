(function() {
    // Número oficial de WhatsApp de SEIN
    const whatsappPhone = "5213334636538";

    // 1. Proteger enlaces externos
    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        const currentRel = link.getAttribute('rel') || '';
        if (!currentRel.includes('noopener')) {
            link.setAttribute('rel', (currentRel + ' noopener noreferrer').trim());
        }
    });

    // 2. Estado del Carrito en LocalStorage
    let cart = [];
    try {
        const saved = localStorage.getItem('sein_cart');
        if (saved) cart = JSON.parse(saved);
    } catch(e) {
        cart = [];
    }

    function saveCart() {
        try {
            localStorage.setItem('sein_cart', JSON.stringify(cart));
        } catch(e) {}
        updateCartUI();
    }

    function parsePrice(priceStr) {
        if (!priceStr) return 0;
        const cleaned = priceStr.replace(/[^0-9.]/g, '');
        return parseFloat(cleaned) || 0;
    }

    function formatCurrency(amount) {
        return '$' + amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MXN';
    }

    // 3. Inyectar Estilos del Carrito Flotante & Drawer
    const style = document.createElement('style');
    style.id = 'sein-floating-cart-styles';
    style.textContent = `
        /* Boton Flotante del Carrito */
        #sein-cart-btn {
            position: fixed;
            bottom: 110px;
            right: 30px;
            background: #2b2b2b;
            color: #ffffff;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 24px rgba(0,0,0,0.25);
            cursor: pointer;
            z-index: 999998;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            border: 2px solid #ffffff;
        }
        #sein-cart-btn:hover {
            transform: scale(1.08);
            background: #a3875e;
        }
        #sein-cart-badge {
            position: absolute;
            top: -4px;
            right: -4px;
            background: #c58d58;
            color: #fff;
            font-size: 12px;
            font-weight: bold;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #fff;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            transition: transform 0.3s ease;
        }

        /* Overlay */
        #sein-cart-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(2px);
            z-index: 999999;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        #sein-cart-overlay.active {
            opacity: 1;
            visibility: visible;
        }

        /* Drawer Lateral */
        #sein-cart-drawer {
            position: fixed;
            top: 0;
            right: -420px;
            width: 100%;
            max-width: 400px;
            height: 100vh;
            background: #ffffff;
            z-index: 1000000;
            box-shadow: -5px 0 25px rgba(0,0,0,0.15);
            display: flex;
            flex-direction: column;
            transition: right 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
            font-family: inherit;
        }
        #sein-cart-drawer.active {
            right: 0;
        }

        /* Drawer Header */
        .sein-drawer-header {
            padding: 20px 24px;
            background: #faf8f5;
            border-bottom: 1px solid #eae5de;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .sein-drawer-header h3 {
            margin: 0;
            font-size: 1.15rem;
            color: #2b2b2b;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .sein-drawer-close {
            background: none;
            border: none;
            font-size: 24px;
            color: #888;
            cursor: pointer;
            line-height: 1;
            padding: 4px 8px;
            border-radius: 4px;
            transition: color 0.2s;
        }
        .sein-drawer-close:hover {
            color: #111;
        }

        /* Drawer Content (Items) */
        .sein-drawer-body {
            flex: 1;
            overflow-y: auto;
            padding: 20px 24px;
        }
        .sein-cart-empty {
            text-align: center;
            padding: 40px 10px;
            color: #777;
        }
        .sein-cart-item {
            display: flex;
            gap: 14px;
            padding-bottom: 16px;
            margin-bottom: 16px;
            border-bottom: 1px solid #f0ebe4;
            align-items: center;
        }
        .sein-cart-item-img {
            width: 65px;
            height: 65px;
            border-radius: 8px;
            object-fit: cover;
            background: #f9f9f9;
            border: 1px solid #eaeaea;
        }
        .sein-cart-item-info {
            flex: 1;
        }
        .sein-cart-item-title {
            font-size: 0.92rem;
            font-weight: 600;
            color: #2b2b2b;
            margin-bottom: 4px;
            line-height: 1.3;
        }
        .sein-cart-item-price {
            font-size: 0.88rem;
            color: #a3875e;
            font-weight: bold;
        }
        .sein-qty-control {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-top: 8px;
        }
        .sein-qty-btn {
            width: 24px;
            height: 24px;
            border: 1px solid #ccc;
            background: #fff;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #444;
            transition: all 0.2s;
        }
        .sein-qty-btn:hover {
            background: #2b2b2b;
            color: #fff;
            border-color: #2b2b2b;
        }
        .sein-qty-val {
            font-size: 13px;
            font-weight: 600;
            min-width: 20px;
            text-align: center;
        }
        .sein-remove-btn {
            background: none;
            border: none;
            color: #bbb;
            cursor: pointer;
            padding: 4px;
            font-size: 16px;
            transition: color 0.2s;
        }
        .sein-remove-btn:hover {
            color: #e04f5f;
        }

        /* Drawer Footer */
        .sein-drawer-footer {
            padding: 20px 24px;
            background: #faf8f5;
            border-top: 1px solid #eae5de;
        }
        .sein-subtotal-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            font-size: 1.05rem;
            font-weight: 600;
            color: #2b2b2b;
        }
        .sein-subtotal-amount {
            color: #a3875e;
            font-size: 1.15rem;
        }
        .sein-checkout-btn {
            width: 100%;
            background: #25d366;
            color: #ffffff;
            border: none;
            padding: 14px 20px;
            border-radius: 30px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
            transition: all 0.3s ease;
        }
        .sein-checkout-btn:hover {
            background: #1eb956;
            box-shadow: 0 6px 20px rgba(37, 211, 102, 0.45);
            transform: translateY(-2px);
        }
        .sein-checkout-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
            box-shadow: none;
            transform: none;
        }
        .sein-toast {
            position: fixed;
            bottom: 100px;
            right: 30px;
            background: #2b2b2b;
            color: #fff;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 0.9rem;
            z-index: 1000001;
            box-shadow: 0 4px 15px rgba(0,0,0,0.25);
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s ease;
            pointer-events: none;
        }
        .sein-toast.show {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);

    // 4. Crear Elementos HTML del Carrito
    const btnContainer = document.createElement('div');
    btnContainer.innerHTML = `
        <div id="sein-cart-btn" title="Ver Carrito de Compras">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span id="sein-cart-badge">0</span>
        </div>
        <div id="sein-cart-overlay"></div>
        <div id="sein-cart-drawer">
            <div class="sein-drawer-header">
                <h3>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                    </svg>
                    Tu Carrito SEIN
                </h3>
                <button class="sein-drawer-close" title="Cerrar">&times;</button>
            </div>
            <div class="sein-drawer-body" id="sein-cart-items">
                <!-- Se llena dinamicamente -->
            </div>
            <div class="sein-drawer-footer">
                <div class="sein-subtotal-row">
                    <span>Total Estimado:</span>
                    <span class="sein-subtotal-amount" id="sein-cart-total">$0.00 MXN</span>
                </div>
                <button class="sein-checkout-btn" id="sein-checkout-action">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.075-2.044-.483-1.614-.668-2.65-2.302-2.73-2.41-.081-.108-.65-0.865-.65-1.65 0-.785.412-1.172.557-1.328.145-.157.319-.196.425-.196.106 0 .213.001.306.006.098.005.23-.037.36.276.134.324.456 1.111.496 1.192.04.081.067.176.013.281-.053.107-.08.174-.16.268-.08.093-.17.208-.242.279-.081.08-.166.166-.071.328.094.162.42 0.693.901 1.122.619.551 1.141.722 1.303.803.162.081.258.071.353-.04.096-.11.41-.478.52-.641.11-.162.221-.136.371-.081.151.054.957.451 1.121.533.164.081.273.122.313.19.04.068.04.394-.104.799z"/>
                    </svg>
                    Pedir por WhatsApp
                </button>
            </div>
        </div>
        <div class="sein-toast" id="sein-toast">Producto añadido al carrito 🌿</div>
    `;
    document.body.appendChild(btnContainer);

    // 5. Referencias UI
    const cartBtn = document.getElementById('sein-cart-btn');
    const cartBadge = document.getElementById('sein-cart-badge');
    const overlay = document.getElementById('sein-cart-overlay');
    const drawer = document.getElementById('sein-cart-drawer');
    const closeBtn = drawer.querySelector('.sein-drawer-close');
    const itemsContainer = document.getElementById('sein-cart-items');
    const totalAmountElem = document.getElementById('sein-cart-total');
    const checkoutBtn = document.getElementById('sein-checkout-action');
    const toastElem = document.getElementById('sein-toast');

    function showToast(msg) {
        toastElem.textContent = msg;
        toastElem.classList.add('show');
        setTimeout(() => toastElem.classList.remove('show'), 2500);
    }

    function openCart() {
        overlay.classList.add('active');
        drawer.classList.add('active');
    }

    function closeCart() {
        overlay.classList.remove('active');
        drawer.classList.remove('active');
    }

    cartBtn.addEventListener('click', openCart);
    closeBtn.addEventListener('click', closeCart);
    overlay.addEventListener('click', closeCart);

    // 6. Renderizar Carrito
    function updateCartUI() {
        const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
        cartBadge.textContent = totalCount;
        cartBadge.style.transform = totalCount > 0 ? 'scale(1.15)' : 'scale(1)';

        if (cart.length === 0) {
            itemsContainer.innerHTML = `
                <div class="sein-cart-empty">
                    <p style="font-size: 1.1rem; margin-bottom: 8px;">Tu carrito está vacío</p>
                    <p style="font-size: 0.85rem; color: #999;">Explora nuestras velas y planners artesanales para añadir tus favoritos.</p>
                </div>
            `;
            totalAmountElem.textContent = '$0.00 MXN';
            checkoutBtn.disabled = true;
            return;
        }

        checkoutBtn.disabled = false;
        let grandTotal = 0;
        itemsContainer.innerHTML = '';

        cart.forEach((item, index) => {
            const numPrice = parsePrice(item.price);
            grandTotal += numPrice * item.qty;

            const itemElem = document.createElement('div');
            itemElem.className = 'sein-cart-item';
            itemElem.innerHTML = `
                ${item.img ? `<img src="${item.img}" class="sein-cart-item-img" alt="${item.title}">` : ''}
                <div class="sein-cart-item-info">
                    <div class="sein-cart-item-title">${item.title}</div>
                    <div class="sein-cart-item-price">${item.price || '$0.00'}</div>
                    <div class="sein-qty-control">
                        <button class="sein-qty-btn" data-action="decrease" data-index="${index}">-</button>
                        <span class="sein-qty-val">${item.qty}</span>
                        <button class="sein-qty-btn" data-action="increase" data-index="${index}">+</button>
                    </div>
                </div>
                <button class="sein-remove-btn" data-index="${index}" title="Eliminar">&times;</button>
            `;
            itemsContainer.appendChild(itemElem);
        });

        totalAmountElem.textContent = formatCurrency(grandTotal);

        // Eventos de controles de cantidad y eliminar
        itemsContainer.querySelectorAll('.sein-qty-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                const action = this.getAttribute('data-action');
                if (action === 'increase') {
                    cart[idx].qty += 1;
                } else if (action === 'decrease') {
                    cart[idx].qty -= 1;
                    if (cart[idx].qty <= 0) {
                        cart.splice(idx, 1);
                    }
                }
                saveCart();
            });
        });

        itemsContainer.querySelectorAll('.sein-remove-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                cart.splice(idx, 1);
                saveCart();
            });
        });
    }

    // 7. Añadir Producto al Carrito
    function addToCart(title, price, img, qty = 1) {
        const existing = cart.find(item => item.title === title);
        if (existing) {
            existing.qty += qty;
        } else {
            cart.push({ title, price, img, qty });
        }
        saveCart();
        showToast(`"${title}" añadido al carrito ✨`);
        openCart();
    }

    // 8. Interceptar Formulario de Producto Individual
    const singleProductForm = document.querySelector('form.cart');
    if (singleProductForm) {
        singleProductForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const productTitleElem = document.querySelector('h1.product_title, h1.entry-title');
            const title = productTitleElem ? productTitleElem.textContent.trim() : 'Producto SEIN';
            const qtyElem = singleProductForm.querySelector('input.qty');
            const qty = qtyElem ? parseInt(qtyElem.value) || 1 : 1;
            const priceElem = document.querySelector('.summary .price .amount, .price .amount');
            const price = priceElem ? priceElem.textContent.trim() : '';
            const imgElem = document.querySelector('.woocommerce-product-gallery__image img, .product-images img');
            const img = imgElem ? imgElem.src : '';

            addToCart(title, price, img, qty);
        });
    }

    // 9. Interceptar Botones de Catálogos y Relacionados
    document.querySelectorAll('.add_to_cart_button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const card = btn.closest('.product');
            const titleElem = card ? card.querySelector('.woocommerce-loop-product__title') : null;
            const title = titleElem ? titleElem.textContent.trim() : 'Producto SEIN';
            const priceElem = card ? card.querySelector('.price .amount') : null;
            const price = priceElem ? priceElem.textContent.trim() : '';
            const imgElem = card ? card.querySelector('img') : null;
            const img = imgElem ? imgElem.src : '';

            addToCart(title, price, img, 1);
        });
    });

    // 10. Generar Mensaje Consolidado de Checkout para WhatsApp
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) return;

        let grandTotal = 0;
        let msg = `¡Hola! Me gustaría realizar el siguiente pedido desde la tienda web de SEIN:%0A%0A`;
        msg += `🛍️ *RESUMEN DEL PEDIDO:*%0A`;
        msg += `---------------------------------%0A`;

        cart.forEach((item, i) => {
            const numPrice = parsePrice(item.price);
            grandTotal += numPrice * item.qty;
            msg += `${i + 1}. *${encodeURIComponent(item.title)}*%0A`;
            msg += `   • Cantidad: ${item.qty}%0A`;
            if (item.price) msg += `   • Precio: ${encodeURIComponent(item.price)} c/u%0A`;
        });

        msg += `---------------------------------%0A`;
        if (grandTotal > 0) {
            msg += `💵 *TOTAL ESTIMADO:* ${encodeURIComponent(formatCurrency(grandTotal))}%0A%0A`;
        }
        msg += `📍 ¿Me podrían apoyar con la confirmación de existencias, costo de envío y formas de pago? ¡Gracias!`;

        window.open(`https://wa.me/${whatsappPhone}?text=${msg}`, '_blank', 'noopener,noreferrer');
    });

    // Inicializar estado del Carrito al cargar la página
    updateCartUI();
})();
