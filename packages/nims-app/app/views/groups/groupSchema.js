import { d3, klay } from 'nims-app-core/libs/klay-adapter';
import ReactDOM from 'react-dom';
import { UI, U, L10n } from 'nims-app-core';
import { getGroupSchemaTemplate } from './GroupSchemaTemplate.jsx';
import { drawSchema } from './drawSchema';

const rootTab = '.group-schema-tab';

export class GroupSchema {
    content;

    init() {
      this.content = U.makeEl('div');
      U.addEl(U.qe('.tab-container'), this.content);
      ReactDOM.render(getGroupSchemaTemplate(), this.content);
      L10n.localizeStatic(this.content);

      this.content = U.queryEl(rootTab);
    }

    getContent() {
      return this.content;
    }

    refresh() {
      DBMS.getGroupSchemas().then((schemas) => {
        this.redrawSchema2(schemas.theory, 'theory');
        this.redrawSchema2(schemas.practice, 'practice');
      }).catch(UI.handleError);
    }

    redrawSchema2(graphData, className) {
      const el = U.queryEl(`${rootTab} svg.${className}`);
      U.clearEl(el);
      drawSchema(graphData, el);
    }
}

// export default {init, getContent, refresh};
