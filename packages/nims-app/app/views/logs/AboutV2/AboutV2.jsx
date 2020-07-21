import React from 'react';
import './AboutV2.css';

export function AboutV2(props) {
  const { t } = props;

  return (
    <div className="AboutV2" id="aboutDiv" >
      <div className="panel panel-default">
        <div className="panel-body">
          <p>{t('about.about-authors')}</p>
          <p><span>{t('about.site-mention')}</span>
            <a href="http://trechkalov.com/index-en.html">trechkalov.com</a> <span
          >{t('about.site-description')}</span></p>
          <p><span>{t('about.program-is-free-in-rep')}</span> <a
            href="https://github.com/NtsDK/larpwriter-toolkit-nims"
          >{t('about.by-link')}</a></p>
          <p>{t('about.icons-authors')}</p>
          <p>{t('about.versions')}</p>
          <ul>
            <li>{t('about.var072')}</li>
            <li>{t('about.var070')}</li>
            <li>{t('about.var061')}</li>
            <li>{t('about.var052')}</li>
            <li>{t('about.var044u3')}</li>
            <li>{t('about.var044u2')}</li>
            <li>{t('about.var044')}</li>
            <li>{t('about.var043')}</li>
            <li>{t('about.var042')}</li>
            <li>{t('about.var041')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
