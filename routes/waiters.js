const { Waiter, validate, validateWaiterUpdate } = require('../models/waiter');
const { Hotel } = require('../models/hotel');
const { OrderTable } = require('../models/orderTable');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const upload = require('../middleWare/upload');
const authenticate = require('../middleWare/authentication');
const authorize = require('../middleWare/authorization');
const QRCode = require('qrcode');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const waiter = await Waiter.find().select('-password');
  res.send(waiter);
});

router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).send('Invalid waiter Id');
  
  let waiter = await Waiter.findById(req.params.id).select('-password');
  if (!waiter)
      return res.status(404).send('waiter not found');
  res.send(waiter);
});

router.post('/', authenticate, authorize(['Hotel']), async (req, res) => {
  const { error } = validate(req.body);
  if (error) 
    return res.status(400).send(error.details[0].message);
  
  if (!mongoose.isValidObjectId(req.body.hotelId))
    return res.status(400).send('Invalid hotel Id');

  const hotelId = await Hotel.findById(req.body.hotelId);
  if (!hotelId)
    return res.status(400).send('Hotel not found');

  let waiter = await Waiter.findOne({email: req.body.email}); 
  
  if (waiter)
    return res.status(400).send('Waiter already registered!');

  waiter = new Waiter(_.pick(req.body, ['firstName', 'lastName', 'email', 'password', 'phoneNumber', 'hotelId']));
  const salt = await bcrypt.genSalt(10);
  waiter.password = await bcrypt.hash(waiter.password, salt);
  waiter = await waiter.save();
  const token = waiter.generateToken();
  waiter = _.omit(waiter.toObject(), 'password');
  res.header('x-auth-token', token).send(waiter);
});

router.put('/:id', authenticate, authorize(['Waiter']), async (req, res) => {
  const { error } = validateWaiterUpdate(req.body);
  if (error) 
    return res.status(400).send(error.details[0].message);
  
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).send('Invalid waiter Id');
  
  if (!mongoose.isValidObjectId(req.body.hotelId))
    return res.status(400).send('Invalid hotel Id');

  const hotelId = await Hotel.findById(req.body.hotelId);
    if (!hotelId)
        return res.status(404).send('The hotel with given ID not found\n');
  
  let waiter = await Waiter.findById(req.params.id);
  if (!waiter)
      return res.status(404).json({ error: 'Waiter not found' });

  waiter.firstName = req.body.firstName;
  waiter.lastName = req.body.lastName;
  waiter.phoneNumber = req.body.phoneNumber;
  waiter = await waiter.save();
  waiter = _.omit(waiter.toObject(), 'password');
  res.send(waiter);
});

router.delete('/:id', authenticate, authorize(['Hotel']), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).send('Invalid waiter Id');
  
  const waiter = await Waiter.findByIdAndRemove(req.params.id).select('-password');
  if (!waiter)
      return res.status(404).send('waiter not found');
  res.send(waiter);
});

router.post('/:id/profile-image', authenticate, authorize(['Waiter']), upload.single('image'), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).send('Invalid waiter Id');
  
  let waiter = await Waiter.findById(req.params.id);
  if (!waiter)
      return res.status(404).json({ error: 'Waiter not found' });
  
  const file = req.file;
  const newImage = req.file.filename;

  if (!file)
      return res.status(400).send('No file found');
  waiter.image = newImage;
  waiter = await waiter.save();
  res.status(200).send('Profile image uploaded successfully');
});

router.post('/:id/confirm', authenticate, authorize(['Waiter']), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).send('Invalid waiter Id');
  
  let waiter = await Waiter.findById(req.params.id);
  if (!waiter)
    return res.status(404).json({ error: 'Waiter not found'});

  if (!mongoose.isValidObjectId(req.body.orderId))
    return res.status(400).send('Invalid order Id');

  let order = await OrderTable.findById(req.body.orderId);
  if (!order)
    return res.status(404).json({ error: 'oder not found'});
  
  if (order.status != 'Placed')
    return res.status(400).send('order already confirmed or cancelled or ready');
  order.status = "Confirmed";
  order = await order.save();
  res.status(200).send(order);
});

router.post('/:id/cancel', authenticate, authorize(['Waiter']), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).send('Invalid waiter Id');
  
  let waiter = await Waiter.findById(req.params.id);
  if (!waiter)
    return res.status(404).json({ error: 'Waiter not found'});

  if (!mongoose.isValidObjectId(req.body.orderId))
    return res.status(400).send('Invalid order Id');

  let order = await OrderTable.findById(req.body.orderId);
  if (!order)
    return res.status(404).json({ error: 'oder not found'});
  
  if (order.status != 'Placed')
    return res.status(400).send('order already confirmed or cancelled or ready');
  order.status = "Cancelled";
  order = await order.save();
  res.status(200).send(order);
});

module.exports = router;
