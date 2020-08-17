import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { withDbms } from 'nims-app-core/withDbms.jsx';
import { CharacterProfile } from './CharacterProfile.jsx';

const tmp = pipe(withTranslation(), withDbms)(CharacterProfile);

export { tmp as CharacterProfile };
