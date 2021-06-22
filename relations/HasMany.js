const Relation = require('./Relation')

class HasMany extends Relation {

    constructor(query, parent, foreignKey, localKey)
    {
        super(query, parent);
        this._foreignKey = foreignKey;
        this._localKey = localKey;
    }

    eagerLoad = async function (models, related) {
        let keys = models.map((model) => model.getKey())

        let query = new this.query();

        let results = await query.newQuery().whereIn(this.foreignKey, keys).get()

        models.forEach(model => {
            model.relations[related] = results.filter((row) => row.getAttribute(this.foreignKey) === model.getAttribute(this.localKey));
        });

        return models;
    }

    get foreignKey() {
        return this._foreignKey;
    }

    get localKey() {
        return this._localKey;
    }

}


module.exports = HasMany