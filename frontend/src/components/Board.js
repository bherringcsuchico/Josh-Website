import React from 'react';
import './Board.css';

function Board({ properties, playerPosition, computerPosition }) {
  const renderSpace = (position) => {
    const property = properties.find(p => p.position === position);
    if (!property) return null;

    const hasPlayer = playerPosition === position;
    const hasComputer = computerPosition === position;
    
    let ownerClass = '';
    if (property.owner === 'player') ownerClass = 'owned-player';
    if (property.owner === 'computer') ownerClass = 'owned-computer';

    return (
      <div key={position} className={`board-space ${ownerClass} ${property.color || ''}`}>
        <div className="space-name">{property.name}</div>
        {property.price > 0 && <div className="space-price">${property.price}</div>}
        <div className="space-pieces">
          {hasPlayer && <span className="piece player-piece">P</span>}
          {hasComputer && <span className="piece computer-piece">C</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="board-container">
      <div className="board">
        <div className="board-row top">
          {[20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map(pos => renderSpace(pos))}
        </div>
        
        <div className="board-middle">
          <div className="board-column left">
            {[19, 18, 17, 16, 15, 14, 13, 12, 11].map(pos => renderSpace(pos))}
          </div>
          
          <div className="board-center">
            <h2>MONOPOLY</h2>
            <div className="center-info">
              <p>Player vs Computer</p>
            </div>
          </div>
          
          <div className="board-column right">
            {[31, 32, 33, 34, 35, 36, 37, 38, 39].map(pos => renderSpace(pos))}
          </div>
        </div>
        
        <div className="board-row bottom">
          {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map(pos => renderSpace(pos))}
        </div>
      </div>
    </div>
  );
}

export default Board;
