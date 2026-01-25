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

### Prerequisites

- Node.js 18+ and npm
- Python
- Firebase account

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
