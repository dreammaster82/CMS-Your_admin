"use strict";

var router = require('express').Router(),
    Permission = require('../../app/Permissions'),
    formidable = require('formidable'),
    crypto = require('crypto'),
    md5 = require('md5'),
    utils = require('../../app/utils');

const APP_SECRET = process.env.appSecret;

module.exports = function (permissions, db) {
    const permission = new Permission(permissions),
        User = db['User'];

    router.get('/', function(req, res, next) {
        if (!permission.canView(req)) next(new Error('Permissions denied'));
        else next();
    });

    router.get('/all', function (req, res, next) {
        User.findAll({attributes: ['id', 'login', 'permissions']}).then(users => {
            res.json(users);
        }).catch(e => next(e));
    });

    router.get('/checkLogin/:id/:login', function (req, res, next) {
        User.findOne({attributes: [[db.sequelize.fn('COUNT', db.sequelize.col('id')), 'cnt']], where: {login: req.params.login, id: {$ne: req.params.id}}}).then(instance => {
            res.send(instance.get('cnt').toString());
        }).catch(e => next(e));
    });

    router.post('/save', function (req, res, next) {
        if (!permission.canEdit(req)) {
            next(new Error('Permissions denied'));
            return;
        }

        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (!fields.login) throw new Error('Password incorrect');
            else if (!fields.permissions) throw new Error('Permissions incorrect');
            User.findOne({where: {id: fields.id}}).then(user => {
                let password
                if (fields.password) {
                    let secToKey = APP_SECRET > 16 ? APP_SECRET.slice(0, 15) : APP_SECRET + 'a'.repeat(16 - APP_SECRET.length),
                        deCipher = crypto.createDecipheriv('aes128', secToKey, secToKey);

                    password = deCipher.update(utils.str2ab(fields.password), 'utf8', 'utf8');
                    password += deCipher.final('utf8');
                    password = md5(password);
                }

                if (!user) {
                    if (!password) throw new Error('Password incorrect');
                    user = User.build(Object.assign({}, fields, {password: password, permissions: JSON.parse(fields.permissions)}));
                } else {
                    if (password) user.password = password;
                    user.permissions = JSON.parse(fields.permissions);
                    user.login = fields.login;
                }
                return user.save();


            }).then(user => {
                if (req.session) {
                    req.session.user = user;
                }
                user = JSON.parse(JSON.stringify(user));
                delete user.password;
                res.json(user);
            }).catch(err => next(err));
        });
    });

    router.delete('/:id', function (req, res, next) {
        if (!permission.canEdit(req)) {
            next(new Error('Permissions denied'));
            return;
        }

        if (!req.params.id) throw new Error('Id incorrect');

        User.findById(req.params.id).then(user => {
            return user.destroy();
        }).then(() => {
            res.send('Ok');
        }).catch(err => next(err));
    });

    return router;
};
