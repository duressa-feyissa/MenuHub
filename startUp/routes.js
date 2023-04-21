const hotels = require('../routes/hotels');
const menus = require('../routes/menus');
const multerError = require('../middleWare/multer-error');
const orderTables = require('../routes/orderTables');
const orderItemTables = require('../routes/orderItems');
const customers = require('../routes/customers');
const chiefs = require('../routes/chiefs');
const waiters = require('../routes/waiters');
const auth = require('../routes/authenticates');
const tables = require('../routes/tables');
const cors = require('../middleWare/cors');
const express = require("express");
const error = require('../middleWare/error');

module.exports = function(app) {
    app.use(express.json());
    app.use(cors);
    app.use('/api/customers', customers);
    app.use('/api/hotels', hotels);
    app.use('/api/menus', menus);
    app.use('/api/orders', orderTables);
    app.use('/api/orderItems', orderItemTables);
    app.use('/api/waiters', waiters);
    app.use('/api/chiefs', chiefs);
    app.use('/api', auth);
    app.use('/api', tables);
    app.use(multerError);
    app.use(error);
}