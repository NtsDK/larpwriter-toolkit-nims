import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { withDbms } from 'nims-app-core/withDbms.jsx';
import { ProfileEditor } from './ProfileEditor.jsx';

const tmp = pipe(withTranslation(), withDbms)(ProfileEditor);

export { tmp as ProfileEditor };
