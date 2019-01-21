exports.Overview = require('./overview/overview');
exports.Adaptations = require('./adaptations/adaptations');
exports.Relations = require('./briefings/relations');
exports.RoleGrid = require('./profiles2/roleGrid');
exports.Timeline = require('./timeline/timeline');
exports.SocialNetwork = require('./network/socialNetwork');
exports.TextSearch = require('./textSearch/textSearch');

exports.Briefings = require('./tabRouting/routingTab')({
    firstTab: 'BriefingPreview',
    tabs: [{
        btnName: 'briefing-preview',
        viewName: 'BriefingPreview',
        viewBody: require('./briefings/briefingPreview')
    }, {
        btnName: 'briefing-export',
        viewName: 'BriefingExport',
        viewBody: require('./briefings/briefingExport')
    }]
});

// RoutingTabTmpl(this.Briefings = {}, {
//     firstTab: 'BriefingPreview',
//     tabs: [{
//         btnName: 'briefing-preview',
//         viewName: 'BriefingPreview'
//     }, {
//         btnName: 'briefing-export',
//         viewName: 'BriefingExport'
//     }]
// });