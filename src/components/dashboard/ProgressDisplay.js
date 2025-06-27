import React from 'react';
import './ProgressDisplay.css';

const ProgressDisplay = ({ 
  isVisible, 
  title, 
  messages, 
  isComplete, 
  onClose 
}) => {
  if (!isVisible) return null;

  return (
    <div className="progress-overlay">
      <div className="progress-modal">
        <div className="progress-header">
          <h3>{title}</h3>
          {isComplete && (
            <button onClick={onClose} className="progress-close-btn">
              ✕
            </button>
          )}
        </div>
        
        <div className="progress-content">
          <div className="progress-messages">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`progress-message ${message.type || 'info'}`}
              >
                <span className="progress-timestamp">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
                <span className="progress-text">{message.text}</span>
              </div>
            ))}
          </div>
          
          {!isComplete && (
            <div className="progress-spinner">
              <div className="spinner"></div>
              <span>Processing...</span>
            </div>
          )}
        </div>
        
        {isComplete && (
          <div className="progress-footer">
            <button onClick={onClose} className="btn-progress-close">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressDisplay; 