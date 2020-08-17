import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { withDbms } from 'nims-app-core/withDbms.jsx';
import { GameInfo } from './GameInfo.jsx';

const tmp = pipe(withTranslation(), withDbms)(GameInfo);

export { tmp as GameInfo };
