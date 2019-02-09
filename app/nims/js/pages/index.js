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

const BriefingPreview = require('./briefings/briefingPreview');
const BriefingExport = require('./briefings/briefingExport');
const LogViewer = require('./logs/logViewer');
const GroupSchema = require('./groups/groupSchema');
const { CharacterEditor, PlayerEditor } = require('./profiles2/profileEditor2');
const { CharacterConfigurer, PlayerConfigurer } = require('./profiles2/profileConfigurer2');
const ProfileBinding2 = require('./profiles2/profileBinding2');
const OrganizerManagement = require('./accessManager/organizerManagement');
const PlayerManagement = require('./accessManager/playerManagement');


exports.Briefings = require('./tabRouting/routingTab')({
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


exports.LogViewer2 = require('./tabRouting/routingTab')({
    firstTab: 'GroupSchema',
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
        viewBody: exports.About
    }]
});

exports.Characters = require('./tabRouting/routingTab')({
    firstTab: 'CharacterEditor',
    tabs: [{
        btnName: 'filling-profile',
        viewName: 'CharacterEditor',
        viewBody: CharacterEditor
    }, {
        btnName: 'changing-profile-structure',
        viewName: 'CharacterConfigurer',
        viewBody: CharacterConfigurer
    }, {
        btnName: 'binding-characters-and-players',
        viewName: 'ProfileBinding2',
        viewBody: ProfileBinding2
    }]
});

exports.Players = require('./tabRouting/routingTab')({
    firstTab: 'PlayerEditor',
    tabs: [{
        btnName: 'filling-profile',
        viewName: 'PlayerEditor',
        viewBody: PlayerEditor
    }, {
        btnName: 'changing-profile-structure',
        viewName: 'PlayerConfigurer',
        viewBody: PlayerConfigurer
    }, {
        btnName: 'binding-characters-and-players',
        viewName: 'ProfileBinding2',
        viewBody: ProfileBinding2
    }]
});


exports.AccessManager = require('./tabRouting/routingTab')({
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
