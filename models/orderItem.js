const mongoose = require('mongoose');
const Joi = require('joi');

const orderItemSchema = new mongoose.Schema({
  menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
  },
  quantity: {
      type: Number,
      min: 1,
      required: true
  },
  specialInstructions: {
      type: String
  },
  price: {
      type: Number,
      default: 0,
      required: true
  },
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

function validateOrderItem(orderItem) {
    const schema = Joi.object({
        menuItemId: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
        specialInstructions: Joi.string(),
        price: Joi.number().required(),
    })
}

exports.orderItemSchema = orderItemSchema;
exports.validate = validateOrderItem;
exports.OrderItem = OrderItem;
