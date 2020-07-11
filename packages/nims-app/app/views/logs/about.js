import ReactDOM from 'react-dom';

import { getAboutTemplate } from "./AboutTemplate.jsx";

let subContainer;
const getContent = () => subContainer;

const init = () => {
    subContainer = U.makeEl('div');
    U.addEl(U.qe('.tab-container'), subContainer);
    ReactDOM.render(getAboutTemplate(), subContainer);
    L10n.localizeStatic(subContainer);
};

// const getContent = () => U.queryEl('#aboutDiv');

const refresh = () => {
};

export default {init, getContent, refresh};
