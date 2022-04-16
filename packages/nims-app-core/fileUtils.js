import dateFormat from 'dateformat';
import { saveAs } from 'file-saver';
import * as R from 'ramda';
import { CU } from 'nims-dbms-core';
import UI from './uiUtils';
import L10n from './l10n';

export function makeNewBase(base) {
  return new Promise((resolve, reject) => {
    UI.confirm(L10n.getValue('utils-new-base-warning'), () => {
      DBMS.setDatabase({ database: R.clone(base) }).then(() => {
        resolve(true);
        // TestUtils.addGroupTestingData();
      }).catch(reject);
    }, () => resolve(false));
  });
}

export function openHelp() {
  window.open('extras/doc/nims.html');
}

export function readSingleFile(evt) {
  return new Promise((resolve, reject) => {
    // Retrieve the first (and only!) File from the FileList object
    const f = evt.target.files[0];

    if (f) {
      const r = new FileReader();
      r.onload = (e) => {
        const contents = e.target.result;
        try {
          const database = JSON.parse(contents);
          resolve(database);
        } catch (err) {
          reject(err);
        }
      };
      r.readAsText(f);
    } else {
      UI.alert(L10n.getValue('utils-base-file-loading-error'));
      reject();
    }
  });
}

export function saveFile() {
  DBMS.getDatabase().then((database) => {
    json2File(database, makeFileName(`${PROJECT_NAME}_${database.Meta.name}`, 'json', new Date(database.Meta.saveTime)));
  }).catch(UI.handleError);
}

export function makeFileName(root, extension, date) {
  date = date || new Date();
  const timeStr = dateFormat(date, 'dd-mmm-yyyy_HH-MM-ss');
  const fileName = `${root}_${timeStr}`;
  return `${CU.sanitizeStr2FileName(fileName)}.${extension}`;
}

export function json2File(str, fileName) {
  str2File(JSON.stringify(str, null, '  '), fileName);
}

export function str2File(str, fileName) {
  const blob = new Blob([str], {
    type: 'text/plain;charset=utf-8'
  });
  saveAs(blob, fileName);
}

function preprocessCsvStr(str) {
  if (!(typeof str === 'string' || str instanceof String)) {
    return str;
  }
  let result = str.replace(/"/g, '""');
  if (result.search(/("|,|\n)/g) >= 0) {
    result = `"${result}"`;
  }
  return result;
}

export function arr2d2Csv(arr, fileName) {
  const csv = `\ufeff${arr.map((dataArray) => dataArray.map(preprocessCsvStr).join(';')).join('\n')}`;

  const out = new Blob([csv], {
    type: 'text/csv;charset=utf-8;'
  });
  saveAs(out, makeFileName(fileName, 'csv'));
}
