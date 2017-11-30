/**
 * Created by Denis on 20.09.2017.
 */
const utils = require('../../../app/utils'),
    path = require('path');
const imagePath = global.imagePath || 'images';

class Images {
    constructor() {
    }

    /**
     * Сохранение картинки
     * @return {Promise}
     */
    async save() {

    }

    /**
     * Сохранение картинок
     * @param {Array | null} files
     * @return {Promise}
     */
    static async saveImages(files) {
        if (files.length) {
            try {
                let curDate = new Date();
                return await utils.saveFiles(files, `${imagePath}/${curDate.getFullYear()}/${curDate.getMonth() + 1}/${curDate.getDate()}`, 'image_', ['png', 'jpg', 'jpeg', 'svg', 'gif']);
            } catch (e) {
                console.log(e);
            }
        }
        return false;
    }
}
module.exports = Images;
