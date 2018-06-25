const mysql = require('mysql');

class Database {
    constructor(config) {
        this.connection = mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: 'idea!23',
            database: 'flatlay_affiliate'
        });
    }
    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err)
                    return reject(err);
                resolve(rows);
            });
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
}

export default Database;
