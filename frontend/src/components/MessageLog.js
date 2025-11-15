import React from 'react';
import './MessageLog.css';

function MessageLog({ messages }) {
  return (
    <div className="message-log">
      <h3>Game Log</h3>
      <div className="messages">
        {messages.slice(-10).reverse().map((msg, index) => (
          <div key={index} className="message">
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MessageLog;
