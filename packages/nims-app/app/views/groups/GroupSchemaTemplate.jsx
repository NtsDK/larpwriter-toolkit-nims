import React from 'react';

export const GroupSchemaTemplate = function () {
  return (
    <div className="group-schema-tab">
      <div className="panel panel-default">
        <div className="panel-body">
          <label l10n-id="groups-theoretical-group-schema" />
          <div className="" style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="flex-0-0-auto">
              <svg className="theory" width="960" height="450" />
            </div>
          </div>
          <label l10n-id="groups-practical-group-schema" />
          <div className="" style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="flex-0-0-auto">
              <svg className="practice" width="960" height="450" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function getGroupSchemaTemplate() {
  return <GroupSchemaTemplate />;
}
