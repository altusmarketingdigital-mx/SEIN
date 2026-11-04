const CLIENT_ID = process.env.SKYDROPX_CLIENT_ID || 'oVFRn71YpSxQE0nXgjzBK4Qoe8a63ObPNB54hwu_29U';
const CLIENT_SECRET = process.env.SKYDROPX_CLIENT_SECRET || '98ElW4L8KACroPqosZGM0ONUipE6EiZLmGpo7e3zn-I';
const ORIGIN_ZIP = '45010'; // Zapopan, Jalisco (Sede de SEIN Candle Co.)

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
    const now = Math.floor(Date.now() / 1000);
    if (cachedToken && tokenExpiresAt > now + 120) {
        return cachedToken;
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);

    const res = await fetch('https://pro.skydropx.com/api/v1/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error('Error al autenticar con Skydropx: ' + res.status + ' ' + errText);
    }

    const data = await res.json();
    cachedToken = data.access_token;
    tokenExpiresAt = now + (data.expires_in || 7200);
    return cachedToken;
}

module.exports = async (req, res) => {
    // Permitir CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido. Utilice POST.' });
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
        const destZip = String(body.zip || '').trim();

        if (!destZip || destZip.length < 4) {
            return res.status(400).json({ error: 'Código postal de destino inválido.' });
        }

        const token = await getAccessToken();

        // Estimar peso según items (por defecto 1.5kg caja estándar 20x15x15)
        const weight = Math.max(1.0, Math.min(10.0, Number(body.weight) || 1.5));

        const quoteRes = await fetch('https://api-pro.skydropx.com/api/v1/quotations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                quotation: {
                    address_from: { postal_code: ORIGIN_ZIP, country_code: 'MX' },
                    address_to: { postal_code: destZip, country_code: 'MX' },
                    parcels: [
                        {
                            length: 20,
                            width: 15,
                            height: 15,
                            weight: weight,
                            distance_unit: 'CM',
                            mass_unit: 'KG'
                        }
                    ]
                }
            })
        });

        if (!quoteRes.ok) {
            const errBody = await quoteRes.text();
            return res.status(quoteRes.status).json({ error: 'Error en cotización Skydropx', details: errBody });
        }

        const quoteData = await quoteRes.json();
        const quotationId = quoteData.id;

        // Esperar cálculo de rates en Skydropx (generalmente tarda 1 a 2 seg)
        let rates = quoteData.rates || [];
        for (let attempt = 1; attempt <= 3; attempt++) {
            if (rates.length > 0) break;
            await new Promise(r => setTimeout(r, 1600));

            const pollRes = await fetch('https://api-pro.skydropx.com/api/v1/quotations/' + quotationId, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (pollRes.ok) {
                const pollData = await pollRes.json();
                rates = pollData.rates || [];
                if (pollData.is_completed || rates.length > 0) break;
            }
        }

        // Mapear tarifas de paqueterías limpias
        const cleanedRates = rates
            .filter(r => r.total && !isNaN(parseFloat(r.total)))
            .map(r => ({
                id: r.id,
                carrier: r.provider_display_name || r.provider_name || 'Paquetería',
                service: r.provider_service_name || r.service_level_name || 'Estándar',
                price: Math.round(parseFloat(r.total)),
                days: r.days || 3,
                currency: 'MXN'
            }))
            .sort((a, b) => a.price - b.price);

        return res.status(200).json({
            success: true,
            quotation_id: quotationId,
            origin_zip: ORIGIN_ZIP,
            destination_zip: destZip,
            rates: cleanedRates
        });

    } catch(err) {
        console.error('Error en cotizador Skydropx:', err);
        return res.status(500).json({ error: 'Error interno cotizando envío', message: err.message });
    }
};
