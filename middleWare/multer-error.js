const multer = require('multer');

module.exports = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_TYPE') {
      return res.status(400).json({ error: 'Invalid file format. Allowed image formats: image/jpeg, image/png, image/jpg' });
    }
  } else {
    return res.status(500).json({ error: 'Internal server error' });
  }
};