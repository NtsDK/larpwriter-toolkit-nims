import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { pipe } from 'ramda';
import { withDbms } from 'nims-app-core/withDbms.jsx';
import { ProfileNav } from './ProfileNav.jsx';

const tmp = pipe(withTranslation(), withRouter, withDbms)(ProfileNav);

export { tmp as ProfileNav };
