import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { withDbms } from 'nims-app-core/withDbms.jsx';
import { TimelineCore } from './TimelineCore.jsx';

const tmp = pipe(withTranslation(), withDbms)(TimelineCore);

export { tmp as TimelineCore };
