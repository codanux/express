const Relation = require('./Relation')

class BelongsTo extends Relation {
    get foreignKey() {
        return this._foreignKey;
    }

    constructor(query, parent, foreignKey, ownerKey)
    {
        super(query, parent);
        this._ownerKey = ownerKey;
        this._foreignKey = foreignKey;
    }

    eagerLoad = async function (models, relation) {

        let keys = models.map((model) => model.getAttribute(this.foreignKey)).filter((a) => a)

        let results = [];
        if (keys.length) {
            let query = new this.query();
            results = await query.newQuery().whereIn(this.ownerKey, keys).get()
        }

        models.forEach(model => {
            model.relations[relation] = results.find((row) => row.getAttribute(this.ownerKey) === model.getAttribute(this.foreignKey)) ?? {};
        });
        return models;
    }

    get ownerKey() {
        return this._ownerKey;
    }

    get localKey() {
        return this._localKey;
    }
}


module.exports = BelongsTo