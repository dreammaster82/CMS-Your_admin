/**
 * Created by Denis on 18.02.2017.
 */
'use strict';
import Cookies from 'js-cookie';
import {restUrl} from './config';
import {getQueryString, fetchErrorHandling, ab2str, str2ab} from './utils';

let protectVars = new Map();
const APP_ID = Symbol("appId"),
    APP_SECRET = Symbol("appSecret"),
    USER = Symbol("user"),
    IS_INIT = Symbol('is_init');

/**
 *
 */
class Authorize {
    /**
     *
     * @param {string} appId
     * @param {string} appSecret
     */
    init(appId, appSecret) {
        if (!appId || !appSecret) throw Error('Ошибка авторизации');

        protectVars.set(APP_ID, appId);
        protectVars.set(APP_SECRET, appSecret);
        protectVars.set(IS_INIT, true);
    }

    /**
     *
     * @return {Promise}
     */
    async authorize() {
        let token = Cookies.get('tk');
        if (token) {
            return await this.tokenAuth(token);
        } else if (token = Cookies.get('refreshTk')) {
            let token = await this.refreshToken(token);
            let date = new Date();
            date.setDate(date.getDate() + 7);
            Cookies.set('tk', token, {path: '/', expires: date});
            return await this.tokenAuth(token);
        } else throw new Error('The authorize is fault');
    }

    /**
     *
     */
    clearAuth() {
        protectVars.delete(USER);
        Cookies.remove('refreshTk');
        Cookies.remove('tk');
    }

    /**
     *
     * @param {string} token
     * @return {Promise}
     */
    async tokenAuth(token) {
        return fetch(restUrl + '/authorize?' + getQueryString({type: 'token', token: token, id: protectVars.get(APP_ID), secret: protectVars.get(APP_SECRET)}), {credentials: 'include'})
            .then(fetchErrorHandling('json')).then(data => {
                protectVars.set(USER, data);
                if (data.refreshToken) {
                    let date = new Date();
                    date.setDate(date.getDate() + 14);
                    Cookies.set('refreshTk', data.refreshToken, {path: '/', expires: date});
                }
            });
    }

    /**
     *
     * @param {string} refreshToken
     * @return {Promise}
     */
    async refreshToken(refreshToken) {
        return fetch(restUrl + '/authorize?' + getQueryString({type: 'refresh_token', refreshToken: refreshToken, id: protectVars.get(APP_ID), secret: protectVars.get(APP_SECRET)}), {credentials: 'include'})
            .then(fetchErrorHandling());
    }

    /**
     *
     * @param {string} login Логин
     * @param {strgin} pass Пароль
     * @return {Promise}
     */
    async loginAuth(login, pass) {
        let appSecret = protectVars.get(APP_SECRET);
        if (appSecret) {
            let cryptoObj = window.crypto || window.msCrypto,
                secToKey = appSecret.length > 16 ? appSecret.slice(0, 15) : appSecret + 'a'.repeat(16 - appSecret.length);
            return cryptoObj.subtle.importKey('raw', str2ab(secToKey), {name: 'AES-CBC', length: 128}, false, ['encrypt']).then((cryptoKey) => {
                return cryptoObj.subtle.encrypt({name: 'AES-CBC', iv: str2ab(secToKey)}, cryptoKey, str2ab(login + ':' + pass)).then((data) => {
                    return fetch(restUrl + '/authorize?' + getQueryString({type: 'login', data: ab2str(data), id: protectVars.get(APP_ID), secret: appSecret}), {credentials: 'include'})
                        .then(fetchErrorHandling('json')).then(data => {
                            let date = new Date();
                            date.setDate(date.getDate() + 7);
                            if (data.token) Cookies.set('tk', data.token, {path: '/', expires: date});
                            date.setDate(date.getDate() + 7);
                            if (data.refreshToken) Cookies.set('refreshTk', data.refreshToken, {path: '/', expires: date});
                            protectVars.set(USER, data);
                            return data;
                        });
                    });
                });
        } else {
            throw Error('Not initial');
        }
    }

    /**
     *
     * @return {User}
     */
    get user() {
        return protectVars.get(USER);
    }
};

export default new Proxy(new Authorize(), {
    get(target, name) {
        if (name == 'user' || name == 'clearAuth' || name == 'init') return target[name];
        else {
            if (!protectVars.get(IS_INIT)) throw new Error('Не иницилизирован класс авторизации');
            else return target[name];
        }
    }
});