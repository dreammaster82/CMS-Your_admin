/**
 * Created by Denis on 13.05.2017.
 */
'use strict';
import {restUrl} from '../../admin/js/config';
import {fetchErrorHandling} from '../../admin/js/utils';

/**
 * Базовый клас для работы с моделями
 */
export default class Base{
    async save(){
        return new Promise((r, rj) => {
            let body;
            if (this.getSaveBody) body = this.getSaveBody();
            else {
                body = new FormData();
                Object.getOwnPropertyNames(this).forEach(name => {
                    if(this[name] != null) body.append(name, this[name]);
                });
            }
            if (!(body instanceof Promise)) {
                body = Promise.resolve(body);
            }
            body.then(body => {
                fetch(`${restUrl}/${this.constructor.postUrl}${this.constructor.type ? '/' + this.constructor.type : ''}/save`, {method: 'post', body: body, credentials: 'include'}).then(fetchErrorHandling('json')).then((res) => {
                    if (res) {
                        r(new this.constructor(res));
                    }
                }).catch((err) => {
                    rj(err);
                });
            });
        });
    }

    /**
     * Удаление элемента
     * @return {Promise}
     */
    async delete() {
        return new Promise((r, rj) => {
            if (!this.id) throw new Error('Mark not found');

            fetch(`${restUrl}/${this.constructor.postUrl}${this.constructor.type ? '/' + this.constructor.type : ''}/${this.id}`, {method: 'delete', credentials: 'include'}).then(fetchErrorHandling()).then((res) => {
                if (res) r(res);
                else rj(new Error('Some problem'));
            }).catch((err) => {
                rj(err);
            });
        });
    }

    /**
     * Получение элемента по id
     * @param {number} id
     * @return {Promise}
     */
    static async getById(id) {
        return new Promise((r, rj) => {
            fetch(`${restUrl}/${this.postUrl}${this.type ? '/' + this.type : ''}/${id}`, {credentials: 'include'}).then(fetchErrorHandling('json')).then((res) => {
                if (res) {
                    r(new this(res));
                } else rj('Some problem');
            }).catch((err) => {
                rj(err);
            });
        });
    }

    /**
     * Получение всех элементов модели
     * @return {Promise}
     */
    static async getAll(){
        return new Promise((r, rj) => {
            fetch(`${restUrl}/${this.postUrl}${this.type ? '/' + this.type : ''}/all`, {credentials: 'include'}).then(fetchErrorHandling('json')).then((res) => {
                if(res){
                    r(res.map(item => new this(item)));
                } else rj('Some problem');
            }).catch((err) => {
                rj(err);
            });
        });
    }
};