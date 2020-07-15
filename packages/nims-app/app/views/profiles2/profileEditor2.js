import PermissionInformer from 'permissionInformer';
import ProjectUtils from 'nims-dbms/db-utils/projectUtils';
import ProfileEditorCore from './profileEditorCore';
import CharacterReports from './characterReports';
import ReactDOM from 'react-dom';
import { getEntityItem, getProfileEditorTemplate } from "./ProfileEditorTemplate.jsx";
import { createModalDialog } from "../commons/uiCommons";
import { UI, U, L10n } from 'nims-app-core';

function ProfileEditorTmpl(opts) {
    const innerExports = {};
    const { firstType, secondType, settingsPath } = opts;

    const tmplRoot = '.profile-editor2-tab-tmpl';
    const root = `.profile-editor2-tab.${`${firstType}-type`} `;
    const state = {};
    const l10n = L10n.get('profiles');
    let profileEditorCore;
    const profilePanel = `${root}.profile-panel`;
    const reportByStories = `${root}.report-by-stories`;
    const reportByRelations = `${root}.report-by-relations`;
    const profileDiv = `${root}.profile-div`;
    const reportByStoriesDiv = `${root}.report-by-stories-div tbody`;
    const reportByRelationsDiv = `${root}.report-by-relations-div tbody`;
    const alertBlock = `${root}.alert-block`;

    innerExports.init = () => {
        profileEditorCore = ProfileEditorCore.makeProfileEditorCore();

        const content = U.makeEl('div');
        U.addEl(U.qe('.tab-container'), content);
        ReactDOM.render(getProfileEditorTemplate(), content);
        L10n.localizeStatic(content);
        const el = U.qee(content, ".ProfileEditorTemplate");

        // const el = U.queryEl(tmplRoot).cloneNode(true);

        U.addClasses(el, ['profile-editor2-tab', `${`${firstType}-type`}`]);
        U.removeClass(el, 'profile-editor2-tab-tmpl');
        U.addEl(U.queryEl('.tab-container'), el);

        const createCharacterDialog = createModalDialog(
            `.profile-editor2-tab.${`${firstType}-type`}`,
            createProfile, {
                bodySelector: 'modal-prompt-body',
                dialogTitle: `profiles-${opts.createMsg}`,
                actionButtonTitle: 'common-create',
            }
        );
        U.listen(U.queryEl(`${root} .create`), 'click', () => createCharacterDialog.showDlg());
        state.renameCharacterDialog = createModalDialog(`.${`${firstType}-type`}`, renameProfile, {
            bodySelector: 'modal-prompt-body',
            dialogTitle: `profiles-${opts.renameMsg}`,
            actionButtonTitle: 'common-rename',
        });

        U.hideEl(U.qee(el, '.report-by-stories'), firstType === 'player');
        U.hideEl(U.qee(el, '.report-by-relations'), firstType === 'player');
        U.setAttr(U.qee(el, '.entity-filter'), 'l10n-placeholder-id', `profiles-${opts.filterPlaceholder}`);
        U.setAttr(U.qee(el, '.profile-panel h3'), 'l10n-id', `profiles-${opts.panelName}`);
        U.setAttr(U.qee(el, '.create'), 'l10n-title', `profiles-${opts.createProfile}`);
        U.setAttr(U.qee(el, '.alert-block'), 'l10n-id', `advices-no-${firstType}`);
        L10n.localizeStatic(el);

        U.setAttr(U.qee(el, '.report-by-stories a'), 'panel-toggler', `${root}.report-by-stories-div`);
        U.setAttr(U.qee(el, '.report-by-relations a'), 'panel-toggler', `${root}.report-by-relations-div`);
        U.setAttr(U.qee(el, '.profile-panel a'), 'panel-toggler', `${root}.profile-div`);
        UI.initPanelTogglers(el);

        innerExports.content = el;
        U.listen(U.queryEl(`${root} .entity-filter`), 'input', filterOptions);
    };

    innerExports.refresh = () => {
        Promise.all([
            PermissionInformer.getEntityNamesArray({ type: firstType, editableOnly: false }),
            PermissionInformer.getEntityNamesArray({ type: secondType, editableOnly: false }),
            DBMS.getProfileBindings()
        ]).then((results) => {
            const [primaryNames, secondaryNames, profileBindings] = results;
            const profileBindings2 = opts.processBindings(profileBindings);
            UI.enableEl(U.queryEl(`${root}.entity-filter`), primaryNames.length > 0);
            rebuildInterface(primaryNames, secondaryNames, profileBindings2);
        }).catch(UI.handleError);
    };

    function rebuildInterface(primaryNames, secondaryNames, profileBindings) {
        const secDict = R.indexBy(R.prop('value'), secondaryNames);
        U.addEls(U.clearEl(U.queryEl(`${root} .entity-list`)), primaryNames.map((name, i, arr) => {
            const content = U.makeEl('div');
            ReactDOM.render(getEntityItem(), content);
            const el = U.qee(content, '.EntityItem');

            // const el = U.wrapEl('div', U.qte(`${root} .entity-item-tmpl`));
            U.addEl(U.qee(el, '.primary-name'), U.makeText(name.displayName));
            U.setAttr(el, 'primary-name', name.displayName);
            U.setAttr(el, 'profile-name', name.value);
            if (profileBindings[name.value] !== undefined) {
                const secondaryName = secDict[profileBindings[name.value]].displayName;
                U.addEl(U.qee(el, '.secondary-name'), U.makeText(secondaryName));
                U.setAttr(el, 'secondary-name', secondaryName);
            }
            U.listen(U.qee(el, '.select-button'), 'click', () => selectProfile(name.value));
            U.setAttr(U.qee(el, '.rename'), 'title', l10n(opts.renameProfile));
            const removeBtn = U.qee(el, '.remove');
            U.setAttr(removeBtn, 'title', l10n(opts.removeProfile));
            if (i + 1 < arr.length) {
                removeBtn.nextName = arr[i + 1].value;
            }
            if (i > 0) {
                removeBtn.prevName = arr[i - 1].value;
            }
            if (name.editable) {
                U.listen(U.qee(el, '.rename'), 'click', () => {
                    U.qee(state.renameCharacterDialog, '.entity-input').value = name.value;
                    state.renameCharacterDialog.fromName = name.value;
                    state.renameCharacterDialog.showDlg();
                });
                U.listen(removeBtn, 'click', removeProfile(firstType, name.value, removeBtn));
            } else {
                U.setAttr(U.qee(el, '.rename'), 'disabled', 'disabled');
                U.setAttr(removeBtn, 'disabled', 'disabled');
            }
            return el;
        }));

        const callback = () => {
            selectProfile(UI.checkAndGetEntitySetting(settingsPath, primaryNames));
        };
        DBMS.getProfileStructure({ type: firstType }).then((allProfileSettings) => {
            profileEditorCore.initProfileStructure(profileDiv, firstType, allProfileSettings, callback);
        }).catch(UI.handleError);
    }

    function selectProfile(name) {
        U.hideEl(U.queryEl(profilePanel), name === null);
        U.hideEl(U.queryEl(reportByStories), name === null || firstType === 'player');
        U.hideEl(U.queryEl(reportByRelations), name === null || firstType === 'player');
        U.hideEl(U.queryEl(alertBlock), name !== null);

        if (name === null) {
            return;
        }

        UI.updateEntitySetting(settingsPath, name);
        U.queryEls(`${root} [profile-name] .select-button`).map(U.removeClass(R.__, 'btn-primary'));
        const el = U.queryEl(`${root} [profile-name="${name}"] .select-button`);
        U.addClass(el, 'btn-primary');

        const parentEl = el.parentElement.parentElement;
        const entityList = U.queryEl(`${root} .entity-list`);
        UI.scrollTo(entityList, parentEl);

        Promise.all([
            DBMS.getProfile({ type: firstType, name }),
            PermissionInformer.isEntityEditable({ type: firstType, name })
        ]).then((results) => {
            const [profile, isProfileEditable] = results;
            U.removeClass(U.queryEl(profileDiv), 'hidden');
            profileEditorCore.fillProfileInformation(profileDiv, firstType, profile, () => isProfileEditable);

            if (firstType === 'character') {
                showCharacterReports(name);
            }
        }).catch(UI.handleError);
    }

    function showCharacterReports(name) {
        Promise.all([
            DBMS.getCharacterReport({ characterName: name }),
            DBMS.getRelationsSummary({ characterName: name }),
        ]).then((results) => {
            const [characterReport, relationsSummary] = results;
            U.hideEl(U.queryEl(`${reportByStories} .alert`), characterReport.length !== 0);
            U.hideEl(U.queryEl(`${reportByStories} table`), characterReport.length === 0);

            if (characterReport.length !== 0) {
                U.removeClass(U.queryEl(reportByStoriesDiv), 'hidden');
                U.addEls(
                    U.clearEl(U.queryEl(reportByStoriesDiv)),
                    characterReport.map(CharacterReports.makeStoryReportRow)
                );
            }

            U.hideEl(U.queryEl(`${reportByRelations} .alert`), relationsSummary.relations.length !== 0);
            U.hideEl(U.queryEl(`${reportByRelations} table`), relationsSummary.relations.length === 0);

            if (relationsSummary.relations.length !== 0) {
                U.removeClass(U.queryEl(reportByRelationsDiv), 'hidden');
                relationsSummary.relations.sort(CU.charOrdAFactory((rel) => ProjectUtils.get2ndRelChar(name, rel).toLowerCase()));

                U.addEls(U.clearEl(U.queryEl(reportByRelationsDiv)), relationsSummary.relations
                    .map(CharacterReports.makeRelationReportRow(name)));
            }
        }).catch(UI.handleError);
    }

    function filterOptions(event) {
        const str = event.target.value.toLowerCase();

        const els = U.queryEls(`${root} [primary-name]`);
        els.forEach((el) => {
            let isVisible = U.getAttr(el, 'primary-name').toLowerCase().indexOf(str) !== -1;
            if (!isVisible && U.getAttr(el, 'secondary-name') !== null) {
                isVisible = U.getAttr(el, 'secondary-name').toLowerCase().indexOf(str) !== -1;
            }
            U.hideEl(el, !isVisible);
        });

        if (U.queryEl(`${root} .hidden[primary-name] .select-button.btn-primary`) !== null
            || U.queryEl(`${root} [primary-name] .select-button.btn-primary`) === null) {
            const els2 = U.queryEls(`${root} [primary-name]`).filter(R.pipe(U.hasClass(R.__, 'hidden'), R.not));
            selectProfile(els2.length > 0 ? U.getAttr(els2[0], 'profile-name') : null);
        } else {
            //            U.queryEl(`${root} [primary-name] .select-button.btn-primary`).scrollIntoView();
        }
    }

    function createProfile(dialog) {
        return () => {
            const input = U.qee(dialog, '.entity-input');
            const value = input.value.trim();

            DBMS.createProfile({ type: firstType, characterName: value }).then(() => {
                UI.updateEntitySetting(settingsPath, value);
                PermissionInformer.refresh().then(() => {
                    input.value = '';
                    dialog.hideDlg();
                    innerExports.refresh();
                }).catch(UI.handleError);
            }).catch((err) => UI.setError(dialog, err));
        };
    }

    function renameProfile(dialog) {
        return () => {
            const toInput = U.qee(dialog, '.entity-input');
            const { fromName } = dialog;
            const toName = toInput.value.trim();

            DBMS.renameProfile({
                type: firstType,
                fromName,
                toName
            }).then(() => {
                PermissionInformer.refresh().then(() => {
                    UI.updateEntitySetting(settingsPath, toName);
                    toInput.value = '';
                    dialog.hideDlg();
                    innerExports.refresh();
                }).catch(UI.handleError);
            }).catch((err) => UI.setError(dialog, err));
        };
    }

    function removeProfile(type, name, btn) {
        return () => {
            UI.confirm(CU.strFormat(l10n(opts.removeMsg), [name]), () => {
                DBMS.removeProfile({ type, characterName: name }).then(() => {
                    PermissionInformer.refresh().then(() => {
                        if (btn.nextName !== undefined) {
                            UI.updateEntitySetting(settingsPath, btn.nextName);
                        } else if (btn.prevName !== undefined) {
                            UI.updateEntitySetting(settingsPath, btn.prevName);
                        }
                        innerExports.refresh();
                    }).catch(UI.handleError);
                }).catch(UI.handleError);
            });
        };
    }
    return innerExports;
}

export const CharacterEditor = ProfileEditorTmpl({
    firstType: 'character',
    secondType: 'player',
    settingsPath: 'Characters',
    processBindings: R.identity,
    createMsg: 'enter-character-name',
    renameMsg: 'enter-new-character-name',
    removeMsg: 'are-you-sure-about-character-removing',
    filterPlaceholder: 'find-character',
    panelName: 'character-profile',
    createProfile: 'create-character',
    renameProfile: 'rename-character',
    removeProfile: 'remove-character',
});

export const PlayerEditor = ProfileEditorTmpl({
    firstType: 'player',
    secondType: 'character',
    settingsPath: 'Players',
    processBindings: R.invertObj,
    createMsg: 'enter-player-name',
    renameMsg: 'enter-new-player-name',
    removeMsg: 'are-you-sure-about-player-removing',
    filterPlaceholder: 'find-player',
    panelName: 'player-profile',
    createProfile: 'create-player',
    renameProfile: 'rename-player',
    removeProfile: 'remove-player',
});

// ProfileEditorTmpl(this.CharacterEditor = {}, );

// ProfileEditorTmpl(this.PlayerEditor = {}, );
