import React from 'react';
import ReactDOM from 'react-dom';

import { AboutComponent, getAboutComponent } from "./about.jsx";

const init = () => {
    const el = U.queryEl('#aboutDiv');
    ReactDOM.render(getAboutComponent(), el);
    L10n.localizeStatic(el);
};

const getContent = () => U.queryEl('#aboutDiv');

const refresh = () => {
};

export default {init, getContent, refresh};
