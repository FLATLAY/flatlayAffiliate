var mysql = require('mysql');

var connection = mysql.createConnection({
	host: '127.0.0.1',
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

module.exports = connection;
