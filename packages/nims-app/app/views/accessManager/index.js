import OrganizerManagement from './organizerManagement';
import PlayerManagement from './playerManagement';

import buildRouteView from '../tabRouting/routingTab';

export const AccessManager = buildRouteView({
    firstTab: 'OrganizerManagement',
    tabs: [{
        btnName: 'organizerManagement',
        viewName: 'OrganizerManagement',
        viewBody: OrganizerManagement
    }, {
        btnName: 'playerManagement',
        viewName: 'PlayerManagement',
        viewBody: PlayerManagement
    }]
});
