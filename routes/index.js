var router = require('express').Router(),
    modules = require('./modules');

module.exports = function(db) {
    let loaded = {};
    Object.entries(modules).forEach(function(entrie) {
        let moduleType = entrie[1].module || entrie[0];
        if (!loaded[moduleType]) {
            let module = require(`../modules/${moduleType}/index`);
            if (typeof module == 'function') {
                router.use('/api/' + moduleType, module(entrie[1].permissions, db));
            }
            loaded[moduleType] = true;
        }
    });

    router.get('/api/ping', function (req, res, next) {
        res.send('ok');
    });

    router.get('/api/getModules', function (req, res, next) {
        let permissions = req.session && req.session.user ? req.session.user.permissions : {},
            correctModules = Object.entries(modules).filter(function(entrie) {
                return entrie[1].permissions.some(function(val) {
                    return permissions[val];
                });
            }).map(function(entrie) {
                let ret = {name: entrie[0], id: entrie[0]};
                if (entrie[1].type || entrie[1].module || entrie[1].noParents) {
                    ret.options = {type: entrie[1].type, module: entrie[1].module, noParents: entrie[1].noParents};
                }
                return ret;
            });

        res.json(correctModules);
    });

    return router;
}
