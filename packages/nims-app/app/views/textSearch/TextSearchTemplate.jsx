import React from 'react';

export const TextSearchTemplate = function() {
  return (
    <div className="text-search-tab block">
      <div className="flex-row">
        <div className="settings-panel">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title" l10n-id="text-search-search"></h3>
            </div>
            <div className="panel-body panel-resizable">
              <div className="margin-bottom-8">
                <input className="text-search-input form-control" l10n-placeholder-id="text-search-enter-search-string"></input>
              </div>
              <div>
                <input type="checkbox" className="textSearchTypeRadio hidden" value="characterProfiles" id="characterProfilesTextSearch"/>
                <label htmlFor="characterProfilesTextSearch" className="checkbox-label-icon common-checkbox"><span l10n-id="text-search-characterProfiles"></span></label> 
              </div>
              <div>
                <input type="checkbox" className="textSearchTypeRadio hidden" value="playerProfiles" id="playerProfilesTextSearch"/>
                <label htmlFor="playerProfilesTextSearch" className="checkbox-label-icon common-checkbox"><span l10n-id="text-search-playerProfiles"></span></label> 
              </div>
              <div>
                <input type="checkbox" className="textSearchTypeRadio hidden" value="groups" id="groupsTextSearch"/>
                <label htmlFor="groupsTextSearch" className="checkbox-label-icon common-checkbox"><span l10n-id="text-search-groups"></span></label> 
              </div>
              <div>
                <input type="checkbox" className="textSearchTypeRadio hidden" value="relations" id="relationsTextSearch"/>
                <label htmlFor="relationsTextSearch" className="checkbox-label-icon common-checkbox"><span l10n-id="text-search-relations"></span></label> 
              </div>
              <div>
                <input type="checkbox" className="textSearchTypeRadio hidden" value="writerStory" id="writerStoryTextSearch"/>
                <label htmlFor="writerStoryTextSearch" className="checkbox-label-icon common-checkbox"><span l10n-id="text-search-writerStory"></span></label> 
              </div>
              <div>
                <input type="checkbox" className="textSearchTypeRadio hidden" value="eventOrigins" id="eventOriginsTextSearch"/>
                <label htmlFor="eventOriginsTextSearch" className="checkbox-label-icon common-checkbox"><span l10n-id="text-search-eventOrigins"></span></label> 
              </div>
              <div className="margin-bottom-16">
                <input type="checkbox" className="textSearchTypeRadio hidden" value="eventAdaptations" id="eventAdaptationsTextSearch"/>
                <label htmlFor="eventAdaptationsTextSearch" className="checkbox-label-icon common-checkbox"><span l10n-id="text-search-eventAdaptations"></span></label> 
              </div>
              <div className="margin-bottom-16">
                <input type="checkbox" value="eventAdaptations" className="hidden" id="caseSensitiveTextSearch"/>
                <label htmlFor="caseSensitiveTextSearch" className="checkbox-label-icon common-checkbox"><span l10n-id="text-search-case-sensitive-search"></span></label> 
              </div>
              <button className="text-search-button btn btn-default" l10n-id="text-search-find"></button>
            </div>
          </div>
        </div>
        <div className="result-panel">
        </div>
      </div>
    </div>
  );
};

export function getTextSearchTemplate() {
  return <TextSearchTemplate />;
}