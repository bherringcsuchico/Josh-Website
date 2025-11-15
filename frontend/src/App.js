import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Board from './components/Board';
import PlayerPanel from './components/PlayerPanel';
import GameControls from './components/GameControls';
import MessageLog from './components/MessageLog';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [game, setGame] = useState(null);
  const [playerPiece, setPlayerPiece] = useState(null);
  const [computerPiece, setComputerPiece] = useState(null);
  const [lastPlayerPos, setLastPlayerPos] = useState(0);
  const [lastComputerPos, setLastComputerPos] = useState(0);
  const [displayPlayerPos, setDisplayPlayerPos] = useState(0);
  const [displayComputerPos, setDisplayComputerPos] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tokenChoices = ['🚗','🐶','🎩','🚀','🧲','🏠'];

  const startNewGame = async () => {
    if (!playerPiece) return; // require selection
    // Reset previous game state before starting a new one
    setGame(null);
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/game/create`);
      // choose computer piece different from player
      const remaining = tokenChoices.filter(t => t !== playerPiece);
      const compPick = remaining[Math.floor(Math.random()*remaining.length)];
      setComputerPiece(compPick);
      setLastPlayerPos(0);
      setLastComputerPos(0);
      setDisplayPlayerPos(0);
      setDisplayComputerPos(0);
      setGame({ ...response.data, playerPiece, computerPiece: compPick });
    } catch (err) {
      setError('Failed to create game: ' + err.message);
    }
    setLoading(false);
  };

  const animateMove = (from, to, setPos) => {
    return new Promise(resolve => {
      let steps = (to - from + 40) % 40;
      if (steps === 0) { resolve(); return; }
      let current = from;
      setAnimating(true);
      const stepFn = () => {
        if (steps <= 0) { setAnimating(false); resolve(); return; }
        current = (current + 1) % 40;
        setPos(current);
        steps--;
        setTimeout(stepFn, 180);
      };
      stepFn();
    });
  };

  const rollDice = async () => {
    if (!game || game.currentTurn !== 'player') return;
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/game/${game.gameId}/roll`);
      setLastPlayerPos(game.player.position);
      setLastComputerPos(game.computer.position);
      setGame({ ...response.data, playerPiece, computerPiece });
      await animateMove(game.player.position, response.data.player.position, setDisplayPlayerPos);
      // If turn switched to computer, trigger computer turns chain
      if (response.data.currentTurn === 'computer') {
        triggerComputerTurns();
      }
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
      setGame({ ...response.data, playerPiece, computerPiece });
      // If buying ended the action phase and switched turn to computer, start computer turns
      if (response.data.currentTurn === 'computer') {
        triggerComputerTurns();
      }
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
      setGame({ ...response.data, playerPiece, computerPiece });
      
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
      setLastPlayerPos(game.player.position);
      setLastComputerPos(game.computer.position);
      setGame({ ...response.data, playerPiece, computerPiece });
      await animateMove(game.computer.position, response.data.computer.position, setDisplayComputerPos);
    } catch (err) {
      setError('Computer turn failed: ' + err.message);
    }
    setLoading(false);
  };

  const triggerComputerTurns = async () => {
    // Loop while currentTurn remains computer and game active
    while (true) {
      if (!game) break;
      // Use freshest game ref from closure; simple approach triggers rebuild
      const currentGameId = game.gameId;
      try {
        const response = await axios.post(`${API_URL}/game/${currentGameId}/computer-turn`);
        const priorPos = game.computer.position;
        setGame(prev => ({ ...response.data, playerPiece, computerPiece }));
        await animateMove(priorPos, response.data.computer.position, setDisplayComputerPos);
        // If after computer turn still computer (doubles), continue; else break
        if (response.data.currentTurn !== 'computer' || response.data.gameStatus !== 'active') {
          break;
        }
      } catch (err) {
        setError('Computer turn failed: ' + err.message);
        break;
      }
    }
  };

  if (!game) {
    return (
      <div className="App">
        <div className="start-screen">
          <h1>Monopoly</h1>
          <h2>Player vs Computer</h2>
          <div className="piece-select">
            <p>Select your token:</p>
            <div className="tokens">
              {tokenChoices.map(t => (
                <button
                  key={t}
                  className={`token-btn ${playerPiece === t ? 'selected' : ''}`}
                  onClick={() => setPlayerPiece(t)}
                  disabled={loading}
                >{t}</button>
              ))}
            </div>
          </div>
          <button onClick={startNewGame} disabled={loading}>
            {loading ? 'Starting...' : 'Start New Game'}
          </button>
          {!playerPiece && <div style={{marginTop:'8px',fontSize:'0.9rem',color:'#444'}}>Pick a token to enable Start.</div>}
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
            playerPosition={displayPlayerPos || game.player.position}
            computerPosition={displayComputerPos || game.computer.position}
            playerPiece={playerPiece}
            computerPiece={computerPiece}
            lastPlayerPos={lastPlayerPos}
            lastComputerPos={lastComputerPos}
          />
          <GameControls
            game={game}
            onRoll={rollDice}
            onBuy={async () => { await buyProperty(); }}
            onFinishPhase={async () => {
              if (game.awaitingAction) {
                try {
                  const response = await axios.post(`${API_URL}/game/${game.gameId}/finish`);
                  setGame({ ...response.data, playerPiece, computerPiece });
                  if (response.data.currentTurn === 'computer') {
                    triggerComputerTurns();
                  }
                } catch (e) {
                  /* ignore */
                }
              }
            }}
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
