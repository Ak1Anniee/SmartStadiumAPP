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
  const { from, to, accessibilityNeed } = req.body;
  if (!from || !to) {
    return res.status(400).json({ error: 'Missing from or to parameters' });
  }

  try {
    const data = await fs.readFile('./data/stadium.json', 'utf8');
    const stadium = JSON.parse(data);

    let prompt = `
      You are an AI assistant for a Smart Stadium navigation app.
      A fan wants to go from "${from}" to "${to}".
      
      Here is the layout graph of connected zones in the stadium, the estimated walk time, and a landmark on the way:
      ${JSON.stringify(stadium.connectedZones)}
      
      Using the shortest path between "${from}" and "${to}" through the connected zones, generate friendly, clear, numbered turn-by-turn walking directions in 3-5 steps. 
      Mention the total estimated walk time and landmarks along the way based on the data.
    `;

    if (accessibilityNeed && accessibilityNeed !== 'None') {
      prompt += `
      CRITICAL ACCESSIBILITY REQUIREMENT: 
      The fan has selected the following accessibility need: "${accessibilityNeed}". 
      You MUST avoid stairs, prefer ramps and elevators, and explicitly mention any accessible restrooms or accessible entrances along the way.
      Ensure the route is safe and accommodating for their specific need.
      `;
    }

    prompt += `\nFormat the output cleanly. Just text, no markdown wrappers like \`\`\``;

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

app.post('/api/request-help', async (req, res) => {
  const { from, to, need } = req.body;
  
  if (!from || !need) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const filePath = './data/requests.json';
    let requests = [];
    try {
      const data = await fs.readFile(filePath, 'utf8');
      requests = JSON.parse(data);
    } catch (e) {
      // File might not exist yet, we will create it
    }

    const newRequest = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      from,
      to: to || 'Not specified',
      need,
      status: 'pending'
    };

    requests.push(newRequest);
    await fs.writeFile(filePath, JSON.stringify(requests, null, 2));

    res.json({ message: 'Staff notified, ETA 3 minutes.' });
  } catch (error) {
    console.error('Error saving request:', error);
    res.status(500).json({ error: 'Failed to save staff request' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
