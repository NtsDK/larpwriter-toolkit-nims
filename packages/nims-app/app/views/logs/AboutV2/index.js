import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { AboutV2 } from './AboutV2.jsx';

const tmp = pipe(withTranslation())(AboutV2);

export { tmp as AboutV2 };
