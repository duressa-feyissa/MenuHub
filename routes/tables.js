const { Hotel } = require('../models/hotel');
const { Waiter } = require('../models/waiter');
const { Table, validate } = require('../models/table');
const authenticate = require('../middleWare/authentication');
const authorize = require('../middleWare/authorization');
const QRCode = require('qrcode');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/hotels/:hotelId/tables/', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.hotelId))
    return res.status(400).send('Invalid hotel Id');
  
  const hotelId = await Hotel.findById(req.params.hotelId);
  if (!hotelId)
    return res.status(404).send('The hotel with given ID not found\n');
  
  const tables = await Table.find({hotelId: req.params.hotelId});
  res.send(tables);
});

router.get('/hotels/:hotelId/tables/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.hotelId))
    return res.status(400).send('Invalid hotel Id');
  
  const hotelId = await Hotel.findById(req.params.hotelId);
  if (!hotelId)
    return res.status(404).send('The hotel with given ID not found\n');

  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).send('Invalid table Id');
  
  const table = await Table.findById(req.params.id);
  if (!table)
    return res.status(404).send('Table not found');
  res.send(table);
});

router.post('/hotels/:hotelId/tables/', authenticate, authorize(['Hotel']), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.hotelId))
    return res.status(400).send('Invalid hotel Id');
  
  let hotelId = await Hotel.findById(req.params.hotelId);
  if (!hotelId)
    return res.status(404).send('The hotel with given ID not found\n');
    
  const { error } = validate(req.body);
  if (error)
    return res.status(400).send(error.details[0].message);
  
  for (let id of req.body.waiterId) {
    if (!mongoose.isValidObjectId(id))
      return res.status(400).send('Invalid waiter Id');
    
    let waiter = await Waiter.findById(id);
    if (!waiter)
      return res.status(404).send('Waiter not found');
  }
  let table = new Table({
    hotelId: req.params.hotelId,
    waiterId: req.body.waiterId,
    tableNubmer: req.body.tableNubmer
  });
  table = await table.save();
  res.send(table);
});

router.put('/hotels/:hotelId/tables/:id', authenticate, authorize(['Hotel']), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.hotelId))
    return res.status(400).send('Invalid hotel Id');
  
  const hotelId = await Hotel.findById(req.params.hotelId);
  if (!hotelId)
    return res.status(404).send('The hotel with given ID not found\n');
    
  const { error } = validate(req.body);
  if (error)
    return res.status(400).send(error.details[0].message);
  
  for (let id of req.body.waiterId) {
    if (!mongoose.isValidObjectId(id))
      return res.status(400).send('Invalid waiter Id');
    
    let waiter = await Waiter.findById(id);
    if (!waiter)
      return res.status(404).send('Waiter not found');
  }
  
  const table = await Table.findByIdAndUpdate(
    req.params.id ,{
      hotelId: req.params.hotelId,
      waiterId: req.body.waiterId,
      tableNubmer: req.body.tableNubmer 
    }, 
    { new: true });
  if (!table) 
    return res.status(404).send('Table not found');
  res.send(table);
});

router.delete('/hotels/:hotelId/tables/:id', authenticate, authorize(['Hotel']), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).send('Invalid table Id');
  const table = await Table.findByIdAndRemove(req.params.id);
  if (!table) 
    return res.status(404).send('Table not found');
  res.send(table);
});

router.get('/hotels/:hotelId/tables/:id/qr-generator', authenticate, authorize(['Hotel']), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.hotelId))
    return res.status(400).send('Invalid hotel Id');
  
  const hotelId = await Hotel.findById(req.params.hotelId);
  if (!hotelId)
    return res.status(404).send('The hotel with given ID not found\n');

  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).send('Invalid Id');
  
  const table = await Table.findById(req.params.id);
  if (!table)
    return res.status(404).send('Table not found');  
  const hotelPageUrl = `https://menuhub.com/hotels/${table.hotelId}/tables/${table._id}/order`;
  const qrCodeDataUrl = await QRCode.toDataURL(hotelPageUrl);
  res.send(qrCodeDataUrl);
});

module.exports = router;
