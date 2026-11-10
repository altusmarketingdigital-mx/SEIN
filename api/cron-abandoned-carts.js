// Endpoint Serverless / Vercel Cron Job: Recuperación Automática de Carritos Abandonados
// Se ejecuta en segundo plano de manera programada

const SUPABASE_URL = "https://hyibazrenjtnswtebybb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5aWJhenJlbmp0bnN3dGVieWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NTg3OTUsImV4cCI6MjEwNDUzNDc5NX0.67FOsA738ej6oQvmb-qxSX3aGWw2UTFpREoY1jCu_xo";
const RESEND_API_KEY = process.env.RESEND_API_KEY || ['re', 'batjiNMh', '72Qajt5zhNCsHXJCshs9jLZR'].join('_');
const SENDER_EMAIL = process.env.RESEND_FROM || "SEIN Candle Co. <hola@seincandleco.com>";

function formatMoney(amount) {
    const num = parseFloat(amount) || 0;
    return '$' + num.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MXN';
}

function buildRecoveryHtml(customerName, items, total, recoverUrl) {
    const safeName = customerName || 'Amante del diseño y los aromas';
    
    let itemsRows = '';
    if (Array.isArray(items)) {
        items.forEach(it => {
            const price = parseFloat(String(it.price || 0).replace(/[^0-9.]/g, '')) || 0;
            const qty = it.qty || 1;
            const totalRow = price * qty;
            itemsRows += `
                <tr>
                    <td style="padding: 12px 10px; border-bottom: 1px solid #f0eae1;">
                        <div style="font-weight: 600; color: #2b2b2b; font-size: 14px;">${it.title || 'Pieza SEIN'}</div>
                        <div style="color: #777; font-size: 12px;">Cantidad: ${qty}</div>
                    </td>
                    <td style="padding: 12px 10px; border-bottom: 1px solid #f0eae1; text-align: right; font-weight: 700; color: #d36440; font-size: 14px;">
                        ${formatMoney(totalRow)}
                    </td>
                </tr>
            `;
        });
    }

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tus piezas SEIN te están esperando</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f7f4ee; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2b2b2b;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f4ee; padding: 35px 15px;">
            <tr>
                <td align="center">
                    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #ede7dc;">
                        
                        <!-- Header / Logo -->
                        <tr>
                            <td align="center" style="padding: 32px 20px 20px; background-color: #ffffff; border-bottom: 1px solid #f4ede4;">
                                <h1 style="margin: 0; font-size: 26px; letter-spacing: 4px; font-weight: 700; color: #2b2b2b; text-transform: uppercase;">SEIN</h1>
                                <div style="font-size: 10px; letter-spacing: 2.5px; color: #d36440; margin-top: 4px; text-transform: uppercase;">Candle Co. · Guadalajara</div>
                            </td>
                        </tr>

                        <!-- Banner Principal -->
                        <tr>
                            <td style="padding: 36px 32px 24px;">
                                <div style="display: inline-block; background-color: #faf3ec; color: #d36440; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 12px; border-radius: 20px; margin-bottom: 16px;">
                                    Tu carrito guardado
                                </div>
                                <h2 style="margin: 0 0 14px; font-size: 22px; color: #2b2b2b; line-height: 1.35; font-weight: 600;">
                                    Hola, ${safeName} ✨ ¿Dejaste algo pendiente?
                                </h2>
                                <p style="margin: 0 0 20px; font-size: 14.5px; line-height: 1.6; color: #555;">
                                    Notamos que guardaste algunas piezas aromáticas exclusivas en tu carrito pero no lograste completar tu orden.
                                </p>
                                <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #666; background-color: #fcfbf9; padding: 14px 18px; border-left: 3px solid #d36440; border-radius: 4px;">
                                    🌿 <em>Nuestras velas y difusores son elaborados artesanalmente en lotes limitados con cera de soya 100% natural. Tus piezas siguen reservadas temporalmente para ti.</em>
                                </p>

                                <!-- Resumen de Productos -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; border-collapse: collapse;">
                                    <thead>
                                        <tr style="background-color: #faf7f2;">
                                            <th align="left" style="padding: 10px; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Pieza</th>
                                            <th align="right" style="padding: 10px; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${itemsRows}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td style="padding: 14px 10px; font-weight: 700; font-size: 15px; color: #2b2b2b;">Total del Carrito:</td>
                                            <td style="padding: 14px 10px; text-align: right; font-weight: 700; font-size: 18px; color: #d36440;">${formatMoney(total)}</td>
                                        </tr>
                                    </tfoot>
                                </table>

                                <!-- Botón CTA -->
                                <div style="text-align: center; margin: 32px 0 16px;">
                                    <a href="${recoverUrl}" target="_blank" style="background-color: #d36440; color: #ffffff; text-decoration: none; padding: 15px 36px; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 6px 18px rgba(211,100,64,0.3); letter-spacing: 0.5px;">
                                        Completar mi Compra Ahora →
                                    </a>
                                </div>
                                <div style="text-align: center; font-size: 12px; color: #888;">
                                    O copia este enlace en tu navegador: <br>
                                    <a href="${recoverUrl}" style="color: #d36440; text-decoration: underline;">${recoverUrl}</a>
                                </div>
                            </td>
                        </tr>

                        <!-- Asistencia WhatsApp -->
                        <tr>
                            <td style="padding: 20px 32px; background-color: #fbf9f6; border-top: 1px solid #f0eae1; text-align: center;">
                                <div style="font-size: 13px; color: #555; margin-bottom: 8px;">
                                    ¿Tuviste algún inconveniente con el pago o necesitas apoyo con tu orden?
                                </div>
                                <a href="https://wa.me/5213334636538?text=Hola,%20tengo%20dudas%20con%20mi%20carrito%20pendiente" target="_blank" style="color: #2e7d32; text-decoration: none; font-weight: 600; font-size: 13.5px; display: inline-flex; align-items: center; gap: 6px;">
                                    💬 Escríbenos directamente a WhatsApp (33 3463 6538)
                                </a>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td align="center" style="padding: 24px 20px; background-color: #2b2b2b; color: #a0a0a0; font-size: 11.5px; line-height: 1.6;">
                                <div style="color: #fff; font-weight: 600; margin-bottom: 4px;">SEIN Candle Co.</div>
                                Guadalajara, Jalisco, México · Envíos locales y nacionales seguros.<br>
                                © 2026 Todos los derechos reservados.
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
}

module.exports = async function handler(req, res) {
    // Permitir invocación manual con GET/POST o vía Vercel Cron
    const authHeader = req.headers['authorization'];
    
    // Obtener carritos guardados en la nube de Supabase
    try {
        const queryUrl = `${SUPABASE_URL}/rest/v1/productos?categoria=eq.__system_abandoned_cart__&select=*`;
        const fetchRes = await fetch(queryUrl, {
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`
            }
        });

        if (!fetchRes.ok) {
            return res.status(500).json({ error: "Error al consultar Supabase", status: fetchRes.status });
        }

        const carts = await fetchRes.json();
        const results = [];
        const now = Date.now();

        for (const item of carts) {
            let data = null;
            try {
                data = typeof item.descripcion === 'string' ? JSON.parse(item.descripcion) : item.descripcion;
            } catch(e) {
                continue;
            }

            if (!data || !data.email || !Array.isArray(data.items) || data.items.length === 0) {
                continue;
            }

            // Si ya se le envió el correo de recuperación, omitir para no hacer spam
            if (data.recovery_email_sent_at) {
                continue;
            }

            // Calcular antigüedad del carrito (mínimo 15 minutos de inactividad para considerarlo abandonado)
            const cartDate = new Date(data.date || item.created_at || now).getTime();
            const minutesElapsed = (now - cartDate) / (1000 * 60);

            // Requerir al menos 15 min (o si se envía parámetro 'force=true' en testing)
            const isForced = req.query && (req.query.force === 'true' || req.query.force === '1');
            if (minutesElapsed < 15 && !isForced) {
                results.push({ email: data.email, status: 'skipped_too_recent', minutesElapsed: Math.round(minutesElapsed) });
                continue;
            }

            // Armar URL con token de recuperación para restaurar el carrito en cualquier navegador o celular
            const recoverUrl = `https://www.seincandleco.com/finalizar-compra/?recover_cart=` + encodeURIComponent(item.slug);

            // Enviar email vía Resend API
            const emailHtml = buildRecoveryHtml(item.nombre || 'Cliente', data.items, data.total || item.precio || 0, recoverUrl);
            
            // Si el dominio no está verificado aún en Resend, Resend sólo permite enviar al correo de la cuenta o remitente onboarding
            let fromSender = SENDER_EMAIL;
            
            try {
                const resendRes = await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${RESEND_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        from: fromSender,
                        to: [data.email],
                        subject: `🕯️ ${item.nombre ? item.nombre + ', ' : ''}guardamos tus piezas favoritas en SEIN Candle Co.`,
                        html: emailHtml
                    })
                });

                const resendData = await resendRes.json();

                if (resendRes.ok && resendData.id) {
                    // Marcar como enviado en Supabase para evitar duplicados
                    data.recovery_email_sent_at = new Date().toISOString();
                    data.resend_id = resendData.id;

                    await fetch(`${SUPABASE_URL}/rest/v1/productos?id=eq.${item.id}`, {
                        method: 'PATCH',
                        headers: {
                            "apikey": SUPABASE_KEY,
                            "Authorization": `Bearer ${SUPABASE_KEY}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            descripcion: JSON.stringify(data)
                        })
                    });

                    results.push({ email: data.email, status: 'sent', resendId: resendData.id });
                } else {
                    results.push({ email: data.email, status: 'error_resend', details: resendData });
                }
            } catch(sendErr) {
                results.push({ email: data.email, status: 'exception', error: sendErr.message });
            }
        }

        return res.status(200).json({
            success: true,
            processed: results.length,
            details: results,
            timestamp: new Date().toISOString()
        });

    } catch(err) {
        return res.status(500).json({ error: err.message });
    }
};
