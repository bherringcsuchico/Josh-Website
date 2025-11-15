import React from 'react';
import './PlayerPanel.css';

function PlayerPanel({ player, title }) {
  return (
    <div className={`player-panel ${title.toLowerCase()}`}>
      <h3>{title}</h3>
      <div className="player-info">
        <div className="info-item">
          <span className="label">Money:</span>
          <span className="value">${player.money}</span>
        </div>
        <div className="info-item">
          <span className="label">Position:</span>
          <span className="value">{player.position}</span>
        </div>
        <div className="info-item">
          <span className="label">Properties:</span>
          <span className="value">{player.properties.length}</span>
        </div>
        {player.inJail && (
          <div className="info-item jail">
            <span className="label">Status:</span>
            <span className="value">In Jail</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerPanel;
