import ReactDOM from 'react-dom';
import { getProfileEditorContainer, getProfileEditorRow } from "../profiles2/ProfileEditorCoreTemplate.jsx";
import { UI, U, L10n } from 'nims-app-core';

export const makeProfileTable = (Constants, profileStructure, profile) => {
    // const container = U.qmte('.profile-editor-container-tmpl');
    const content = U.makeEl('div');
    ReactDOM.render(getProfileEditorContainer(), content);
    const container =  U.qee(content, '.ProfileEditorContainer');

    U.addClass(container, 'profile-table');
    let value;
    return U.addEls(container, profileStructure.filter((element) => element.doExport).map((element) => {
        switch (element.type) {
        case 'text':
            value = U.addClass(U.makeEl('span'), 'briefingTextSpan');
            U.addEl(value, U.makeText(profile[element.name]));
            break;
        case 'enum':
        case 'multiEnum':
        case 'number':
        case 'string':
            value = U.makeText(profile[element.name]);
            break;
        case 'checkbox':
            value = U.makeText(L10n.const(Constants[profile[element.name]]));
            break;
        default:
            throw new Error(`Unexpected type ${element.type}`);
        }

        const content = U.makeEl('div');
        ReactDOM.render(getProfileEditorRow(), content);
        const row =  U.qee(content, '.ProfileEditorRow');

        // const row = U.qmte('.profile-editor-row-tmpl');
        U.addEl(U.qee(row, '.profile-item-name'), U.makeText(element.name));
        U.addEl(U.qee(row, '.profile-item-input'), value);
        return row;
    }));
};

export const createModalDialog = (root, onAction, opts) => {
    const commons = '.dialog-commons ';
    const el2 = U.wrapEl('div', U.qte(`${commons} .request-data-dialog-tmpl`));
    const el = U.qee(el2, '.modal');
    if (opts.dialogClass !== undefined) {
        U.addClass(el, opts.dialogClass);
    }
    const body = U.qee(el, '.modal-body');
    let bodyContent;
    if(opts.bodySelector){
        bodyContent = U.qte(`${commons} .${opts.bodySelector}`);
    } else {
        const content = U.makeEl('div');
        ReactDOM.render(opts.getComponent(), content);
        bodyContent = U.qee(content, opts.componentClass);
    }

    U.addEl(body, bodyContent);
    if (opts.body !== undefined) {
        R.toPairs(opts.body).map((pair) => U.setAttr(U.qee(body, pair[0]), 'l10n-id', pair[1]));
    }
    if (opts.initBody !== undefined) {
        opts.initBody(body);
    }
    U.addEl(body, U.qte(`${commons} .modal-error-block`));
    U.setAttr(U.qee(el, '.modal-title'), 'l10n-id', opts.dialogTitle);
    U.setAttr(U.qee(el, '.on-action-button'), 'l10n-id', opts.actionButtonTitle);
    L10n.localizeStatic(el);
    U.listen(U.qee(el, '.on-action-button'), 'click', onAction(el));
    el.showDlg = () => {
        UI.clearError(el);
        $(el).modal('show');
        const focusable = U.qee(body, '.focusable');
        if (focusable !== null) {
            setTimeout(() => focusable.focus(), 500);
        }
    };
    const onenterable = U.qees(body, '.onenterable');
    if (onenterable.length !== 0) {
        onenterable.forEach(U.listenOnEnter(R.__, onAction(el)));
    }
    el.hideDlg = () => $(el).modal('hide');
    U.listen(U.qee(el, '.on-cancel-button'), 'click', () => {
        el.hideDlg();
        if (opts.onCancel) opts.onCancel();
    });
    U.listen(U.qee(el, '.on-close-button'), 'click', () => {
        el.hideDlg();
        if (opts.onCancel) opts.onCancel();
    });
    U.addEl(U.qe(root), el);
    return el;
};
