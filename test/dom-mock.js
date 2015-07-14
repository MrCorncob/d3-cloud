var ElementMock = function() {};
ElementMock.prototype.createElement = function() {
	var el = new ElementMock();
	if (global && global.document) {
		el.ownerDocument = global.document;
	} else {
		el.ownerDocument = new ElementMock();
	}
	return el;
};
ElementMock.prototype.setAttribute = function(key, value) {
	this[key] = value;
};
ElementMock.prototype.appendChild = function(el) {
	this.children = this.children || [];
	this.children.push(el);
};
ElementMock.prototype.createElementNS = function() {
	return this.createElement;
};

if (!global.document) {
	global.document = new ElementMock();
	global.document.body = new ElementMock();
}
exports.ElementMock = ElementMock;