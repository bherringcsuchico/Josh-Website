# Monopoly Game - Quick Start Guide

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (optional - game works without it using in-memory storage)

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Josh-Website
```

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```
The backend server will start on `http://localhost:5000`

### 3. Frontend Setup (in a new terminal)
```bash
cd frontend
npm install
npm start
```
The frontend will open automatically at `http://localhost:3000`

## Playing the Game

1. Click "Start New Game" on the welcome screen
2. Click "Roll Dice" to move your player piece
3. When landing on an unowned property, click "Buy Property" if you want to purchase it
4. Click "End Turn" when you're done to let the computer play
5. The computer will automatically take its turn and return control to you
6. Continue playing until one player goes bankrupt!

## Game Features

### Implemented Rules
- Start with $1,500
- Roll two six-sided dice to move
- Collect $200 when passing GO
- Buy properties, railroads, and utilities
- Pay rent when landing on opponent's properties
- Pay taxes on Income Tax and Luxury Tax squares
- Go to Jail when landing on "Go To Jail"
- Bankruptcy detection (game ends when money goes below $0)

### Board Spaces
- **Properties**: 22 properties in 8 color groups
- **Railroads**: 4 railroads (Reading, Pennsylvania, B&O, Short Line)
- **Utilities**: 2 utilities (Electric Company, Water Works)
- **Special**: GO, Jail, Free Parking, Go To Jail, Chance, Community Chest, Taxes

### Computer AI
The computer opponent:
- Makes strategic decisions about property purchases
- Buys properties when it has sufficient funds (1.5x the property price)
- Automatically pays rent and taxes
- Follows all game rules

## Configuration

### Environment Variables (Backend)
Create a `.env` file in the backend directory:
```
MONGODB_URI=mongodb://localhost:27017/monopoly
PORT=5000
```

If MongoDB is not available, the game will automatically use in-memory storage (data won't persist between server restarts).

### API Base URL (Frontend)
The frontend connects to `http://localhost:5000/api` by default. To change this, set the `REACT_APP_API_URL` environment variable.

## API Endpoints

- `POST /api/game/create` - Create a new game
- `GET /api/game/:gameId` - Get game state
- `POST /api/game/:gameId/roll` - Roll dice and move
- `POST /api/game/:gameId/buy` - Buy current property
- `POST /api/game/:gameId/endturn` - End current turn
- `POST /api/game/:gameId/computer-turn` - Execute computer's turn

## Troubleshooting

### Backend won't start
- Make sure port 5000 is not in use
- Check that all dependencies are installed: `npm install`

### Frontend won't start
- Make sure port 3000 is not in use
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### MongoDB connection errors
- The game works without MongoDB using in-memory storage
- To use MongoDB, ensure it's running: `mongod`

### CORS errors
- Ensure backend is running before starting frontend
- Backend CORS is configured to accept all origins by default

## Development

### Running in Development Mode
Backend with auto-restart:
```bash
npm install -g nodemon
cd backend
nodemon server.js
```

Frontend with hot-reload:
```bash
cd frontend
npm start
```

### Building for Production
```bash
cd frontend
npm run build
```

## Project Structure
```
Josh-Website/
├── backend/           # Express API server
├── frontend/          # React application
└── README.md         # Main documentation
```

## License
ISC

## Support
For issues or questions, please check the main README.md file for detailed documentation.
