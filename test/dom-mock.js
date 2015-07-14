(function() {
	/* globals require, global, module, console */
	"use strict";
	
	var CanvasMock = require("canvas") || require("canvas-mock");

	var ElementMock = function() {
		this.children = this.childNodes = [];
		this.childElementCount = this.children.length;
	};
	ElementMock.prototype.createElement = function(elementType) {
		if (elementType === "canvas") {
			return new CanvasMock();
		}

		var el = new ElementMock();
		if (global && global.document) {
			el.ownerDocument = global.document;
		} else {
			el.ownerDocument = new ElementMock();
		}
		el.style = {
			setProperty: function() {}
		};
		el.type = elementType;
		return el;
	};
	ElementMock.prototype.setAttribute = function(key, value) {
		this[key] = value;
	};
	ElementMock.prototype.appendChild = function(el) {
		if (typeof el === "function") {
			console.log("element ", el);
			// throw new Error("testing stack");
			el = el();
		} else if (typeof el === "string") {
			el = this.createElement(el);
		}
		// el.childNodes = [new ElementMock()];
		this.children.push(el);
		this.childElementCount = this.children.length;
	};
	ElementMock.prototype.createElementNS = function() {
		return this.createElement;
	};

	if (!global.document) {
		global.document = new ElementMock();
		global.document.body = new ElementMock();
	}
	module.exports.ElementMock = ElementMock;
})();