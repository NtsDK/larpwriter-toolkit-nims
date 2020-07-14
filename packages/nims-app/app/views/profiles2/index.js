import { CharacterEditor, PlayerEditor } from './profileEditor2';
import { CharacterConfigurer, PlayerConfigurer } from './profileConfigurer2';
import ProfileBinding2 from './profileBinding2';

import buildRouteView from '../tabRouting/routingTab';

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
