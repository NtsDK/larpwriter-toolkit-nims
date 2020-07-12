import React from 'react';

export const OverviewTemplate = function() {
  return (
    <div className="overview-tab block">
      <div className="panel panel-default">
        <div className="panel-body">
        
          <ul className="nav nav-pills margin-bottom-16">
            <li className="btn-default active"><a href="#overview-descr" data-toggle="tab" l10n-id="overview-about-game"></a>
            </li>
            <li className="btn-default"><a href="#overview-diagrams" data-toggle="tab" l10n-id="overview-statistic-diagrams"></a></li>
            <li className="btn-default"><a href="#profile-diagrams" data-toggle="tab" l10n-id="overview-profile-diagrams"></a></li>
            <li className="btn-default "><a href="#gears" data-toggle="tab" ><span className="gearsButton fa-free fa-bold fa-margin-right" l10n-id="header-gears"></span></a></li>
            <li className="btn-default "><a href="#sliders" data-toggle="tab" ><span className="slidersButton fa-free fa-bold fa-margin-right" l10n-id="header-sliders"></span></a></li>
          </ul>
        
          <div className="tab-content clearfix">
            <div className="tab-pane active" id="overview-descr">
              <div className="container-fluid">
                <div className="row">
                  <div className="col-xs-9">
                    <div className="container-fluid">
                      <div className="row">
                        <div className="col-xs-6">
                          <div className="form-group">
                            <label className=" control-label" l10n-id="overview-name"></label>
                            <input id="gameNameInput" className="adminOnly form-control"></input>
                            <div className="">
                            </div>
                          </div>
                          <div className="form-group">
                            <label className=" control-label" l10n-id="overview-last-save-time"></label>
                            <p  id="lastSaveTime" className="form-control-static" l10n-id="overview-last-save-time"></p>
                            <div className="">
                            </div>
                          </div>
                        </div>
                        <div className="col-xs-6">
                          <div className="form-group">
                            <label className=" control-label" l10n-id="overview-pre-game-start-date"></label>
                            <input id="preGameDatePicker" className="adminOnly form-control"></input>
                            <div className="">
                            </div>
                          </div>
                          <div className="form-group">
                            <label className=" control-label" l10n-id="overview-pre-game-end-date"></label>
                            <input id="gameDatePicker" className="adminOnly form-control"></input>
                            <div className="">
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-xs-12">
                          <div className="form-group">
                            <label l10n-id="overview-descr"></label>
                            <textarea className="adminOnly game-description-area form-control"></textarea>
                          </div>
                        </div>
                      </div>
                    </div>
                  
                  </div>
                  <div className="col-xs-3">
                    <table className="table table-bordered table-striped" style={{width: "auto"}}>
                      <thead>
                        <tr>
                          <th colSpan="2" l10n-id="overview-stats" style={{textAlign: "center"}}></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td><span className="statisticsLabel" l10n-id="overview-character-count">      </span></td><td><span className="statisticsValue" id="characterNumber"></span>    </td></tr>
                        <tr><td><span className="statisticsLabel" l10n-id="overview-player-count">         </span></td><td><span className="statisticsValue" id="playerNumber"></span>       </td></tr>
                        <tr><td><span className="statisticsLabel" l10n-id="overview-story-count">          </span></td><td><span className="statisticsValue" id="storyNumber"></span>        </td></tr>
                        <tr><td><span className="statisticsLabel" l10n-id="overview-group-count">          </span></td><td><span className="statisticsValue" id="groupNumber"></span>        </td></tr>
                        <tr><td><span className="statisticsLabel" l10n-id="overview-event-count">          </span></td><td><span className="statisticsValue" id="eventsNumber"></span>       </td></tr>
                        <tr><td><span className="statisticsLabel" l10n-id="overview-user-count">           </span></td><td><span className="statisticsValue" id="userNumber"></span>         </td></tr>
                        <tr><td><span className="statisticsLabel" l10n-id="overview-first-event">          </span></td><td><span className="statisticsValue" id="firstEvent"></span>         </td></tr>
                        <tr><td><span className="statisticsLabel" l10n-id="overview-last-event">           </span></td><td><span className="statisticsValue" id="lastEvent"></span>          </td></tr>
                        <tr><td><span className="statisticsLabel" l10n-id="overview-symbol-count">         </span></td><td><span className="statisticsValue" id="textCharacterNumber"></span></td></tr>
                        <tr><td><span className="statisticsLabel" l10n-id="overview-story-completeness">   </span></td><td><span className="statisticsValue" id="storyCompleteness"></span>  </td></tr>
                        <tr><td><span className="statisticsLabel" l10n-id="overview-general-completeness"> </span></td><td><span className="statisticsValue" id="generalCompleteness"></span></td></tr>
                        <tr><td><span className="statisticsLabel" l10n-id="overview-relation-completeness"></span></td><td><span className="statisticsValue" id="relationCompleteness"></span></td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="tab-pane" id="overview-diagrams">
              <div className="container-fluid">
                <div className="row margin-bottom-16">
                  <div className="col-xs-4">
                    <h4 l10n-id="overview-event-count-diagram"></h4>
                    <div className="overviewHist storyEventsHist"></div>
                  </div>
                  <div className="col-xs-4">
                    <h4 l10n-id="overview-character-count-diagram"></h4>
                    <div className="overviewHist storyCharactersHist"></div>
                  </div>
                  <div className="col-xs-4">
                    <h4 l10n-id="overview-character-stories-diagram"></h4>
                    <div className="overviewHist characterStoriesHist"></div>
                  </div>
                </div>
                <div className="row margin-bottom-16">
                  <div className="col-xs-4">
                    <h4 l10n-id="overview-story-completeness-diagram"></h4>
                    <div className="overviewHist eventCompletenessHist"></div>
                  </div>
                  <div className="col-xs-4">
                    <h4 l10n-id="overview-character-symbols-diagram"></h4>
                    <div className="overviewHist characterSymbolsHist"></div>
                  </div>
                  <div className="col-xs-4">
                    <h4 l10n-id="overview-character-symbols-doughnut"></h4>
                    <div style={{display:"flex",justifyContent:"center"}}>
                      <div>
                        <canvas className="symbolChart" width="300" height="125"></canvas>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-xs-8">
                    <h4 l10n-id="overview-object-belonging-diagrams"></h4>
                    <div style={{display:"flex",justifyContent:"center"}}>
                      <div style= {{flexGrow:1,flexBasis:0,textAlign:"center"}}>
                        <canvas className="characterChart margin-bottom-8" width="120" height="100" style={{margin: "0 auto"}}></canvas>
                        <span l10n-id="header-characters"></span>
                      </div>
                      <div style={{flexGrow:1,flexBasis:0,textAlign:"center"}}>
                        <canvas className="playerChart margin-bottom-8" width="120" height="100" style={{margin: "0 auto"}}></canvas>
                        <span l10n-id="header-players"></span>
                      </div>
                      <div style={{flexGrow:1,flexBasis:0,textAlign:"center"}}>
                        <canvas className="storyChart margin-bottom-8" width="120" height="100" style={{margin: "0 auto"}}></canvas>
                        <span l10n-id="header-stories"></span>
                      </div>
                      <div style={{flexGrow:1,flexBasis:0,textAlign:"center"}}>
                        <canvas className="groupChart margin-bottom-8" width="120" height="100" style={{margin: "0 auto"}}></canvas>
                        <span l10n-id="header-groups"></span>
                      </div>
                    </div>
                  </div>
                  <div className="col-xs-4">
                    <h4 l10n-id="overview-binding-doughnut"></h4>
                    <div style={{display:"flex",justifyContent:"center"}}>
                      <div>
                        <canvas className="bindingChart" width="300" height="125"></canvas>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="tab-pane" id="profile-diagrams">
              <h3 l10n-id="overview-character-diagrams"></h3>
              <div className="alert character alert-info margin-bottom-8" l10n-id="advices-no-character-profile-items-for-diagram"></div>
              <div className="container-fluid">
                <div className="profileDiagrams row characterProfileDiagrams"></div>
              </div>
              <h3 l10n-id="overview-player-diagrams"></h3>
              <div className="alert player alert-info margin-bottom-8" l10n-id="advices-no-player-profile-items-for-diagram"></div>
              <div className="container-fluid">
                <div className="profileDiagrams row playerProfileDiagrams"></div>
              </div>
            </div>
            
            <div className="tab-pane" id="gears" style={{"backgroundColor": "grey", borderRadius: "3px"}}>
            </div>
            <div className="tab-pane" id="sliders" style={{"backgroundColor": "grey", borderRadius: "3px"}}>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function getOverviewTemplate() {
  return <OverviewTemplate />;
}