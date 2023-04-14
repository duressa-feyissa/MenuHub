const mongoose = require('mongoose');
const Joi = require('joi'); 

const waiterSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  firstName: {
    type: String,
    minlength: 4,
    maxlength: 50,
    required: true
  },
  lastName: {
    type: String,
    minlength: 4,
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
  password: {
    type: String,
    minlength: 3,
    maxlength: 50,
    required: true
  },
  image: {
    type: String,
    default: 'waiter.png' 
  }
});

waiterSchema.methods.generateToken = function () {
  const data = {
      _id: this._id, 
      firstName: this.firstName, 
      lastName: this.lastName,
      hotelId: this.hotelId,
      image: this.image
  }
  const token = jwt.sign(data, '1234');
  return token;
}

const Waiter = mongoose.model('Waiter', waiterSchema);

function validateWaiter(waiter) { 
  const schema = Joi.object({
    hotelId: Joi.string().required(),
    firstName: Joi.string().min(4).max(50).required(),
    lastName: Joi.string().min(4).max(50).required(),
    email: Joi.string().required().email(),
    phoneNumber: Joi.string().required(),
    password: Joi.string().min(3).max(50).required(),
    image: Joi.string().default('waiter.png')
  });
  return schema.validate(waiter);
}

function validateWaiterUpdate(waiter) { 
  const schema = Joi.object({
      hotelId: Joi.string().required(),
      firstName: Joi.string().min(4).max(50).required(),
      lastName: Joi.string().min(4).max(50).required(),
      phoneNumber: Joi.string().required(),
  });
  return schema.validate(waiter);
}

exports.validate = validateWaiter;
exports.Waiter = Waiter;
exports.validateWaiterUpdate = validateWaiterUpdate;
