const mysql = require('mysql2');

const con = mysql.createConnection({
    host: 'containers-us-west-75.railway.app',
    port: '7869',
    user: 'root',
    password: 'jAqLLub5p2JEd23B7vd0',
    database: 'railway',
});

con.connect((err) => err ?
    console.log(err.message) :
    console.log('Connected to the MySQL server.'));

module.exports = { con, mysql };
