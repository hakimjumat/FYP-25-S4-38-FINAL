# Incentive-Driven Personalized Learning Platform

## Project Structure

```
FYP/
├── client/          # React frontend
├── datamining/          # Python datamining service
├── server/             # Node.js backend
└── docs/            # Documentation
```

## Setup Instructions

### Prerequisites for Development

- Node.js 18+ and npm
- Python
- Firebase account
- Clone repo from github
- ServiceAccountKey.js in /server and /datamining folders.
- Docker (optional)

# NEW OPTIONAL SETUP: Backend Setup (Node.js + Python using Docker)

# SKip to frontend setup if using this

```bash
cd FYP-25-S4-38
docker-compose up -d --build
```

# NORMAL SETUP:

### Backend Setup (Node.js)

```bash
cd server
npm install
# Add your serviceAccountKey.json
npm start
```

### Backend Setup (Python venv)

```bash
cd datamining
# create virtual environment for python
python3 -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

# Add your serviceAccountKey.json here too
pip install -r requirements.txt
uvicorn analytics:app --reload --port 8000
```

### Frontend Setup

```bash
cd client
npm install
npm start
```

## Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js + Express
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **AI/ML:** Python + FastAPI (coming soon)

## Team

- FYP-25-S4-38

# Subsequent runs for development work

# 1. Using Docker

Terminal 1: (backend microservices)

```bash
cd FYP-25-S4-38
docker-compose up -d
```

for logging both client and server, open 2 terminals,
run:
Terminal A (Node.js):

```bash
docker compose logs -f server
```

Terminal B (Python):

```bash
docker compose logs -f datamining
```

Terminal 2: (frontend)

```bash
cd client
npm start
```

# 2 Not using Docker

Terminal 1: (/server)

```bash
cd server
npm start
```

Terminal 2: (/datamining)

```bash
cd datamining
uvicorn analytics:app --reload --port 8000
```

terminal 3: (/client)

```bash
cd client
npm start
```
