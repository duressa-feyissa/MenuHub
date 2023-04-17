const jwt = require('jsonwebtoken');
const _= require('lodash');
const Joi = require('joi');
const authenticate = require('../middleWare/authentication');
const authorize = require('../middleWare/authorization');
const { Hotel } = require('../models/hotel');
const { Waiter } = require('../models/waiter');
const { Customer } = require('../models/customer');
const { Chief } = require('../models/chief');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

router.get('/me', authenticate, authorize(['Customer', 'Waiter', 'Chief', 'Hotel']), async (req, res) => {
  const role = req.user.role;
  let user;
  if (role == 'Customer') {
    user = await Customer.findById(req.user._id).select('-password');
  } else if (role == 'Hotel') {
    user = await Hotel.findById(req.user._id).select('-password');
  } else if (role == 'Waiter') {
    user = await Waiter.findById(req.user._id).select('-password');
  } else if (role == 'Chief') {
    user = await Chief.findById(req.user._id).select('-password');
  } 
  res.send(user);
});

router.post('/auth', async (req, res) => {
  const { error } = validate(req.body);
  if (error)
    return res.status(400).send(error.details[0].message);
  const role = req.body.role;
  const email = req.body.email;
  const password = req.body.password;
  let user;
  if (role == 'Customer') {
    user = await Customer.findOne({email: email});
  } else if (role == 'Hotel') {
    user = await Hotel.findOne({'contact.email': email});
  } else if (role == 'Waiter') {
    user = await Waiter.findOne({email: email})
  } else if (role == 'Chief') {
    user = await Chief.findOne({email: email})
  } 
  if (!user)
    return res.status(400).send('Invalid email or password');
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword)
    return res.status(400).send('Invalid email or password');
  const token = user.generateToken();
  res.send(token);
});

function validate(req) {
  const schema = Joi.object({
    email: Joi.string().min(6).max(100).required().email(),
    role: Joi.string().valid('Customer', 'Waiter', 'Hotel', 'Chief'),
    password: Joi.string().min(5).max(100).required(),
  });
  return schema.validate(req);
}

module.exports = router;

