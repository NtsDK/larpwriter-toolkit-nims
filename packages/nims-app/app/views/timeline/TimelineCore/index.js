import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { TimelineCore } from './TimelineCore.jsx';

const tmp = pipe(withTranslation())(TimelineCore);

export { tmp as TimelineCore };
