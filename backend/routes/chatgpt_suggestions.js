require('dotenv').config({ path: '../.env' });
const express = require('express');
const { OpenAI } = require('openai');

const app = express();

app.use(express.json());

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your .env file contains the API key
});

// Sample data for restaurants (including IDs)
const restaurantList = [
  { id: 1, name: "La Bella Vita", cuisine: "Italian", location: "Downtown", price: "$$", rating: 4.5 },
  { id: 2, name: "Sushi Paradise", cuisine: "Japanese", location: "Uptown", price: "$$$", rating: 4.8 },
  { id: 3, name: "Vegan Delight", cuisine: "Vegan", location: "Suburbs", price: "$", rating: 4.2 },
  // Add more restaurants as needed
];

const userBookings = [
  { restaurant: "La Bella Vita", date: "2024-12-01", occasion: "Anniversary" },
  { restaurant: "Sushi Paradise", date: "2024-11-20", occasion: "Business meeting" },
];

// Route to get restaurant recommendations
app.post('/recommendations', async (req, res) => {
  const { preferences } = req.body; // Accept user preferences from the request body

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant that recommends restaurants based on user preferences." },
        {
          role: "user",
          content: `Here is a list of restaurants:\n${JSON.stringify(restaurantList, null, 2)}\n\n` +
                   `Here is the user's booking history:\n${JSON.stringify(userBookings, null, 2)}\n\n` +
                   `The user preferences are:\n${JSON.stringify(preferences, null, 2)}\n\n` +
                   `Provide restaurant IDs only that match the preferences.`,
        },
      ],
    });

    // Parse the AI response to extract restaurant IDs
    const suggestedIds = response.choices[0].message.content
      .match(/\d+/g) // Extract numeric IDs from the response
      .map(Number); // Convert to an array of integers

    // Filter restaurant list to include only matching IDs
    const filteredRestaurants = restaurantList.filter(restaurant => suggestedIds.includes(restaurant.id));

    // Respond with the filtered restaurant IDs
    res.json({ restaurantIds: filteredRestaurants.map(r => r.id) });
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Failed to fetch restaurant recommendations" });
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
