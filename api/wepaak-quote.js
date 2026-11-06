// Endpoint Serverless / API para Cotizaciones de Wepaak (Envíos Locales ZMG / México)
const https = require('https');

const WEPAAK_TOKEN = process.env.WEPAAK_API_KEY || 'wpk_live_IRNGWCaKI6NhOUXuKiGY3fP-3AVcw-YMgpjK8_Gjz7E';
const ORIGIN_ZIP = process.env.STORE_ORIGIN_ZIP || '45010'; // Zapopan / Guadalajara

module.exports = async function handler(req, res) {
    // Permitir CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
        const destZip = body.destination_zip || req.query.zip || '44100';

        const payload = {
            address_from: {
                postal_code: ORIGIN_ZIP
            },
            address_to: {
                postal_code: String(destZip).trim()
            },
            parcel: {
                length_cm: 15,
                width_cm: 15,
                height_cm: 15,
                weight_kg: 1
            }
        };

        const postData = JSON.stringify(payload);

        const options = {
            hostname: 'api.wepaak.com',
            path: '/v1/quotes',
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + WEPAAK_TOKEN,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const apiReq = https.request(options, (apiRes) => {
            let responseData = '';
            apiRes.on('data', chunk => responseData += chunk);
            apiRes.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    return res.status(apiRes.statusCode).json(parsed);
                } catch(e) {
                    return res.status(500).json({ error: 'Respuesta inválida de Wepaak', raw: responseData });
                }
            });
        });

        apiReq.on('error', (err) => {
            return res.status(500).json({ error: 'Error de conexión con Wepaak', details: err.message });
        });

        apiReq.write(postData);
        apiReq.end();

    } catch (error) {
        return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
};
