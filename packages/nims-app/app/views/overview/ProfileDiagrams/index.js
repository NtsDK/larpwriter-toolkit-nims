import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { ProfileDiagrams } from './ProfileDiagrams.jsx';

const tmp = pipe(withTranslation())(ProfileDiagrams);

export { tmp as ProfileDiagrams };
