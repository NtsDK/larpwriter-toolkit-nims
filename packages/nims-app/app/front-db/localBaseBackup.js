import dateFormat from 'dateformat';
import DemoBase from 'nims-resources/demoBase';
import EmptyBase from 'nims-resources/emptyBase';
import { LocalBackupCore } from 'nims-app-core';
import ReactDOM from 'react-dom';
import { getBackupBaseTemplate } from "./BackupBaseTemplate.jsx";
import { getSetDatabaseDialog } from "./SetDatabaseDialog.jsx";

export default function (imports) {
    const innerExports = {};
    const BACKUP_NUMBER = 4;
    const BACKUP_INTERVAL = 60000 * 10; // 10 min

    innerExports.runBaseSelectDialog = function () {
        let dbDialog = U.queryEl('.set-database-dialog');
        if (dbDialog === null) {
            const content = U.makeEl('div');
            U.addEl(U.qe('.tab-container'), content);
            ReactDOM.render(getSetDatabaseDialog(), content);
            L10n.localizeStatic(content);
            const newDialog = U.qee(content, '.set-database-dialog');
            dbDialog = newDialog;
            U.addEl(U.queryEl('body'), dbDialog);
        }

        U.listen(U.qee(dbDialog, '.on-action-button'), 'click', (event) => {
            $(dbDialog).modal('hide');
        });

        readLocalBases().then((browserBases) => {
            U.addEls(U.qee(dbDialog, '.modal-body .backup-bases'), (browserBases || []).map((base, i) => {
                const content = U.makeEl('div');
                ReactDOM.render(getBackupBaseTemplate(), content);
                const baseSelect = U.qee(content, '.BackupBaseTemplate');

                // const baseSelect = U.qmte('.backup-base-tmpl');
                const input = U.qee(baseSelect, 'input');
                U.setAttr(input, 'value', `browserBackup${i}`);
                U.setAttr(input, 'id', `dbSourceBrowserBackup${i}`);
                input.base = base;
                U.setAttr(U.qee(baseSelect, 'label'), 'for', `dbSourceBrowserBackup${i}`);
                const date = dateFormat(new Date(base.Meta.saveTime), 'dd mmm yyyy HH:MM:ss');
                U.addEl(U.qee(baseSelect, '.base-name'), U.makeText(`${base.Meta.name} (${date})`));
                return baseSelect;
            }));

            U.qee(dbDialog, 'input[name=dbSource]').checked = true;
            U.qee(dbDialog, '#dbSourceDemoBase').base = R.clone(DemoBase.data);
            U.qee(dbDialog, '#dbSourceEmptyBase').base = R.clone(EmptyBase.data);

            U.addEl(U.qee(dbDialog, '.demo-base-name'), U.makeText(DemoBase.data.Meta.name));

            const dialogOnBaseLoad = (err) => {
                if (err) { UI.handleError(err); return; }
                $(dbDialog).modal('hide');
                imports.onBaseLoaded(err);
            };

            imports.initBaseLoadBtn(U.qee(dbDialog, '.upload-db'), U.qee(dbDialog, '.upload-db input'), dialogOnBaseLoad);

            U.listen(U.qee(dbDialog, '.on-action-button'), 'click', () => {
                const { base } = U.getSelectedRadio(dbDialog, 'input[name=dbSource]');
                DBMS.setDatabase({ database: base }).then(() => {
                    dialogOnBaseLoad();
                }).catch(UI.handleError);
            });

            L10n.localizeStatic(dbDialog);

            $(dbDialog).modal({
                backdrop: 'static'
            });
        }).catch(err => console.error(err));
    };


    function readLocalBases() {
        if (!window.indexedDB) {
            UI.alert(L10n.get('errors', 'indexeddb-is-not-found'));
            return Promise.resolve(null);
        }

        let counter = 0;
        const counters = [];
        while (!R.contains(counter, counters)) {
            counters.push(counter);
            counter = (counter + 1) % BACKUP_NUMBER;
        }

        return Promise.all(counters.map(counter2 => LocalBackupCore.get(`base${counter2}`))).then((bases) => {
            bases = bases.filter(base => !R.isNil(base));
            if (bases.length === 0) {
                return null;
            }

            bases.sort(CU.charOrdAFactory(base => -new Date(base.obj.Meta.saveTime).getTime()));
            return bases.map(R.prop('obj'));
        });
    }

    function localAutoSave() {
        if (!window.indexedDB) {
            return;
        }

        makeBackup();
        setInterval(makeBackup, BACKUP_INTERVAL); // 5 min
    }
    innerExports.localAutoSave = localAutoSave;

    let counter = 0;
    function makeBackup() {
        console.log(counter + 1);
        counter = (counter + 1) % BACKUP_NUMBER;
        console.log('Starting autosave');

        DBMS.getDatabase().then((database) => {
            LocalBackupCore.put(`base${counter}`, database).then(() => {
                console.log(`Autosave OK ${new Date()}`);
                //                LocalBackupCore.get('base' + counter).then((database) => {
                //                    console.log(database);
                //                }).catch(UI.handleError);
            }).catch(UI.handleError);
        }).catch(UI.handleError);
    }
    innerExports.makeBackup = makeBackup;
    return innerExports;
};
