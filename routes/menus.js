const { Menu , validate } = require('../models/menu');
const { Hotel } = require('../models/hotel');
const mongoose = require('mongoose');
const authenticate = require('../middleWare/authentication');
const authorize = require('../middleWare/authorization');
const upload = require('../middleWare/upload');
const express = require('express');
const router = express.Router();

router.get('/hotel/:id', async(req, res) => {
    const sortBy = req.query.sortBy || 'name';
    const sortOrder = req.query.sortOrder || 'asc';
    const validSortByValues = ['name', 'price', 'rating'];
    const validSortOrderValues = ['asc', 'desc'];
    
    if (!validSortByValues.includes(sortBy) || !validSortOrderValues.includes(sortOrder)) {
        return res.status(400).send('Invalid sortBy or sortOrder value.');
    }
    const sort = {}
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const menuItem = await Menu.find({hotelId: req.params.id}).sort(sort);
    res.send(menuItem);
});

router.get('/:id', async (req, res) => {

    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid menu item Id');
    }

    const menuItem = await Menu.findById(req.params.id);
    if (!menuItem)
        return res.status(404).send('The menu item with given ID not found\n');
    res.send(menuItem); 
});

router.post('/', authenticate, authorize(['Hotel']), upload.array('image'), async (req, res) => {
    console.log("req.files", req.files);

    const { error } = validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    const array = [];
    if  (req.files) 
        req.files.map(file => file.filename);

    let menuItem = new Menu({
        hotelId: req.body.hotelId ,
        name: req.body.name,
        description: req.body.description,
        ingredients: req.body.ingredients,
        price: req.body.price,
        allergenInformation: req.body.allergenInformation,
        nutritionalInformation: req.body.nutritionalInformation,
        vegetarian: req.body.vegetarian,
        images: array,
        type: req.body.type,
        availability: req.body.availability,
        rating: req.body.rating,
    });
    menuItem = await menuItem.save();
    res.status(201).send(menuItem);
});

router.put('/:id', authenticate, authorize(['Hotel']), async (req, res) => {
    console.log("id", req.params.id)
    console.log("body", req.body)
    
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid menu item Id');
    }
    
    const { error } = validate(req.body);
    if (error)
        return res.status(400).send(error.details[0].message);

    let menuItem = await Menu.findById(req.params.id);

    if (!menuItem)
        return res.status(404).send('Menu item not found');

    const hotelId = await Hotel.findById(req.body.hotelId);
    if (!hotelId)
        return res.status(404).send('The hotel with given ID not found\n');

    menuItem.hotelId = req.body.hotelId;
    menuItem.name = req.body.name;
    menuItem.description = req.body.description;
    menuItem.ingredients = req.body.ingredients;
    menuItem.price = req.body.price;
    menuItem.allergenInformation = req.body.allergenInformation;
    menuItem.nutritionalInformation = req.body.nutritionalInformation;
    menuItem.vegetarian = req.body.vegetarian;
    menuItem.type = req.body.type;
    menuItem.availability = req.body.availability;
    menuItem.rating = req.body.rating;
    menuItem = await menuItem.save();
    res.send(menuItem);
});

router.delete('/:id', authenticate, authorize(['Hotel']), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id))
        return res.status(400).send('IInvalid menu item Id');
    const menuItem = await Menu.findByIdAndRemove(req.params.id);
    if (!menuItem)
        return res.status(404).send('The menu item with given ID not found\n');
    res.send(menuItem); 
});

router.post('/:id/images', authenticate, authorize(['Hotel']), upload.array('images'), async (req, res) => {

    if (!mongoose.isValidObjectId(req.params.id))
        return res.status(400).send('Invalid menu item Id');

    const menuItemId = req.params.id;
    const newMenuImages = req.files.map(file => file.filename);

    let menuItem = await Menu.findById(menuItemId);
    if (!menuItem)
        return res.status(404).json({ error: 'Hotel not found' });
    menuItem.images.push(...newMenuImages);
    menuItem = await menuItem.save();
    res.send('Profile image uploaded successfully');
});

module.exports = router;

