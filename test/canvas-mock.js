(function() {
	/* globals global, module, console */
	"use strict";

	var CanvasContextMock = function() {};

	CanvasContextMock.prototype.clearRect = function() {};
	CanvasContextMock.prototype.measureText = function() {
		return {
			placeholder: 999
		};
	};
	CanvasContextMock.prototype.translate = function() {};
	CanvasContextMock.prototype.rotate = function() {};
	CanvasContextMock.prototype.restore = function() {};
	CanvasContextMock.prototype.filltext = function() {};
	CanvasContextMock.prototype.strokeText = function() {};
	CanvasContextMock.prototype.getImageData = function() {
		return {
			data: []
		};
	};

	var CanvasMock = function() {
		this.getContext = function() {
			return new CanvasContextMock();
		};
		return this;
	};
	try {
		if (!global.Canvas) {
			global.Canvas = CanvasMock;
		}
	} catch (exception) {
		console.warn("Not exporting Canvas", exception.stack);
	}
	module.exports.CanvasMock = CanvasMock;
})();