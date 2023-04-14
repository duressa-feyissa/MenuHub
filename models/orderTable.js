const mongoose = require('mongoose');
const Joi = require('joi');

const orderSchema = new mongoose.Schema({
  customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
  },
  waiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Waiter',
      required: false
  },
  tableNumber: {
      type: Number,
      required: true
  },
  items: {
      type: [mongoose.Schema.Types.ObjectId],
      required: true
  },
  orderDate: {
      type: Date,
      default: Date.now
  },
  status: {
      type: String,
      enum: ['Placed', 'Confirmed', 'Cancelled'],
      default: 'Placed'
  },
  totalAmount: {
      type: Number,
      required: true,
      default: 0
  },
  paymentMethod: {
      type: String,
      enum: ['Cash', 'Card'],
      required: true
  },
  paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid'],
      required: true,
      default: 'Pending'
  },
});

const OrderTable = mongoose.model('OrderTable', orderSchema);

const validateOrder = (order) => {
    const schema = Joi.object({
        customerId: Joi.string().required(),
        waiterId: Joi.string(),
        tableNumber: Joi.number().required(),
        items: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).required(),
        orderDate: Joi.date().default(Date.now, 'current date'),
        status: Joi.string().valid('Placed', 'Confirmed', 'Cancelled').default('Placed'),
        totalAmount: Joi.number().required().default(0),
        paymentMethod: Joi.string().valid('Cash', 'Card').required(),
        paymentStatus: Joi.string().valid('Pending', 'Paid').required().default('Pending')
    });
    return schema.validate(order);
};

exports.OrderTable = OrderTable;
exports.validate = validateOrder;
