import React from 'react';

export const AboutTemplate = function() {
  return (
    <div id="aboutDiv" >
      <div className="panel panel-default">
        <div className="panel-body">
          <p l10n-id="about-about-authors"></p>
          <p><span l10n-id="about-site-mention"></span><a href="http://trechkalov.com/index-en.html">trechkalov.com</a> <span
            l10n-id="about-site-description"
          ></span></p>
          <p><span l10n-id="about-program-is-free-in-rep"></span> <a
            href="https://github.com/NtsDK/larpwriter-toolkit-nims" l10n-id="about-by-link"
          ></a></p>
          
          <p l10n-id="about-icons-authors"></p>
          
          <p l10n-id="about-versions"></p>
          <ul>
            <li l10n-id="about-var072"></li>
            <li l10n-id="about-var070"></li>
            <li l10n-id="about-var061"></li>
            <li l10n-id="about-var052"></li>
            <li l10n-id="about-var044u3"></li>
            <li l10n-id="about-var044u2"></li>
            <li l10n-id="about-var044"></li>
            <li l10n-id="about-var043"></li>
            <li l10n-id="about-var042"></li>
            <li l10n-id="about-var041"></li>
          </ul>

        </div>
      </div>
    </div>
  );
};

export function getAboutTemplate() {
  return <AboutTemplate />;
}