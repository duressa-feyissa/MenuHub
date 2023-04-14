const hotels = require('../routes/hotels');
const menus = require('../routes/menus');
const multerError = require('../middleWare/multer-error');
const orderTables = require('../routes/orderTables');
const orderItemTables = require('../routes/orderItems');
const customers = require('../routes/customers');
const waiters = require('../routes/waiters');
const express = require("express");

module.exports = function(app) {
    app.use(express.json());
    app.use('/api/customers', customers);
    app.use('/api/hotels', hotels);
    app.use('/api/menus', menus);
    app.use('/api/orders', orderTables);
    app.use('/api/orderItems', orderItemTables);
    app.use('/api/waiters', waiters);
    app.use(multerError);
}