const { Chief, validate, validateChiefUpdate } = require('../models/chief');
const { Hotel } = require('../models/hotel');
const { OrderTable } = require('../models/orderTable');
const authenticate = require('../middleWare/authentication');
const authorize = require('../middleWare/authorization');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const upload = require('../middleWare/upload');
const QRCode = require('qrcode');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const chief = await Chief.find().select('-password');
  res.send(chief);
});

router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).send('Invalid chief Id');
  
  let chief = await Chief.findById(req.params.id).select('-password');
  if (!chief)
      return res.status(404).send('chief not found');
  res.send(chief);
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

  let chief = await Chief.findOne({email: req.body.email}); 
  
  if (chief)
    return res.status(400).send('Chief already registered!');

  chief = new Chief(_.pick(req.body, ['firstName', 'lastName', 'email', 'password', 'phoneNumber', 'hotelId']));
  const salt = await bcrypt.genSalt(10);
  chief.password = await bcrypt.hash(chief.password, salt);
  chief = await chief.save();
  const token = chief.generateToken();
  chief = _.omit(chief.toObject(), 'password');
  res.header('x-auth-token', token).send(chief);
});

router.put('/:id', authenticate, authorize(['Chief']), async (req, res) => {
  const { error } = validateChiefUpdate(req.body);
  if (error) 
    return res.status(400).send(error.details[0].message);
  
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).send('Invalid Chief Id');
  
  if (!mongoose.isValidObjectId(req.body.hotelId))
    return res.status(400).send('Invalid hotel Id');

  const hotelId = await Hotel.findById(req.body.hotelId);
    if (!hotelId)
        return res.status(404).send('The hotel with given ID not found\n');
  
  let chief = await Chief.findById(req.params.id);
  if (!chief)
      return res.status(404).json({ error: 'chief not found' });

  chief.firstName = req.body.firstName;
  chief.lastName = req.body.lastName;
  chief.phoneNumber = req.body.phoneNumber;
  chief = await chief.save();
  chief = _.omit(chief.toObject(), 'password');
  res.send(chief);
});

router.delete('/:id', authenticate, authorize(['Hotel']), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).send('Invalid Chief Id');
  
  const chief = await Chief.findByIdAndRemove(req.params.id).select('-password');
  if (!chief)
      return res.status(404).send('Chief not found');
  res.send(chief);
});

router.post('/:id/profile-image', authenticate, authorize(['Chief']), upload.single('image'), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).send('Invalid chief Id');
  
  let chief = await Chief.findById(req.params.id);
  if (!chief)
      return res.status(404).json({ error: 'chief not found' });
  
  const file = req.file;
  const newImage = req.file.filename;

  if (!file)
      return res.status(400).send('No file found');
  chief.image = newImage;
  chief = await chief.save();
  res.status(200).send('Profile image uploaded successfully');
});

router.post('/:id/ready', authenticate, authorize(['Chief']), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).send('Invalid chief Id');
  
  let chief = await Chief.findById(req.params.id);
  if (!chief)
    return res.status(404).json({ error: 'chief not found'});

  if (!mongoose.isValidObjectId(req.body.orderId))
    return res.status(400).send('Invalid order Id');

  let order = await OrderTable.findById(req.body.orderId);
  if (!order)
    return res.status(404).json({ error: 'oder not found'});
  
  if (order.status != 'Confirmed')
    return res.status(400).send('order already cancelled or ready');
  order.status = "Ready";
  order = await order.save();
  res.status(200).send(order);
});

module.exports = router;
