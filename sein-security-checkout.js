(function() {
    // Numero de WhatsApp oficial de SEIN
    const whatsappPhone = "5213329442880";

    // 1. Proteger enlaces externos con rel="noopener noreferrer"
    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        const currentRel = link.getAttribute('rel') || '';
        if (!currentRel.includes('noopener')) {
            link.setAttribute('rel', (currentRel + ' noopener noreferrer').trim());
        }
    });

    // 2. Interceptar boton de compra en pagina de producto individual
    const singleProductForm = document.querySelector('form.cart');
    if (singleProductForm) {
        singleProductForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const productTitleElem = document.querySelector('h1.product_title, h1.entry-title');
            const productTitle = productTitleElem ? productTitleElem.textContent.trim() : 'Producto SEIN';
            const qtyElem = singleProductForm.querySelector('input.qty');
            const qty = qtyElem ? qtyElem.value : 1;
            const priceElem = document.querySelector('.summary .price .amount, .price .amount');
            const price = priceElem ? priceElem.textContent.trim() : '';

            let msg = `¡Hola! Me gustaría hacer un pedido desde su sitio web:%0A%0A`;
            msg += `🌿 *Producto:* ${encodeURIComponent(productTitle)}%0A`;
            msg += `🔢 *Cantidad:* ${qty}%0A`;
            if (price) msg += `💵 *Precio:* ${encodeURIComponent(price)}%0A`;
            msg += `%0A¿Me podrían confirmar disponibilidad y formas de pago?`;

            window.open(`https://wa.me/${whatsappPhone}?text=${msg}`, '_blank', 'noopener,noreferrer');
        });
    }

    // 3. Interceptar botones "Añadir al carrito" en catalogos y relacionados
    document.querySelectorAll('.add_to_cart_button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const card = btn.closest('.product');
            const titleElem = card ? card.querySelector('.woocommerce-loop-product__title') : null;
            const title = titleElem ? titleElem.textContent.trim() : 'Producto SEIN';
            const priceElem = card ? card.querySelector('.price .amount') : null;
            const price = priceElem ? priceElem.textContent.trim() : '';

            let msg = `¡Hola! Me interesa este producto visto en la web de SEIN:%0A%0A`;
            msg += `🌿 *Producto:* ${encodeURIComponent(title)}%0A`;
            if (price) msg += `💵 *Precio:* ${encodeURIComponent(price)}%0A`;
            msg += `%0A¿Tienen disponible para entrega?`;

            window.open(`https://wa.me/${whatsappPhone}?text=${msg}`, '_blank', 'noopener,noreferrer');
        });
    });
})();
