require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());

app.get('/recipe/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/information`, {
            params: {
                apiKey: process.env.SPOONACULAR_API_KEY
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('❌ Failed to fetch recipe info:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch recipe information' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));