'use strict';

function getMgmt(db) {
    return db && db.database ? db.database.ManagementInfo : null;
}

function getAdminName(db) {
    const mgmt = getMgmt(db);
    return mgmt ? mgmt.admin || '' : '';
}

function getEditorName(db) {
    const mgmt = getMgmt(db);
    return mgmt ? mgmt.editor || '' : '';
}

function isAdmin(user, db) {
    return user && user.role === 'organizer' && user.name === getAdminName(db);
}

function isEditor(user, db) {
    const editor = getEditorName(db);
    return editor && user && user.name === editor;
}

function isOrganizer(user) {
    return user && user.role === 'organizer';
}

function isPlayer(user) {
    return user && user.role === 'player';
}

function denyPlayer(user) {
    if (isPlayer(user)) {
        throw new Error('Доступ запрещён: роль player не может использовать этот инструмент');
    }
}

function requireAdmin(user, db) {
    denyPlayer(user);
    if (!isOrganizer(user)) {
        throw new Error('Доступ запрещён: требуются права организатора');
    }
    if (!isAdmin(user, db)) {
        throw new Error('Доступ запрещён: требуются права администратора');
    }
}

function requireOrganizer(user) {
    denyPlayer(user);
    if (!isOrganizer(user)) {
        throw new Error('Доступ запрещён: требуются права организатора');
    }
}

function canModifyCharacter(user, db, characterName) {
    denyPlayer(user);
    const editor = getEditorName(db);
    if (editor && user.name === editor) return true;
    if (isAdmin(user, db)) return true;
    const mgmt = getMgmt(db);
    if (!mgmt || !mgmt.UsersInfo) return true;
    const userInfo = mgmt.UsersInfo[user.name];
    if (!userInfo) return false;
    return userInfo.characters && userInfo.characters.includes(characterName);
}

function requireCharacterAccess(user, db, characterName) {
    if (!canModifyCharacter(user, db, characterName)) {
        throw new Error(`Доступ запрещён: нет прав на персонажа «${characterName}»`);
    }
}

function canModifyStory(user, db, storyName) {
    denyPlayer(user);
    const editor = getEditorName(db);
    if (editor) {
        return user.name === editor;
    }
    if (isAdmin(user, db)) return true;
    const mgmt = getMgmt(db);
    if (!mgmt || !mgmt.UsersInfo) return true;
    const userInfo = mgmt.UsersInfo[user.name];
    if (!userInfo) return false;
    return userInfo.stories && userInfo.stories.includes(storyName);
}

function requireStoryAccess(user, db, storyName) {
    if (!canModifyStory(user, db, storyName)) {
        throw new Error(`Доступ запрещён: нет прав на сюжет «${storyName}»`);
    }
}

module.exports = {
    isAdmin, isEditor, isOrganizer, isPlayer,
    denyPlayer, requireAdmin, requireOrganizer,
    requireCharacterAccess, requireStoryAccess,
    canModifyCharacter, canModifyStory,
};
