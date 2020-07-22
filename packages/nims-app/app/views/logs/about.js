import ReactDOM from 'react-dom';

import { U, L10n } from 'nims-app-core';
import { getAboutTemplate } from './AboutTemplate.jsx';

export class About {
    subContainer;

    constructor() {

    }

    getContent = () => this.subContainer;

    init() {
      this.subContainer = U.makeEl('div');
      U.addEl(U.qe('.tab-container'), this.subContainer);
      ReactDOM.render(getAboutTemplate(), this.subContainer);
      L10n.localizeStatic(this.subContainer);
    }

    refresh() {
    }
}

// export default {init, getContent, refresh};
