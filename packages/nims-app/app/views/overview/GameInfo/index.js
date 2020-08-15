import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { GameInfo } from './GameInfo.jsx';

const tmp = pipe(withTranslation())(GameInfo);

export { tmp as GameInfo };
