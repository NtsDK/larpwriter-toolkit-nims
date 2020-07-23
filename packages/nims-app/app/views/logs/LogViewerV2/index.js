import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { LogViewerV2 } from './LogViewerV2.jsx';

const tmp = pipe(withTranslation())(LogViewerV2);

export { tmp as LogViewerV2 };
