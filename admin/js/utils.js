/**
 * Created by Denis on 07.05.2017.
 */
"use strict";

/**
 *
 * @param {string | object}obj
 * @return {string | object}
 */
export function getQueryString(obj) {
    if (typeof obj == 'string') return encodeURI(obj);
    else {
        const params = new URLSearchParams();
        Object.entries(obj).forEach(entrie => params.append(entrie[0], entrie[1]));
        return params;
    }
}

/**
 *
 * @param {string} type
 * @return {Function}
 */
export function fetchErrorHandling(type = 'text') {
    return function (res) {
        if (!res.ok) {
            res.text().then((err) => {
                throw new Error(err)
            });
        }
        if (res[type]) return res[type]();
        else return res.text();
    };
};

/**
 * Преобразование Data URL в двоичное представление файла
 * @param dataURI
 * @param name
 * @return {File}
 */
export function dataURItoFile(dataURI, name) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    let parts = dataURI.split(',')
    let byteString = atob(parts[1]);

    // separate out the mime component
    let mimeString = parts[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    let ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    return typeof File != 'undefined' ? new File([ia], name, {type: mimeString}) : new Blob([ia], {type: mimeString});
};

/**
 * Преобразует строку в Uint8Array
 * @param {string} str
 * @return {Uint8Array}
 */
export function str2ab(str) {
    let buf = new ArrayBuffer(str.length); // 2 bytes for each char
    let bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return bufView;
}

/**
 * Преобразует Uint8Array в строку
 * @param {Uint8Array} buf
 * @return {string}
 */
export function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

/**
 * Конвертирует кирилицу в транслит
 * @param {string} str
 * @param {string} spaceReplacement
 * @return {string}
 */
export function translit(str, spaceReplacement) {
    var _associations = {
        "а": "a",
        "б": "b",
        "в": "v",
        "ґ": "g",
        "г": "g",
        "д": "d",
        "е": "e",
        "ё": "e",
        "є": "ye",
        "ж": "zh",
        "з": "z",
        "и": "i",
        "і": "i",
        "ї": "yi",
        "й": "i",
        "к": "k",
        "л": "l",
        "м": "m",
        "н": "n",
        "о": "o",
        "п": "p",
        "р": "r",
        "с": "s",
        "т": "t",
        "у": "u",
        "ф": "f",
        "x": "h",
        "ц": "c",
        "ч": "ch",
        "ш": "sh",
        "щ": "sh'",
        "ъ": "",
        "ы": "i",
        "ь": "",
        "э": "e",
        "ю": "yu",
        "я": "ya"
    };

    if (!str) {
        return "";
    }

    var new_str = "";
    for (var i = 0; i < str.length; i++) {
        var strLowerCase = str[i].toLowerCase();
        if (strLowerCase === " " && spaceReplacement) {
            new_str += spaceReplacement;
            continue;
        }
        if (!_associations[strLowerCase]) {
            new_str += strLowerCase;
        }
        else {
            new_str += _associations[strLowerCase];
        }
    }
    return new_str;

};