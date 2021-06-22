const con = require("../config/db.js");
const pluralize = require('pluralize')
const HasMany = require('../relations/HasMany')
const BelongsTo = require('../relations/BelongsTo')


class Model {
  primaryKey = 'id';
  table = null;
  attributes = {}
  select = []
  query = {
    where: [],
  }
  eagerLoad = []
  relations = {}

  constructor(attributes = {}) {
    this.attributes = attributes;

    let name = this.constructor.name;
    this.table = pluralize(name).toLowerCase();

    this.select.push(`${this.table}.*`)
  }

  // Relationship
  with = function (relations) {
    if (Array.isArray(relations)) {
      this.eagerLoad.push(...relations);
    } else {
      this.eagerLoad.push(relations);
    }
    return this;
  }

  hasMany = function (related, foreignKey , localeKey) {
    foreignKey = foreignKey ?? this.getForeignKey();
    localeKey = localeKey ?? this.getKeyName();
    return new HasMany(related, this, foreignKey, localeKey);
  }

  belongsTo = function (related, foreignKey = null, ownerKey = null, relation = null) {
    foreignKey = foreignKey ?? this.getForeignKey();
    ownerKey = ownerKey ?? this.getKeyName();
    return new BelongsTo(related, this, foreignKey, ownerKey);
  }


  eagerLoadRelations = async function(rows) {
    let _vm = this;
    await Promise.all(
        _vm.eagerLoad.map((related) => {
          return _vm.eagerLoadRelation(rows, related);
        })
    )
  }

  eagerLoadRelation = async function(models, related) {
    return await this[related]().eagerLoad(models, related);
  }


  // Query

  find = function (id) {
    return new Promise((resolve, reject) => {
      let _vm = this
      con.query(`SELECT ${this.select.join(',')} FROM ${this.table} WHERE id = ${id} limit 1`, async function(err, rows) {
        if (err) throw err;
        if (rows) {
          // instance create
          rows = rows.map((row) => _vm.clone(row));

          // eager load
          await _vm.eagerLoadRelations(rows);

          resolve(rows[0]);
        }
        reject('empty data');
      })
    }).catch((err) => {
      console.error(err)
    });
  }

  get = function () {
    return new Promise((resolve, reject) => {
      let _vm = this;
      let query = `SELECT ${this.select.join(',')} FROM ${this.table} ${this.generate()}`;

      con.query(query, async function (err, rows) {
        if (err) return reject(err);

        // instance create
        rows = rows.map((row) => _vm.clone(row));

        // eager load
        await _vm.eagerLoadRelations(rows);

        resolve(rows)
      });
    }).catch((err) => {
      console.error(err);
    });
  }

  newQuery = function (attributes = {}) {
    return new this.constructor(attributes);
  }

  join = function (table, first, operator = null, second = null, type = 'inner', where = false) {
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

  whereIn = function (column, values, boolean = 'and', not = false) {
    let type = not ? 'NotIn' : 'In';
    if (this.query.where.length > 0) {
      this.query.where.push(`and ${column} ${type} (${values})`);
    }
    else {
      this.query.where.push(`${column} ${type} (${values})`);
    }
    return this;
  }

  orWhere = function (q) {
    this.query.where.push(`or ${q} `);
    return this;
  }

  whereRaw = function (raw) {
    if (this.query.where.length > 0)
      this.query.where.push(`and ${raw} `);
    else
      this.query.where.push(raw);

    return this;
  }

  generate = function (nested = false) {
    let appendQuery = '';
    for (const [key, value] of Object.entries(this.query)) {
      if (value.length) {
        if (nested) {
          appendQuery = `(${appendQuery} ${value.join(' ')})`;
        } else {
          appendQuery = `${appendQuery} ${key} ${value.join(' ')}`;
        }
      }
    }
    return appendQuery;
  }

  // Methods
  getAttribute(key) {
    return this.attributes[key];
  }

  getKey() {
    return this.getAttribute(this.getKeyName());
  }

  getKeyName() {
    return this.primaryKey;
  }

  getForeignKey() {
    return (this.constructor.name+'_'+this.getKeyName()).toLowerCase();
  }

  getLocaleKey() {
    return this.primaryKey;
  }

  clone(attributes) {
    let clone = Object.assign(Object.create(Object.getPrototypeOf(this)), this)
    clone.attributes = attributes;
    return clone;
  }

}





module.exports = Model