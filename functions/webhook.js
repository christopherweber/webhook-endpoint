const axios = require('axios');

exports.handler = async function(event, context) {
    try {
        // Parse the incoming payload
        const payload = JSON.parse(event.body);
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

        // Extract the new incident ID
        const newIncidentId = incidentResponse.data.incident.id;

        // Construct the payload for the PATCH request
        const patchPayload = {
            "incidentId": newIncidentId,
            "child_incident_ids": payload.child_incident_ids,
            "parent_incident_id": payload.incidentId // Assuming the original incident ID is sent in this field
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
