import PermissionInformer from 'permissionInformer';
import ReactDOM from 'react-dom';
import {
    getBindingItem,
    getProfileBindingTemplate,
    getProfileItem
} from "./ProfileBindingTemplate.jsx";

// ((exports) => {
const root = '.profile-binding2-tab ';
const l10n = L10n.get('binding');

let content;
function getContent(){
    return content;
}
export default {
    init, refresh, getContent
}

function init(){
    content = U.makeEl('div');
    U.addEl(U.qe('.tab-container'), content);
    ReactDOM.render(getProfileBindingTemplate(), content);
    L10n.localizeStatic(content);

    U.listen(U.queryEl(`${root} .character-filter`), 'input', filterList('.character-list'));
    U.listen(U.queryEl(`${root} .player-filter`), 'input', filterList('.player-list'));
    U.listen(U.queryEl(`${root} .binding-filter`), 'input', filterList('.binding-list'));

    content = U.queryEl(root);
};

function refresh(){
    Promise.all([
        PermissionInformer.getEntityNamesArray({ type: 'character', editableOnly: false }),
        PermissionInformer.getEntityNamesArray({ type: 'player', editableOnly: false }),
        DBMS.getProfileBindings()
    ]).then((results) => {
        const [characterNames, playerNames, profileBindings] = results;
        rebuildInterface(characterNames, playerNames, profileBindings);
    }).catch(UI.handleError);
};

function rebuildInterface(characterNames, playerNames, profileBindings) {
    const bondedCharacterList = R.keys(profileBindings);
    const bondedPlayerList = R.values(profileBindings);
    const filter = list => R.compose(R.not, R.contains(R.__, list), R.prop('value'));

    U.showEl(U.queryEl(`${root} .alert.no-character`), characterNames.length === 0);
    UI.enableEl(U.queryEl(`${root} .character-filter`), characterNames.length !== 0);
    U.showEl(U.queryEl(`${root} .character-list`), characterNames.length !== 0);

    U.showEl(U.queryEl(`${root} .alert.no-player`), playerNames.length === 0);
    UI.enableEl(U.queryEl(`${root} .player-filter`), playerNames.length !== 0);
    U.showEl(U.queryEl(`${root} .player-list`), playerNames.length !== 0);

    UI.enableEl(U.queryEl(`${root} .binding-filter`), R.keys(profileBindings).length !== 0);

    U.addEls(
        U.clearEl(U.queryEl(`${root} .entity-list.character-list`)),
        characterNames.filter(filter(bondedCharacterList)).map(profile2el('character'))
    );

    U.addEls(
        U.clearEl(U.queryEl(`${root} .entity-list.player-list`)),
        playerNames.filter(filter(bondedPlayerList)).map(profile2el('player'))
    );

    const bindings = R.toPairs(profileBindings).map(binding => ({
        name: R.join('/', binding),
        value: binding
    }));
    bindings.sort(CU.charOrdAFactory(R.prop('name')));

    U.addEls(U.clearEl(U.queryEl(`${root} .entity-list.binding-list`)), bindings.map(binding2el));
}

const profile2el = R.curry((type, name) => {
    const content = U.makeEl('div');
    ReactDOM.render(getProfileItem(), content);
    const el =  U.qee(content, '.ProfileItem');

    // const el = U.qmte(`${root} .profile-item-tmpl`);
    el.profileName = name.value;
    const btn = U.qee(el, '[role=button]');
    U.addEl(U.qee(el, '.primary-name'), U.makeText(name.displayName));
    U.setAttr(btn, 'profile-name', name.value);
    U.setAttr(btn, 'primary-name', name.displayName);
    U.setAttr(btn, 'profile-type', type);
    U.listen(btn, 'dragstart', onDragStart);
    U.listen(btn, 'drop', onDrop);
    U.listen(btn, 'dragover', allowDrop);
    U.listen(btn, 'dragenter', handleDragEnter);
    U.listen(btn, 'dragleave', handleDragLeave);
    return el;
});

// eslint-disable-next-line no-var,vars-on-top
var onDragStart = function (event) {
    console.log(`onDragStart ${this.profileName}`);
    event.dataTransfer.setData('data', JSON.stringify({
        name: U.getAttr(this, 'profile-name'),
        type: U.getAttr(this, 'profile-type'),
    }));
    event.dataTransfer.effectAllowed = 'move';
};

// eslint-disable-next-line no-var,vars-on-top
var onDrop = function (event) {
    U.removeClass(this, 'over');
    console.log(`onDrop ${this.profileName}${event.dataTransfer.getData('data')}`);
    if (event.stopPropagation) {
        event.stopPropagation(); // stops the browser from redirecting.
    }
    const thatData = JSON.parse(event.dataTransfer.getData('data'));
    if (thatData.type === U.getAttr(this, 'profile-type')) {
        return;
    }

    createBinding([thatData, {
        name: U.getAttr(this, 'profile-name'),
        type: U.getAttr(this, 'profile-type'),
    }]);
};

// eslint-disable-next-line no-var,vars-on-top
var allowDrop = function (event) {
    console.log(`allowDrop ${this.profileName}`);
    event.preventDefault();
};

function handleDragEnter(event) {
    U.addClass(this, 'over');
}

function handleDragLeave(event) {
    U.removeClass(this, 'over');
}

function binding2el(binding) {
    const content = U.makeEl('div');
    ReactDOM.render(getBindingItem(), content);
    const el = U.qee(content, '.BindingItem');

    // const el = U.wrapEl('div', U.qte(`${root} .binding-item-tmpl`));
    U.addEl(U.qee(el, '.primary-name'), U.makeText(binding.name));
    U.setAttr(el, 'primary-name', binding.name);
    U.setAttr(U.qee(el, '.unlink'), 'title', l10n('unlink-binding'));
    U.listen(U.qee(el, '.unlink'), 'click', () => removeBinding(binding.value));
    return el;
}

// eslint-disable-next-line no-var,vars-on-top
var filterList = sel => (event) => {
    const str = event.target.value.toLowerCase();

    const els = U.queryEls(`${root} ${sel} [primary-name]`);
    els.forEach((el) => {
        const isVisible = U.getAttr(el, 'primary-name').toLowerCase().indexOf(str) !== -1;
        U.showEl(el, isVisible);
    });
};

function createBinding(pair) {
    const characterName = pair[0].type === 'character' ? pair[0].name : pair[1].name;
    const playerName = pair[0].type === 'player' ? pair[0].name : pair[1].name;
    DBMS.createBinding({ characterName, playerName }).then(refresh, UI.handleError);
}

function removeBinding(binding) {
    DBMS.removeBinding({
        characterName: binding[0],
        playerName: binding[1]
    }).then(refresh, UI.handleError);
}
// })(window.ProfileBinding2 = {});
