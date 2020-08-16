import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { ProfileConstructor } from './ProfileConstructor.jsx';

const tmp = pipe(withTranslation())(ProfileConstructor);

export { tmp as ProfileConstructor };
