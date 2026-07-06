import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini API client
let ai;
try {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} catch (e) {
  console.warn("GoogleGenAI initialized without API key, make sure it is added to .env");
}

app.post('/api/navigation', async (req, res) => {
  const { from, to } = req.body;
  if (!from || !to) {
    return res.status(400).json({ error: 'Missing from or to parameters' });
  }

  try {
    const data = await fs.readFile('./data/stadium.json', 'utf8');
    const stadium = JSON.parse(data);

    const prompt = `
      You are an AI assistant for a Smart Stadium navigation app.
      A fan wants to go from "${from}" to "${to}".
      
      Here is the layout graph of connected zones in the stadium, the estimated walk time, and a landmark on the way:
      ${JSON.stringify(stadium.connectedZones)}
      
      Using the shortest path between "${from}" and "${to}" through the connected zones, generate friendly, clear, numbered turn-by-turn walking directions in 3-5 steps. 
      Mention the total estimated walk time and landmarks along the way based on the data.
      Format the output cleanly. Just text, no markdown wrappers like \`\`\`
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ directions: response.text });
  } catch (error) {
    console.error('Error generating directions:', error);
    res.status(500).json({ error: 'Failed to generate directions. Make sure GEMINI_API_KEY is set.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
