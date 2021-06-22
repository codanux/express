class Relation {
    constructor(query, parent) {

        this._query = query;
        this._parent = parent;
    }

    get query() {
        return this._query;
    }

    get parent() {
        return this._parent;
    }

    get() {
        return new this.query().get();
    }
}


module.exports = Relation