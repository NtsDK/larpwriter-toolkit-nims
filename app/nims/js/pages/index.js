exports.Overview = require('./overview/overview');
exports.Stories = require('./stories/stories');
exports.Adaptations = require('./adaptations/adaptations');
exports.Relations = require('./briefings/relations');
exports.RoleGrid = require('./profiles2/roleGrid');
exports.Timeline = require('./timeline/timeline');
exports.SocialNetwork = require('./network/socialNetwork');
exports.TextSearch = require('./textSearch/textSearch');
exports.ProfileFilter = require('./groups/profileFilter');
exports.GroupProfile = require('./groups/groupProfile');

exports.Enter = require('./serverSpecific/enter');
exports.SignUp = require('./serverSpecific/sign-up');
exports.About = require('./logs/about');

exports.Briefings = require('./tabRouting/routingTab')({
    firstTab: 'BriefingExport',
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
        viewBody: exports.About
    }]
});

exports.Characters = require('./tabRouting/routingTab')({
    firstTab: 'CharacterEditor',
    tabs: [{
        btnName: 'filling-profile',
        viewName: 'CharacterEditor',
        viewBody: require('./profiles2/profileEditor2').CharacterEditor
    }, {
        btnName: 'changing-profile-structure',
        viewName: 'CharacterConfigurer',
        viewBody: require('./profiles2/profileConfigurer2').CharacterConfigurer
    }, {
        btnName: 'binding-characters-and-players',
        viewName: 'ProfileBinding2',
        viewBody: require('./profiles2/profileBinding2')
    }]
});

exports.Players = require('./tabRouting/routingTab')({
    firstTab: 'PlayerEditor',
    tabs: [{
        btnName: 'filling-profile',
        viewName: 'PlayerEditor',
        viewBody: require('./profiles2/profileEditor2').PlayerEditor
    }, {
        btnName: 'changing-profile-structure',
        viewName: 'PlayerConfigurer',
        viewBody: require('./profiles2/profileConfigurer2').PlayerConfigurer
    }, {
        btnName: 'binding-characters-and-players',
        viewName: 'ProfileBinding2',
        viewBody: require('./profiles2/profileBinding2')
    }]
});

exports.AccessManager = require('./tabRouting/routingTab')({
    firstTab: 'OrganizerManagement',
    tabs: [{
        btnName: 'organizerManagement',
        viewName: 'OrganizerManagement',
        viewBody: require('./accessManager/organizerManagement')
    }, {
        btnName: 'playerManagement',
        viewName: 'PlayerManagement',
        viewBody: require('./accessManager/playerManagement')
    }]
});
