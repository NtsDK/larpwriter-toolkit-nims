// const { HttpError } = require('../../error');
// const log = require('../../libs/log')(module);

module.exports = function (LocalDBMS, opts) {
    const { R, logModule, serverSpecific } = opts;
    const log = logModule(module);

    let clients = [];

    function isAdaptationRightsByStory(db) {
        return db.ManagementInfo.adaptationRights === 'ByStory';
    }

    LocalDBMS.prototype._getOwnerMap = function (entity) {
        const allEntities = Object.keys(this.database[entity]);
        const managementInfo = this.database.ManagementInfo;
        const zeroMap = R.zipObj(allEntities, R.repeat('-', allEntities.length));
        const ownedEntities = R.mergeAll(Object.keys(managementInfo.UsersInfo).map((userName) => {
            const entityArr = managementInfo.UsersInfo[userName][entity.toLowerCase()];
            return R.zipObj(entityArr, R.repeat(userName, entityArr.length));
        }));
        return R.merge(zeroMap, ownedEntities);
    };

    const _getPermissionsSummary = function (userName) {
        const summary = { all: {}, user: {}, ownerMaps: {} };
        const managementInfo = this.database.ManagementInfo;
        summary.isAdmin = managementInfo.admin === userName;
        summary.isEditor = managementInfo.editor === userName;
        summary.existEditor = managementInfo.editor != null;
        summary.isAdaptationRightsByStory = isAdaptationRightsByStory(this.database);
        summary.all.character = Object.keys(this.database.Characters);
        summary.all.story = Object.keys(this.database.Stories);
        summary.all.group = Object.keys(this.database.Groups);
        summary.all.player = Object.keys(this.database.Players);
        summary.user.character = managementInfo.UsersInfo[userName].characters;
        summary.user.story = managementInfo.UsersInfo[userName].stories;
        summary.user.group = managementInfo.UsersInfo[userName].groups;
        summary.user.player = managementInfo.UsersInfo[userName].players;
        summary.ownerMaps.character = this._getOwnerMap('Characters');
        summary.ownerMaps.story = this._getOwnerMap('Stories');
        summary.ownerMaps.group = this._getOwnerMap('Groups');
        summary.ownerMaps.player = this._getOwnerMap('Players');

        return summary;
    };

    LocalDBMS.prototype.getPermissionsSummary = function (req, res, next) {
        if (!req.session.username) {
            setTimeout(() => next(new serverSpecific.serverErrors.HttpError(401, 'User is not authorized')), 5000);
            return;
        }

        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Content-Type', 'text/plain; charset=utf-8');
        const summary = _getPermissionsSummary.apply(this, [req.session.username]);
        res.end(JSON.stringify(summary));
    };

    LocalDBMS.prototype.subscribeOnPermissionsUpdate = function (req, res, next) {
        log.info('subscribe');

        if (!req.session.username) {
            setTimeout(() => next(new serverSpecific.serverErrors.HttpError(401, 'User is not authorized')), 5000);
            return;
        }

        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Content-Type', 'text/plain; charset=utf-8');
        clients.push(res);
        res.username = req.session.username;

        res.on('close', () => {
            clients.splice(clients.indexOf(res), 1);
        });
    };

    LocalDBMS.prototype.publishPermissionsUpdate = function () {
        const that = this;
        clients.forEach((res2) => {
            const summary = _getPermissionsSummary.apply(that, [res2.username]);
            res2.end(JSON.stringify(summary));
        });

        clients = [];
    };
};
