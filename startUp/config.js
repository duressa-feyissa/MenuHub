const config = require('config'); 

module.exports = function() {
  if (!config.get('API_Private_Key')) {

    throw new Error('FATAL ERROR: API_Private_Key.');
    process.exit(1); 
  }  
}