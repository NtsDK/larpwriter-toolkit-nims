import React from 'react';

export const WriterStoryTemplate = function() {
  return (
    <div id="writerStoryDiv2">
      <div className="panel panel-default">
        <div className="panel-body">
          <textarea id="writerStoryArea" className="isStoryEditable form-control"></textarea>
        </div>
      </div>
    </div>
  );
};

export function getWriterStoryTemplate() {
  return <WriterStoryTemplate />;
}