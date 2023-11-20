const axios = require('axios');

exports.handler = async (event) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const payload = JSON.parse(event.body);

        // Manipulate the payload or make an API request
        // Example: const response = await axios.post('API_URL', payload);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Webhook received and processed' })
        };
    } catch (error) {
        return { statusCode: 500, body: 'Internal Server Error' };
    }
};
