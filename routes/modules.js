/**
 * Created by Denis on 21.02.2017.
 */
module.exports = {
    models: {permissions: ['admin', 'content']},
    content: {permissions: ['admin', 'content']},
    articles: {module: 'content', noParents: true, type: 1, permissions: ['admin', 'content']},
    users: {permissions: ['admin', 'content']}
};