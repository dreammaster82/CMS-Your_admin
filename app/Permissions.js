/**
 * Created by Denis on 10.05.2017.
 */
'use strict';
module.exports = exports = function Permissions(p = {}) {
    function getPermissions(req) {
        if (!req.session || !req.session.user) throw new Error('No permissions');

        return p.reduce((obj, p) => {
            if (req.session.user.permissions[p]) {
                req.session.user.permissions[p].forEach((p2) => {
                    obj[p2] = obj[p2] || [];
                    obj[p2].push(p);
                });
            }
            return obj;
        }, {});
    };

    this.canView = function (req) {
        return getPermissions(req)['view'];
    };

    this.canEdit = function (req) {
        return getPermissions(req)['edit'];
    };

    this.canAdminEdit = function (req) {
        let p = getPermissions(req);
        return p['edit'] && p['edit'].indexOf('admin') != -1;
    };
};
