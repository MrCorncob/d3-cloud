// (function() {
  /* globals require, describe, it, expect, console, d3 */
  'use strict';

  try {

    var locald3;
    try {
      locald3 = d3;
    } catch (e) {
      locald3 = require("d3");
      require("../");
    }
    // window = localdocument.createWindow();
    // navigator = window.navigator;
    // CSSStyleDeclaration = window.CSSStyleDeclaration;

    describe('AMD', function() {

      it('should add itself to d3', function() {
        expect(locald3).toBeDefined();
        expect(locald3.layout).toBeDefined();
        expect(locald3.layout.cloud).toBeDefined();
        expect(typeof locald3.layout.cloud).toEqual('function');
      });

    });


  } catch (e) {
    console.log(e);
    console.log(e, e.stack);
  }

// })();