import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { withDbms } from 'nims-app-core/withDbms.jsx';
import { LogViewerV2 } from './LogViewerV2.jsx';

const tmp = pipe(withTranslation(), withDbms)(LogViewerV2);

export { tmp as LogViewerV2 };
