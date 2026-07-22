# Stadium Elite

A GenAI-powered smart stadium platform built for FIFA World Cup 2026, connecting fan experience with real-time stadium operations.

## How to View This Demo

Stadium Elite has two views — a **Fan App** for navigation and assistance, and an **Organizer Dashboard** (Command Center) for crowd monitoring and AI-driven operational intelligence. Both are reachable directly from the landing page with a single click — no login or passcode required.

- **Live demo:** [add your deployed URL here]
- **Landing page:** Click **"Enter as Fan"** to explore the fan-facing navigation experience, or **"Enter as Organizer"** to explore the live Command Center dashboard.
- The Fan App has no link back to the Organizer Dashboard (by design, to reflect real-world role separation) — return to the landing page to switch views.

---

## Chosen Vertical

**Smart Stadiums & Tournament Operations** — specifically the intersection of **navigation, crowd management, and accessibility**, extended into **operational intelligence and real-time decision support** for organizers.

We chose this combination because navigation and crowd management are naturally the same underlying problem viewed from two sides: a fan trying to get from A to B is also, by definition, a data point about where people are moving and congregating. Rather than building these as separate features, we treated fan-facing navigation as the *data collection layer* and organizer-facing intelligence as the *decision-support layer* built on top of it — with accessibility woven through both, since accessible routing and staff-assisted requests are where navigation and operations intersect most directly for people who need extra support.

## Approach and Logic

The core design principle: **every fan interaction should generate operational value, not just individual convenience.**

1. **Fans navigate** → the system logs origin/destination pairs and accessibility needs
2. **Fans request help or report incidents** → these become live, timestamped, structured events, not just tickets in a void
3. **Simulated crowd density** feeds a live picture of zone-level congestion (standing in for real IoT/camera sensor data in this demo)
4. **Generative AI (Google Gemini) sits at the center of both layers:**
   - On the fan side, it generates natural-language, context-aware directions and confirmations, adapting tone and routing logic to accessibility needs and language preference
   - On the organizer side, it synthesizes the raw data streams (density + requests + incidents) into human-readable, prioritized, actionable recommendations — the kind of judgment call a human operations lead would otherwise have to make manually under time pressure

This is why GenAI is load-bearing in this solution rather than decorative: removing it wouldn't just remove a chatbot, it would remove the entire reasoning layer that turns raw operational data into decisions.

## How the Solution Works

### Fan App
- **Navigation:** Fan selects current location and destination; Gemini generates turn-by-turn directions using the stadium's zone connectivity graph, adapted in real time to any selected accessibility need (Wheelchair / Elderly / Visual / Hearing)
- **Assistance requests:** Fans can request staff help, tracked with live status (Pending/Resolved) in a personal "My Requests" panel, with the ability to raise a follow-up sub-issue on an existing request rather than filing a duplicate
- **Incident reporting:** Fans can report Medical, Security, Lost Person, or Overcrowding incidents with location and notes
- **Multilingual support:** Navigation, confirmations, and key UI labels are generated/displayed in English, Spanish, French, Portuguese, or Arabic based on fan selection
- **Live stadium map:** An SVG stadium bowl visualizes gates, seating sections, restrooms, medical stations, food courts, and accessible entrances

### Organizer Dashboard (Command Center)
- **AI Recommendations:** On a refresh cycle, Gemini receives current zone density, pending accessibility requests, and simulated time, and returns structured JSON containing: overcrowding risk zones with reasoning, a specific staffing reallocation suggestion, and a prioritized list of pending requests
- **Live Density Heatmap:** The same stadium bowl, recolored in real time based on simulated crowd density per zone
- **Accessibility Requests queue:** Live-updating list with status management and nested sub-issue follow-ups
- **Active Incidents panel:** Live incident feed, each paired with an AI-generated suggested response action based on incident type, location, and current operational context
- **Stat bar:** Total fans guided, active requests, and current peak-density zone at a glance

### Data Flow
```
Fan Action (navigate / request help / report incident)
        ↓
Backend (Express) stores structured event + updates shared state
        ↓
Organizer Dashboard polls shared state (crowd density, requests, incidents)
        ↓
Gemini API reasons over combined state → structured recommendations
        ↓
Organizer sees prioritized, actionable insight in the Command Center
```

## Assumptions Made

- **Crowd density is simulated**, not sourced from real IoT sensors or cameras — a scripted time-based scenario models a realistic pre-kickoff congestion pattern (e.g., a gate spiking in the lead-up to kickoff) to demonstrate how the AI recommendation layer responds to real crowd dynamics. In production, this would be replaced by live sensor/camera feed data.
- **No persistent database** is used; data is stored in local JSON files for the scope of this demo. A production deployment would use a proper database with persistence across sessions and devices.
- **Fan and Organizer views are separated by navigation design, not authentication.** The landing page is the single entry point to both views, with no passcode, since this is a judged demo intended to be explored without a live walkthrough. In a real deployment, the Organizer Dashboard would sit behind proper role-based authentication for stadium staff.
- **"Staff dispatch" and "response protocols" are AI-generated suggestions for a human operator to act on**, not automated dispatch actions — the system is designed for human-in-the-loop decision support, not full automation, given the safety-critical nature of stadium operations.
- **Zone layout (gates, sections, services) is a representative demo stadium**, not modeled on a specific real World Cup 2026 venue, since venue-specific data wasn't available for this build.
- **Language support covers UI text and AI-generated content** for five major languages; it is not an exhaustive localization of every string in the application.

---

## Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Node.js + Express
- **AI:** Google Gemini API
- **Data storage:** Local JSON files (demo-scale)
- **Development environment:** Built using Google Antigravity, an agentic coding IDE

## Project Structure

```
SmartStadiumAPP/
├── backend/
│   ├── data/           # JSON data store (zones, requests, incidents)
│   ├── server.js       # Express server + Gemini API integration
│   └── .env            # API key and config (not committed)
├── frontend/
│   ├── src/
│   │   ├── components/ # React components (Fan App, Organizer Dashboard, etc.)
│   │   └── assets/     # Logo and static assets
│   └── ...
└── README.md
```

## Running Locally

**Prerequisites:** Node.js installed, and a free Gemini API key from [aistudio.google.com](https://aistudio.google.com).

**1. Clone the repository**
```bash
git clone <repository-url>
cd SmartStadiumAPP
```

**2. Set up the backend**
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder with:
```
GEMINI_API_KEY=your_api_key_here
PORT=3000
```
Start the backend:
```bash
node server.js
```

**3. Set up the frontend** (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

**4. Open the app**
Visit the local URL shown in the terminal (typically `http://localhost:5173`).

## Future Roadmap

- Role-based authentication for organizer/staff accounts
- Integration with real-time IoT/camera-based crowd sensors in place of simulated density
- Push notifications for fans when their request status changes
- Expanded incident response automation (auto-dispatch to nearest available staff member)

## Acknowledgments

Built for the Prompt Wars hackathon, exploring how generative AI can enhance stadium operations and tournament experience across navigation, crowd management, accessibility, and real-time operational decision support.
