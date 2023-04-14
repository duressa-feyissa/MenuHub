const mongoose = require('mongoose');
const Joi = require('joi'); 

const customerSchema = new mongoose.Schema({
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
    default: 'customer.png' 
  }
});

customerSchema.methods.generateToken = function () {
  const data = {
      _id: this._id, 
      firstName: this.firstName, 
      lastName: this.lastName,
      image: this.image,
  }
  const token = jwt.sign(data, '1234');
  return token;
}

const Customer = mongoose.model('Customer', customerSchema);

function validateCustomer(customer) { 
  const schema = Joi.object({
    firstName: Joi.string().min(4).max(50).required(),
    lastName: Joi.string().min(4).max(50).required(),
    email: Joi.string().required().email(),
    phoneNumber: Joi.string().required(),
    password: Joi.string().min(3).max(50).required(),
    image: Joi.string().default('customer.png')
  });

  return schema.validate(customer);
}

function validateCustomerUpdate(waiter) { 
  const schema = Joi.object({
      firstName: Joi.string().min(4).max(50).required(),
      lastName: Joi.string().min(4).max(50).required(),
      phoneNumber: Joi.string().required(),
  });
  return schema.validate(waiter);
}

exports.validate = validateCustomer;
exports.Customer = Customer;
exports.validateCustomerUpdate = validateCustomerUpdate;
