const con = require("../config/db.js");
const pluralize = require('pluralize')

class Model {
  primaryKey = 'id';
  table = null;
  attributes = {}

  select = []

  query = {
    where: [],
  }

  eagerLoad = []

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

    let query = new related();

    foreignKey = foreignKey ?? this.getForeignKey();
    localeKey = localeKey ?? this.getKeyName();

    query.getForeignKey = () => foreignKey;
    query.localeKey = () => localeKey;

    query.where(`${foreignKey} = ${this.getKey(localeKey)}`)

    console.log(query)
    return query;
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

    let keys = models.map((model) => model.getKey())

    let query = this[related]();

    let rows = await query.newQuery().whereIn(query.getLocaleKey(), keys).get()

    models.forEach(model => {
      model.attributes[related] = rows.filter((row) => row.getAttribute(query.getForeignKey()) === model.getAttribute(query.getLocaleKey()));

    });

    return models;
  }



  // Query

  find = function (id) {
    return new Promise((resolve, reject) => {
      let _vm = this
      con.query(`SELECT ${this.select.join(',')} FROM ${this.table} WHERE id = ${id} limit 1`, function(err, data) {
        if (err) throw err;
        if (data) {
          resolve(_vm.newQuery(data[0]));
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

      let query = `SELECT ${this.select.join(',')} FROM ${this.table}`;
      query = query + this.generate();

      con.query(query, async function (err, rows) {
        if (err) return reject(err);

        // instance create
        rows = rows.map((row) => _vm.newQuery(row));

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
    console.log(clone)
    return clone;
  }

}





module.exports = Model