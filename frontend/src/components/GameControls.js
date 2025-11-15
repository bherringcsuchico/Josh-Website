import React from 'react';
import './GameControls.css';

function GameControls({ game, onRoll, onBuy, onEndTurn, loading }) {
  const isPlayerTurn = game.currentTurn === 'player';
  const currentProperty = game.properties.find(p => p.position === game.player.position);
  const canBuyProperty = currentProperty && 
                         (currentProperty.type === 'property' || 
                          currentProperty.type === 'railroad' || 
                          currentProperty.type === 'utility') &&
                         !currentProperty.owner &&
                         game.player.money >= currentProperty.price;

  return (
    <div className="game-controls">
      <div className="dice-display">
        <h3>Last Roll: {game.lastDiceRoll && game.lastDiceRoll[0] ? `${game.lastDiceRoll[0]} + ${game.lastDiceRoll[1]} = ${game.lastDiceRoll[0] + game.lastDiceRoll[1]}` : 'Not rolled yet'}</h3>
      </div>
      
      <div className="turn-indicator">
        <h3>{isPlayerTurn ? "Your Turn" : "Computer's Turn"}</h3>
      </div>
      
      <div className="control-buttons">
        <button 
          onClick={onRoll} 
          disabled={!isPlayerTurn || loading}
          className="btn-primary"
        >
          Roll Dice
        </button>
        
        {canBuyProperty && (
          <button 
            onClick={onBuy} 
            disabled={!isPlayerTurn || loading}
            className="btn-success"
          >
            Buy Property (${currentProperty.price})
          </button>
        )}
        
        <button 
          onClick={onEndTurn} 
          disabled={!isPlayerTurn || loading}
          className="btn-secondary"
        >
          End Turn
        </button>
      </div>
    </div>
  );
}

export default GameControls;
