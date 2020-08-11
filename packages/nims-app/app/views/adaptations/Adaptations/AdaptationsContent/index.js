import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { AdaptationsContent } from './AdaptationsContent.jsx';

const tmp = pipe(withTranslation())(AdaptationsContent);

export { tmp as AdaptationsContent };
