import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { SocialNetwork } from './SocialNetwork.jsx';

const tmp = pipe(withTranslation())(SocialNetwork);

export { tmp as SocialNetwork };
