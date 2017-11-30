/**
 * Created by Denis on 21.05.2017.
 */
import ModelAdapter from '../../../core/Base';
import {restUrl} from '../../../../admin/js/config';
import {fetchErrorHandling, dataURItoFile} from '../../../../admin/js/utils';

export default class Content extends ModelAdapter {
    constructor({id = null, parent = null, name = '', text = '', active = false, priority = 0, Image = null, type = 0, alias = '', author = 0, Meta = []} = {}) {
        super();
        this.id = id;
        this.parent = parent;
        this.name = name;
        this.text = text;
        this.active = active;
        this.priority = priority;
        this.Image = Image;
        this.type = type;
        this.alias = alias;
        this.author = author;
        this.Meta = Meta;
    }

    /**
     * Формирование тела для запроса сохранения
     * @return {FormData}
     */
    getSaveBody() {
        let body = new FormData();
        Object.getOwnPropertyNames(this).forEach(name => {
            this.appendWithName(body, name, this[name]);
        });
        return body;
    }

    appendWithName(body, name, val){
        if (val != null) {
            if (name == 'Image' && val.path) {
                body.append('Image.path', dataURItoFile(val.path, val.name));
            } else if (name == 'Meta') {
                val.forEach(m => {
                    if (m.value != null) {
                        body.append('Meta.' + m.type, m.value);
                    }
                });
            } else if (typeof val != 'object') {
                body.append(name, val);
            } else {
                Object.getOwnPropertyNames(val).forEach(innerName => {
                    this.appendWithName(body, name + '.' + innerName, val[innerName]);
                });
            }
        }
    }

    /**
     * Плучение рекурсивно всех родителей
     * @return {Promise}
     */
    getParentsRecursive() {
        return fetch(`${restUrl}/${this.constructor.postUrl}/getParentRecursive/${this.type}/${this.id}`, {credentials: 'include'}).then(fetchErrorHandling('json')).then(res => {
            return res.map(it => new Content(it));
        });
    };

    /**
     * Получение всех элементов модели по id
     * @param {number} id
     * @param {number} type
     * @return {Promise}
     */
    static async getAll(id = 0, type = 0) {
        return fetch(`${restUrl}/${this.postUrl}/${type}/${id}/all`, {credentials: 'include'}).then(fetchErrorHandling('json')).then((res) => {
            if (res) {
                return res.map(item => new this(item));
            } else throw new Error('Some problem');
        });
    }

    /**
     * Проверка алиаса
     * @param {number} id
     * @param {string} alias
     * @return {Promise}
     */
    static async checkAlias(id = 0, alias = ''){
        return fetch(`${restUrl}/${this.postUrl}/checkAlias/${id}/${alias}`, {credentials: 'include'}).then(fetchErrorHandling()).then((res) => {
            if (isNaN(parseInt(res)) || parseInt(res)){
                throw new Error('Alias is incorrect');
            } else return true;
        });
    }

    /**
     * Удаление нескольких элементов
     * @param {Array} items
     * @return {Promise}
     */
    static async deleteItems(items) {
        return fetch(`${restUrl}/${this.postUrl}/deleteItems`, {credentials: 'include', method: 'POST', body: new Uint8Array(items.map(it => it.id))}).then(fetchErrorHandling()).then((res) => {
            if (res) return res;
            else throw new Error('Some problem');
        });
    }
};


Content.postUrl = 'content';