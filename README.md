# Monopoly Game - MERN Stack

A single-player Monopoly game where you compete against a computer opponent. Built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- **Single Player vs Computer**: Play against an AI opponent
- **Full Monopoly Board**: All 40 spaces including properties, railroads, utilities, and special spaces
- **Property Management**: Buy properties, pay rent, and track ownership
- **Computer AI**: Intelligent computer opponent that makes strategic decisions
- **Real-time Game State**: Live updates of player positions, money, and properties
- **Game Log**: Track all game events and actions
- **Responsive UI**: Clean, modern interface with visual board representation

## Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database (with Mongoose ODM)
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **Axios** - HTTP client for API calls
- **CSS3** - Styling and animations

## Game Rules Implemented

- Start with $1,500
- Roll two dice to move around the board
- Collect $200 when passing GO
- Buy unowned properties
- Pay rent when landing on opponent's properties
- Special spaces: GO, Jail, Free Parking, Income Tax, Luxury Tax
- Go to Jail space
- Bankruptcy detection and game-over conditions

## Project Structure

```
Josh-Website/
├── backend/
│   ├── config/
│   │   ├── boardData.js      # Monopoly board configuration
│   │   └── database.js        # MongoDB connection
│   ├── controllers/
│   │   └── gameController.js  # Game logic and AI
│   ├── models/
│   │   └── Game.js            # Game state model
│   ├── routes/
│   │   └── gameRoutes.js      # API endpoints
│   ├── .env.example           # Environment variables template
│   ├── package.json
│   └── server.js              # Express server
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Board.js          # Game board component
    │   │   ├── Board.css
    │   │   ├── PlayerPanel.js    # Player info display
    │   │   ├── PlayerPanel.css
    │   │   ├── GameControls.js   # Game action buttons
    │   │   ├── GameControls.css
    │   │   ├── MessageLog.js     # Game event log
    │   │   └── MessageLog.css
    │   ├── App.js                # Main app component
    │   ├── App.css
    │   └── index.js
    └── package.json

```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (optional - will work without it but data won't persist)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional):
```bash
cp .env.example .env
```

4. Edit `.env` to configure MongoDB (optional):
```
MONGODB_URI=mongodb://localhost:27017/monopoly
PORT=5000
```

5. Start the backend server:
```bash
npm start
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open in your browser at `http://localhost:3000`

## How to Play

1. **Start a New Game**: Click "Start New Game" on the welcome screen
2. **Roll Dice**: Click "Roll Dice" to move your piece
3. **Buy Property**: When landing on an unowned property, click "Buy Property" if you have enough money
4. **End Turn**: Click "End Turn" to let the computer take its turn
5. **Watch the Computer**: The computer will automatically roll, make decisions, and end its turn
6. **Win the Game**: Bankrupt your opponent to win!

## API Endpoints

### Game Management
- `POST /api/game/create` - Create a new game
- `GET /api/game/:gameId` - Get game state

### Game Actions
- `POST /api/game/:gameId/roll` - Roll dice and move
- `POST /api/game/:gameId/buy` - Buy current property
- `POST /api/game/:gameId/endturn` - End current turn
- `POST /api/game/:gameId/computer-turn` - Execute computer's turn

## Computer AI Strategy

The computer opponent:
- Evaluates property purchases based on available funds (buys if it has 1.5x the price)
- Automatically pays rent when landing on player properties
- Makes decisions within 1 second for realistic gameplay
- Follows the same rules as the human player

## Future Enhancements

Possible features to add:
- Houses and hotels
- Chance and Community Chest cards
- Trading between players
- Mortgage system
- Get Out of Jail Free cards
- Multiple human players
- Save/Load game functionality
- Multiplayer online mode
- Property auction system
- Custom game rules

## Development

### Running in Development Mode

Backend with auto-restart (requires nodemon):
```bash
cd backend
npm install -g nodemon
nodemon server.js
```

Frontend with hot-reload:
```bash
cd frontend
npm start
```

### Building for Production

Frontend:
```bash
cd frontend
npm run build
```

The build folder will contain optimized production files.

## Troubleshooting

### MongoDB Connection Issues
- If MongoDB is not installed, the app will still work but data won't persist
- Make sure MongoDB is running: `mongod` or `brew services start mongodb-community` (macOS)

### Port Already in Use
- Backend: Change PORT in `.env` or use: `PORT=5001 npm start`
- Frontend: It will prompt to use a different port automatically

### CORS Errors
- Ensure backend is running on port 5000
- Check that CORS is enabled in `backend/server.js`

## License

ISC

## Author

Josh's Monopoly Game Project