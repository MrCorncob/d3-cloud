(function() {

  /* globals require, describe, it, expect, console, document */
  "use strict";

  try {

    var localdocument;
    var ElementMock;
    try {
      localdocument = document;
      ElementMock = function() {
        var el = localdocument.createElement("div");
        el.createElement = function() {
          return localdocument.createElement();
        };
        return el;
      };
    } catch (e) {
      try {
        localdocument = require("jsdom").jsdom("<html><head></head><body><div id='a-cloud'></div></body></html>");
      } catch (exception) {
        console.warn("jsdom is not installed, testing with a mock please do `npm install jsdom@3.0`");
        ElementMock = require("./dom-mock").ElementMock;
        var body = Object.create(ElementMock.prototype);
        var localdocument = new ElementMock();
        localdocument.body = new ElementMock();
      }
    }

    describe("DOM mock", function() {

      it("should load", function() {
        expect(ElementMock).toBeDefined();
      });

      describe("element functions", function() {

        it("should create a fake element", function() {
          var el = new ElementMock();
          expect(el).toBeDefined();
        });

        it("should have a createElement function", function() {
          var dom = new ElementMock();
          var el2 = dom.createElement();
          expect(el2).toBeDefined();
          expect(el2.ownerDocument).toBeDefined();
          expect(el2.ownerDocument.createElement).toBeDefined();
        });

        it("should have a setAttribute function", function() {
          var el3 = new ElementMock();
          expect(typeof el3.setAttribute).toEqual("function");
        });

        it("should have an appendChild function", function() {
          var el4 = new ElementMock();
          expect(typeof el4.appendChild).toEqual("function");
        });

      });

      describe("localdocument", function() {

        it("should have an appendChild function", function() {
          expect(localdocument).toBeDefined();
          expect(localdocument.createElement).toBeDefined();

          var simpleCloudElement = localdocument.createElement("div");
          expect(simpleCloudElement).toBeDefined();
          if (simpleCloudElement.type) {
            expect(simpleCloudElement.type).toEqual("div");
          }

          simpleCloudElement.setAttribute("id", "simple-cloud");
          expect(simpleCloudElement.id).toEqual("simple-cloud");

          localdocument.body.appendChild(simpleCloudElement);
          expect(localdocument.body).toBeDefined();
          expect(localdocument.body.children).toBeDefined();
        });

        it("should have an appendChild function which can append a canvas", function() {
          expect(localdocument).toBeDefined();
          expect(localdocument.createElement).toBeDefined();

          var simpleCloudElement = localdocument.createElement("canvas");
          expect(simpleCloudElement).toBeDefined();
          if (simpleCloudElement.type) {
            expect(simpleCloudElement.type).toEqual("image");
          }

          expect(typeof simpleCloudElement.getContext).toEqual("function");
        });

      });

    });

  } catch (e) {
    console.log(e);
    console.log(e, e.stack);
  }

})();