import React from 'react';

export const PlayerTemplate = function() {
  return (
    <div className="player-tab block">
      <div className="panel panel-default">
        <div className="panel-body welcome-text-panel">
          <textarea className="welcome-text-area form-control" disabled></textarea>
        </div>
      </div>
      
      <div className="panel panel-default">
        <div className="panel-heading">
          <a href="#" panel-toggler=".player-tab .player-profile-div">
            <h3 className="panel-title player-profile-header" ></h3>
          </a>
        </div>
        <div className="panel-body player-profile-div">
        </div>
      </div>
      
      <div className="panel panel-default">
        <div className="panel-heading">
          <a href="#" panel-toggler=".player-tab .character-profile-div">
            <h3 className="panel-title character-profile-header"></h3>
          </a>
        </div>
        <div className="panel-body character-profile-div">
        </div>
      </div>
    </div>
  );
};

export function getPlayerTemplate() {
  return <PlayerTemplate />;
}