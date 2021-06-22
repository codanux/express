let Model = require('./Model')
let Role = require('./Role')

class User extends Model {

    roles() {
        return this.hasMany(Role, 'user_id', 'id');
    }

    role() {
        return this.belongsTo(Role, 'user_id', 'id');
    }
}


module.exports = User