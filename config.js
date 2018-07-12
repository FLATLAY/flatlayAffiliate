'use strict';

var mysql = require('mysql');

 module.exports =  mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'idea!23',
	database: 'flatlay_affiliate'
});

try {
	connection.connect();
	console.log('Database connected! (from config.js)');

} catch (e) {
	console.log('Database Connetion failed (from config.js):' + e);
}
	