"use strict";

var router = require('express').Router(),
    Permission = require('../../app/Permissions'),
    formidable = require('formidable'),
    ImagesAdmin = require('../images/admin');

module.exports = function(permissions, db) {
    const permission = new Permission(permissions),
        Content = db['Content'],
        Images = db['Images'],
        Meta = db['Meta'];

    /**
     * Рекурсивный поиск дочерних элементов
     * @param {Array} ids - массив id элементов в которых ищутся дочерние
     * @return {Promise} - ожидание массива дочерних элементов
     */
    function findChildrenRecursive(ids) {
        let ret = [];
        return Content.findAll({where: {parent: {$in: ids}}}).then(data => {
            if (data) {
                ret = data.map(it => it.id);
            }
            return ret.length ? findChildrenRecursive(ret) : false;
        }).then(data => {
            if (data) {
                ret = ret.concat(data);
            }
            return ret;
        }).catch(err => {
            console.log(err);
            return ret;
        });
    }

    /**
     * Рекурсивное удаление элементов
     * @param {Array} itemsIds
     * @return {Promise}
     */
    function deleteContentRecursive(itemsIds) {
        return findChildrenRecursive(itemsIds).then(childrenIds => {
            itemsIds = itemsIds.concat(childrenIds);
            return db.sequelize.transaction(t => {
                return Meta.destroy({where: {content_id: {$in: itemsIds}}}, {transaction: t})
                    .then(() => Content.destroy({where: {id: {$in: itemsIds}}}, {transaction: t}));
            });
        });
    }

    /**
     * Общий обработчик для проверки прав
     */
    router.get('/', function(req, res, next) {
        if (!permission.canView(req)) next(new Error('Permissions denied'));
        else next();
    });

    /**
     * Получение всех элементов для родителя
     */
    router.get('/:type/:id/all', function(req, res, next) {
        Content.findAll({where: {parent: req.params.id, type: req.params.type}, order: ['priority'], include: [Images, Meta]}).then(items => {
            res.json(items);
        }).catch(e => next(e));
    });

    /**
     * Проверка алиаса на дублирование
     */
    router.get('/checkAlias/:id/:alias', function(req, res, next) {
        Content.findOne({attributes: [[db.sequelize.fn('COUNT', db.sequelize.col('alias')), 'cnt']], where: {alias: req.params.alias, id: {$ne: req.params.id}}}).then(instance => {
            res.send(instance.get('cnt').toString());
        }).catch(e => next(e));
    });

    /**
     * Получение по id
     */
    router.get('/:id', function(req, res, next) {
        Content.findById(req.params.id, {include: [Images, Meta]}).then(content => {
            if (content) res.json(content);
            else next(new Error('Item not found'));
        }).catch(e => next(e));
    });

    /**
     * Сохранение
     */
    router.post('/save', function(req, res, next) {
        const form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
            try {
                if (err) throw err;
                if (!fields.name) throw new Error('Name must have');
                new Promise((r, rj) => {
                    // Сохранение изображения для страницы в случае изменения или добавления
                    if (files && Object.keys(files).length) {
                        ImagesAdmin.saveImages(Object.values(files)).then(images => {
                            let savePromises = [];
                            images.forEach(image => {
                                image = Images.build({path: image.url, name: image.name});
                                savePromises.push(image.save());
                            });
                            return Promise.all(savePromises);
                        })
                            .then(images => r(images))
                            .catch(err => rj(err));
                    } else r(false);
                }).then(images => {
                    return Content.findById(fields.id).then(content => {
                        let pr;
                        if (!content) {
                            content = Content.build(fields);
                            pr = Content.max('priority').then(max => {
                                content.priority = max + 1;
                            });
                        } else {
                            Object.assign(content, fields);
                            pr = Promise.resolve();
                        }

                        if (images) {
                            content.image_id = images[0].id;
                        }

                        return pr.then(() => content.save()).then(() => {
                            content = JSON.parse(JSON.stringify(content));
                            content.Image = images[0];
                            return content;
                        });
                    }).then(content => {
                        return new Promise((r, rj) => {
                            // проверка на существование необходимых мета данных и создание при отсутствии
                            Meta.findAll({where: {content_id: content.id}}).then(metaList => {
                                let needMeta = ['title', 'description', 'keywords'], promises = [];
                                if (metaList) {
                                    metaList.forEach(it => {
                                        let index = needMeta.indexOf(it.type);
                                        if (index != -1) {
                                            if (it.value != fields['Meta.' + it.type]) {
                                                it.value = fields['Meta.' + it.type];
                                                promises.push(it.save());
                                            }
                                            needMeta.splice(index, 1);
                                        }
                                    });
                                }
                                if (needMeta.length) {
                                    needMeta.forEach(it => {
                                        if (fields['Meta.' + it]) {
                                            let meta = db['Meta'].build({type: it, value: fields['Meta.' + it], content_id: content.id});
                                            promises.push(meta.save());
                                        }
                                    });
                                }
                                if (promises.length) {
                                    Promise.all(promises)
                                        .then(meta => {
                                            content.Meta = meta;
                                            r(content);
                                        })
                                        .catch(err => rj(err));
                                } else r(content);
                            }).catch(err => rj(err));
                        });
                    });
                }).then(content => {
                    res.json(content);
                }).catch(err => next(err));
            } catch (e) {
                next(e);
            }
        });
    });

    /**
     * Удаление элемента
     */
    router.delete('/:id', function (req, res, next) {
        if (!req.params.id) throw new Error('Id incorrect');

        deleteContentRecursive([req.params.id]).then(() => {
            res.send('Ok');
        }).catch(err => next(err));
    });

    /**
     * Удаление списка элементов
     */
    router.post('/deleteItems', (req, res, next) => {
        let chank = [];
        req.on("data", function(data) {
            chank.push(data);
        });
        req.on('end', function() {
            if (chank.length) {
                let buffer = Buffer.concat(chank), items = [];
                buffer.values().forEach(it => {
                    items.push(it);
                });
                deleteContentRecursive(items).then(() => {
                    res.send('Ok');
                }).catch(err => next(err));
            } else {
                next(new Error('Data is incorrect'));
            }
        });
    });

    router.get('/getParentRecursive/:type/:id', (req, res, next) => {
        Content.findAll({attributes: ['id', 'parent'], where: {type: req.params.type}}).then(contents => {
            if (contents) {
                let map = {}, parents = [], id = req.params.id;
                contents.forEach(it => {
                    if (it.id == id) {
                        parents.push(it.parent);
                        id = it.parent;
                    }
                    map[it.id] = it.parent;
                });
                let parentId = map[id];
                while (parentId) {
                    parents.push(parentId);
                    parentId = map[parentId];
                }
                return parents;
            };
        }).then(parents => {
            if (parents) {
                return Content.findAll({where: {id: {$in: parents}}, include: [Images, Meta]});
            }
        }).then(parents => {
            res.json(parents || []);
        }).catch(e => next(e));
    });

    return router;
};
