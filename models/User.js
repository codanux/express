const con = require("../config/db.js");
let Model = require('./Model')

class User extends Model {
    constructor() {
        super()
        this.table = 'users'

    }

}


module.exports = User