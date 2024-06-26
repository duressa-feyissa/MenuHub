const { OrderTable, validate } = require("../models/orderTable");
const { Customer } = require("../models/customer");
const { Waiter } = require("../models/waiter");
const { OrderItem } = require("../models/orderItem");
const authenticate = require("../middleWare/authentication");
const authorize = require("../middleWare/authorization");
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize(["Customer", "Waiter"]),
  async (req, res) => {
    const orders = await OrderTable.find();
    res.send(orders);
  }
);

router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).send("Invalid waiter Id");

  const order = await OrderTable.findById(req.params.id);
  if (!order) return res.status(404).send("Order not found.");
  res.send(order);
});

router.post(
  "/",
  authenticate,
  authorize(["Customer", "Waiter"]),
  async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    if (!mongoose.isValidObjectId(req.body.customerId))
      return res.status(400).send("Invalid customer Id");

    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(404).send("The customer item not found");

    if (!mongoose.isValidObjectId(req.body.waiterId))
      return res.status(400).send("Invalid waiter Id");

    const waiter = await Waiter.findById(req.body.waiterId);
    if (!waiter) return res.status(404).send("The waiter not found");

    for (let id of req.body.items) {
      if (!mongoose.isValidObjectId(id))
        return res.status(400).send("Invalid order item Id");

      let orderItem = await OrderItem.findById(id);
      if (!orderItem) return res.status(404).send("The order item not found");
    }

    let order = new OrderTable({
      customerId: req.body.customerId,
      waiterId: req.body.waiterId,
      tableNumber: req.body.tableNumber,
      items: req.body.items,
      orderDate: Date.now(),
      status: req.body.status,
      totalAmount: req.body.totalAmount,
      paymentMethod: req.body.paymentMethod,
      paymentStatus: req.body.paymentStatus,
    });
    order = await order.save();
    res.status(201).send(order);
  }
);

router.put(
  "/:id",
  authenticate,
  authorize(["Customer", "Waiter"]),
  async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    if (!mongoose.isValidObjectId(req.body.customerId))
      return res.status(400).send("Invalid customer Id");

    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(404).send("The customer item not found");

    if (!mongoose.isValidObjectId(req.body.waiterId))
      return res.status(400).send("Invalid waiter Id");

    const waiter = await Waiter.findById(req.body.waiterId);
    if (!waiter) return res.status(404).send("The waiter not found");

    for (let id of req.body.items) {
      if (!mongoose.isValidObjectId(id))
        return res.status(400).send("Invalid order item Id");

      let orderItem = await OrderItem.findById(id);
      if (!orderItem) return res.status(404).send("The order item not found");
    }

    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).send("Invalid order Id");

    const order = await OrderTable.findByIdAndUpdate(
      req.params.id,
      {
        customerId: req.body.customerId,
        waiterId: req.body.waiterId,
        tableNumber: req.body.tableNumber,
        items: req.body.items,
        orderDate: Date.now(),
        status: req.body.status,
        totalAmount: req.body.totalAmount,
        paymentMethod: req.body.paymentMethod,
        paymentStatus: req.body.paymentStatus,
      },
      { new: true }
    );

    if (!order) return res.status(404).send("Order not found.");

    res.send(order);
  }
);

router.delete(
  "/:id",
  authenticate,
  authorize(["Customer", "Waiter"]),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).send("Invalid waiter Id");

    const order = await OrderTable.findByIdAndRemove(req.params.id);
    if (!order) return res.status(404).send("Order not found.");
    res.send(order);
  }
);

module.exports = router;
