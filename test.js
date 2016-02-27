var Firebase = require('firebase');

var rootRef = new Firebase('https://fiery-heat-3854.firebaseio.com/')
var step;
var myJson;

var stepRef = rootRef.child('step');
var recipeRef = rootRef.child('recipe');

        rootRef.on('value', function(rootSnapshot){
          rootRef.child('step').on('value', function(stepSnapshot){
            step = stepSnapshot.val();
          });
          rootRef.child('recipe').on('value', function(recipeSnapshot){
            myJson = recipeSnapshot.val();
            console.log("Step " + (step + 1) + ", " + myJson[step]);
          });
        });

        /** CODE NEEDS TO BE REDONE WITH ALEXA INPUT **/
/*
        //Alexa what was step __ again?
        setBtn.addEventListener('click', function(){
            stepRef.set(+(document.getElementById('stepNumber').value) - 1);
        })

        //Alexa, next step please
        nextBtn.addEventListener('click', function(){
            stepRef.set((step + 1));
        });

        //Alexa, could you repeat the step again?
        currBtn.addEventListener('click', function(){
          console.log("Step " + (step + 1) + ", " + myJson[step]);
        });

        //Alexa, what was the last step?
        prevBtn.addEventListener('click', function(){
            stepRef.set((step - 1));
        });
*/
