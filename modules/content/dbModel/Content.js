/**
 * Created by Denis on 31.08.2017.
 */
module.exports = function (Sequelize, DataTypes) {
    let Content = Sequelize.define('Content', {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        parent: {type: DataTypes.INTEGER},
        name: {type: DataTypes.STRING(255)},
        text: {type: DataTypes.TEXT},
        alias: {type: DataTypes.STRING(255), unique: true},
        active: {type: DataTypes.BOOLEAN},
        priority: {type: DataTypes.INTEGER},
        type: {type: DataTypes.INTEGER(1), defaultValue: 0},
        author: {type: DataTypes.INTEGER}
    }, {
        timestamps: true,
        underscored: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
        indexes: [
            {method: 'BTREE', fields: ['parent']},
            {method: 'BTREE', fields: ['type', 'active']},
            {method: 'BTREE', fields: ['priority']}
        ]
    });

    /**
     * Ассоциации с внешними моделями
     * @param {Object} models
     */
    Content.associate = function(models) {
        Content.belongsTo(models.Images);
        Content.hasMany(models.Meta);
    };

    return Content;
};