import React from 'react';

export const GearsTemplate = function () {
  return (
    <div className="gears-tab block fixed-tab">
      <div className="container-fluid height-100p">
        <div className="row height-100p">
          <div className="col-xs-3 height-100p" style={{ overflowY: 'auto', paddingLeft: '0px' }}>

            <div id="faq" role="tablist" aria-multiselectable="true">
              <div className="panel panel-default">
                <div className="panel-heading" role="tab" id="">
                  <h5 className="panel-title">
                    <a data-toggle="collapse" data-parent="#faq" href="#answerOne" aria-expanded="false" aria-controls="answerOne" l10n-id="gears-what-is-gear" />
                  </h5>
                </div>
                <div id="answerOne" className="panel-collapse collapse" role="tabpanel" aria-labelledby="">
                  <div className="panel-body">
                    <div className="margin-bottom-16">
                      <a target="_blank" href="https://nordiclarp.org/2018/05/29/larp-design-cards/" l10n-id="gears-link-design-cards" />
                    </div>
                    <div className="margin-bottom-16">
                      <a target="_blank" href="http://master.larp.ru/theory/gear.php" l10n-id="gears-link1" />
                    </div>
                    <div className="margin-bottom-16">
                      <a target="_blank" href="http://lib.rpg.ru/index.php/%D0%A8%D0%B5%D1%81%D1%82%D0%B5%D1%80%D0%B5%D0%BD%D0%BA%D0%B0_%D1%80%D0%BE%D0%BB%D0%B5%D0%B9" l10n-id="gears-link2" />
                    </div>
                    <div>
                      <a target="_blank" href="https://www.mirf.ru/boards/karta-syuzheta" l10n-id="gears-link3" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel panel-default">
                <div className="panel-heading" role="tab" id="">
                  <h5 className="panel-title">
                    <a data-toggle="collapse" data-parent="#faq" href="#answerFive" aria-expanded="true" aria-controls="answerFive" l10n-id="gears-settings" />
                  </h5>
                </div>
                <div id="answerFive" className="panel-collapse collapse in" role="tabpanel" aria-labelledby="">
                  <div className="panel-body">
                    <div className="margin-bottom-16">
                      <label l10n-id="gears-search" />
                      <select className="search-node form-control" />
                    </div>
                    <div className="form-check margin-bottom-16">
                      <input id="gears-show-notes-checkbox" className="form-check-input show-notes-checkbox hidden" type="checkbox" value="" />
                      <label className="form-check-label checkbox-label-icon common-checkbox" htmlFor="gears-show-notes-checkbox">
                        <span l10n-id="gears-show-notes" />
                      </label>
                    </div>
                    <div className="form-check margin-bottom-16">
                      <input id="gears-physics-enabled-checkbox" className="form-check-input physics-enabled-checkbox hidden" type="checkbox" value="" />
                      <label htmlFor="gears-physics-enabled-checkbox" className="form-check-label checkbox-label-icon common-checkbox">
                        <span l10n-id="gears-physics-enabled" />
                      </label>
                    </div>
                    <button className="clear-button btn btn-default fa-icon remove" l10n-title="gears-clear" />
                  </div>
                </div>
              </div>

              <div className="panel panel-default hidden">
                <div className="panel-heading" role="tab" id="">
                  <h5 className="panel-title">
                    <a data-toggle="collapse" data-parent="#faq" href="#answerTwo" aria-expanded="false" aria-controls="answerTwo" l10n-id="gears-data" />
                  </h5>
                </div>
                <div id="answerTwo" className="panel-collapse collapse" role="tabpanel" aria-labelledby="">
                  <div className="panel-body">
                    <div>
                      <div l10n-id="gears-nodes" />
                      <textarea className="nodesText form-control" />
                    </div>
                    <div>
                      <div l10n-id="gears-edges" />
                      <textarea className="edgesText form-control" />
                    </div>
                    <br />
                    <button type="button" className="draw-button btn btn-primary" l10n-id="gears-draw" />
                    <br />
                  </div>
                </div>
              </div>

              <div className="panel panel-default hidden">
                <div className="panel-heading" role="tab" id="">
                  <h5 className="panel-title">
                    <a data-toggle="collapse" data-parent="#faq" href="#answerThree" aria-expanded="false" aria-controls="answerThree" l10n-id="gears-physics" />
                  </h5>
                </div>
                <div id="answerThree" className="panel-collapse collapse" role="tabpanel" aria-labelledby="">
                  <div className="panel-body">

                    <div className="form-group">
                      <button type="button" className="physics-settings-button btn btn-primary" l10n-id="gears-physics-editor" />
                    </div>
                    <div className="form-group">
                      <div l10n-id="gears-custom-physics-settings" />
                      <textarea className="custom-physics-settings form-control" />
                    </div>
                    <button type="button" className="custom-physics-settings-button btn btn-primary" l10n-id="gears-apply-custom-settings" />
                  </div>
                </div>
              </div>

              <div className="panel panel-default">
                <div className="panel-heading" role="tab" id="">
                  <h5 className="panel-title">
                    <a data-toggle="collapse" data-parent="#faq" href="#answerFour" aria-expanded="false" aria-controls="answerFour" l10n-id="gears-export" />
                  </h5>
                </div>
                <div id="answerFour" className="panel-collapse collapse" role="tabpanel" aria-labelledby="">
                  <div className="panel-body">
                    <div className="form-check margin-bottom-8">
                      <input id="gears-big-picture-checkbox" className="form-check-input big-picture-checkbox hidden" type="checkbox" value="" />
                      <label htmlFor="gears-big-picture-checkbox" className="form-check-label checkbox-label-icon common-checkbox">
                        <span l10n-id="gears-big-picture-mode" />
                      </label>
                    </div>
                    <a href="#" className="link get-image-button btn btn-default btn-reduced white-space-normal width-100p margin-bottom-16" download="gears.png" l10n-id="gears-download-image" />
                    <br />
                    <button type="button" className="download-button btn btn-default btn-reduced white-space-normal width-100p margin-bottom-8" l10n-id="gears-download-csv" />
                    <br />
                    <button type="button" className="download-json-button btn btn-default btn-reduced white-space-normal width-100p margin-bottom-8" l10n-id="gears-download-json" />
                    <br />
                    <button type="button" className="download-graphml-button btn btn-default btn-reduced white-space-normal width-100p margin-bottom-8" l10n-id="gears-download-yed" />
                    <br />
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="panel panel-default col-xs-9 height-100p">
            <div className="panel-body height-100p">
              <div className="mynetwork height-100p">
                <div className="vis-network" tabIndex="900">
                  <canvas style={{
                    position: 'relative', touchAction: 'none', MozUserSelect: 'none', width: '100%', height: '100%'
                  }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function getGearsTemplate() {
  return <GearsTemplate />;
}

export const AddOrEditNodeBody = function () {
  return (
    <div className="AddOrEditNodeBody">
      <div className="form-group hidden">
        <input className="node-id" value="new value" />
      </div>
      <div className="form-group">
        <label className="control-label" l10n-id="gears-node-name" />
        <input className="node-name form-control focusable onenterable" />
      </div>
      <div className="form-group">
        <label className="control-label" l10n-id="gears-node-group" />
        <input className="node-group form-control onenterable" />
      </div>
      <div className="form-group">
        <label className="control-label" l10n-id="gears-notes" />
        <textarea className="node-notes form-control" />
      </div>
    </div>
  );
};

export function getAddOrEditNodeBody() {
  return <AddOrEditNodeBody />;
}

export const ConfigInnerBody = function () {
  return (
    <div className="ConfigInnerBody configInner" />
  );
};

export function getConfigInnerBody() {
  return <ConfigInnerBody />;
}
