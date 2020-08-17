import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { withDbms } from 'nims-app-core/withDbms.jsx';
import { ProfileConstructor } from './ProfileConstructor.jsx';

const tmp = pipe(withTranslation(), withDbms)(ProfileConstructor);

export { tmp as ProfileConstructor };
