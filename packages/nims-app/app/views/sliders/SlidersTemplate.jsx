import React from 'react';

export const SlidersTemplate = function() {
  return (
    <div className="sliders-tab block">
      <div className="panel panel-default intro-panel">
        <div className="panel-heading">
          <a href="#/" panel-toggler=".sliders-tab .intro-panel .panel-body">
            <h3 className="panel-title" l10n-id="sliders-what-is-it"></h3>
          </a>
        </div>
        <div className="panel-body hidden">
          <div className="margin-bottom-16">
            <a target="_blank" href="http://analoggamestudies.org/2016/11/the-mixing-desk-of-larp-history-and-current-state-of-a-design-theory/" l10n-id="sliders-link1"></a>
          </div>
          <div className="margin-bottom-16">
            <a target="_blank" href="http://larpschool.blogspot.ru/p/mixing-desk.html" l10n-id="sliders-link2"></a>
          </div>
          <div>
            <a target="_blank" href="https://www.youtube.com/watch?list=PLkcfpOLbv_drrBejHm3g38jIQWgwpAcvn&v=nDmHZ2gmSnc" l10n-id="sliders-link3"></a>
          </div>
        </div>
      </div>
      
      <div className="panel panel-default mixer-settings-panel">
        <div className="panel-body">
          <button className="btn btn-default btn-reduced fa-icon create flex-0-0-auto" l10n-title="sliders-create-slider"></button>
        </div>
      </div>

      <div className="panel panel-default mixer-panel">
        <div className="panel-heading">
          <a href="#/" panel-toggler=".sliders-tab .mixer-panel .panel-body">
            <h3 className="panel-title player-profile-header" l10n-id="sliders-mixing-desk"></h3>
          </a>
        </div>
        <div className="panel-body ">
        </div>
      </div>
    </div>
  );
};

export function getSlidersTemplate() {
  return <SlidersTemplate />;
}