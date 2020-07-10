import BriefingPreview from './briefings/briefingPreview';
import BriefingExport from './briefings/briefingExport';
import LogViewer from './logs/logViewer';
import GroupSchema from './groups/groupSchema';
import { CharacterEditor, PlayerEditor } from './profiles2/profileEditor2';
import { CharacterConfigurer, PlayerConfigurer } from './profiles2/profileConfigurer2';
import ProfileBinding2 from './profiles2/profileBinding2';
import OrganizerManagement from './accessManager/organizerManagement';
import PlayerManagement from './accessManager/playerManagement';
import About from './logs/about';

import buildRouteView from './tabRouting/routingTab';

export { default as Overview } from './overview/overview';
export { default as Stories } from './stories/stories';
export { default as Adaptations } from './adaptations/adaptations';
export { default as Relations } from './briefings/relations';
export { default as RoleGrid } from './profiles2/roleGrid';
export { default as Timeline } from './timeline/timeline';
export { default as SocialNetwork } from './network/socialNetwork';
export { default as TextSearch } from './textSearch/textSearch';
export { default as ProfileFilter } from './groups/profileFilter';
export { default as GroupProfile } from './groups/groupProfile';

export { default as Enter } from './serverSpecific/enter';
export { default as Player } from './serverSpecific/player';
export { default as SignUp } from './serverSpecific/sign-up';
export { default as About } from './logs/about';

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

export const LogViewer2 = buildRouteView({
    firstTab: 'About',
    // firstTab: 'GroupSchema',
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

export const Characters = buildRouteView({
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

export const Players = buildRouteView({
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
