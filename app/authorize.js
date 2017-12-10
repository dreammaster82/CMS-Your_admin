/**
 * Created by Denis on 21.02.2017.
 */
const router = require('express').Router(),
    crypto = require('crypto'),
    md5 = require('md5'),
    utils = require('./utils');

const APP_ID = process.env.appId,
    APP_SECRET = process.env.appSecret;



module.exports = function(db) {
    const User = db['User'];
    router.use(function(req, res, next) {
        if (req.session && !req.session.user) req.session.user = {permissions: {content: ['view']}};
        next();
    });

    router.get('/api/authorize', function(req, res, next) {
        try {
            if (!db) throw Error('No connection');

            if (req.query.type && req.query.id == APP_ID) {
                if (req.query.type == 'token') {
                    if (!req.query.token) throw new Error('No token');
                    User.findOne({attributes: ['id', 'login', 'permissions', 'token', 'ref_token'], where: {token: req.query.token}}).then(user => {
                        if (!user) throw new Error('Token is not found');

                        if (req.session) {
                            req.session.user = user;
                        }
                        res.json(user);
                    }).catch(err => {
                        next(err);
                    });
                } else if (req.query.type == 'refresh_token') {
                    if (!req.query.refreshToken) throw new Error('No refreshToken');

                    User.findOne({where: {ref_token: req.query.refreshToken}}).then(user => {
                        if (!user) throw new Error('Refresh token is not found');
                        res.send(user.token);
                    }).catch(err => {
                        next(err);
                    });
                } else if (req.query.type == 'login') {
                    if (!req.query.data && !req.query.login) throw new Error('No login && password');

                    let login, password;
                    if (req.query.login) { // не включен tsl
                        ({login, password} = req.query);
                    } else {
                        // Декодируем пришедшие авторизационные данные
                        let secToKey = APP_SECRET > 16 ? APP_SECRET.slice(0, 15) : APP_SECRET + 'a'.repeat(16 - APP_SECRET.length),
                            deCipher = crypto.createDecipheriv('aes128', secToKey, secToKey),
                            decrypted = deCipher.update(utils.str2ab(req.query.data), 'utf8', 'utf8');

                        decrypted += deCipher.final('utf8');
                        let passArr;
                        [login, ...passArr] = decrypted.split(':');
                        password = passArr.join('');
                    }

                    if (!login || !password) throw new Error('Not correct login && password');

                    User.findOne({attributes: ['id', 'login', 'permissions', 'token', 'ref_token'], where: {login: login, password: db.sequelize.fn('md5', password)}}).then(user => {
                        if (!user) throw new Error('User is incorrect');

                        user.token = md5('token' + Date.now());
                        user.ref_token = md5(user.token + Date.now());

                        return user.save();
                    }).then(user => {
                        if (req.session) {
                            req.session.user = user;
                        }
                        res.json(user);
                    }).catch(err => next(err));
                }
            } else throw Error('Not correct params');
        } catch (e) {
            next(e);
        }
    });

    return router;
};
