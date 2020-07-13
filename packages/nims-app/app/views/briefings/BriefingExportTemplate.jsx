import React from 'react';

export const BriefingExportTemplate = function() {
  return (
    <div className="briefing-export-tab block">
      <div className="panel panel-default">
        <div className="panel-heading">
          <a href="#" panel-toggler=".briefing-export-tab div.export-panel-body">
            <h3 className="panel-title" l10n-id="briefings-export-settings"></h3>
          </a>
        </div>
        <div className="panel-body export-panel-body flex-row">
          
          <fieldset className="margin-right-16">
            <legend l10n-id="briefings-export-mode"></legend>
            <div>
              <input type="checkbox" id="toSeparateFileCheckbox" className="hidden"/> 
              <label htmlFor="toSeparateFileCheckbox" className="checkbox-label-icon common-checkbox"><span l10n-id="briefings-each-briefing-to-own-file"></span></label>
            </div>
            <div>
              <input type="checkbox" id="exportOnlyFinishedStories" className="hidden"/> 
              <label htmlFor="exportOnlyFinishedStories" className="checkbox-label-icon common-checkbox"><span l10n-id="briefings-export-only-finished-stories"></span></label>
            </div>
          </fieldset>
        
          <fieldset className="margin-right-16">
            <legend l10n-id="briefings-briefing-selection"></legend>
            <div className="flex-row">
              <div className="flex-0-0-auto margin-right-16">
                <div>
                  <input type="radio" name="exportCharacterSelection" id="exportAllCharacters" className="hidden"/>
                  <label htmlFor="exportAllCharacters" className="radio-label-icon common-radio"><span l10n-id="briefings-print-all"></span></label>
                </div>
                <div>
                  <input type="radio" name="exportCharacterSelection" id="exportCharacterRange" className="hidden"/>
                  <label htmlFor="exportCharacterRange" className="radio-label-icon common-radio"><span l10n-id="briefings-print-partly"></span></label>
                </div>
                <div>
                  <input type="radio" name="exportCharacterSelection" id="exportCharacterSet" className="hidden"/>
                  <label htmlFor="exportCharacterSet" className="radio-label-icon common-radio"><span l10n-id="briefings-exact-character-select"></span></label>
                </div>
              </div>
              <div className="flex-0-0-auto">
                <div id="characterRangeSelect" className="hidden">
                  <div>
                    <span l10n-id="briefings-briefings-amount"></span> 
                    <select id="briefingNumberSelector" className="form-control"></select>
                  </div>
                  <div>
                    <span l10n-id="briefings-briefings-range" className="display-block"></span>
                    <select id="briefingIntervalSelector" className="form-control common-select"></select>
                  </div>
                </div>
                <div id="characterSetSelect" className="hidden">
                  <input selector-filter="#characterSetSelector"/>
                  <select id="characterSetSelector" multiple size="15"  className="form-control"></select>
                </div>
              </div>
            </div>
          </fieldset>
          
          <fieldset>
            <legend l10n-id="briefings-story-selection"></legend>
            <div className="flex-row">
              <div className="flex-0-0-auto margin-right-16">
                <div>
                  <input type="radio" name="exportStorySelection" value="all" id="exportAllStories" className="hidden"/>
                  <label htmlFor="exportAllStories" className="radio-label-icon common-radio"><span l10n-id="briefings-export-all-stories"></span></label>
                </div>
                <div>
                  <input type="radio" name="exportStorySelection" value="multiple" id="exportStorySet" className="hidden"/>
                  <label htmlFor="exportStorySet" className="radio-label-icon common-radio"><span l10n-id="briefings-exact-story-select"></span></label>
                </div>
              </div>
              <div className="flex-0-0-auto">
                <div id="storySetSelect" className="hidden">
                  <input selector-filter="#storySetSelector"/>
                  <select id="storySetSelector" multiple size="15"  className="form-control"></select>
                </div>
              </div>
            </div>
            
          </fieldset>
        </div>
      </div>
          
      <div style={{display:"flex", "marginRight":"8px"}}>
        <button className="navigation-button exportModeButton" id="simpleExport" l10n-id="briefings-simple-export"></button>
        <button className="navigation-button exportModeButton" id="advancedWordExport" l10n-id="briefings-advanced-docx-export"></button>
        <button className="navigation-button exportModeButton" id="advancedTextExport" l10n-id="briefings-advanced-txt-export"></button>
      </div>
          
      <div className="panel panel-default">
        <div className="panel-body">
          <div id="simpleExportContainer" className="exportContainer">
            <button className="btn btn-default btn-reduced" id="makeBriefingsByTime" l10n-id="briefings-make-docx-by-time"></button>
            <button className="btn btn-default btn-reduced" id="makeBriefingsByStory" l10n-id="briefings-make-docx-by-stories"></button>
            
            <button className="btn btn-default btn-reduced" id="makeInventoryList" l10n-id="briefings-make-inventory"></button>
          </div>
          
          <div id="advancedWordExportContainer" className="exportContainer">
            <span l10n-id="briefings-upload-template"></span> 
            <input type="file" name="file" id="docxBriefings" className="form-control"/> 
            <button className="btn btn-default btn-reduced" id="makeDocxBriefings" l10n-id="briefings-make-export"></button>
          </div>
          
          <div id="advancedTextExportContainer" className="exportContainer container-fluid">
            <div className="row">
              <div className="col-xs-2">
                <div className="margin-bottom-16">
                  <button className="btn btn-default btn-reduced white-space-normal" id="previewTextOutput" l10n-id="briefings-preview"></button>
                  <button className="btn btn-default btn-reduced white-space-normal" id="showRawData" l10n-id="briefings-raw-data"></button>
                  <button className="btn btn-default btn-reduced white-space-normal" id="convertToDocxTemplate" l10n-id="briefings-convert-to-docx-template"></button>
                  <button className="btn btn-default btn-reduced white-space-normal" id="generateByDocxTemplate" l10n-id="briefings-generate-by-docx-template"></button>
                  <button className="btn btn-default btn-reduced white-space-normal" id="makeCustomTextBriefings" l10n-id="briefings-export"></button>
                  <button className="btn btn-default btn-reduced white-space-normal" id="makeMarkdownBriefings" l10n-id="briefings-markdown-export"></button>
                </div>
                <div>
                  <label l10n-id="briefings-enter-text-file-type"></label>
                  <input id="textTypeSelector" value="txt" className="form-control"/>
                </div>
              </div>
              <div className="col-xs-5">
                <div>
                  <h3 l10n-id="briefings-template"></h3>
                  <textarea id="templateArea" className="form-control"></textarea>
                </div>
              </div>
              <div className="col-xs-5">
                <h3 l10n-id="briefings-exported-text"></h3>
                <textarea id="textBriefingPreviewArea" className="form-control"></textarea>
              </div>
            </div>
          </div>
              
          <h3 l10n-id="briefings-export-status"></h3>
          <div id="exportStatus"></div>
        </div>
      </div>
    </div>
  );
};

export function getBriefingExportTemplate() {
  return <BriefingExportTemplate />;
}