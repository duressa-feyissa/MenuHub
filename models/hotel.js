const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const config = require('config');

const hotelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 100,
    },
    location: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        }
    },
    contact: {
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        socialMedia: {
            facebook: {
                type: String
            },
            twitter: {
                type: String
            },
            instagram: {
                type: String
            }
        }
    },
    images: {
        type: [String],
    },  
    role: {
        type: String,
        default: 'Hotel'
    },
    profileImage: {
        type: String,
        default: "hotel.jpeg"
    },
    star: {
        type: Number,
        required: true,
        min: 1,
        max: 7
    }
});

hotelSchema.methods.generateToken = function () {
    const data = {
        _id: this._id, 
        name: this.name, 
        profileImage: this.profileImage,
        role: this.role,
        star: this.star,
    }
    const token = jwt.sign(data, config.get('API_Private_Key'));
    return token;
}

const Hotel = mongoose.model('Hotel', hotelSchema);

function validateHotel(hotel) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        password: Joi.string().min(8).max(100).required(),
        location: Joi.object({
            address: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            country: Joi.string().required(),
            postalCode: Joi.string().required()
        }),
        contact: Joi.object({
            email: Joi.string().required(),
            phone: Joi.string().required(),
            socialMedia: Joi.object({
                facebook: Joi.string(),
                twitter: Joi.string(),
                instagram: Joi.string()
            })
        }),
        images: Joi.array().items(Joi.string()),
        profileImage: Joi.string(),
        star: Joi.number().required().min(1).max(7)
    });

    return schema.validate(hotel);
}

exports.Hotel = Hotel;
exports.validate = validateHotel;
