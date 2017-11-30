import {restUrl} from './config';
import {fetchErrorHandling} from './utils';
/**
 * Created by Denis on 13.08.2017.
 */

export const ONLINE = Symbol('change_online');
export const USER = Symbol('set_user');
export const MODULE = Symbol('set_module');
export const LOADING = Symbol('is_loading');
export const ERRORS = Symbol('set_errors');
export const MODULES = Symbol('set_modules');

/**
 *
 * @param {boolean} online
 * @return {object}
 */
export function setOnline(online) {
    return {
        type: ONLINE,
        online
    };
};

/**
 *
 * @param {object} user
 * @return {object}
 */
export function setUser(user) {
    return {
        type: USER,
        user
    };
};

/**
 *
 * @param {object} module
 * @return {object}
 */
export function setModule(module) {
    return {
        type: MODULE,
        module
    };
};

/**
 *
 * @param {Array} modules
 * @return {object}
 */
export function setModules(modules) {
    return {
        type: MODULES,
        modules
    };
};

/**
 *
 * @param {boolean} loading
 * @return {object}
 */
export function setLoading(loading) {
    return {
        type: LOADING,
        loading
    };
};

/**
 *
 * @param {Array} errors
 * @return {object}
 */
export function setErrors(errors) {
    return {
        type: ERRORS,
        errors
    };
};

/**
 *
 * @return {function(*)}
 */
export function loadModules(dispatch) {
    fetch(restUrl + '/getModules', {credentials: 'include'}).then(fetchErrorHandling('json')).then(data => {
        dispatch(setModules(
            data.map(it => {
                return {name: it.name, id: it.id, options: it.options};
            })
        ));
        dispatch(setLoading(false));
    }).catch(err => dispatch(setErrors([err])));
    return {type: null, loading: true};
};