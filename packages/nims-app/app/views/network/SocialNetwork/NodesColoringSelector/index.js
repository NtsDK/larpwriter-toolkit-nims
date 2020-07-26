import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { NodesColoringSelector } from './NodesColoringSelector.jsx';

const tmp = pipe(withTranslation())(NodesColoringSelector);

export { tmp as NodesColoringSelector };
