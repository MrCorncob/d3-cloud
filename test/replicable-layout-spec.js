(function() {

  /* globals require, describe, it, expect, console, d3, document, MersenneTwister */
  'use strict';

  try {

    var localdocument;
    var locald3;
    var d3CloudLayout;
    var LocalMersenneTwister;
    try {
      localdocument = document;
      locald3 = d3;
      d3CloudLayout = d3.layout.cloud;
      LocalMersenneTwister = MersenneTwister;
    } catch (e) {
      localdocument = require("jsdom").jsdom("<body></body>");
      locald3 = require("d3");
      d3CloudLayout = require("../");
      LocalMersenneTwister = require("mersenne-twister");
    }

    describe('Replicable layout', function() {
      var myFewWordsFactory,
        myColorFunction,
        myReproduceableDrawFunction,
        WIDTH = 400,
        HEIGHT = 400,
        SEED = 2;

      // Short hand to build an array of word objects with random importance (as a function to ensure no shared state between the clouds)
      myFewWordsFactory = function() {
        var randomImportanceGenerator = new LocalMersenneTwister(SEED);
        return "As a user I want to be able to remove words and see roughly the same cloud".split(" ")
          .map(function(word) {
            return {
              text: word,
              importance: 10 + randomImportanceGenerator.random() * 90
            };
          });
      };

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
          .attr("transform", "translate(" + WIDTH / 2 + "," + HEIGHT / 2 + ")")
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


      describe('generate same text data', function() {

        it('should have equivalent data', function() {
          var firstPageLoad = myFewWordsFactory();
          var secondPageLoad = myFewWordsFactory();
          expect(secondPageLoad[0].importance).not.toEqual(firstPageLoad[firstPageLoad.length - 1].importance);
          for (var wordIndex = 0; wordIndex < secondPageLoad.length; wordIndex++) {
            expect(secondPageLoad[wordIndex].importance).toEqual(firstPageLoad[wordIndex].importance);
          }
        });

        it('should use the same code but not leak state ', function() {
          expect(myFewWordsFactory()).not.toBe(myFewWordsFactory());
        });

      });

      describe('Redraw a new random cloud', function() {

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
          .words(myFewWordsFactory())
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
          expect(representativeWord.color).toBeDefined();
          expect(representativeWord.transform).toBeDefined();
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
          expect(wordBeforeRerender.color).toEqual(wordAfterRender.color);
          expect(wordBeforeRerender.transform).toEqual(wordAfterRender.transform);

          expect(wordBeforeRerender.rotate).toEqual(wordAfterRender.rotate);
          expect(wordBeforeRerender.padding).toEqual(wordAfterRender.padding);

          // If this version of d3.layout.cloud has recursive fit for all words, they might not be the exact same size and therefore width and height
          if (wordBeforeRerender.size === wordAfterRender.size) {
            expect(wordBeforeRerender.size).toEqual(wordAfterRender.size);
            expect(wordBeforeRerender.width).toEqual(wordAfterRender.width);
            expect(wordBeforeRerender.height).toEqual(wordAfterRender.height);
          }

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

      /**
       * https://github.com/jasondavies/d3-cloud/pull/1
       * https://github.com/jasondavies/d3-cloud/pull/8
       * https://github.com/jasondavies/d3-cloud/pull/14
       * https://github.com/jasondavies/d3-cloud/pull/35
       * https://github.com/jasondavies/d3-cloud/pull/45
       * https://github.com/WheatonCS/Lexos/issues/149
       */
      describe('Redraw the same pseudorandom cloud from the same text', function() {
        // Hoist all vars 
        var myPseudorandomCloud,
          myPseudorandomCloudsElement,
          myRandomGenerator = new LocalMersenneTwister(SEED),
          myRotateRandomGenerator = new LocalMersenneTwister(SEED),
          mySecondPseudorandomCloud,
          mySecondPseudorandomCloudsElement,
          mySecondRandomGenerator = new LocalMersenneTwister(SEED),
          mySecondRotateRandomGenerator = new LocalMersenneTwister(SEED);

        myPseudorandomCloudsElement = localdocument.createElement("span");
        myPseudorandomCloudsElement.setAttribute("id", "pseudo-random-cloud");
        localdocument.body.appendChild(myPseudorandomCloudsElement);

        mySecondPseudorandomCloudsElement = localdocument.createElement("span");
        mySecondPseudorandomCloudsElement.setAttribute("id", "second-pseudo-random-cloud");
        localdocument.body.appendChild(mySecondPseudorandomCloudsElement);


        // Ask d3-cloud to make an cloud object for us
        myPseudorandomCloud = d3CloudLayout();

        // Configure our cloud with d3 chaining
        myPseudorandomCloud
          .random(function() {
            return myRandomGenerator.random();
          })
          .size([WIDTH, HEIGHT])
          .words(myFewWordsFactory())
          .padding(5)
          .rotate(function(word) {
            if (word.rotate === null || word.rotate === undefined) {
              word.rotate = ~~(myRotateRandomGenerator.random() * 2) * 90;
            }
            return word.rotate;
          })
          .font("Impact")
          .fontSize(function(word) {
            return word.importance;
          })
          .on("end", function(words) {
            myReproduceableDrawFunction(words, myPseudorandomCloudsElement);
          });


        myPseudorandomCloud.start();
        it('should generate a seemingly random cloud', function() {
          var representativeWord = myPseudorandomCloud.words()[15];

          expect(representativeWord).toBeDefined();
          expect(representativeWord).toBe(myPseudorandomCloud.words()[15]);
          expect(representativeWord.rotate).toBeDefined();
          expect(representativeWord.size).toBeDefined();
          expect(representativeWord.padding).toBeDefined();
          expect(representativeWord.width).toBeDefined();
          expect(representativeWord.height).toBeDefined();
        });

        it('should generate a second matching seemingly random cloud', function() {
          // Ask d3-cloud to make an cloud object for us
          mySecondPseudorandomCloud = d3CloudLayout();

          // Configure our cloud with d3 chaining
          mySecondPseudorandomCloud
            .random(function() {
              return mySecondRandomGenerator.random();
            })
            .size([WIDTH, HEIGHT])
            .words(myFewWordsFactory())
            .padding(5)
            .rotate(function(word) {
              if (word.rotate === null || word.rotate === undefined) {
                word.rotate = ~~(mySecondRotateRandomGenerator.random() * 2) * 90;
              }
              return word.rotate;
            })
            .font("Impact")
            .fontSize(function(word) {
              return word.importance;
            })
            .on("end", function(words) {
              myReproduceableDrawFunction(words, mySecondPseudorandomCloudsElement);
            });


          mySecondPseudorandomCloud.start();

          var representativeWord = myPseudorandomCloud.words()[15];
          expect(representativeWord).toBeDefined();
          expect(representativeWord).toBe(myPseudorandomCloud.words()[15]);

          var representativeWordInSecondCloud = mySecondPseudorandomCloud.words()[15];
          expect(representativeWordInSecondCloud).toBeDefined();
          expect(representativeWordInSecondCloud).toBe(mySecondPseudorandomCloud.words()[15]);
          expect(representativeWordInSecondCloud.rotate).toBeDefined();
          expect(representativeWordInSecondCloud.size).toBeDefined();
          expect(representativeWordInSecondCloud.padding).toBeDefined();
          expect(representativeWordInSecondCloud.width).toBeDefined();
          expect(representativeWordInSecondCloud.height).toBeDefined();

          // Make sure that there is NO shared state between clouds, otherwise this proves nothing.
          expect(representativeWordInSecondCloud).not.toBe(representativeWord);

          expect(representativeWordInSecondCloud.text).toEqual(representativeWord.text);
          expect(representativeWordInSecondCloud.value).toEqual(representativeWord.value);
          expect(representativeWordInSecondCloud.rotate).toEqual(representativeWord.rotate);
          expect(representativeWordInSecondCloud.color).toEqual(representativeWord.color);
          expect(representativeWordInSecondCloud.transform).toEqual(representativeWord.transform);
          expect(representativeWordInSecondCloud.size).toEqual(representativeWord.size);
          expect(representativeWordInSecondCloud.padding).toEqual(representativeWord.padding);
          expect(representativeWordInSecondCloud.width).toEqual(representativeWord.width);
          expect(representativeWordInSecondCloud.height).toEqual(representativeWord.height);
          expect(representativeWordInSecondCloud.x).toEqual(representativeWord.x);
          expect(representativeWordInSecondCloud.y).toEqual(representativeWord.y);

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