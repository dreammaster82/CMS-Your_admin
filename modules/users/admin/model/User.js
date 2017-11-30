/**
 * Created by Denis on 21.05.2017.
 */
import ModelAdapter from '../../../core/Base';
import {restUrl, appSecret} from '../../../../admin/js/config';
import {fetchErrorHandling, str2ab, ab2str} from '../../../../admin/js/utils';

export const PERMISSIONS = {
    admin: ['edit', 'view'],
    content: ['edit', 'view']
};

export const PRESENT_TYPES = {
    administrator: {admin: ['edit', 'view'], content: ['edit', 'view']},
    content_manager: {content: ['edit', 'view']}
};

export default class User extends ModelAdapter{
    constructor({id = null, password = null, permissions = {}, login = ''} = {}){
        super();
        this.id = id;
        this.password = password;
        this.permissions = permissions;
        this.login = login;
    }

    getSaveBody(){
        return new Promise((r, rj) => {
            var body = new FormData(), arr = [];
            Object.getOwnPropertyNames(this).forEach(name => {
                if (this[name] != null) {
                    if (name == 'password') {
                        arr.push(new Promise((r1, rj1) => {
                            let cryptoObj = window.crypto || window.msCrypto,
                                secToKey = appSecret.length > 16 ? appSecret.slice(0, 15) : appSecret + 'a'.repeat(16 - appSecret.length);
                            return cryptoObj.subtle.importKey('raw', str2ab(secToKey), {name: 'AES-CBC', length: 128}, false, ['encrypt']).then((cryptoKey) => {
                                return cryptoObj.subtle.encrypt({name: 'AES-CBC', iv: str2ab(secToKey)}, cryptoKey, str2ab(this[name])).then((data) => {
                                    body.append(name, ab2str(data));
                                    r1();
                                });
                            });
                        }));
                    } else {
                        if (name == 'permissions') {
                            body.append(name, JSON.stringify(this[name]));
                        } else {
                            body.append(name, this[name]);
                        }
                        arr.push(Promise.resolve());
                    }
                }
            });
            Promise.all(arr).then(() => r(body));
        });
    }
};

/**
 * Проверка логина
 * @param {String} id
 * @param {String} login
 * @return {Promise}
 */
User.checkLogin = function(id, login) {
    return fetch(`${restUrl}/${this.postUrl}/checkLogin/${id}/${login}`, {credentials: 'include'}).then(fetchErrorHandling('text')).then((res) => {
        if (parseInt(res)) {
            throw new Error('Incorrect login');
        }
    });
};

User.postUrl = 'users';