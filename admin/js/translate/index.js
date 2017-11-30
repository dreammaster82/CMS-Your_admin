/**
 * Created by Denis on 26.02.2017.
 */
'use strict';
let translatorObj;
let cache = new Map();

/**
 * Иницилизация плокализатора
 * @param {object} obj
 */
export function init(obj) {
    translatorObj = obj;
};

/**
 * Переводит переданный параметр
 * @param {string} key
 * @return {string}
 */
export default function translate(key) {
    if (!translatorObj) {
        console.warn('Translator is not initiated');
        return key;
    }

    if (cache.has(key)) return cache.get(key);
    let t = key.split('.').reduce((prev, val) => {
        if (prev == null && val in translatorObj) prev = translatorObj[val];
        else if (prev != null && val in prev) prev = prev[val];
        return prev;
    }, null);

    if (t == null) throw Error('Translate is not correct');

    cache.set(key, t);
    return t;
};