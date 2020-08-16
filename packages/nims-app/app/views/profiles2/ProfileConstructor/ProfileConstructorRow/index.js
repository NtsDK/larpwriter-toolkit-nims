import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { ProfileConstructorRow } from './ProfileConstructorRow.jsx';

const tmp = pipe(withTranslation())(ProfileConstructorRow);

export { tmp as ProfileConstructorRow };
