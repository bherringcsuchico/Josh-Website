import React, { useState } from 'react';
import axios from 'axios';
import Board from './components/Board';
import PlayerPanel from './components/PlayerPanel';
import GameControls from './components/GameControls';
import MessageLog from './components/MessageLog';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startNewGame = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/game/create`);
      setGame(response.data);
    } catch (err) {
      setError('Failed to create game: ' + err.message);
    }
    setLoading(false);
  };

  const rollDice = async () => {
    if (!game || game.currentTurn !== 'player') return;
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/game/${game.gameId}/roll`);
      setGame(response.data);
    } catch (err) {
      setError('Failed to roll dice: ' + err.message);
    }
    setLoading(false);
  };

  const buyProperty = async () => {
    if (!game) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/game/${game.gameId}/buy`);
      setGame(response.data);
    } catch (err) {
      setError('Cannot buy property: ' + err.message);
    }
    setLoading(false);
  };

  const endTurn = async () => {
    if (!game) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/game/${game.gameId}/endturn`);
      setGame(response.data);
      
      // Automatically trigger computer turn
      if (response.data.currentTurn === 'computer') {
        setTimeout(() => {
          computerTurn();
        }, 1000);
      }
    } catch (err) {
      setError('Failed to end turn: ' + err.message);
    }
    setLoading(false);
  };

  const computerTurn = async () => {
    if (!game) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/game/${game.gameId}/computer-turn`);
      setGame(response.data);
    } catch (err) {
      setError('Computer turn failed: ' + err.message);
    }
    setLoading(false);
  };

  if (!game) {
    return (
      <div className="App">
        <div className="start-screen">
          <h1>Monopoly</h1>
          <h2>Player vs Computer</h2>
          <button onClick={startNewGame} disabled={loading}>
            {loading ? 'Starting...' : 'Start New Game'}
          </button>
          {error && <div className="error">{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Monopoly Game</h1>
      {error && <div className="error">{error}</div>}
      
      <div className="game-container">
        <div className="left-panel">
          <PlayerPanel player={game.player} title="Player" />
          <PlayerPanel player={game.computer} title="Computer" />
          <MessageLog messages={game.messageLog} />
        </div>
        
        <div className="center-panel">
          <Board 
            properties={game.properties} 
            playerPosition={game.player.position}
            computerPosition={game.computer.position}
          />
          <GameControls
            game={game}
            onRoll={rollDice}
            onBuy={buyProperty}
            onEndTurn={endTurn}
            loading={loading}
          />
        </div>
      </div>
      
      {game.gameStatus !== 'active' && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <p>{game.winner === 'player' ? 'You won!' : 'Computer won!'}</p>
          <button onClick={startNewGame}>Start New Game</button>
        </div>
      )}
    </div>
  );
}

export default App;
