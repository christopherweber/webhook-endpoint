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
            "impacts": payload.impacts,
            // Include other fields as needed
            // "summary": "Your summary here",
            // "description": "Your description here",
            // ...
        };

        // Send a POST request to Firehydrant
        // Uncomment the following code to enable the POST request

        const response = await axios.post('https://api.firehydrant.io/v1/incidents', newIncidentData, {
            headers: {
                'Authorization': 'Bearer fhb-08cfef6f54a0238ce39315fc562e7217', // Use your actual API token
                 'Content-Type': 'application/json'
             }
         });
         console.log(response.data);

        // Return a successful response
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Incident creation initiated successfully" })
        };
    } catch (error) {
        console.error("Error: ", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error initiating incident creation" })
        };
    }
};
