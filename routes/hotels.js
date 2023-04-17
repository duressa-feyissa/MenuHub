const { Hotel , validate } = require('../models/hotel');
const authenticate = require('../middleWare/authentication');
const authorize = require('../middleWare/authorization');
const _ = require('lodash');
const bcrpt = require('bcrypt');
const mongoose = require('mongoose');
const upload = require('../middleWare/upload');
const QRCode = require('qrcode');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const sortBy = req.query.sortBy || 'name';
    const sortOrder = req.query.sortOrder || 'asc';
    const validSortByValues = ['name', 'star'];
    const validSortOrderValues = ['asc', 'desc'];

    if (!validSortByValues.includes(sortBy) || !validSortOrderValues.includes(sortOrder)) 
        return res.status(400).send('Invalid sortBy or sortOrder value.');
        
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    let hotels = await Hotel.find({}).sort(sort);
    hotels = hotels.map(hotel => _.omit(hotel.toObject(), 'password'));
    res.status(200).send(hotels);
});

router.get('/:id', async (req, res) => {
    
    if (!mongoose.isValidObjectId(req.params.id))
        return res.status(400).send('Invalid hotel Id');
    
    let hotel = await Hotel.findById(req.params.id);
    if (!hotel)
        return res.status(404).send('The hotel with given ID not found\n');
    hotel = _.omit(hotel.toObject(), 'password');
    res.status(200).send(hotel); 
});

router.post('/', async (req, res) => {
    const { error } = validate(req.body); 
    
    if (error)
        return res.status(400).send(error.details[0].message);
    
    let hotel = await Hotel.findOne({ email: req.body.email });
    
    if (hotel)
        return res.status(400).send('User already registered!');
    
    const salt = await bcrpt.genSalt(10);
    const hotelObj = {
        name: req.body.name,
        password: await bcrpt.hash(req.body.password, salt),
        location: {
            address: req.body.location.address, 
            city: req.body.location.city, 
            state: req.body.location.state, 
            country: req.body.location.country, 
            postalCode: req.body.location.postalCode 
        },
        contact: {
        email: req.body.contact.email, 
        phone: req.body.contact.phone,
        socialMedia: {
            facebook: req.body.contact.socialMedia.facebook,
            twitter: req.body.contact.socialMedia.twitter,
            instagram: req.body.contact.socialMedia.instagram
            }
        },
        profileImage: req.body.profileImage,
        star: req.body.star,
    };
    hotel = new Hotel(hotelObj);
    await hotel.save();
    const token = hotel.generateToken();
    res.status(201).send(token);
});

router.put('/:id', authenticate, authorize(['Hotel']), async (req, res) => {
    
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid hotel Id');
    }
    
    const { error } = validate(req.body);
    if (error)
        return res.status(404).send(error.details[0].message);
    
    const hotelObj = {
        name: req.body.name,
        location: {
            address: req.body.location.address, 
            city: req.body.location.city, 
            state: req.body.location.state, 
            country: req.body.location.country, 
            postalCode: req.body.location.postalCode 
        },
        contact: {
        email: req.body.contact.email, 
        phone: req.body.contact.phone,
        socialMedia: {
            facebook: req.body.contact.socialMedia.facebook,
            twitter: req.body.contact.socialMedia.twitter,
            instagram: req.body.contact.socialMedia.instagram
            }
        },
        star: req.body.star,
    };
    
    let hotel = await Hotel.findByIdAndUpdate(req.params.id, hotelObj, {new: true});
    if (!hotel)
        return res.status(404).send('The hotel with given ID not found\n');
    hotel = _.omit(hotel.toObject(), 'password');
    res.status(200).send(hotel);
});

router.delete('/:id',  async (req, res) => {
    
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid hotel Id');
    }
    
    let hotel = await Hotel.findByIdAndRemove(req.params.id);
    if (!hotel)
        return res.status(404).send('The hotel with given ID not found\n');
    hotel = _.omit(hotel.toObject(), 'password');
    res.status(200).send(hotel); 
});

router.get('/:id/qr-generator', authenticate, authorize(['Hotel']), async (req, res) => {
    
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid hotel Id');
    }
    
    const hotelId = req.params.id;
    try {
        const hotelPageUrl = `https://menuhub.com/hotels/${hotelId}`;
        const qrCodeDataUrl = await QRCode.toDataURL(hotelPageUrl);
        res.send(qrCodeDataUrl);
    } catch (error) {
        res.status(500).send('Failed to generate QR code');
    }
});

router.post('/:id/profile-image', authenticate, authorize(['Hotel']), upload.single('image'), async (req, res) => {
    
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid hotel Id');
    }
    
    let hotel = await Hotel.findById(req.params.id);
    if (!hotel)
        return res.status(404).json({ error: 'Hotel not found' });
    
    const file = req.file;
    const newImage = req.file.filename;

    if (!file)
        return res.status(400).send('No file found');
    hotel.images.push(newImage);
    hotel.profileImage = newImage;
    hotel = await hotel.save();
    res.status(200).send('Profile image uploaded successfully');
});

router.post('/:id/images', authenticate, authorize(['Hotel']), upload.array('images'), async (req, res) => {
    
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid hotel Id');
    }
    
    const hotelId = req.params.id;
    const newGalleryImages = req.files.map(file => file.filename);

    let hotel = await Hotel.findById(hotelId);
    if (!hotel)
        return res.status(404).json({ error: 'Hotel not found' });
    hotel.images.push(...newGalleryImages);
    hotel = await hotel.save();
    res.status(201).send('Profile image uploaded successfully');
});

module.exports = router;
