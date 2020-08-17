import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { withDbms } from 'nims-app-core/withDbms.jsx';
import { ProfileDiagrams } from './ProfileDiagrams.jsx';

const tmp = pipe(withTranslation(), withDbms)(ProfileDiagrams);

export { tmp as ProfileDiagrams };
