/**
 * Created by Denis on 31.08.2017.
 */
module.exports = function (Sequelize, DataTypes) {
    return Sequelize.define('User', {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        token: {type: DataTypes.STRING(32)},
        ref_token: {type: DataTypes.STRING(32)},
        login: {type: DataTypes.STRING(32)},
        password: {type: DataTypes.STRING(32)},
        permissions: {type: DataTypes.JSON},
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci',
        indexes: [
            {method: 'BTREE', fields: ['login', 'password']},
            {method: 'BTREE', fields: ['token']},
            {method: 'BTREE', fields: ['ref_token']}
        ]
    });
};