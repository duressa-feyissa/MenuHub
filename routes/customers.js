const { Customer, validate, validateCustomerUpdate } = require('../models/customer');
const mongoose = require('mongoose');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

router.get('/me', async (req, res) => {
  const customer = await Customer.findById(req.customer._id).select('-password');
  res.send(customer);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) 
    return res.status(400).send(error.details[0].message);
  
  let customer = await Customer.findOne({email: req.body.email}); 
  if (customer)
    return res.status(400).send('customer already registered!');

  customer = new Customer(_.pick(req.body, ['firstName', 'lastName', 'email', 'password', 'phoneNumber']));
  const salt = await bcrypt.genSalt(10);
  customer.password = await bcrypt.hash(customer.password, salt);
  customer = await customer.save();
  const token = customer.generateToken();
  customer = _.omit(customer.toObject(), 'password');
  res.header('x-auth-token', token).send(_.pick(customer));
});

router.put('/:id', async (req, res) => {
  const { error } = validateCustomerUpdate(req.body);
  if (error) 
    return res.status(400).send(error.details[0].message);
  
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).send('Invalid customer Id');
  
  let customer = await Customer.findById(req.params.id);
  if (!customer)
      return res.status(404).json({ error: 'customer not found' });

  customer.firstName = req.body.firstName;
  customer.lastName = req.body.lastName;
  customer.phoneNumber = req.body.phoneNumber;
  customer = await customer.save();
  customer = _.omit(customer.toObject(), 'password');
  res.send(customer);
});

router.post('/:id/profile-upload', upload.single('file'), async (req, res) => {
 
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).send('Invalid customer Id');
  
  let customer = await customer.findById(req.params.id);
  if (!customer)
      return res.status(404).json({ error: 'customer not found' });
  
  const file = req.file;
  const newImage = req.file.filename;

  if (!file)
      return res.status(400).send('No file found');
  customer.image = newImage;
  customer = await customer.save();
  res.status(200).send('Profile image uploaded successfully');
});

module.exports = router;
