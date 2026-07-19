'use strict';

function getMgmt(db) {
    return db && db.database ? db.database.ManagementInfo : null;
}

function getAdmins(db) {
    const mgmt = getMgmt(db);
    if (!mgmt) return [];
    if (Array.isArray(mgmt.admins)) return mgmt.admins.filter(Boolean);
    return mgmt.admin ? [mgmt.admin] : [];
}

function getEditors(db) {
    const mgmt = getMgmt(db);
    if (!mgmt) return [];
    if (Array.isArray(mgmt.editors)) return mgmt.editors.filter(Boolean);
    return mgmt.editor ? [mgmt.editor] : [];
}

function isAdmin(user, db) {
    return user && user.role === 'organizer' && getAdmins(db).includes(user.name);
}

function isEditor(user, db) {
    return user && user.role === 'organizer' && getEditors(db).includes(user.name);
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

function ownedList(db, userName, collection) {
    const mgmt = getMgmt(db);
    if (!mgmt || !mgmt.UsersInfo) return null;
    const userInfo = mgmt.UsersInfo[userName];
    if (!userInfo) return [];
    return userInfo[collection] || [];
}

/**
 * Content mutation rules (stories/characters):
 * - editor mode ON → only assigned editors may mutate content
 * - editor mode OFF → admin may mutate anything; organizers only their owned entities
 */
function canModifyOwned(user, db, collection, entityName) {
    denyPlayer(user);
    const editors = getEditors(db);
    if (editors.length > 0) {
        return editors.includes(user.name);
    }
    if (isAdmin(user, db)) return true;
    const list = ownedList(db, user.name, collection);
    if (list === null) return true;
    return list.includes(entityName);
}

function canModifyCharacter(user, db, characterName) {
    return canModifyOwned(user, db, 'characters', characterName);
}

function requireCharacterAccess(user, db, characterName) {
    if (!canModifyCharacter(user, db, characterName)) {
        throw new Error(`Доступ запрещён: нет прав на персонажа «${characterName}»`);
    }
}

function canModifyStory(user, db, storyName) {
    return canModifyOwned(user, db, 'stories', storyName);
}

function requireStoryAccess(user, db, storyName) {
    if (!canModifyStory(user, db, storyName)) {
        throw new Error(`Доступ запрещён: нет прав на историю «${storyName}»`);
    }
}

module.exports = {
    isAdmin, isEditor, isOrganizer, isPlayer,
    denyPlayer, requireAdmin, requireOrganizer,
    requireCharacterAccess, requireStoryAccess,
    canModifyCharacter, canModifyStory,
};
