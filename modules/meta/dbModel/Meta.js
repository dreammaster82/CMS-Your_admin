/**
 * Created by Denis on 13.09.2017.
 */
module.exports = function (Sequelize, DataTypes) {
    let Meta = Sequelize.define('Meta', {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        type: {type: DataTypes.STRING(255)},
        value: {type: DataTypes.STRING(500)}
    }, {charset: 'utf8', collate: 'utf8_general_ci', underscored: true, indexes: [{method: 'BTREE', fields: ['type']}]});

    return Meta;
};