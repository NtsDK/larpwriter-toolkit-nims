import LogViewer from './logViewer';
import About from './About';
import GroupSchema from '../groups/groupSchema';

import buildRouteView from '../tabRouting/routingTab';

export const LogViewer2 = buildRouteView({
    firstTab: 'About',
    tabs: [{
        btnName: 'logViewer',
        viewName: 'LogViewer',
        viewBody: LogViewer
    }, {
        btnName: 'group-schema',
        viewName: 'GroupSchema',
        viewBody: GroupSchema
    }, {
        btnName: 'about',
        viewName: 'About',
        viewBody: About
    }]
});
