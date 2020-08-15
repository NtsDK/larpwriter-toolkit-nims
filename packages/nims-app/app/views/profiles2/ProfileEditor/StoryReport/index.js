import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { StoryReport } from './StoryReport.jsx';

const tmp = pipe(withTranslation())(StoryReport);

export { tmp as StoryReport };
