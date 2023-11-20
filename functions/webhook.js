const axios = require('axios');

exports.handler = async function(event, context) {
    try {
        // Parse the incoming payload
        const payload = JSON.parse(event.body);
        const incidentName = payload.data.incident.name + "-second channel";

        // Construct new incident data for Firehydrant
        const newIncidentData = {
            "name": incidentName,
            // ...other fields populated as needed
        };

        // Send a POST request to Firehydrant
        // const response = await axios.post('https://api.firehydrant.io/v1/incidents', newIncidentData, {
        //     headers: {
        //         'Authorization': 'Bearer fhb-08cfef6f54a0238ce39315fc562e7217',
        //         'Content-Type': 'application/json'
        //     }
        // });

        // Handle the response
        console.log(response.data);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Incident created successfully" })
        };
    } catch (error) {
        console.error("Error: ", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error creating incident" })
        };
    }
};
