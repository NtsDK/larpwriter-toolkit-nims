import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { ProfileEditor } from './ProfileEditor.jsx';

const tmp = pipe(withTranslation())(ProfileEditor);

export { tmp as ProfileEditor };
