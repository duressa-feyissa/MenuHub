const mongoose = require('mongoose');
const Joi = require('joi');

const tableSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  waiterId: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Waiter',
    required: true
  },
  tableNubmer: {
    type: Number,
    require: true,
    min: 0
  }  
});

const Table = mongoose.model('table', tableSchema);

function validateTable(table) { 
  const schema = Joi.object({
    waiterId: Joi.array().items(Joi.string().required()).required(),
    tableNumber: Joi.number().required().min(0)
  });
  return schema.validate(table);
}

exports.validate = validateTable;
exports.Table = Table;

