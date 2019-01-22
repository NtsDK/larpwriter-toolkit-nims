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

exports.LogViewer2 = require('./tabRouting/routingTab')({
    firstTab: 'GroupSchema',
    tabs: [{
        btnName: 'logViewer',
        viewName: 'LogViewer',
        viewBody: require('./logs/logViewer')
    }, {
        btnName: 'group-schema',
        viewName: 'GroupSchema',
        viewBody: require('./groups/groupSchema')
    }, {
        btnName: 'about',
        viewName: 'About',
        viewBody: require('./logs/about')
    }]
});

// exports.Characters = require('./tabRouting/routingTab')({
//     firstTab: 'CharacterEditor',
//     tabs: [{
//         btnName: 'filling-profile',
//         viewName: 'CharacterEditor',
//         viewBody: require('./profiles2/briefingPreview')
//     }, {
//         btnName: 'briefing-export',
//         viewName: 'BriefingExport',
//         viewBody: require('./briefings/briefingExport')
//     }]
// });

// RoutingTabTmpl(this.Characters = {}, {
//     firstTab: 'CharacterEditor',
//     tabs: [{
//         btnName: 'filling-profile',
//         viewName: 'CharacterEditor'
//     }, {
//         btnName: 'changing-profile-structure',
//         viewName: 'CharacterConfigurer'
//     }, {
//         btnName: 'binding-characters-and-players',
//         viewName: 'ProfileBinding2'
//     }]
// });

// RoutingTabTmpl(this.Players = {}, {
//     firstTab: 'PlayerEditor',
//     tabs: [{
//         btnName: 'filling-profile',
//         viewName: 'PlayerEditor'
//     }, {
//         btnName: 'changing-profile-structure',
//         viewName: 'PlayerConfigurer'
//     }, {
//         btnName: 'binding-characters-and-players',
//         viewName: 'ProfileBinding2'
//     }]
// });



// RoutingTabTmpl(this.AccessManager = {}, {
//     firstTab: 'OrganizerManagement',
//     tabs: [{
//         btnName: 'organizerManagement',
//         viewName: 'OrganizerManagement'
//     }, {
//         btnName: 'playerManagement',
//         viewName: 'PlayerManagement'
//     }]
// });
