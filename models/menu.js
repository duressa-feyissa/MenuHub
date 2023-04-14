const Joi = require('joi');
const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    ingredients: {
        type: [String]
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    allergenInformation: {
        type: String
    },
    nutritionalInformation: {
        type: [String]
    },
    vegetarian: {
        type: String,
        enum: ['Vegetarian', 'Vegan', 'Non-vegetarian'],
        required: true
    },
    images: {
        type: [String],
        default: ["food.jpeg"]
    },
    type: {
        type: String,
        enum: ['Appetizer', 'Main Course', 'Dessert'],
        required: true
    },
    availability: {
        type: String,
        enum: ['Available all day', 'Breakfast only', 'Lunch only', 'Dinner only', 'Lunch and dinner only'],
        required: true
    },
    rating: {
        type: Number,
        default: 0
    },
    reviews: {
        type: [String]
    }
});

const Menu = mongoose.model('Menu', menuItemSchema);

function validateMenuItem(menuItem) {
    const schema = Joi.object({
        hotelId: Joi.string().required(),
        name: Joi.string().required(),
        description: Joi.string(),
        ingredients: Joi.array().items(Joi.string()),
        price: Joi.number().required(),
        allergenInformation: Joi.string(),
        nutritionalInformation: Joi.array().items(Joi.string()),
        vegetarian: Joi.string().valid('Vegetarian', 'Vegan', 'Non-vegetarian').required(),
        images: Joi.array().items(Joi.string()),
        type: Joi.string().valid('Appetizer', 'Main Course', 'Dessert').required(),
        availability: Joi.string().valid('Available all day', 'Breakfast only', 'Lunch and dinner only').required(),
        rating: Joi.number().default(0),
        reviews: Joi.array().items(Joi.string())
    });
    return schema.validate(menuItem);
}

module.exports.Menu = Menu;
module.exports.validate = validateMenuItem;
