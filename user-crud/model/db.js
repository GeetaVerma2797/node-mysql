var mysql = require('mysql');
const config = require('config');
const db = config.db;

var con = mysql.createConnection(db);

con.connect(function(err){
    if(err) throw err;
    console.log("connected");
})

module.exports = con;
