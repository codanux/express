const mysql = require("mysql")
require("dotenv").config()

module.exports = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '123456',
  database: 'shop'
})