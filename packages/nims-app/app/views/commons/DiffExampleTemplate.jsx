import React from 'react';

export const DiffExampleTemplate = function() {
  return (
    <div className="DiffExampleTemplate row margin-bottom-16" style={{padding: "8px"}}>
      <div className="col-xs-4 last">
        <label className="margin-bottom-8">prev:</label>
        <label className="user margin-bottom-8"></label>
        <label className="time margin-bottom-8"></label>
        <div className="text" style={{whiteSpace: "pre-line"}}></div>
      </div>
      <div className="col-xs-4 diff">
        <label className="user">diff</label>
        <label className="time"></label>
        <div className="text" style={{whiteSpace: "pre-line"}}></div>
      </div>
      <div className="col-xs-4 first">
        <label className="margin-bottom-8">next:</label>
        <label className="user margin-bottom-8"></label>
        <label className="time margin-bottom-8"></label>
        <div className="text" style={{whiteSpace: "pre-line"}}></div>
      </div>
    </div>
  );
};

export function getDiffExampleTemplate() {
  return <DiffExampleTemplate />;
}