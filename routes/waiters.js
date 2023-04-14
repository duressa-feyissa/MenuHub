const { Waiter, validate, validateWaiterUpdate } = require('../models/waiter');
const mongoose = require('mongoose');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

router.get('/me', async (req, res) => {
  const waiter = await Waiter.findById(req.waiter._id).select('-password');
  res.send(waiter);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  
  if (!mongoose.isValidObjectId(req.body.hotelId))
    return res.status(400).send('Invalid hotel Id');

  if (error) 
    return res.status(400).send(error.details[0].message);
  
  let waiter = await Waiter.findOne({email: req.body.email}); 
  
  if (waiter)
    return res.status(400).send('Waiter already registered!');

  waiter = new Waiter(_.pick(req.body, ['firstName', 'lastName', 'email', 'password', 'phoneNumber', 'hotelId']));
  const salt = await bcrypt.genSalt(10);
  waiter.password = await bcrypt.hash(waiter.password, salt);
  waiter = await waiter.save();
  const token = waiter.generateToken();
  waiter = _.omit(waiter.toObject(), 'password');
  res.header('x-auth-token', token).send(_.pick(waiter));
});

router.put('/:id', async (req, res) => {
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

router.post('/:id/profile-upload', upload.single('file'), async (req, res) => {
 
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).send('Invalid waiter Id');

  if (!mongoose.isValidObjectId(req.body.hotelId))
      return res.status(400).send('Invalid hotel Id');
  
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

module.exports = router;
