import { withTranslation } from 'react-i18next';
import { withDbms } from 'nims-app-core/withDbms.jsx';
import { pipe } from 'ramda';
import { Adaptations } from './Adaptations.jsx';

const tmp = pipe(withTranslation(), withDbms)(Adaptations);

export { tmp as Adaptations };
