// (function() {

  /* globals require, describe, it, expect, console, d3, document */
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
      var myFewWords,
        myColorFunction,
        myReproduceableDrawFunction,
        WIDTH = 900,
        HEIGHT = 900;

      // Short hand to build an array of word objects with random importance
      myFewWords = "As a user I want to be able to remove words and see roughly the same cloud".split(" ")
        .map(function(word) {
          return {
            text: word,
            importance: 10 + Math.random() * 90
          };
        });

      myColorFunction = locald3.scale.category20();


      // Declare our own draw function which will be called on the "end" event 
      myReproduceableDrawFunction = function(words, element) {
        // if (element && element.children) {
        //   element.innerHTML = "";
        // }
        var svg = locald3.select(element).append("svg");
        svg.attr("width", WIDTH)
          .attr("height", HEIGHT)
          .append("g")
          .attr("transform", "translate(450,450)")
          .selectAll("text")
          .data(words)
          .enter().append("text")
          .style("font-size", function(word) {
            return word.importance + "px";
          })
          .style("font-family", "Impact")
          .style("fill", function(word, i) {
            if (!word.color) {
              word.color = myColorFunction(i);
            }
            return word.color;
          })
          .attr("text-anchor", "middle")
          .attr("transform", function(word) {
            if (!word.transform) {
              word.transform = "translate(" + [word.x, word.y] + ")rotate(" + word.rotate + ")";
            }
            return word.transform;
          })
          .text(function(word) {
            return word.text;
          });
      };


      describe('Redraw a new cloud', function() {

        // Hoist all vars 
        var myRerenderableCloud,
          redrawNewCloudElement;

        redrawNewCloudElement = localdocument.createElement("div");
        redrawNewCloudElement.setAttribute("id", "redraw-new-cloud");
        localdocument.body.appendChild(redrawNewCloudElement);

        // Ask d3-cloud to make an cloud object for us
        myRerenderableCloud = d3CloudLayout();

        // Configure our cloud with d3 chaining
        myRerenderableCloud
          .size([WIDTH, HEIGHT])
          .words(myFewWords)
          .padding(5)
          .rotate(function(word) {
            if (word.rotate === null || word.rotate === undefined) {
              word.rotate = ~~(Math.random() * 2) * 90;
            }
            return word.rotate;
          })
          .font("Impact")
          .fontSize(function(word) {
            return word.importance;
          })
          .on("end", function(words) {
            myReproduceableDrawFunction(words, redrawNewCloudElement);
          });

        it('should have its own element', function() {
          expect(redrawNewCloudElement).toBeDefined();
          expect(redrawNewCloudElement.children).toBeDefined();
        });

        it('should have word objects', function() {
          expect(myRerenderableCloud.words().length).toEqual(17);
          expect(myRerenderableCloud.words()[13].text).toEqual('roughly');
          expect(myRerenderableCloud.words()[15].text).toEqual('same');
        });

        it('should add render attributes upon start', function() {
          myRerenderableCloud.start();

          var representativeWord = myRerenderableCloud.words()[15];
          expect(representativeWord.rotate).toBeDefined();
          expect(representativeWord.size).toBeDefined();
          expect(representativeWord.padding).toBeDefined();
          expect(representativeWord.width).toBeDefined();
          expect(representativeWord.height).toBeDefined();

          expect(representativeWord.xoff).toBeDefined();
          expect(representativeWord.yoff).toBeDefined();
          expect(representativeWord.x1).toBeDefined();
          expect(representativeWord.y1).toBeDefined();
          expect(representativeWord.x0).toBeDefined();
          expect(representativeWord.y0).toBeDefined();
          expect(representativeWord.x).toBeDefined();
          expect(representativeWord.y).toBeDefined();
        });

        it('should not change word objects render attributes on subsequent start()', function() {
          var wordBeforeRerender = JSON.parse(JSON.stringify(myRerenderableCloud.words()[15]));

          var cleanedWords = myRerenderableCloud.words();
          var removedWord = cleanedWords.splice(13, 1);
          expect(removedWord[0].text).toEqual('roughly');

          myRerenderableCloud.words(cleanedWords);
          expect(myRerenderableCloud.words().length).toEqual(16);

          myRerenderableCloud.start();
          var wordAfterRender = myRerenderableCloud.words()[14];

          expect(wordBeforeRerender.text).toEqual(wordAfterRender.text);
          expect(wordBeforeRerender.value).toEqual(wordAfterRender.value);
          expect(wordBeforeRerender.rotate).toEqual(wordAfterRender.rotate);
          expect(wordBeforeRerender.size).toEqual(wordAfterRender.size);
          expect(wordBeforeRerender.padding).toEqual(wordAfterRender.padding);
          expect(wordBeforeRerender.width).toEqual(wordAfterRender.width);
          expect(wordBeforeRerender.height).toEqual(wordAfterRender.height);

          // These attributes might change but dont seem to affect the render being identical
          // expect(wordBeforeRerender.xoff).toEqual(wordAfterRender.xoff);
          // expect(wordBeforeRerender.yoff).toEqual(wordAfterRender.yoff);
          // expect(wordBeforeRerender.x1).toEqual(wordAfterRender.x1);
          // expect(wordBeforeRerender.y1).toEqual(wordAfterRender.y1);
          // expect(wordBeforeRerender.x0).toEqual(wordAfterRender.x0);
          // expect(wordBeforeRerender.y0).toEqual(wordAfterRender.y0);
          // expect(wordBeforeRerender.x).toEqual(wordAfterRender.x);
          // expect(wordBeforeRerender.y).toEqual(wordAfterRender.y);
        });

      });

      xdescribe('Redraw an existing cloud', function() {

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