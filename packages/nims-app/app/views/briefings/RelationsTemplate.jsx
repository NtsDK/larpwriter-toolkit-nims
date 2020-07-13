import React from 'react';

export const RelationsTemplate = function() {
  return (
    <div className="relations-tab block">
      <div className="alert alert-info" l10n-id="advices-no-characters-for-relations"></div>
      <div className="panel panel-default">
        <div className="panel-heading">
          <select className="character-select common-select"></select>
        </div>
        <div className="panel-body">
        </div>
      </div>
    </div>
  );
};

export function getRelationsTemplate() {
  return <RelationsTemplate />;
}

export const Relation = function() {
  return (
    <div>
      <div className="Relation entity-management relations-management">
        <div>
          <span className="known-characters-label"></span>
          <span><select className="common-select known-characters-select" style={{width: "200px"}}></select></span>
          <button className="add-known-character-relation btn btn-default btn-reduced"></button>
        </div>
        <div>
          <span className="unknown-characters-label"></span>
          <span><select className="common-select unknown-characters-select" style={{width: "200px"}}></select></span>
          <button className="add-unknown-character-relation btn btn-default btn-reduced"></button>
        </div>
        <div>
          <span className="profile-item-label"></span>
          <span><select className="common-select profile-item-select" style={{width: "200px"}}></select></span>
        </div>
      </div>
      
      <div className="relation-content container-fluid">
      </div>
    </div>
  );
};

export function getRelation() {
  return <Relation />;
}

export const RelationRow = function() {
  return (
    <div className="RelationRow row">
      <div className="to-character-data col-xs-3">
        <h4 className="to-character-name"></h4>
        <div>
          <div className="where-meets-label bold-cursive"></div>
          <div className="where-meets-content"></div>
        </div>
        <div tocharacter="">
          <div className="profile-item-name bold-cursive"></div>
          <div className="profile-item-value"></div>
        </div>
        <div>
          <button className="btn btn-default fa-icon remove"></button>
        </div>
      </div>
      <div className="direct text-column col-xs-3">
        <div className="pre-text-area">
          <button className="btn btn-default fa-icon finished" l10n-title="constant-finishedText"></button>
        </div>
        <textarea className="briefing-relation-area form-control"></textarea>
      </div>
      <div className="origin text-column col-xs-3">
        <div className="pre-text-area btn-group">
          <button className="btn btn-default fa-icon starterToEnder"></button>
          <button className="btn btn-default fa-icon allies"></button>
          <button className="btn btn-default fa-icon enderToStarter"></button>
        </div>
        <textarea className="briefing-relation-area form-control"></textarea>
      </div>
      <div className="reverse text-column col-xs-3">
        <div className="pre-text-area">
          <button className="btn btn-default fa-icon finished" l10n-title="constant-finishedText"></button>
        </div>
        <textarea className="briefing-relation-area form-control"></textarea>
      </div>
    </div>
  );
};

export function getRelationRow() {
  return <RelationRow />;
}