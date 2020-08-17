import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { withDbms } from 'nims-app-core/withDbms.jsx';
import { SocialNetwork } from './SocialNetwork.jsx';

const tmp = pipe(withTranslation(), withDbms)(SocialNetwork);

export { tmp as SocialNetwork };
