const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('joi'); 
const config = require('config');

const chiefSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  firstName: {
    type: String,
    minlength: 3,
    maxlength: 50,
    required: true
  },
  lastName: {
    type: String,
    minlength: 3,
    maxlength: 50,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'Chief'
  },
  password: {
    type: String,
    minlength: 6,
    maxlength: 100,
    required: true
  },
  image: {
    type: String,
    default: 'chief.png' 
  }
});

chiefSchema.methods.generateToken = function () {
  const data = {
      _id: this._id, 
      firstName: this.firstName, 
      lastName: this.lastName,
      hotelId: this.hotelId,
      role: this.role,
      image: this.image
  }
  const token = jwt.sign(data, config.get('API_Private_Key'));
  return token;
}

const Chief = mongoose.model('chief', chiefSchema);

function validateChief(chief) { 
  const schema = Joi.object({
    hotelId: Joi.string().required(),
    firstName: Joi.string().min(3).max(50).required(),
    lastName: Joi.string().min(3).max(50).required(),
    email: Joi.string().required().email(),
    phoneNumber: Joi.string().required(),
    password: Joi.string().min(6).max(100).required(),
    image: Joi.string().default('chief.png')
  });
  return schema.validate(chief);
}

function validateChiefUpdate(chief) { 
  const schema = Joi.object({
      hotelId: Joi.string().required(),
      email: Joi.string().required().email(),
      firstName: Joi.string().min(3).max(50).required(),
      lastName: Joi.string().min(3).max(50).required(),
      phoneNumber: Joi.string().required(),
  });
  return schema.validate(chief);
}

exports.validate = validateChief;
exports.Chief = Chief;
exports.validateChiefUpdate = validateChiefUpdate;
