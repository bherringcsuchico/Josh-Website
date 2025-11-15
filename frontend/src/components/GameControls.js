import React, { useState, useEffect } from 'react';
import './GameControls.css';

function GameControls({ game, onRoll, onBuy, onFinishPhase, loading }) {
  const [rolling, setRolling] = useState(false);
  const [showDice, setShowDice] = useState(false);
  const [diceValues, setDiceValues] = useState([null, null]);

  // When backend updates lastDiceRoll, show dice values
  useEffect(() => {
    if (game.lastDiceRoll && game.lastDiceRoll.length === 2) {
      setDiceValues(game.lastDiceRoll);
      setRolling(false);
      setShowDice(true);
      // hide after a few seconds
      const t = setTimeout(() => setShowDice(false), 3000);
      return () => clearTimeout(t);
    }
  }, [game.lastDiceRoll]);

  const handleRoll = async () => {
    if (rolling) return;
    setRolling(true);
    setShowDice(true);
    // pre-animation random wobble values
    setDiceValues([Math.ceil(Math.random()*6), Math.ceil(Math.random()*6)]);
    // wait a short moment for animation then call backend
    setTimeout(async () => {
      await onRoll();
    }, 600); // sync with CSS animation duration
  };
  const isPlayerTurn = game.currentTurn === 'player';
  const currentProperty = game.properties.find(p => p.position === game.player.position);
  const canBuyProperty = currentProperty && 
    (currentProperty.type === 'property' || 
     currentProperty.type === 'railroad' || 
     currentProperty.type === 'utility') &&
    !currentProperty.owner &&
    game.player.money >= currentProperty.price;

  // Auto finish phase countdown when awaitingAction and no purchasable property
  useEffect(() => {
    if (isPlayerTurn && game.awaitingAction && !canBuyProperty) {
      const t = setTimeout(() => {
        onFinishPhase && onFinishPhase();
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [isPlayerTurn, game.awaitingAction, canBuyProperty, onFinishPhase]);

  return (
    <div className="game-controls">
      <div className="dice-display">
        <h3>Last Roll:</h3>
        <div className={`dice-wrapper ${rolling ? 'rolling' : ''}`}>
          {showDice && diceValues.map((val, i) => (
            <div key={i} className={`die face-${val} ${rolling ? 'animate' : ''}`}> 
              <span>{val}</span>
            </div>
          ))}
        </div>
        {game.lastDiceRoll && game.lastDiceRoll[0] && !rolling && (
          <div className="dice-total">= {game.lastDiceRoll[0]} + {game.lastDiceRoll[1]} =&nbsp;{game.lastDiceRoll[0] + game.lastDiceRoll[1]}</div>
        )}
      </div>
      
      <div className="turn-indicator">
        <h3>{isPlayerTurn ? "Your Turn" : "Computer's Turn"}</h3>
      </div>
      
      <div className="control-buttons">
        <button 
          onClick={handleRoll} 
          disabled={!isPlayerTurn || loading}
          className="btn-primary"
        >
          {rolling ? 'Rolling...' : 'Roll Dice'}
        </button>
        
        {isPlayerTurn && canBuyProperty && (
          <button 
            onClick={onBuy} 
            disabled={!isPlayerTurn || loading}
            className="btn-success"
          >
            Buy Property (${currentProperty.price})
          </button>
        )}
        {game.awaitingAction && !canBuyProperty && (
          <div className="auto-finish">Ending turn...</div>
        )}
        
        {/* End Turn removed due to automatic turn progression */}
      </div>
    </div>
  );
}

export default GameControls;
