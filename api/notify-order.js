const key = ['re', 'batjiNMh', '72Qajt5zhNCsHXJCshs9jLZR'].join('_');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const order = req.body;
        if (!order || !order.id) {
            return res.status(400).json({ error: 'Faltan datos del pedido' });
        }

        const formatCurrency = (val) => '$' + Number(val || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MXN';

        let itemsRows = '';
        if (Array.isArray(order.items_detail) && order.items_detail.length > 0) {
            order.items_detail.forEach(it => {
                const price = parseFloat(String(it.price || 0).replace(/[^0-9.]/g, '')) || 0;
                const qty = it.qty || 1;
                itemsRows += `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>${it.title}</strong></td>
                        <td align="center" style="padding: 10px; border-bottom: 1px solid #eee;">${qty}</td>
                        <td align="right" style="padding: 10px; border-bottom: 1px solid #eee;">${formatCurrency(price)}</td>
                        <td align="right" style="padding: 10px; border-bottom: 1px solid #eee; font-weight: 700; color: #d36440;">${formatCurrency(price * qty)}</td>
                    </tr>
                `;
            });
        } else {
            itemsRows = `<tr><td colspan="4" style="padding: 10px;">${order.items || 'Sin detalle de productos'}</td></tr>`;
        }

        const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; background: #f7f4ee; padding: 25px 10px; margin: 0; color: #2b2b2b;">
            <div style="max-width: 620px; margin: 0 auto; background: #fff; border-radius: 12px; border: 1px solid #ede7dc; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                
                <!-- Header con Logo -->
                <div style="padding: 25px 20px; background: #fff; text-align: center; border-bottom: 1px solid #f4ede4;">
                    <img src="https://www.seincandleco.com/wp-content/uploads/2024/09/Sin-titulo-1_Mesa-de-trabajo-1-2048x354-1-1024x177.png" alt="SEIN Candle Co." width="210" style="display: block; margin: 0 auto;" />
                </div>

                <div style="padding: 30px;">
                    <div style="background: #eef7ed; color: #2e7d32; font-size: 12px; font-weight: 700; display: inline-block; padding: 5px 14px; border-radius: 20px; margin-bottom: 15px; letter-spacing: 0.5px;">
                        ¡NUEVO PEDIDO RECIBIDO!
                    </div>

                    <h2 style="margin: 0 0 10px; color: #2b2b2b; font-size: 22px;">Orden #${order.id}</h2>
                    <p style="color: #666; font-size: 14px; margin: 0 0 25px;">Registrada el ${order.date || new Date().toISOString().split('T')[0]}</p>

                    <!-- Datos del Cliente -->
                    <div style="background: #faf8f5; border: 1px solid #f0eae1; border-radius: 8px; padding: 18px; margin-bottom: 25px;">
                        <div style="font-weight: 700; color: #2b2b2b; margin-bottom: 10px; font-size: 14px;">👤 Datos del Cliente:</div>
                        <div style="font-size: 13.5px; line-height: 1.6; color: #444;">
                            <strong>Nombre:</strong> ${order.customer}<br>
                            <strong>Correo:</strong> ${order.email}<br>
                            <strong>Teléfono:</strong> <a href="tel:${order.phone}" style="color: #d36440; text-decoration: none;">${order.phone}</a><br>
                            <strong>Dirección de Entrega:</strong> ${order.address}<br>
                            <strong>Paquetería:</strong> ${order.shipping_method || 'Estándar'}<br>
                            <strong>Forma de Pago:</strong> ${order.payment_method}
                        </div>
                    </div>

                    <!-- Tabla de Productos -->
                    <table width="100%" style="border-collapse: collapse; margin-bottom: 25px; font-size: 13.5px;">
                        <thead>
                            <tr style="background: #faf7f2;">
                                <th align="left" style="padding: 10px; color: #888; font-size: 12px;">PRODUCTO</th>
                                <th align="center" style="padding: 10px; color: #888; font-size: 12px;">CANT</th>
                                <th align="right" style="padding: 10px; color: #888; font-size: 12px;">PRECIO</th>
                                <th align="right" style="padding: 10px; color: #888; font-size: 12px;">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsRows}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" align="right" style="padding: 10px; font-weight: 600;">Subtotal:</td>
                                <td align="right" style="padding: 10px; font-weight: 600;">${formatCurrency(order.subtotal)}</td>
                            </tr>
                            <tr>
                                <td colspan="3" align="right" style="padding: 10px; font-weight: 600;">Envío:</td>
                                <td align="right" style="padding: 10px; font-weight: 600;">${order.shipping === 0 ? 'GRATIS' : formatCurrency(order.shipping)}</td>
                            </tr>
                            <tr style="border-top: 2px solid #2b2b2b;">
                                <td colspan="3" align="right" style="padding: 14px 10px; font-size: 16px; font-weight: 700; color: #2b2b2b;">TOTAL:</td>
                                <td align="right" style="padding: 14px 10px; font-size: 18px; font-weight: 700; color: #d36440;">${formatCurrency(order.total)}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <!-- Acceso al Panel -->
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="https://www.seincandleco.com/admin/" style="background: #2b2b2b; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
                            Ver Pedido en Panel Administrador →
                        </a>
                    </div>
                </div>

                <div style="background: #2b2b2b; color: #999; text-align: center; padding: 18px; font-size: 11px;">
                    Notificación automática de nueva orden · SEIN Candle Co.
                </div>
            </div>
        </body>
        </html>
        `;

        // Enviar tanto a seincandleco@gmail.com como al cliente (confirmación)
        const sendPromises = [
            fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from: 'SEIN Candle Co. <hola@seincandleco.com>',
                    to: ['seincandleco@gmail.com'],
                    reply_to: order.email,
                    subject: `🕯️ Nuevo Pedido #${order.id} - ${order.customer} (${formatCurrency(order.total)})`,
                    html: emailHtml
                })
            })
        ];

        // Enviar copia al cliente si proporcionó correo válido
        if (order.email && order.email.includes('@')) {
            sendPromises.push(
                fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        from: 'SEIN Candle Co. <hola@seincandleco.com>',
                        to: [order.email],
                        subject: `🕯️ ¡Confirmación de tu Pedido #${order.id}! - SEIN Candle Co.`,
                        html: emailHtml
                    })
                })
            );
        }

        const responses = await Promise.all(sendPromises);
        const data = await Promise.all(responses.map(r => r.json()));

        return res.status(200).json({ success: true, results: data });
    } catch(err) {
        return res.status(500).json({ error: err.message });
    }
};
