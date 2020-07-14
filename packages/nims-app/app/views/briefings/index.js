import BriefingPreview from './briefingPreview';
import BriefingExport from './briefingExport';

import buildRouteView from '../tabRouting/routingTab';

export const Briefings = buildRouteView({
    firstTab: 'BriefingExport',
    tabs: [{
        btnName: 'briefing-preview',
        viewName: 'BriefingPreview',
        viewBody: BriefingPreview
    }, {
        btnName: 'briefing-export',
        viewName: 'BriefingExport',
        viewBody: BriefingExport
    }]
});
