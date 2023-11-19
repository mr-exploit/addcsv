
// const Pool  = require('pg').Pool;
const mysql = require('mysql2');
require('dotenv').config();

// database SQLYog
const pool = mysql.createPool({
    host: process.env.HOST_DB,
    port: process.env.PORT_DB,
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.DATABASE_DB,
});


module.exports = {
    pool
}