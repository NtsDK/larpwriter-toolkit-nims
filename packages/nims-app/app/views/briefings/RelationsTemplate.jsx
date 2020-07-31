import React from 'react';

export const RelationsTemplate = function () {
  return (
    <div className="relations-tab block">
      <div className="alert alert-info" l10n-id="advices-no-characters-for-relations" />
      <div className="panel panel-default">
        <div className="panel-heading">
          <select className="character-select common-select" />
        </div>
        <div className="panel-body" />
      </div>
    </div>
  );
};

export function getRelationsTemplate() {
  return <RelationsTemplate />;
}

export const Relation = function () {
  return (
    <div>
      <div className="Relation entity-management relations-management">
        <div>
          <span className="known-characters-label" />
          <span><select className="common-select known-characters-select" style={{ width: '200px' }} /></span>
          <button type="button" className="add-known-character-relation btn btn-default btn-reduced" />
        </div>
        <div>
          <span className="unknown-characters-label" />
          <span><select className="common-select unknown-characters-select" style={{ width: '200px' }} /></span>
          <button type="button" className="add-unknown-character-relation btn btn-default btn-reduced" />
        </div>
        <div>
          <span className="profile-item-label" />
          <span><select className="common-select profile-item-select" style={{ width: '200px' }} /></span>
        </div>
      </div>

      <div className="relation-content container-fluid" />
    </div>
  );
};

export function getRelation() {
  return <Relation />;
}

export const RelationRow = function () {
  return (
    <div className="RelationRow row">
      <div className="to-character-data col-xs-3">
        <h4 className="to-character-name" />
        <div>
          <div className="where-meets-label bold-cursive" />
          <div className="where-meets-content" />
        </div>
        <div tocharacter="">
          <div className="profile-item-name bold-cursive" />
          <div className="profile-item-value" />
        </div>
        <div>
          <button type="button" className="btn btn-default fa-icon remove" />
        </div>
      </div>
      <div className="direct text-column col-xs-3">
        <div className="pre-text-area">
          <button type="button" className="btn btn-default fa-icon finished" l10n-title="constant-finishedText" />
        </div>
        <textarea className="briefing-relation-area form-control" />
      </div>
      <div className="origin text-column col-xs-3">
        <div className="pre-text-area btn-group">
          <button type="button" className="btn btn-default fa-icon starterToEnder" />
          <button type="button" className="btn btn-default fa-icon allies" />
          <button type="button" className="btn btn-default fa-icon enderToStarter" />
        </div>
        <textarea className="briefing-relation-area form-control" />
      </div>
      <div className="reverse text-column col-xs-3">
        <div className="pre-text-area">
          <button type="button" className="btn btn-default fa-icon finished" l10n-title="constant-finishedText" />
        </div>
        <textarea className="briefing-relation-area form-control" />
      </div>
    </div>
  );
};

export function getRelationRow() {
  return <RelationRow />;
}
