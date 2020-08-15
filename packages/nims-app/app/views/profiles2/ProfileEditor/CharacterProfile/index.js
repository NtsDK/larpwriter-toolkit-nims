import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { CharacterProfile } from './CharacterProfile.jsx';

const tmp = pipe(withTranslation())(CharacterProfile);

export { tmp as CharacterProfile };
