const { OrderItem, validate } = require('../models/orderItem');
const { Menu } = require('../models/menu');
const express = require('express');
const mongoose = require('mongoose');
const authenticate = require('../middleWare/authentication');
const authorize = require('../middleWare/authorization');
const router = express.Router();

router.get('/', async (req, res) => {
  const orderItems = await OrderItem.find();
  res.send(orderItems);
});

router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).send('Invalid order item Id');
  const orderItems = await OrderItem.findById(req.params.id);
  res.send(orderItems);
});

router.post('/',  authenticate, authorize(['Customer', 'Waiter']), async (req, res) => {
  const { error } = validate(req.body);
  if (error) 
      return res.status(400).json({ error: error.details[0].message });
  
  if (!mongoose.isValidObjectId(req.body.menuItemId))
    return res.status(400).send('Invalid menu item Id');

  const menuItem = await Menu.findById(req.body.menuItemId);
  if (!menuItem)
    return res.status(404).send('Menu item not found');

  let orderItem = new OrderItem({
    menuItemId: req.body.menuItemId,
    quantity: req.body.quantity,
    specialInstructions: req.body.specialInstructions,
    price: req.body.price
  });
  orderItem = await orderItem.save();
  res.status(201).send(orderItem);
});

router.put('/:id', authenticate, authorize(['Customer', 'Waiter']), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).send('Invalid order item Id');
  
  const { error } = validate(req.body);
  if (error) 
    return res.status(400).send(error.details[0].message);

  if (!mongoose.isValidObjectId(req.body.menuItemId))
    return res.status(400).send('Invalid menu item Id');

  const menuItem = await Menu.findById(req.body.menuItemId);
  if (!menuItem)
    return res.status(404).send('Menu item not found');

  const orderItem = await OrderItem.findByIdAndUpdate(req.params.id, {
      menuItemId: req.body.menuItemId,
      quantity: req.body.quantity,
      specialInstructions: req.body.specialInstructions,
      price: req.body.price}, { new: true});

  if (!orderItem)
    return res.status(404).send('Order item not found');
  res.send(orderItem);
});

router.delete('/:id', authenticate, authorize(['Customer', 'Waiter']), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).send('Invalid order item Id');
  const orderItem = await OrderItem.findByIdAndDelete(req.params.id);
  if (!orderItem)
    return res.status(404).send('Order item not found');
  res.send(orderItem);
});

module.exports = router;
