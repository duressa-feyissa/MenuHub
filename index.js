const express = require('express');
const app = express();
const hotels = require('./routes/hotels');
const menus = require('./routes/menus');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/MenuHub')
  .then(() => console.log('Connected to MongoDB...'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

app.use(express.json());
app.use('/api/hotels', hotels);
app.use('/api/menus', menus);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`App listening on port ${port}!`));
