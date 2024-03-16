const fetch = require('node-fetch');
const fs = require('fs');

const uploadImageToCloudflare = async (imagePath, apiKey, zoneId) => {
    try {
        const image = fs.readFileSync(imagePath);
        const encodedImage = Buffer.from(image).toString('base64');

        const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/media`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                file: encodedImage
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Image uploaded successfully:', data.result.url);
        } else {
            console.error('Failed to upload image:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error uploading image:', error);
    }
};

// Usage example
const imagePath = '/path/to/image.jpg';
const apiKey = 'YOUR_CLOUDFLARE_API_KEY';
const zoneId = 'YOUR_CLOUDFLARE_ZONE_ID';

uploadImageToCloudflare(imagePath, apiKey, zoneId);