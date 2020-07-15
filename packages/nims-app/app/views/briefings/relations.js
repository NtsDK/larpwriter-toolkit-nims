import PermissionInformer from "permissionInformer";
import RelationsPreview from "./relationsPreview";
import ReactDOM from 'react-dom';
import { getRelationsTemplate } from "./RelationsTemplate.jsx";
import { UI, U, L10n } from 'nims-app-core';

const root = '.relations-tab ';
const state = {};
const settingsPath = 'Relations';

let content;
function getContent(){
    return content;
}
export default {
    init, refresh, getContent, load
}

function init(){
    content = U.makeEl('div');
    U.addEl(U.qe('.tab-container'), content);
    ReactDOM.render(getRelationsTemplate(), content);
    L10n.localizeStatic(content);

    $(`${root} .character-select`).select2().on('change', buildContent);
    content = U.queryEl(root);
};

function refresh(){
    U.clearEl(U.queryEl(`${root} .character-select`));
    U.clearEl(U.queryEl(`${root} .panel-body`));

    Promise.all([
        DBMS.getProfileStructure({ type: 'character' }),
        PermissionInformer.getEntityNamesArray({ type: 'character', editableOnly: false })
    ]).then((results) => {
        const [characterProfileStructure, names] = results;
        state.characterProfileStructure = characterProfileStructure;

        U.showEl(U.qe(`${root} .alert`), names.length < 2);
        U.showEl(U.qe(`${root} > .panel`), names.length > 1);

        if (names.length > 0) {
            const characterName = UI.checkAndGetEntitySetting(settingsPath, names);
            const data = UI.getSelect2Data(names);
            // this call trigger buildContent
            $(`${root} .character-select`).select2(data).val(characterName).trigger('change');
        }
    }).catch(UI.handleError);
};

function buildContent(event) {
    U.clearEl(U.queryEl(`${root} .panel-body`));
    const characterName = event.target.value;
    UI.updateEntitySetting(settingsPath, characterName);
    state.data = {};
    state.data.characterName = characterName;
    load(state.data, buildContentInner);
}

function buildContentInner() {
    const content = RelationsPreview.makeRelationsContent(
        state.data, true, state.characterProfileStructure,
        refresh
    );
    U.addEl(U.queryEl(`${root} .panel-body`), content);
    UI.initTextAreas(`${root} .panel-body textarea`);
    UI.refreshTextAreas(`${root} .panel-body textarea`);
}

function load(data, callback){
    Promise.all([
        DBMS.getAllProfiles({ type: 'character' }),
        DBMS.getRelationsSummary({ characterName: data.characterName }),
        DBMS.getExtendedProfileBindings(),
        PermissionInformer.getEntityNamesArray({ type: 'character', editableOnly: false })
    ]).then((results) => {
        const [profiles, relationsSummary, profileBindings, characterNamesArray] = results;
        data.relationsSummary = relationsSummary;
        data.characterNamesArray = characterNamesArray;
        data.profiles = profiles;
        data.profileBindings = R.fromPairs(profileBindings);
        callback();
    }).catch(UI.handleError);
};
// })(window.Relations = {});
