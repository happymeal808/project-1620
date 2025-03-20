require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors()); // Allow frontend requests

const PORT = 5000;

app.get('/recipes', async (req, res) => {
    try {
        const { ingredients, offset = 0, number = 8 } = req.query; // Default values

        const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
            params: {
                ingredients,
                number,
                offset,
                apiKey: process.env.SPOONACULAR_API_KEY
            }
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch recipes' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
