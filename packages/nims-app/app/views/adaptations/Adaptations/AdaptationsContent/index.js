import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { withDbms } from 'nims-app-core/withDbms.jsx';
import { AdaptationsContent } from './AdaptationsContent.jsx';

const tmp = pipe(withTranslation(), withDbms)(AdaptationsContent);

export { tmp as AdaptationsContent };
