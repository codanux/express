const con = require("../config/db.js");

class Model {
  primaryKey = 'id';
  table = null;

  query = {
    where: []
  }

  constructor() {
  }


  find = function (id, callback) {
    con.query(`SELECT * FROM ${this.table} WHERE id = ${id}`, callback)
  }

  all = function (req, callback) {
    let query = `SELECT * FROM ${this.table}`;
    query = query + this.generate();

    con.query(query, callback)
  }

  whereRaw = function (raw) {
    if (this.query.where.length > 0)
      this.query.where.push(`and ${raw} `);
    else
      this.query.where.push(raw);

    return this;
  }

  where = function (q) {

    if (q instanceof Function) {
      let cloneQuery = new Model();
      q(cloneQuery);

      let q2 = cloneQuery.generate(true);
      this.query.where.push(q2);
    }
    else {
      if (this.query.where.length > 0)
        this.query.where.push(`and ${q} `);
      else
        this.query.where.push(q);
    }

    return this;
  }

  orWhere = function (q) {
    this.query.where.push(`or ${q} `);
    return this;
  }
  generate = function (nested = false) {
    let appendQuery = '';
    for (const [key, value] of Object.entries(this.query)) {
      if (nested) {
        appendQuery = `(${appendQuery} ${value.join(' ')})`;
      } else {
        appendQuery = `${appendQuery}  ${key} ${value.join(' ')}`;
      }
    }
    console.log(appendQuery)
    return appendQuery;
  }
}





module.exports = Model