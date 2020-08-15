import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { pipe } from 'ramda';
import { ProfileNav } from './ProfileNav.jsx';

const tmp = pipe(withTranslation(), withRouter)(ProfileNav);

export { tmp as ProfileNav };
