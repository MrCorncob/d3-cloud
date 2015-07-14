(function() {

  /* globals require, describe, it, expect, console */
  "use strict";

  try {

    var CanvasMock = CanvasMock = function() {
      var el = document.createElement("canvas");
      return el;
    };
    try {
      var doesDocumentWork = document;
    } catch (e) {
      try {
        CanvasMock = require("canvas");
      } catch (exception) {
        console.warn("canvas is not installed, testing only the d3 layout, not the full behavior.\n If you want to test the full behavior, please Google how to install Cairo and canvas for our operating system");
        CanvasMock = require("./canvas-mock").CanvasMock;
      }
    }

    describe("Canvas mock", function() {

      it("should load", function() {
        expect(CanvasMock).toBeDefined();
      });

      describe("element functions", function() {

        it("should create a fake canvas", function() {
          var canvas1 = new CanvasMock();
          expect(canvas1).toBeDefined();
        });

        it("should have a getContext function", function() {
          var canvas2 = new CanvasMock();
          expect(canvas2).toBeDefined();
          expect(typeof canvas2.getContext).toEqual("function");
          var context1 = canvas2.getContext();
          expect(context1).toBeDefined();
        });

        describe("context", function() {

          it("should have a getContext function", function() {
            var canvas3 = new CanvasMock();
            var context1 = canvas3.getContext("2d");
            expect(context1).toBeDefined();
            expect(context1.clearRect).toBeDefined();
            expect(context1.clearRect(0, 0, canvas3.width, canvas3.height)).toEqual();

            expect(context1.measureText).toBeDefined();
            expect(context1.measureText("test")).toBeDefined();

            expect(context1.getImageData).toBeDefined();
            expect(context1.getImageData(0, 0, canvas3.width, canvas3.height).data).toBeDefined();

          });

        });

      });

    });

  } catch (e) {
    console.log(e);
    console.log(e, e.stack);
  }

})();