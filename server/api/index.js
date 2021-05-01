var router = require('express').Router();
const today = new Date().toISOString();


router.get('/', (req,res)=>{
    res.send(' '+ today);
})

require('./users')(router)
require('./product')(router)
require('./orders')(router)
require('./checkout')(router)
require('./cart')(router)
require('./fileipload')(router)

module.exports = router;


