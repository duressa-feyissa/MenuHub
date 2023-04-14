const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { OrderItem, validate } = require('../models/orderItem');

router.get('/', async (req, res) => {
  const orderItems = await OrderItem.find();
  res.send(orderItems);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) 
      return res.status(400).json({ error: error.details[0].message });
  
  if (!mongoose.isValidObjectId(req.body.menuItemId))
    return res.status(400).send('Invalid menu item Id');

  const menuItem = await Menu.findById(req.body.menuItemId);
  if (!menuItem)
    return res.status(404).send('Menu item not found');

  const orderItem = new OrderItem({
    menuItemId: req.body.menuItemId,
    quantity: req.body.quantity,
    specialInstructions: req.body.specialInstructions,
    price: req.body.price
  });
  orderItem = await orderItem.save();
  res.status(201).send(orderItem);
});

router.put('/:id', async (req, res) => {
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

router.delete('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).send('Invalid order item Id');
  const orderItem = await OrderItem.findByIdAndDelete(req.params.id);
  if (!orderItem)
    return res.status(404).send('Order item not found');
  res.send(orderItem);
});

module.exports = router;
