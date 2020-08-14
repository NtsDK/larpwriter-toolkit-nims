import React from 'react';

export const OverviewTemplate = function () {
  return (
    <div className="overview-tab block">
      <div className="panel panel-default">
        <div className="panel-body">

          <ul className="nav nav-pills margin-bottom-16">
            <li className="btn-default active">
              <a href="#overview-descr" data-toggle="tab" l10n-id="overview-about-game" />
            </li>
            <li className="btn-default"><a href="#overview-diagrams" data-toggle="tab" l10n-id="overview-statistic-diagrams" /></li>
            <li className="btn-default"><a href="#profile-diagrams" data-toggle="tab" l10n-id="overview-profile-diagrams" /></li>
            <li className="btn-default "><a href="#gears" data-toggle="tab"><span className="gearsButton fa-free fa-bold fa-margin-right" l10n-id="header-gears" /></a></li>
            <li className="btn-default "><a href="#sliders" data-toggle="tab"><span className="slidersButton fa-free fa-bold fa-margin-right" l10n-id="header-sliders" /></a></li>
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
                            <label className=" control-label" l10n-id="overview-name" />
                            <input id="gameNameInput" className="adminOnly form-control" />
                            <div className="" />
                          </div>
                          <div className="form-group">
                            <label className=" control-label" l10n-id="overview-last-save-time" />
                            <p id="lastSaveTime" className="form-control-static" l10n-id="overview-last-save-time" />
                            <div className="" />
                          </div>
                        </div>
                        <div className="col-xs-6">
                          <div className="form-group">
                            <label className=" control-label" l10n-id="overview-pre-game-start-date" />
                            <input id="preGameDatePicker" className="adminOnly form-control" />
                            <div className="" />
                          </div>
                          <div className="form-group">
                            <label className=" control-label" l10n-id="overview-pre-game-end-date" />
                            <input id="gameDatePicker" className="adminOnly form-control" />
                            <div className="" />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-xs-12">
                          <div className="form-group">
                            <label l10n-id="overview-descr" />
                            <textarea className="adminOnly game-description-area form-control" />
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                  <div className="col-xs-3">
                    <table className="table table-bordered table-striped" style={{ width: 'auto' }}>
                      <thead>
                        <tr>
                          <th colSpan="2" l10n-id="overview-stats" style={{ textAlign: 'center' }} />
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><span className="statisticsLabel" l10n-id="overview-character-count">      </span></td>
                          <td>
                            <span className="statisticsValue" id="characterNumber" />
                            {' '}
                          </td>
                        </tr>
                        <tr>
                          <td><span className="statisticsLabel" l10n-id="overview-player-count">         </span></td>
                          <td>
                            <span className="statisticsValue" id="playerNumber" />
                            {' '}
                          </td>
                        </tr>
                        <tr>
                          <td><span className="statisticsLabel" l10n-id="overview-story-count">          </span></td>
                          <td>
                            <span className="statisticsValue" id="storyNumber" />
                            {' '}
                          </td>
                        </tr>
                        <tr>
                          <td><span className="statisticsLabel" l10n-id="overview-group-count">          </span></td>
                          <td>
                            <span className="statisticsValue" id="groupNumber" />
                            {' '}
                          </td>
                        </tr>
                        <tr>
                          <td><span className="statisticsLabel" l10n-id="overview-event-count">          </span></td>
                          <td>
                            <span className="statisticsValue" id="eventsNumber" />
                            {' '}
                          </td>
                        </tr>
                        <tr>
                          <td><span className="statisticsLabel" l10n-id="overview-user-count">           </span></td>
                          <td>
                            <span className="statisticsValue" id="userNumber" />
                            {' '}
                          </td>
                        </tr>
                        <tr>
                          <td><span className="statisticsLabel" l10n-id="overview-first-event">          </span></td>
                          <td>
                            <span className="statisticsValue" id="firstEvent" />
                            {' '}
                          </td>
                        </tr>
                        <tr>
                          <td><span className="statisticsLabel" l10n-id="overview-last-event">           </span></td>
                          <td>
                            <span className="statisticsValue" id="lastEvent" />
                            {' '}
                          </td>
                        </tr>
                        <tr>
                          <td><span className="statisticsLabel" l10n-id="overview-symbol-count">         </span></td>
                          <td><span className="statisticsValue" id="textCharacterNumber" /></td>
                        </tr>
                        <tr>
                          <td><span className="statisticsLabel" l10n-id="overview-story-completeness">   </span></td>
                          <td>
                            <span className="statisticsValue" id="storyCompleteness" />
                            {' '}
                          </td>
                        </tr>
                        <tr>
                          <td><span className="statisticsLabel" l10n-id="overview-general-completeness"> </span></td>
                          <td><span className="statisticsValue" id="generalCompleteness" /></td>
                        </tr>
                        <tr>
                          <td><span className="statisticsLabel" l10n-id="overview-relation-completeness" /></td>
                          <td><span className="statisticsValue" id="relationCompleteness" /></td>
                        </tr>
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
                    <h4 l10n-id="overview-event-count-diagram" />
                    <div className="overviewHist storyEventsHist" />
                  </div>
                  <div className="col-xs-4">
                    <h4 l10n-id="overview-character-count-diagram" />
                    <div className="overviewHist storyCharactersHist" />
                  </div>
                  <div className="col-xs-4">
                    <h4 l10n-id="overview-character-stories-diagram" />
                    <div className="overviewHist characterStoriesHist" />
                  </div>
                </div>
                <div className="row margin-bottom-16">
                  <div className="col-xs-4">
                    <h4 l10n-id="overview-story-completeness-diagram" />
                    <div className="overviewHist eventCompletenessHist" />
                  </div>
                  <div className="col-xs-4">
                    <h4 l10n-id="overview-character-symbols-diagram" />
                    <div className="overviewHist characterSymbolsHist" />
                  </div>
                  <div className="col-xs-4">
                    <h4 l10n-id="overview-character-symbols-doughnut" />
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <div>
                        <canvas className="symbolChart" width="300" height="125" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-xs-8">
                    <h4 l10n-id="overview-object-belonging-diagrams" />
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <div style={{ flexGrow: 1, flexBasis: 0, textAlign: 'center' }}>
                        <canvas className="characterChart margin-bottom-8" width="120" height="100" style={{ margin: '0 auto' }} />
                        <span l10n-id="header-characters" />
                      </div>
                      <div style={{ flexGrow: 1, flexBasis: 0, textAlign: 'center' }}>
                        <canvas className="playerChart margin-bottom-8" width="120" height="100" style={{ margin: '0 auto' }} />
                        <span l10n-id="header-players" />
                      </div>
                      <div style={{ flexGrow: 1, flexBasis: 0, textAlign: 'center' }}>
                        <canvas className="storyChart margin-bottom-8" width="120" height="100" style={{ margin: '0 auto' }} />
                        <span l10n-id="header-stories" />
                      </div>
                      <div style={{ flexGrow: 1, flexBasis: 0, textAlign: 'center' }}>
                        <canvas className="groupChart margin-bottom-8" width="120" height="100" style={{ margin: '0 auto' }} />
                        <span l10n-id="header-groups" />
                      </div>
                    </div>
                  </div>
                  <div className="col-xs-4">
                    <h4 l10n-id="overview-binding-doughnut" />
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <div>
                        <canvas className="bindingChart" width="300" height="125" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="tab-pane" id="profile-diagrams">
              <h3 l10n-id="overview-character-diagrams" />
              <div className="alert character alert-info margin-bottom-8" l10n-id="advices-no-character-profile-items-for-diagram" />
              <div className="container-fluid">
                <div className="profileDiagrams row characterProfileDiagrams" />
              </div>
              <h3 l10n-id="overview-player-diagrams" />
              <div className="alert player alert-info margin-bottom-8" l10n-id="advices-no-player-profile-items-for-diagram" />
              <div className="container-fluid">
                <div className="profileDiagrams row playerProfileDiagrams" />
              </div>
            </div>

            <div className="tab-pane" id="gears" style={{ backgroundColor: 'grey', borderRadius: '3px' }} />
            <div className="tab-pane" id="sliders" style={{ backgroundColor: 'grey', borderRadius: '3px' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export function getOverviewTemplate() {
  return <OverviewTemplate />;
}
