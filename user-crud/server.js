const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const port = process.env.PORT || 3000;
app.set('port', port);



let routes = require('./routes/app-routes');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(__dirname + '/public'));
app.use(cors());

global.sql = require('./model/db');
app.use((req, res, next)=>{
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Request with, Content-type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS, PATCH");
    next();
});

app.use('/api',routes);

module.exports = app;
app.listen(port, () => { 
    console.log('Listening on port: ', port);
});
