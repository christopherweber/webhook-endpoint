const axios = require('axios');

exports.handler = async function(event) {
    // Ensure the method is POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    try {
        // Parse the incoming payload
        const payload = JSON.parse(event.body);

        // Validate and extract required fields from the payload
        if (!payload.name || !payload.started_at || !payload.impacts) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Payload missing required fields ('name', 'started_at', 'impacts')" })
            };
        }

        let incidentName = payload.name;

        // Append "-second channel" to the incident name if not already present
        if (!incidentName.includes("-second channel")) {
            incidentName += "-second channel";
        }

        // Construct new incident data for Firehydrant
        const newIncidentData = {
            "name": incidentName,
            "started_at": payload.started_at,
            "impacts": payload.impacts
        };

        const apiToken = process.env.FIREHYDRANT_API_TOKEN;

        // Create a new incident with a POST request
        const incidentResponse = await axios.post('https://api.firehydrant.io/v1/incidents', newIncidentData, {
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
            }
        });

        // Check if the response has the expected structure
        if (!incidentResponse.data || !incidentResponse.data.incident || typeof incidentResponse.data.incident.id !== 'string') {
            console.error("Invalid response structure:", incidentResponse.data);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Invalid API response structure" })
            };
        }

        const newIncidentId = incidentResponse.data.incident.id;

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
