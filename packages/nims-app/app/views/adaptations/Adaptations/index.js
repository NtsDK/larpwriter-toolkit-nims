import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { Adaptations } from './Adaptations.jsx';

const tmp = pipe(withTranslation())(Adaptations);

export { tmp as Adaptations };
