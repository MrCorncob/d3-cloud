(function() {

  /* globals require, describe, it, expect, console */
  'use strict';

  try {

    var localdocument;
    var locald3;
    var d3CloudLayout;
    try {
      localdocument = document;
      locald3 = d3;
      d3CloudLayout = d3.layout.cloud;
    } catch (e) {
      localdocument = require("jsdom").jsdom("<body></body>");
      locald3 = require("d3");
      d3CloudLayout = require("../");
    }

    describe('Replicable layout', function() {

      describe('Redraw a new cloud', function() {

        it('should have word objects', function() {
          expect(true).toBeTruthy();
        });

        it('should add render attributes upon start', function() {
          expect(true).toBeTruthy();
        });

        it('should not change word objects render attributes', function() {
          expect(true).toBeTruthy();
        });

      });

      describe('Redraw an existing cloud', function() {

        it('should not change word objects render attributes', function() {
          expect(true).toBeTruthy();
        });

      });

    });


  } catch (e) {
    console.log(e);
    console.log(e, e.stack);
  }

})();