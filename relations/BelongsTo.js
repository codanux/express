const Relation = require('./Relation')

class BelongsTo extends Relation {

    constructor(query, parent, ownerKey, localKey)
    {
        super(query, parent);
        this._ownerKey = ownerKey;
        this._localKey = localKey;
    }

    eagerLoad = async function (models, relation) {

        let keys = models.map((model) => model.getKey())

        let query = new this.query();

        let results = await query.newQuery().whereIn(this.ownerKey, keys).get()

        models.forEach(model => {
            model.relations[relation] = results.find((row) => row.getAttribute(this.ownerKey) === model.getAttribute(this.localKey)) ?? {};
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