/**
 Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

 http://aws.amazon.com/apache2.0/

 or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

/**
 * This sample shows how to create a simple Trivia skill with a multiple choice format. The skill
 * supports 1 player at a time, and does not support games across sessions.
 */



'use strict';

var http = require('http');
var Firebase = require("firebase");
// var nodemailer = require('nodemailer');

// //emailer
// function sendEmail(emailText, emailHTML, callback){

//   var transporter = nodemailer.createTransport({
//     service: 'Gmail',
//       auth: {
//         user: 'spartahackechoramsay@gmail.com',
//       pass: 'spartahack2016'
//       }
//   });

//   var mailOptions = {
//     from: 'spartahackechoramsay@gmail.com', 
//     to: 'chen.bill96@gmail.com', 
//     subject: 'Purchase Reminder', 
//     text: emailText, 
//     html: emailHTML 
//   };

//   transporter.sendMail(mailOptions, function(err, info){
//     if(err){
//       console.log("Error sending email: " + err);
//     }
//     console.log('Message sent: ' + info.response);
//     callback("Sucessfully sent message");
//   });

// };

var apiKey = "1a2pNH4Ed5Yt15zsqR28Q2MUXJt4gG7B";

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {

    if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.10bc99aa-7ab8-45c2-9a70-d9c24abaaa15") {
        context.fail("Invalid Application ID");
     }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

//Called when the session starts.
function onSessionStarted(sessionStartedRequest, session) {
}


//Called when the user invokes the skill without specifying what they want.
function onLaunch(launchRequest, session, callback) {
    getWelcomeResponse(callback);
}

//Called when the user specifies an intent for this skill.
function onIntent(intentRequest, session, callback) {
    var session = new Firebase('https://fiery-heat-3854.firebaseio.com/');


    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    if ("QueryRecipesIntent" === intentName) {
        recipeSearch(intent, session, callback);
    } else if ("RecipeSelectionIntent" === intentName) {
        recipeSelect(intent, session, callback);
    } else if ("StartInstructions" === intentName) {
        startInstructions(intent, session, callback);
    } else if ("GiveInstructionControl" === intentName) {
        giveInstructionControl(intent, session, callback);
    } else if ("GiveInstructionIndex" === intentName) {
        giveInstructionIndex(intent, session, callback);
    } else if ("AMAZON.StartOverIntent" === intentName) {
        getWelcomeResponse(intent, session, callback);
    } else if ("AMAZON.RepeatIntent" === intentName) {
        handleRepeatRequest(intent, session, callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
        handleGetHelpRequest(intent, session, callback);
    } else if ("AMAZON.StopIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    } else if ("AMAZON.CancelIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    } else if ("JokeIntent" === intentName) {
        tellJoke(callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // Add any cleanup logic here
}

// ------- Skill specific business logic -------

function getWelcomeResponse(callback) {
    var sessionAttributes = {},
        speechOutput = "Welcome to Cloud Kitchen. Ask me for a recipe.",
        repromptText = "Ask me for a recipe.";

    sessionAttributes = {
        "speechOutput": speechOutput,
        "repromptText": repromptText
        // "currentQuestionIndex": currentQuestionIndex
    };
    callback(sessionAttributes,
        buildSpeechletResponse("card", speechOutput, repromptText, false));
}

function recipeSearch(intent, session, callback){

  var rootRef = session;
  console.log(rootRef);

  var recipeName = intent.slots.Recipe.value.replace(/\s/g, '%20');

    var host = "api.bigoven.com"
    var path = "/recipes?pg=1&rpp=25&title_kw="
              + recipeName
              + "&api_key=" + apiKey + "&sort=quality";

    var post_options = {
        hostname: host,
        path: path,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    // console.log(host+path);
    var req = http.request(post_options, function(res) {
        var output = "";
        var recipesObject = {};
        var recipesArray = [];
        var topFiveRecipes = [];

        res.on("data", function (chunk) {
            output += chunk
        })
        res.on("error", console.log)
        res.on("end", function () {
            recipesObject = JSON.parse(output);
            recipesArray = recipesObject.Results.reverse();

            var speechOutput = "Select a recipe. ";
            var repromptText = "Select a recipe. ";

            for(var x = 0; x < 5 ; x++){
                speechOutput = speechOutput + (x+1).toString() + " - " + recipesArray[x].Title + ", ";

                repromptText = repromptText + (x+1).toString() + " - " + recipesArray[x].Title + ", ";
                topFiveRecipes.push(recipesArray[x]);
            }

            var choiceRef = rootRef.child("Choices");
            choiceRef.set(topFiveRecipes);

            console.log(topFiveRecipes);
            console.log(speechOutput);

            var sessionAttributes = {
                    "speechOutput": repromptText,
                    "repromptText": repromptText
                    // "currentQuestionIndex": currentQuestionIndex
                };

            callback(sessionAttributes, buildSpeechletResponse("card", speechOutput, repromptText, false));
        })
    }).end();
}

function recipeSelect(intent, session, callback){
    console.log('recipeSelect');
    console.log(intent.slots.Selection.value);

    var index = parseInt(intent.slots.Selection.value) -1

    var rootRef = session;

    var recipeRef = rootRef.child("Recipe");

    var choicesRef = rootRef.child("Choices");
    choicesRef.once('value', function(choicesSnapshot){
      var choicesJson = choicesSnapshot.val();

      var selectionId = choicesJson[index].RecipeID;

      var host = "api.bigoven.com";
      var path = "/recipe/" + selectionId + "?api_key=" + apiKey;

      var post_options = {
          hostname: host,
          path: path,
          method: 'GET',
          headers: {
              'Content-Type': 'application/json'
          }
      };
      // console.log(host+path);
      var req = http.request(post_options, function(res) {
          var output = "";
          var recipeObject = {};
          var newObj = {};
          var finalObj = {};

          res.on("data", function (chunk) {
              output += chunk
          })
          res.on("error", console.log)
          res.on("end", function () {
              recipeObject = JSON.parse(output);

              var newObj = {};
              newObj.Title = recipeObject.Title;
              newObj.Ingredients = recipeObject.Ingredients;
              newObj.Instructions = recipeObject.Instructions;
              var newstring = newObj.Instructions.replace(/[&\/\\#,+()$~%'":*?<>\r{}\n]/g, '').replace("..", "").trim();
              var array = newstring.split('. ');
               var replaceObj = [];
            //   console.log(array);
               for (var i = 1; i < array.length; i ++) {
                    replaceObj.push("Step " + i + ": " + array[i]);
               }
              // newObj.Instructions = replaceObj;
              


              newObj.Instructions = replaceObj;
              newObj.CurrentStep = 0;

              recipeRef.set(newObj);
              // finalObj = JSON.stringify(newObj);

              var speechOutput = "You have selected " + newObj.Title + ". Ask me about the ingredients and cooking instructions.";
              var repromptText = "You have selected " + newObj.Title + ". Ask me about the ingredients and cooking instructions.";

              var sessionAttributes = {
                      "speechOutput": speechOutput,
                      "repromptText": repromptText
                      // "currentQuestionIndex": currentQuestionIndex
                  };

            //   console.log(speechOutput);
              callback(sessionAttributes, buildSpeechletResponse("card", speechOutput, repromptText, false));
          })
      }).end();

    })  
}

function startInstructions (intent, session, callback){
  console.log('startInstructions');
  var index = 0;

  var rootRef = session;
  var recipeRef = rootRef.child("Recipe");
  var currentStepRef = recipeRef.child("CurrentStep");  

  recipeRef.once('value', function(recipeSnapshot){
    //recipe snapshot is an array
    var recipeSnapshotObject = recipeSnapshot.val();
    var instructionsArray = recipeSnapshotObject.Instructions;

    var speechOutput = instructionsArray[index];
    var repromptText = "Would you like to continue?"

    var sessionAttributes = {
      "speechOutput": speechOutput,
      "repromptText": repromptText
      // "currentQuestionIndex": currentQuestionIndex
    };

    currentStepRef.set(index);

    callback(sessionAttributes, buildSpeechletResponse("card", speechOutput, repromptText, false));
  }) 
}

function giveInstructionControl(intent, session, callback){
    console.log('giveInstructioncontrol');
  var control = intent.slots.Control.value;

  var rootRef = session;
  var recipeRef = rootRef.child("Recipe");

  var currentStepRef = recipeRef.child("CurrentStep");
  recipeRef.once('value', function(recipeSnapshot){
    //recipe snapshot is an array
    var recipeSnapshotObject = recipeSnapshot.val();
    var instructionsArray = recipeSnapshotObject.Instructions;
    var index = recipeSnapshotObject.CurrentStep;

    console.log(index);
    console.log(instructionsArray);

    var speechOutput = ""
    var repromptText = "Would you like to continue?"

    if (control == 'next'){
      index++;
      speechOutput = instructionsArray[index];
    } else if(control == 'previous' || control == 'last'){
      index--;
      speechOutput = instructionsArray[index];
    } else {
      speechOutput = "I didn't quite get that. Say next or previous";
    }

    var sessionAttributes = {
      "speechOutput": speechOutput,
      "repromptText": repromptText
      // "currentQuestionIndex": currentQuestionIndex
    };

    currentStepRef.set(index);

    callback(sessionAttributes, buildSpeechletResponse("card", speechOutput, repromptText, false));
  }) 
}

function giveInstructionIndex(intent, session, callback){
  console.log('giveInstructionIndex');
  //retrieve from firebase

  var instructionsArray = mockInstructions;
  var speechOutput = ""
  var repromptText = "Would you like to continue?"

  var rootRef = session;
  var recipeRef = rootRef.child("Recipe");

  var currentStepRef = recipeRef.child("CurrentStep");

  recipeRef.once('value', function(recipeSnapshot){
    //recipe snapshot is an array

    var recipeSnapshotObject = recipeSnapshot.val();
    var instructionsArray = recipeSnapshotObject.Instructions;
    var index = 0;

    var speechOutput = ""
    var repromptText = "Would you like to continue?"

    try {
      index = parseInt(intent.slots.InstructionIndex.value)-1;
      if(index < instructionsArray.length){
          speechOutput = instructionsArray[index];    
      } else {
          speechOutput = "Step out of range. There are only " + instructionsArray.length.toString() + " steps";
      }
      
    }
    catch(err) {
      speechOutput = "I didn't quite get that. Please give me the step number";
    }

    var sessionAttributes = {
      "speechOutput": speechOutput,
      "repromptText": repromptText
      // "currentQuestionIndex": currentQuestionIndex
    };

    currentStepRef.set(index);

    callback(sessionAttributes, buildSpeechletResponse("card", speechOutput, repromptText, false));
  }) 
};

function handleRepeatRequest(intent, session, callback) {
    // Repeat the previous speechOutput and repromptText from the session attributes if available
    // else start a new game session
    if (!session.attributes || !session.attributes.speechOutput) {
        getWelcomeResponse(callback);
    } else {
        callback(session.attributes,
            buildSpeechletResponseWithoutCard(session.attributes.speechOutput, session.attributes.repromptText, false));
    }
}

function handleGetHelpRequest(intent, session, callback) {
    // Provide a help prompt for the user, explaining how the game is played. Then, continue the game
    // if there is one in progress, or provide the option to start another one.

    // Do not edit the help dialogue. This has been created by the Alexa team to demonstrate best practices.

    var speechOutput = "You asked for help",
        repromptText = "repromptText",
        shouldEndSession = false;

    callback(session.attributes,
        buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession));
}

function handleFinishSessionRequest(intent, session, callback) {
    // End the session with a "Good bye!" if the user wants to quit the game
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Good bye!", "", true));
}

function tellJoke(callback){
    var speechOutput = "Test";
    var randomIndex = Math.floor(Math.random() * (jokes.length-1 + 1));
    console.log(randomIndex);

    callback(null, buildSpeechletResponseWithoutCard(jokes[randomIndex], null, false));
}


// ------- Helper functions to build responses -------
function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}

var mockInstructions = [ 'Step 1: Mix two parts garlic powder to one part each salt pepper onion powder and paprika',
  'Step 2: For 2 large chicken breasts I use about 1 tsp garlic powder and 12 tsp each of everything else',
  'Step 3: Evenly sprinkle the chicken breasts with the seasoning mixture.Heat a oven-safe panskillet on moderately high heat',
  'Step 4: Add about 1-2 TB spoon of oil to the pan',
  'Step 5: Once heated place the chicken in the pan',
  'Step 6: Cook until golden brown on each side – about 3 minutes no more! on each side.Transfer the pan to the oven',
  'Step 7: Bake in preheated oven on the top rack for about 20 minutes until the internal temperature of the chicken breast reaches 165 degrees and juices run clear.Remove from heat',
  'Step 8: Allow the chicken breasts to sit for about 5 minutes to allow the juices to redistribute',
  'Step 9: Serve as desired',
  'Step 10: Store leftovers in an airtight container in the refrigerator.',
  'Step 11: undefined' ]



var jokes = [
  "Mushroom walks in a bar, bartender says hey you can't drink here. Mushroom says why not, Im a Fun-gi!",
  "What do you call a fake noodle? An Impasta.",
  "Why don't eggs tell jokes? They'd crack each other up!",
  "Your cooking",
  "What does a nosey pepper do? Gets jalapeno business!"
]
