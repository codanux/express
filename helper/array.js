Array.prototype.pluck = function(field) {
    return this.map(item => item[field])
}