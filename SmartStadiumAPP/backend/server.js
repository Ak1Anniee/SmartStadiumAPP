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

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

// Simulation Data
const snapshots = [
  { time: '6:00 PM', densities: { 'gate-a': 20, 'gate-b': 25, 'gate-c': 15, 'gate-d': 20, 'sec-100': 10, 'sec-200': 15, 'sec-300': 10, 'sec-400': 12, 'rr-1': 5, 'rr-2': 5, 'med-1': 2, 'fc-1': 10, 'fc-2': 12, 'acc-1': 5, 'acc-2': 5 } },
  { time: '6:10 PM', densities: { 'gate-a': 25, 'gate-b': 45, 'gate-c': 20, 'gate-d': 25, 'sec-100': 15, 'sec-200': 20, 'sec-300': 15, 'sec-400': 18, 'rr-1': 10, 'rr-2': 10, 'med-1': 5, 'fc-1': 15, 'fc-2': 18, 'acc-1': 8, 'acc-2': 8 } },
  { time: '6:20 PM', densities: { 'gate-a': 30, 'gate-b': 65, 'gate-c': 25, 'gate-d': 30, 'sec-100': 25, 'sec-200': 30, 'sec-300': 25, 'sec-400': 22, 'rr-1': 15, 'rr-2': 15, 'med-1': 5, 'fc-1': 20, 'fc-2': 25, 'acc-1': 12, 'acc-2': 12 } },
  { time: '6:30 PM', densities: { 'gate-a': 35, 'gate-b': 85, 'gate-c': 30, 'gate-d': 35, 'sec-100': 35, 'sec-200': 35, 'sec-300': 30, 'sec-400': 25, 'rr-1': 20, 'rr-2': 20, 'med-1': 8, 'fc-1': 30, 'fc-2': 35, 'acc-1': 15, 'acc-2': 15 } },
  { time: '6:40 PM', densities: { 'gate-a': 38, 'gate-b': 95, 'gate-c': 35, 'gate-d': 38, 'sec-100': 45, 'sec-200': 45, 'sec-300': 35, 'sec-400': 30, 'rr-1': 25, 'rr-2': 25, 'med-1': 10, 'fc-1': 35, 'fc-2': 40, 'acc-1': 18, 'acc-2': 18 } },
  { time: '6:50 PM', densities: { 'gate-a': 35, 'gate-b': 80, 'gate-c': 35, 'gate-d': 35, 'sec-100': 55, 'sec-200': 55, 'sec-300': 40, 'sec-400': 35, 'rr-1': 30, 'rr-2': 30, 'med-1': 12, 'fc-1': 40, 'fc-2': 45, 'acc-1': 20, 'acc-2': 20 } },
  { time: '7:00 PM', densities: { 'gate-a': 30, 'gate-b': 60, 'gate-c': 30, 'gate-d': 30, 'sec-100': 65, 'sec-200': 65, 'sec-300': 50, 'sec-400': 45, 'rr-1': 35, 'rr-2': 35, 'med-1': 15, 'fc-1': 45, 'fc-2': 50, 'acc-1': 22, 'acc-2': 22 } },
  { time: '7:10 PM', densities: { 'gate-a': 25, 'gate-b': 45, 'gate-c': 25, 'gate-d': 25, 'sec-100': 60, 'sec-200': 60, 'sec-300': 55, 'sec-400': 50, 'rr-1': 30, 'rr-2': 30, 'med-1': 10, 'fc-1': 40, 'fc-2': 40, 'acc-1': 20, 'acc-2': 20 } },
  { time: '7:20 PM', densities: { 'gate-a': 20, 'gate-b': 30, 'gate-c': 20, 'gate-d': 20, 'sec-100': 55, 'sec-200': 55, 'sec-300': 50, 'sec-400': 45, 'rr-1': 25, 'rr-2': 25, 'med-1': 8, 'fc-1': 35, 'fc-2': 35, 'acc-1': 15, 'acc-2': 15 } },
  { time: '7:30 PM', densities: { 'gate-a': 15, 'gate-b': 20, 'gate-c': 15, 'gate-d': 15, 'sec-100': 50, 'sec-200': 50, 'sec-300': 45, 'sec-400': 40, 'rr-1': 20, 'rr-2': 20, 'med-1': 5, 'fc-1': 30, 'fc-2': 30, 'acc-1': 10, 'acc-2': 10 } },
];

let currentSnapshotIndex = 0;
setInterval(() => {
  currentSnapshotIndex = (currentSnapshotIndex + 1) % snapshots.length;
}, 5000); // Update every 5 seconds

app.get('/api/stadium-data', (req, res) => {
  res.json(snapshots[currentSnapshotIndex]);
});

app.get('/api/requests', async (req, res) => {
  try {
    const filePath = './data/requests.json';
    const data = await fs.readFile(filePath, 'utf8');
    const requests = JSON.parse(data);
    res.json(requests.reverse()); // Newest first
  } catch (error) {
    res.json([]);
  }
});

app.put('/api/requests/:id/resolve', async (req, res) => {
  try {
    const filePath = './data/requests.json';
    const data = await fs.readFile(filePath, 'utf8');
    const requests = JSON.parse(data);

    const index = requests.findIndex(r => r.id === req.params.id);
    if (index !== -1) {
      requests[index].status = 'resolved';
      await fs.writeFile(filePath, JSON.stringify(requests, null, 2));
      res.json(requests[index]);
    } else {
      res.status(404).json({ error: 'Request not found' });
    }
  } catch (error) {
    console.error('Error resolving request:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

app.post('/api/navigation', async (req, res) => {
  const { from, to, accessibilityNeed, language } = req.body;
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
      `;
    }

    if (language && language !== 'English') {
      prompt += `\nPlease generate the response in the following language: ${language}.`;
    }

    prompt += `\nFormat the output cleanly. Just text, no markdown wrappers like \`\`\``;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    res.json({ directions: response.text });
  } catch (error) {
    console.error('Error generating directions:', error);
    res.status(500).json({ error: 'Failed to generate directions. Make sure GEMINI_API_KEY is set.' });
  }
});

app.post('/api/request-help', async (req, res) => {
  const { from, to, need, language } = req.body;

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
      status: 'pending',
      subIssues: []
    };

    requests.push(newRequest);
    await fs.writeFile(filePath, JSON.stringify(requests, null, 2));

    let confirmationMessage = 'Staff notified, ETA 3 minutes.';
    if (ai && language && language !== 'English') {
      try {
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: `Translate the following confirmation message to ${language}: "Staff notified, ETA 3 minutes." Just return the translated text.`,
        });
        if (response && response.text) {
          confirmationMessage = response.text.trim();
        }
      } catch (e) {
        console.error('Translation failed', e);
      }
    }

    res.json({ message: confirmationMessage, request: newRequest });
  } catch (error) {
    console.error('Error saving request:', error);
    res.status(500).json({ error: 'Failed to save staff request' });
  }
});

app.post('/api/requests/:id/subissue', async (req, res) => {
  const { note } = req.body;
  if (!note) return res.status(400).json({ error: 'Missing note parameter' });

  try {
    const filePath = './data/requests.json';
    const data = await fs.readFile(filePath, 'utf8');
    const requests = JSON.parse(data);

    const index = requests.findIndex(r => r.id === req.params.id);
    if (index !== -1) {
      if (!requests[index].subIssues) requests[index].subIssues = [];
      requests[index].subIssues.push({
        timestamp: new Date().toISOString(),
        note
      });
      await fs.writeFile(filePath, JSON.stringify(requests, null, 2));
      res.json(requests[index]);
    } else {
      res.status(404).json({ error: 'Request not found' });
    }
  } catch (error) {
    console.error('Error adding subissue:', error);
    res.status(500).json({ error: 'Failed to add subissue' });
  }
});

app.post('/api/ai-insights', async (req, res) => {
  const { stadiumData, requests } = req.body;
  if (!stadiumData || !requests) {
    return res.status(400).json({ error: 'Missing stadiumData or requests' });
  }

  if (!ai) {
    console.error("AI client not initialized. Check GEMINI_API_KEY.");
    return res.status(500).json({ error: 'AI client not initialized on server. Check API key.' });
  }

  try {

    const prompt = `
      You are an AI assistant for a Smart Stadium Organizer Dashboard.
      Analyze the current stadium state and provide insights.
      
      Current Time: ${stadiumData.time}
      Zone Densities: ${JSON.stringify(stadiumData.densities)}
      Pending Accessibility/Help Requests: ${JSON.stringify(requests.filter(r => r.status === 'pending'))}
      
      1. Identify the top 1-2 zones at risk of overcrowding in the next 15 minutes, with a one-sentence reason for each.
      2. Recommend a specific staff reallocation action (e.g., "move 2 volunteers from Gate A to Gate B").
      3. Rank the pending accessibility requests by urgency, with a short reason for the top pick. If there are no pending requests, return an empty array for prioritizedRequests.
      
      Respond strictly in JSON format matching exactly this schema:
      {
        "riskZones": [{ "zone": "string", "reason": "string" }],
        "staffingRecommendation": "string",
        "prioritizedRequests": [{ "requestId": "string", "urgencyReason": "string" }]
      }
    `;

    console.log(`[${new Date().toISOString()}] Calling Gemini API for insights...`);
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    console.log(`[${new Date().toISOString()}] Raw Gemini API response text:`, response.text);

    let parsedData;
    try {
      parsedData = JSON.parse(response.text);
    } catch (parseError) {
      console.error(`[${new Date().toISOString()}] Failed to parse Gemini response as JSON. Raw text:`, response.text);
      return res.status(500).json({ error: 'Received invalid JSON format from AI.' });
    }

    res.json(parsedData);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error generating AI insights:`, error);

    // Check for rate limit error (429)
    if (error.status === 429 || (error.message && (error.message.includes('429') || error.message.includes('rate') || error.message.includes('Too Many Requests') || error.message.includes('quota')))) {
      return res.status(429).json({ error: 'AI insights temporarily unavailable, please try again in a moment' });
    }

    res.status(500).json({ error: 'Failed to generate AI insights: ' + (error.message || 'Unknown error') });
  }
});

app.get('/api/incidents', async (req, res) => {
  try {
    const filePath = './data/incidents.json';
    try {
      const data = await fs.readFile(filePath, 'utf8');
      res.json(JSON.parse(data));
    } catch (e) {
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

app.post('/api/incidents', async (req, res) => {
  console.log(`[${new Date().toISOString()}] POST /api/incidents received with body:`, req.body);
  const { zone, type, note } = req.body;
  if (!zone || !type) {
    console.warn(`[${new Date().toISOString()}] POST /api/incidents missing parameters`);
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const filePath = './data/incidents.json';
    let incidents = [];
    try {
      const data = await fs.readFile(filePath, 'utf8');
      incidents = JSON.parse(data);
    } catch (e) {
      console.log(`[${new Date().toISOString()}] Could not read incidents.json, starting fresh.`, e.message);
    }

    const newIncident = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      zone,
      type,
      note: note || '',
      severity: (type === 'Medical' || type === 'Security') ? 'high' : 'medium',
      status: 'open',
      suggestedResponse: 'Please dispatch nearest available staff to investigate immediately.'
    };

    // Try to get AI response
    if (ai) {
      try {
        const currentDensities = snapshots[currentSnapshotIndex].densities;
        const prompt = `An incident of type "${type}" has been reported in zone "${zone}". Additional note: "${note}". 
        Current stadium zone densities: ${JSON.stringify(currentDensities)}.
        Generate a short suggested response (2-3 sentences) for the stadium staff to address this incident effectively.`;

        console.log(`[${new Date().toISOString()}] Generating AI response for incident...`);
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
        });
        if (response && response.text) {
          newIncident.suggestedResponse = response.text;
          console.log(`[${new Date().toISOString()}] AI response generated successfully.`);
        }
      } catch (aiError) {
        console.error(`[${new Date().toISOString()}] Error generating AI response for incident:`, aiError);
      }
    }

    incidents.push(newIncident);
    await fs.writeFile(filePath, JSON.stringify(incidents, null, 2));

    console.log(`[${new Date().toISOString()}] Incident saved successfully.`);
    res.json({ message: 'Incident reported successfully.', incident: newIncident });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] FATAL Error saving incident:`, error);
    res.status(500).json({ error: 'Failed to save incident' });
  }
});

app.put('/api/incidents/:id/resolve', async (req, res) => {
  try {
    const filePath = './data/incidents.json';
    const data = await fs.readFile(filePath, 'utf8');
    const incidents = JSON.parse(data);

    const index = incidents.findIndex(i => i.id === req.params.id);
    if (index !== -1) {
      incidents[index].status = 'resolved';
      await fs.writeFile(filePath, JSON.stringify(incidents, null, 2));
      res.json(incidents[index]);
    } else {
      res.status(404).json({ error: 'Incident not found' });
    }
  } catch (error) {
    console.error('Error resolving incident:', error);
    res.status(500).json({ error: 'Failed to resolve incident' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
