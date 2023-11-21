const axios = require('axios');

// Function to introduce a delay
const delay = ms => new Promise(res => setTimeout(res, ms));

exports.handler = async function(event) {
    // Ensure the method is POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    try {
        // Parse the incoming payload
        const payload = JSON.parse(event.body);

        // Validate and extract required fields from the payload
        if (!payload.name) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Payload missing required field ('name')" })
            };
        }

        // Append "-second channel" to the incident name if not already present
        let incidentName = payload.name.includes("-second channel") ? payload.name : payload.name + "-second channel";

        // Construct new incident data for Firehydrant
        const newIncidentData = {
            "name": incidentName
        };

        const apiToken = process.env.FIREHYDRANT_API_TOKEN;

        // Create a new incident with a POST request
        const incidentResponse = await axios.post('https://api.firehydrant.io/v1/incidents', newIncidentData, {
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
            }
        });

        // Check if the response has the 'id' property
        if (!incidentResponse.data || typeof incidentResponse.data.id !== 'string') {
            console.error("Invalid response structure:", incidentResponse.data);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Invalid API response structure" })
            };
        }

        const newIncidentId = incidentResponse.data.id;

        // Introduce a delay before making the PATCH request
        await delay(10000);

        // Construct the payload for the PATCH request
        const patchPayload = {
            "incidentId": newIncidentId,
            "child_incident_ids": payload.child_incident_ids || [],
            "parent_incident_id": payload.incidentId || null
        };

        // Update the incident with a PATCH request
        await axios.patch(`https://api.firehydrant.io/v1/incidents/${newIncidentId}`, patchPayload, {
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
            }
        });

        // Return a successful response
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Incident created and updated successfully", updatedPayload: patchPayload })
        };
    } catch (error) {
        console.error("Error: ", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error processing request", error: error.message })
        };
    }
};
