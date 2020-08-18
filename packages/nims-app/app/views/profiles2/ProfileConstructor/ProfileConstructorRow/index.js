import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { withDbms } from 'nims-app-core/withDbms.jsx';
import { ProfileConstructorRow } from './ProfileConstructorRow.jsx';

const tmp = pipe(withTranslation(), withDbms)(ProfileConstructorRow);

export { tmp as ProfileConstructorRow };
