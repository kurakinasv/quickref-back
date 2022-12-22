const sequelize = require('../db');
const { DataTypes } = require('sequelize'); // для описания полей того или иного типа

// Описываем модели данных

// todo delete created_at, last_update, date_upload
const User = sequelize.define('user', {
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING },
    surname: { type: DataTypes.STRING },
    username: { type: DataTypes.STRING, unique: true },
    is_admin: { type: DataTypes.BOOLEAN, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false },
    about: { type: DataTypes.STRING },
});

const Collection = sequelize.define('collection', {
    name: { type: DataTypes.STRING, allowNull: false },
    cover_image: { type: DataTypes.STRING },
    image_amount: { type: DataTypes.INTEGER, defaultValue: 0 },
    last_update: { type: DataTypes.DATE },
    description: { type: DataTypes.STRING },
});

const Image = sequelize.define('image', {
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    date_upload: { type: DataTypes.DATE },
    source: { type: DataTypes.STRING, allowNull: false, unique: true },
    // orientation: { type: DataTypes.STRING },
});

const Category = sequelize.define('category', {
    category_name: { type: DataTypes.STRING, allowNull: false, unique: true },
    category_description: { type: DataTypes.STRING },
});

const Author = sequelize.define('author', {
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    name: { type: DataTypes.STRING },
    surname: { type: DataTypes.STRING },
    social_media: { type: DataTypes.STRING },
});

const ImageCollection = sequelize.define('image_collection', {});

// Описываем типы связей
User.hasMany(Collection);
Collection.belongsTo(User);

Category.hasMany(Image);
Image.belongsTo(Category);

Author.hasMany(Image);
Image.belongsTo(Author);

// User.belongsToMany(Image)
// Image.belongsToMany(User)

Collection.belongsToMany(Image, { through: ImageCollection });
Image.belongsToMany(Collection, { through: ImageCollection });

module.exports = {
    User,
    Collection,
    Image,
    Category,
    Author,
    ImageCollection,
};
