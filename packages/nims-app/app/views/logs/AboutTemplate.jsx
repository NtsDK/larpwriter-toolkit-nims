import React from 'react';

export const AboutTemplate = function () {
  return (
    <div id="aboutDiv">
      <div className="panel panel-default">
        <div className="panel-body">
          <p l10n-id="about-about-authors" />
          <p>
            <span l10n-id="about-site-mention" />
            <a href="http://trechkalov.com/index-en.html">trechkalov.com</a>
            {' '}
            <span
              l10n-id="about-site-description"
            />

          </p>
          <p>
            <span l10n-id="about-program-is-free-in-rep" />
            {' '}
            <a
              href="https://github.com/NtsDK/larpwriter-toolkit-nims"
              l10n-id="about-by-link"
            />

          </p>

          <p l10n-id="about-icons-authors" />

          <p l10n-id="about-versions" />
          <ul>
            <li l10n-id="about-var072" />
            <li l10n-id="about-var070" />
            <li l10n-id="about-var061" />
            <li l10n-id="about-var052" />
            <li l10n-id="about-var044u3" />
            <li l10n-id="about-var044u2" />
            <li l10n-id="about-var044" />
            <li l10n-id="about-var043" />
            <li l10n-id="about-var042" />
            <li l10n-id="about-var041" />
          </ul>

        </div>
      </div>
    </div>
  );
};

export function getAboutTemplate() {
  return <AboutTemplate />;
}
