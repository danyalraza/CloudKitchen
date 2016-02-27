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

var fireBaseObject = {
    description:{

    },
    prep:{

    },
    ingredients: {

    },
    step: {

    },
    utensils: {

    }
};

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
    //make http call to firebase here, store it in session;

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    if ("QueryRecipesIntent" === intentName) {
        recipeSearch(intent, session, callback);
    } else if ("RecipeSelectionIntent" === intentName) {
        recipeSelect(intent, session, callback);
    } else if ("AMAZON.StartOverIntent" === intentName) {
        recipeSearch(intent, session, callback);
    } else if ("AMAZON.RepeatIntent" === intentName) {
        handleRepeatRequest(intent, session, callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
        handleGetHelpRequest(intent, session, callback);
    } else if ("AMAZON.StopIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    } else if ("AMAZON.CancelIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
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

// function recipeSearch(intent, session, callback){
//     var recipeName = intent.slots.Recipe.value.replace(/\s/g, '%20');

//     var host = "api.bigoven.com";
//     var path = "/recipes?pg=1&rpp=25&title_kw="
//               + recipeName
//               + "&api_key=" + apiKey + "&sort=quality";

//     var post_options = {
//         hostname: host,
//         path: path,
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json'
//         }
//     };
//     console.log(host+path);
//     var req = http.request(post_options, function(res) {
//         var output = "";
//         var recipesObject = {};
//         var recipesArray = [];
            // var topFiveRecipes = [];
        
//         res.on("data", function (chunk) {
//             console.log(chunk);
//             output += chunk;
//         });
//         res.on("error", console.log('Error'));
//         res.on("end", function () {
//             // recipesObject = JSON.parse(output);
//             recipesObject = JSON.parse(mockData);

//             //write to firebase
//             recipesArray = recipesObject.Results.reverse();
//             var speechOutput = "";

//             for(var x = 0; x < 5 ; x++){
        //         speechOutput = speechOutput + (x+1).toString() + " - " + recipesArray[x].Title + ", ";
//                 speechOutput = speechOutput + recipesArray[x].Title + ", ";
                // topFiveRecipes.push(recipesArray[x]);
//                 console.log(speechOutput);
//             }

//             var repromptText = "Select a recipe";
            
//             var sessionAttributes = {
//                     "speechOutput": repromptText,
//                     "repromptText": repromptText
//                     // "currentQuestionIndex": currentQuestionIndex
//                 };
        
//             callback(sessionAttributes, buildSpeechletResponse("card", speechOutput, repromptText, false));            
//         })
//     }).end();
// }

function recipeSearch(intent, session, callback){
    var output = "";
    var recipesObject = {};
    var recipesArray = [];
    var topFiveRecipes = [];

    recipesObject = mockData;

    //write to firebase
    recipesArray = recipesObject.Results.reverse();
    var speechOutput = "Please select one of the following recipes. ";
    var repromptText = "Please select one of the following recipes. ";

    for(var x = 0; x < 5 ; x++){
        speechOutput = speechOutput + (x+1).toString() + " - " + recipesArray[x].Title + ", ";
        repromptText = speechOutput + (x+1).toString() + " - " + recipesArray[x].Title + ", ";
        topFiveRecipes.push(recipesArray[x]);
        console.log(speechOutput);
    }

    console.log(topFiveRecipes);
    
    var sessionAttributes = {
            "speechOutput": repromptText,
            "repromptText": repromptText
            // "currentQuestionIndex": currentQuestionIndex
        };

    callback(sessionAttributes, buildSpeechletResponse("card", speechOutput, repromptText, false));     
}

function recipeSelect(intent, session, callback){
    //session contains the json with recipe id
    session = mockData;
    
    var selectionId = mockData[intent.slots.Selection.value - 1].RecipeID;

    var host = "api.bigoven.com";
    var path = "/recipe/" + selectionId + "?api_key=" + apiKey;

    console.log(host+path);

    var post_options = {
        hostname: host,
        path: path,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    var req = http.request(post_options, function(res) {
        var output = "";
        var recipeObject = {};
        
        res.on("data", function (chunk) {
            console.log(chunk);
            output += chunk;
        });
        res.on("error", console.log('Error'));
        res.on("end", function () {

            recipeObject = JSON.parse();

            //write to firebase

            var speechOutput = "You have selected " + recipeObject.Title + ". Ask me about the ingredients and cooking instructions.";
            var repromptText = "You have selected " + recipeObject.Title + ". Ask me about the ingredients and cooking instructions.";
            
            var sessionAttributes = {
                    "speechOutput": repromptText,
                    "repromptText": repromptText
                    // "currentQuestionIndex": currentQuestionIndex
                };
        
            callback(sessionAttributes, buildSpeechletResponse("card", speechOutput, repromptText, false));            
        })
    }).end();
}



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

var mockData = [
    {
      "RecipeID": 480473,
      "Title": "Chicken Breast",
      "Cuisine": "",
      "Category": "Main Dish",
      "Subcategory": "Poultry - Chicken",
      "Microcategory": "",
      "StarRating": 0,
      "StarRatingIMG": null,
      "WebURL": "http:\/\/www.bigoven.com\/recipe\/chicken-breast\/480473",
      "ImageURL": "http:\/\/redirect.bigoven.com\/pics\/recipe-no-image.jpg",
      "ImageURL120": "http:\/\/redirect.bigoven.com\/pics\/rs\/120\/recipe-no-image.jpg",
      "ReviewCount": 0,
      "Poster": {
        "UserID": 1953785,
        "UserName": "yelay52",
        "ImageURL48": "http:\/\/images.bigoven.com\/image\/upload\/t_recipe-48,d_avatar-default.png\/avatar-default.png",
        "PhotoUrl": "http:\/\/photos.bigoven.com\/avatar\/photo\/avatar-default.png",
        "IsPremium": false,
        "IsKitchenHelper": false,
        "PremiumExpiryDate": null,
        "MemberSince": null,
        "IsUsingRecurly": false,
        "FirstName": null,
        "LastName": null
      },
      "IsPrivate": false,
      "HideFromPublicSearch": false,
      "IsBookmark": null,
      "BookmarkURL": null,
      "YieldNumber": 1,
      "QualityScore": 0,
      "CreationDate": "\/Date(1364388055583)\/",
      "MaxImageSquare": 256,
      "TotalTries": 4,
      "HeroPhotoUrl": "http:\/\/photos.bigoven.com\/recipe\/hero\/recipe-no-image.jpg"
    },
    {
      "RecipeID": 462679,
      "Title": "Chicken Breast",
      "Cuisine": "",
      "Category": "Main Dish",
      "Subcategory": "Poultry - Chicken",
      "Microcategory": "",
      "StarRating": 0,
      "StarRatingIMG": null,
      "WebURL": "http:\/\/www.bigoven.com\/recipe\/chicken-breast\/462679",
      "ImageURL": "http:\/\/redirect.bigoven.com\/pics\/recipe-no-image.jpg",
      "ImageURL120": "http:\/\/redirect.bigoven.com\/pics\/rs\/120\/recipe-no-image.jpg",
      "ReviewCount": 0,
      "Poster": {
        "UserID": 1532789,
        "UserName": "malindameeks21",
        "ImageURL48": "http:\/\/images.bigoven.com\/image\/upload\/t_recipe-48,d_avatar-default.png\/avatar-default.png",
        "PhotoUrl": "http:\/\/photos.bigoven.com\/avatar\/photo\/avatar-default.png",
        "IsPremium": true,
        "IsKitchenHelper": false,
        "PremiumExpiryDate": null,
        "MemberSince": null,
        "IsUsingRecurly": false,
        "FirstName": null,
        "LastName": null
      },
      "IsPrivate": false,
      "HideFromPublicSearch": false,
      "IsBookmark": null,
      "BookmarkURL": null,
      "YieldNumber": 5,
      "QualityScore": 0,
      "CreationDate": "\/Date(1362292763537)\/",
      "MaxImageSquare": 256,
      "TotalTries": 0,
      "HeroPhotoUrl": "http:\/\/photos.bigoven.com\/recipe\/hero\/recipe-no-image.jpg"
    },
    {
      "RecipeID": 60255,
      "Title": "Chicken Breasts",
      "Cuisine": "American",
      "Category": "Main Dish",
      "Subcategory": "Poultry - Chicken",
      "Microcategory": "",
      "StarRating": 0,
      "StarRatingIMG": null,
      "WebURL": "http:\/\/www.bigoven.com\/recipe\/chicken-breasts\/60255",
      "ImageURL": "http:\/\/redirect.bigoven.com\/pics\/recipe-no-image.jpg",
      "ImageURL120": "http:\/\/redirect.bigoven.com\/pics\/rs\/120\/recipe-no-image.jpg",
      "ReviewCount": 0,
      "Poster": null,
      "IsPrivate": false,
      "HideFromPublicSearch": false,
      "IsBookmark": null,
      "BookmarkURL": null,
      "YieldNumber": 6,
      "QualityScore": 0,
      "CreationDate": "\/Date(1072915200000)\/",
      "MaxImageSquare": 256,
      "TotalTries": 1,
      "HeroPhotoUrl": "http:\/\/photos.bigoven.com\/recipe\/hero\/recipe-no-image.jpg"
    },
    {
      "RecipeID": 423607,
      "Title": "Chicken Breasts",
      "Cuisine": "",
      "Category": "Main Dish",
      "Subcategory": "Poultry - Chicken",
      "Microcategory": "",
      "StarRating": 0,
      "StarRatingIMG": null,
      "WebURL": "http:\/\/www.bigoven.com\/recipe\/chicken-breasts\/423607",
      "ImageURL": "http:\/\/redirect.bigoven.com\/pics\/recipe-no-image.jpg",
      "ImageURL120": "http:\/\/redirect.bigoven.com\/pics\/rs\/120\/recipe-no-image.jpg",
      "ReviewCount": 0,
      "Poster": {
        "UserID": 1832367,
        "UserName": "rliccardi31",
        "ImageURL48": "http:\/\/images.bigoven.com\/image\/upload\/t_recipe-48,d_avatar-default.png\/avatar-default.png",
        "PhotoUrl": "http:\/\/photos.bigoven.com\/avatar\/photo\/avatar-default.png",
        "IsPremium": false,
        "IsKitchenHelper": false,
        "PremiumExpiryDate": null,
        "MemberSince": null,
        "IsUsingRecurly": false,
        "FirstName": null,
        "LastName": null
      },
      "IsPrivate": false,
      "HideFromPublicSearch": false,
      "IsBookmark": null,
      "BookmarkURL": null,
      "YieldNumber": 6,
      "QualityScore": 0,
      "CreationDate": "\/Date(1358079879590)\/",
      "MaxImageSquare": 256,
      "TotalTries": 2,
      "HeroPhotoUrl": "http:\/\/photos.bigoven.com\/recipe\/hero\/recipe-no-image.jpg"
    },
    {
      "RecipeID": 148066,
      "Title": "Chicken Breasts",
      "Cuisine": "American",
      "Category": "Main Dish",
      "Subcategory": "Poultry - Chicken",
      "Microcategory": "",
      "StarRating": 0,
      "StarRatingIMG": null,
      "WebURL": "http:\/\/www.bigoven.com\/recipe\/chicken-breasts\/148066",
      "ImageURL": "http:\/\/redirect.bigoven.com\/pics\/recipe-no-image.jpg",
      "ImageURL120": "http:\/\/redirect.bigoven.com\/pics\/rs\/120\/recipe-no-image.jpg",
      "ReviewCount": 0,
      "Poster": null,
      "IsPrivate": false,
      "HideFromPublicSearch": false,
      "IsBookmark": null,
      "BookmarkURL": null,
      "YieldNumber": 1,
      "QualityScore": 0,
      "CreationDate": "\/Date(1072915200000)\/",
      "MaxImageSquare": 256,
      "TotalTries": 1,
      "HeroPhotoUrl": "http:\/\/photos.bigoven.com\/recipe\/hero\/recipe-no-image.jpg"
    },
    {
      "RecipeID": 813780,
      "Title": "Chicken Breasts",
      "Cuisine": "Dinner",
      "Category": "Main Dish",
      "Subcategory": "Poultry - Chicken",
      "Microcategory": "",
      "StarRating": 0,
      "StarRatingIMG": null,
      "WebURL": "http:\/\/www.bigoven.com\/recipe\/chicken-breasts\/813780",
      "ImageURL": "http:\/\/redirect.bigoven.com\/pics\/recipe-no-image.jpg",
      "ImageURL120": "http:\/\/redirect.bigoven.com\/pics\/rs\/120\/recipe-no-image.jpg",
      "ReviewCount": 0,
      "Poster": {
        "UserID": 2317706,
        "UserName": "emulou",
        "ImageURL48": "http:\/\/images.bigoven.com\/image\/upload\/t_recipe-48,d_avatar-default.png\/avatar-default.png",
        "PhotoUrl": "http:\/\/photos.bigoven.com\/avatar\/photo\/avatar-default.png",
        "IsPremium": false,
        "IsKitchenHelper": false,
        "PremiumExpiryDate": null,
        "MemberSince": null,
        "IsUsingRecurly": false,
        "FirstName": null,
        "LastName": null
      },
      "IsPrivate": false,
      "HideFromPublicSearch": false,
      "IsBookmark": null,
      "BookmarkURL": null,
      "YieldNumber": 3,
      "QualityScore": 0,
      "CreationDate": "\/Date(1393519113547)\/",
      "MaxImageSquare": 256,
      "TotalTries": 4,
      "HeroPhotoUrl": "http:\/\/photos.bigoven.com\/recipe\/hero\/recipe-no-image.jpg"
    },
    {
      "RecipeID": 456826,
      "Title": "Chicken breasts",
      "Cuisine": "",
      "Category": "Main Dish",
      "Subcategory": "Poultry - Chicken",
      "Microcategory": "",
      "StarRating": 0,
      "StarRatingIMG": null,
      "WebURL": "http:\/\/www.bigoven.com\/recipe\/chicken-breasts\/456826",
      "ImageURL": "http:\/\/redirect.bigoven.com\/pics\/recipe-no-image.jpg",
      "ImageURL120": "http:\/\/redirect.bigoven.com\/pics\/rs\/120\/recipe-no-image.jpg",
      "ReviewCount": 0,
      "Poster": {
        "UserID": 475556,
        "UserName": "mqboom",
        "ImageURL48": "http:\/\/images.bigoven.com\/image\/upload\/t_recipe-48,d_avatar-default.png\/avatar-default.png",
        "PhotoUrl": "http:\/\/photos.bigoven.com\/avatar\/photo\/avatar-default.png",
        "IsPremium": false,
        "IsKitchenHelper": false,
        "PremiumExpiryDate": null,
        "MemberSince": null,
        "IsUsingRecurly": false,
        "FirstName": null,
        "LastName": null
      },
      "IsPrivate": false,
      "HideFromPublicSearch": false,
      "IsBookmark": null,
      "BookmarkURL": null,
      "YieldNumber": 4,
      "QualityScore": 0,
      "CreationDate": "\/Date(1361620335980)\/",
      "MaxImageSquare": 256,
      "TotalTries": 0,
      "HeroPhotoUrl": "http:\/\/photos.bigoven.com\/recipe\/hero\/recipe-no-image.jpg"
    },
    {
      "RecipeID": 1218779,
      "Title": "Chicken breast",
      "Cuisine": "",
      "Category": "Main Dish",
      "Subcategory": "Poultry - Chicken",
      "Microcategory": "",
      "StarRating": 0,
      "StarRatingIMG": null,
      "WebURL": "http:\/\/www.bigoven.com\/recipe\/chicken-breast\/1218779",
      "ImageURL": "http:\/\/redirect.bigoven.com\/pics\/recipe-no-image.jpg",
      "ImageURL120": "http:\/\/redirect.bigoven.com\/pics\/rs\/120\/recipe-no-image.jpg",
      "ReviewCount": 0,
      "Poster": {
        "UserID": 2756430,
        "UserName": "en4noelj8p3b6",
        "ImageURL48": "http:\/\/images.bigoven.com\/image\/upload\/t_recipe-48,d_avatar-default.png\/avatar-default.png",
        "PhotoUrl": "http:\/\/photos.bigoven.com\/avatar\/photo\/avatar-default.png",
        "IsPremium": false,
        "IsKitchenHelper": false,
        "PremiumExpiryDate": null,
        "MemberSince": null,
        "IsUsingRecurly": false,
        "FirstName": null,
        "LastName": null
      },
      "IsPrivate": false,
      "HideFromPublicSearch": false,
      "IsBookmark": null,
      "BookmarkURL": null,
      "YieldNumber": 1,
      "QualityScore": 0,
      "CreationDate": "\/Date(1434493275160)\/",
      "MaxImageSquare": 256,
      "TotalTries": 0,
      "HeroPhotoUrl": "http:\/\/photos.bigoven.com\/recipe\/hero\/recipe-no-image.jpg"
    },
    {
      "RecipeID": 60254,
      "Title": "Chicken Breasts",
      "Cuisine": "American",
      "Category": "Main Dish",
      "Subcategory": "Poultry - Chicken",
      "Microcategory": "",
      "StarRating": 0,
      "StarRatingIMG": null,
      "WebURL": "http:\/\/www.bigoven.com\/recipe\/chicken-breasts\/60254",
      "ImageURL": "http:\/\/redirect.bigoven.com\/pics\/recipe-no-image.jpg",
      "ImageURL120": "http:\/\/redirect.bigoven.com\/pics\/rs\/120\/recipe-no-image.jpg",
      "ReviewCount": 0,
      "Poster": null,
      "IsPrivate": false,
      "HideFromPublicSearch": false,
      "IsBookmark": null,
      "BookmarkURL": null,
      "YieldNumber": 8,
      "QualityScore": 0,
      "CreationDate": "\/Date(1072915200000)\/",
      "MaxImageSquare": 256,
      "TotalTries": 1,
      "HeroPhotoUrl": "http:\/\/photos.bigoven.com\/recipe\/hero\/recipe-no-image.jpg"
    },
    {
      "RecipeID": 557802,
      "Title": "Chicken Breasts",
      "Cuisine": null,
      "Category": "Main Dish",
      "Subcategory": "Poultry - Chicken",
      "Microcategory": "",
      "StarRating": 0,
      "StarRatingIMG": null,
      "WebURL": "http:\/\/www.bigoven.com\/recipe\/chicken-breasts\/557802",
      "ImageURL": "http:\/\/redirect.bigoven.com\/pics\/recipe-no-image.jpg",
      "ImageURL120": "http:\/\/redirect.bigoven.com\/pics\/rs\/120\/recipe-no-image.jpg",
      "ReviewCount": 0,
      "Poster": {
        "UserID": 1956574,
        "UserName": "lwardsmb",
        "ImageURL48": "http:\/\/images.bigoven.com\/image\/upload\/t_recipe-48,d_avatar-default.png\/avatar\/lwardsmb.jpg",
        "PhotoUrl": "http:\/\/photos.bigoven.com\/avatar\/photo\/lwardsmb.jpg",
        "IsPremium": true,
        "IsKitchenHelper": false,
        "PremiumExpiryDate": null,
        "MemberSince": null,
        "IsUsingRecurly": false,
        "FirstName": null,
        "LastName": null
      },
      "IsPrivate": false,
      "HideFromPublicSearch": false,
      "IsBookmark": null,
      "BookmarkURL": null,
      "YieldNumber": 2,
      "QualityScore": 0,
      "CreationDate": "\/Date(1372010986000)\/",
      "MaxImageSquare": 256,
      "TotalTries": 0,
      "HeroPhotoUrl": "http:\/\/photos.bigoven.com\/recipe\/hero\/recipe-no-image.jpg"
    },
    {
      "RecipeID": 159709,
      "Title": "Chicken Breasts",
      "Cuisine": "American",
      "Category": "Main Dish",
      "Subcategory": "Poultry - Chicken",
      "Microcategory": "",
      "StarRating": 4.2307692307692,
      "StarRatingIMG": null,
      "WebURL": "http:\/\/www.bigoven.com\/recipe\/chicken-breasts\/159709",
      "ImageURL": "http:\/\/redirect.bigoven.com\/pics\/chicken-breasts-2.jpg",
      "ImageURL120": "http:\/\/redirect.bigoven.com\/pics\/rs\/120\/chicken-breasts-2.jpg",
      "ReviewCount": 13,
      "Poster": {
        "UserID": 1776993,
        "UserName": "DonnaJN",
        "ImageURL48": "http:\/\/images.bigoven.com\/image\/upload\/t_recipe-48,d_avatar-default.png\/avatar-default.png",
        "PhotoUrl": "http:\/\/photos.bigoven.com\/avatar\/photo\/avatar-default.png",
        "IsPremium": true,
        "IsKitchenHelper": false,
        "PremiumExpiryDate": null,
        "MemberSince": null,
        "IsUsingRecurly": false,
        "FirstName": null,
        "LastName": null
      },
      "IsPrivate": false,
      "HideFromPublicSearch": false,
      "IsBookmark": null,
      "BookmarkURL": null,
      "YieldNumber": 3,
      "QualityScore": 0,
      "CreationDate": "\/Date(1128165918480)\/",
      "MaxImageSquare": 320,
      "TotalTries": 102,
      "HeroPhotoUrl": "http:\/\/photos.bigoven.com\/recipe\/hero\/chicken-breasts-2.jpg"
    },
    {
      "RecipeID": 160094,
      "Title": "Chicken Breast Stuffed with Feta Cheese and Oregano",
      "Cuisine": "Greek",
      "Category": "Main Dish",
      "Subcategory": "Poultry - Chicken",
      "Microcategory": "",
      "StarRating": 4.3589743589744,
      "StarRatingIMG": null,
      "WebURL": "http:\/\/www.bigoven.com\/recipe\/chicken-breast-stuffed-with-feta-cheese-and-oregano\/160094",
      "ImageURL": "http:\/\/redirect.bigoven.com\/pics\/chicken-breast-stuffed-with-feta-ch-8.jpg",
      "ImageURL120": "http:\/\/redirect.bigoven.com\/pics\/rs\/120\/chicken-breast-stuffed-with-feta-ch-8.jpg",
      "ReviewCount": 39,
      "Poster": {
        "UserID": 24150,
        "UserName": "blueskier",
        "ImageURL48": "http:\/\/images.bigoven.com\/image\/upload\/t_recipe-48,d_avatar-default.png\/avatar\/blueskier.jpg",
        "PhotoUrl": "http:\/\/photos.bigoven.com\/avatar\/photo\/blueskier.jpg",
        "IsPremium": true,
        "IsKitchenHelper": false,
        "PremiumExpiryDate": null,
        "MemberSince": null,
        "IsUsingRecurly": false,
        "FirstName": null,
        "LastName": null
      },
      "IsPrivate": false,
      "HideFromPublicSearch": false,
      "IsBookmark": null,
      "BookmarkURL": null,
      "YieldNumber": 4,
      "QualityScore": 0,
      "CreationDate": "\/Date(1132951574000)\/",
      "MaxImageSquare": 640,
      "TotalTries": 2189,
      "HeroPhotoUrl": "http:\/\/photos.bigoven.com\/recipe\/hero\/chicken-breast-stuffed-with-feta-ch-8.jpg"
    },
    {
      "RecipeID": 163741,
      "Title": "Garlic-roasted Chicken Breasts",
      "Cuisine": "American",
      "Category": "Main Dish",
      "Subcategory": "Poultry - Chicken",
      "Microcategory": "",
      "StarRating": 3.8181818181818,
      "StarRatingIMG": null,
      "WebURL": "http:\/\/www.bigoven.com\/recipe\/garlic-roasted-chicken-breasts\/163741",
      "ImageURL": "http:\/\/photos.bigoven.com\/recipe\/hero\/garlic-roasted-chicken-breasts-4c10b0.jpg",
      "ImageURL120": "http:\/\/photos.bigoven.com\/recipe\/hero\/garlic-roasted-chicken-breasts-4c10b0.jpg",
      "ReviewCount": 11,
      "Poster": {
        "UserID": 9972,
        "UserName": "chrism2607",
        "ImageURL48": "http:\/\/images.bigoven.com\/image\/upload\/t_recipe-48,d_avatar-default.png\/avatar\/chrism2607.jpg",
        "PhotoUrl": "http:\/\/photos.bigoven.com\/avatar\/photo\/chrism2607.jpg",
        "IsPremium": true,
        "IsKitchenHelper": false,
        "PremiumExpiryDate": null,
        "MemberSince": null,
        "IsUsingRecurly": false,
        "FirstName": null,
        "LastName": null
      },
      "IsPrivate": false,
      "HideFromPublicSearch": false,
      "IsBookmark": null,
      "BookmarkURL": null,
      "YieldNumber": 4,
      "QualityScore": 0,
      "CreationDate": "\/Date(1190406186000)\/",
      "MaxImageSquare": 1280,
      "TotalTries": 657,
      "HeroPhotoUrl": "http:\/\/photos.bigoven.com\/recipe\/hero\/garlic-roasted-chicken-breasts-4c10b0.jpg"
    },
    {
      "RecipeID": 185639,
      "Title": "Apricot Chicken Breasts",
      "Cuisine": "American",
      "Category": "Main Dish",
      "Subcategory": "Poultry - Chicken",
      "Microcategory": "",
      "StarRating": 4.25,
      "StarRatingIMG": null,
      "WebURL": "http:\/\/www.bigoven.com\/recipe\/apricot-chicken-breasts\/185639",
      "ImageURL": "http:\/\/redirect.bigoven.com\/pics\/apricot-chicken-breasts.jpg",
      "ImageURL120": "http:\/\/redirect.bigoven.com\/pics\/rs\/120\/apricot-chicken-breasts.jpg",
      "ReviewCount": 4,
      "Poster": {
        "UserID": 783327,
        "UserName": "stpagh",
        "ImageURL48": "http:\/\/images.bigoven.com\/image\/upload\/t_recipe-48,d_avatar-default.png\/avatar\/stpagh.jpg",
        "PhotoUrl": "http:\/\/photos.bigoven.com\/avatar\/photo\/stpagh.jpg",
        "IsPremium": true,
        "IsKitchenHelper": false,
        "PremiumExpiryDate": null,
        "MemberSince": null,
        "IsUsingRecurly": false,
        "FirstName": null,
        "LastName": null
      },
      "IsPrivate": false,
      "HideFromPublicSearch": false,
      "IsBookmark": null,
      "BookmarkURL": null,
      "YieldNumber": 6,
      "QualityScore": 0,
      "CreationDate": "\/Date(1284393583000)\/",
      "MaxImageSquare": 512,
      "TotalTries": 86,
      "HeroPhotoUrl": "http:\/\/photos.bigoven.com\/recipe\/hero\/apricot-chicken-breasts.jpg"
    },
    {
      "RecipeID": 158373,
      "Title": "Stuffed Chicken Breasts",
      "Cuisine": "American",
      "Category": "Main Dish",
      "Subcategory": "Poultry - Chicken",
      "Microcategory": "",
      "StarRating": 4,
      "StarRatingIMG": null,
      "WebURL": "http:\/\/www.bigoven.com\/recipe\/stuffed-chicken-breasts\/158373",
      "ImageURL": "http:\/\/redirect.bigoven.com\/pics\/stuffed-chicken-breasts-7.jpg",
      "ImageURL120": "http:\/\/redirect.bigoven.com\/pics\/rs\/120\/stuffed-chicken-breasts-7.jpg",
      "ReviewCount": 5,
      "Poster": null,
      "IsPrivate": false,
      "HideFromPublicSearch": false,
      "IsBookmark": null,
      "BookmarkURL": null,
      "YieldNumber": 2,
      "QualityScore": 0,
      "CreationDate": "\/Date(1114807679000)\/",
      "MaxImageSquare": 256,
      "TotalTries": 119,
      "HeroPhotoUrl": "http:\/\/photos.bigoven.com\/recipe\/hero\/stuffed-chicken-breasts-7.jpg"
    },
    {
      "RecipeID": 854,
      "Title": "Honey Baked Chicken Breasts",
      "Cuisine": "American",
      "Category": "Main Dish",
      "Subcategory": "",
      "Microcategory": "",
      "StarRating": 4,
      "StarRatingIMG": null,
      "WebURL": "http:\/\/www.bigoven.com\/recipe\/honey-baked-chicken-breasts\/854",
      "ImageURL": "http:\/\/redirect.bigoven.com\/pics\/honey-baked-chicken-breasts.jpg",
      "ImageURL120": "http:\/\/redirect.bigoven.com\/pics\/rs\/120\/honey-baked-chicken-breasts.jpg",
      "ReviewCount": 17,
      "Poster": null,
      "IsPrivate": false,
      "HideFromPublicSearch": false,
      "IsBookmark": null,
      "BookmarkURL": null,
      "YieldNumber": 1,
      "QualityScore": 0,
      "CreationDate": "\/Date(1072915200000)\/",
      "MaxImageSquare": 320,
      "TotalTries": 161,
      "HeroPhotoUrl": "http:\/\/photos.bigoven.com\/recipe\/hero\/honey-baked-chicken-breasts.jpg"
    },
    {
      "RecipeID": 162262,
      "Title": "Mustard Lemon Chicken Breasts",
      "Cuisine": "American",
      "Category": "Main Dish",
      "Subcategory": "Poultry - Chicken",
      "Microcategory": "",
      "StarRating": 3.9444444444444,
      "StarRatingIMG": null,
      "WebURL": "http:\/\/www.bigoven.com\/recipe\/mustard-lemon-chicken-breasts\/162262",
      "ImageURL": "http:\/\/redirect.bigoven.com\/pics\/mustard-lemon-chicken-breasts-3.jpg",
      "ImageURL120": "http:\/\/redirect.bigoven.com\/pics\/rs\/120\/mustard-lemon-chicken-breasts-3.jpg",
      "ReviewCount": 18,
      "Poster": {
        "UserID": 20236,
        "UserName": "RKG1",
        "ImageURL48": "http:\/\/images.bigoven.com\/image\/upload\/t_recipe-48,d_avatar-default.png\/avatar\/11060509554620236.jpg",
        "PhotoUrl": "http:\/\/photos.bigoven.com\/avatar\/photo\/11060509554620236.jpg",
        "IsPremium": true,
        "IsKitchenHelper": false,
        "PremiumExpiryDate": null,
        "MemberSince": null,
        "IsUsingRecurly": false,
        "FirstName": null,
        "LastName": null
      },
      "IsPrivate": false,
      "HideFromPublicSearch": false,
      "IsBookmark": null,
      "BookmarkURL": null,
      "YieldNumber": 4,
      "QualityScore": 0,
      "CreationDate": "\/Date(1166571465213)\/",
      "MaxImageSquare": 1280,
      "TotalTries": 141,
      "HeroPhotoUrl": "http:\/\/photos.bigoven.com\/recipe\/hero\/mustard-lemon-chicken-breasts-3.jpg"
    },
    {
      "RecipeID": 182008,
      "Title": "Apricot Almond Chicken Breasts",
      "Cuisine": "American",
      "Category": "Main Dish",
      "Subcategory": "Poultry - Chicken",
      "Microcategory": "",
      "StarRating": 4.6666666666667,
      "StarRatingIMG": null,
      "WebURL": "http:\/\/www.bigoven.com\/recipe\/apricot-almond-chicken-breasts\/182008",
      "ImageURL": "http:\/\/redirect.bigoven.com\/pics\/apricot-almond-chicken-breasts.jpg",
      "ImageURL120": "http:\/\/redirect.bigoven.com\/pics\/rs\/120\/apricot-almond-chicken-breasts.jpg",
      "ReviewCount": 3,
      "Poster": {
        "UserID": 541714,
        "UserName": "horikor",
        "ImageURL48": "http:\/\/images.bigoven.com\/image\/upload\/t_recipe-48,d_avatar-default.png\/avatar-default.png",
        "PhotoUrl": "http:\/\/photos.bigoven.com\/avatar\/photo\/avatar-default.png",
        "IsPremium": true,
        "IsKitchenHelper": false,
        "PremiumExpiryDate": null,
        "MemberSince": null,
        "IsUsingRecurly": false,
        "FirstName": null,
        "LastName": null
      },
      "IsPrivate": false,
      "HideFromPublicSearch": false,
      "IsBookmark": null,
      "BookmarkURL": null,
      "YieldNumber": 4,
      "QualityScore": 0,
      "CreationDate": "\/Date(1274203297770)\/",
      "MaxImageSquare": 1280,
      "TotalTries": 48,
      "HeroPhotoUrl": "http:\/\/photos.bigoven.com\/recipe\/hero\/apricot-almond-chicken-breasts.jpg"
    },
    {
      "RecipeID": 163825,
      "Title": "Easy Crockpot Chicken Breasts",
      "Cuisine": "American",
      "Category": "Main Dish",
      "Subcategory": "Slow Cooker",
      "Microcategory": "",
      "StarRating": 3.3333333333333,
      "StarRatingIMG": null,
      "WebURL": "http:\/\/www.bigoven.com\/recipe\/easy-crockpot-chicken-breasts\/163825",
      "ImageURL": "http:\/\/redirect.bigoven.com\/pics\/easy-crockpot-chicken-breasts-3.jpg",
      "ImageURL120": "http:\/\/redirect.bigoven.com\/pics\/rs\/120\/easy-crockpot-chicken-breasts-3.jpg",
      "ReviewCount": 5,
      "Poster": {
        "UserID": 57974,
        "UserName": "pamcastle",
        "ImageURL48": "http:\/\/images.bigoven.com\/image\/upload\/t_recipe-48,d_avatar-default.png\/avatar\/pamcastle.jpg",
        "PhotoUrl": "http:\/\/photos.bigoven.com\/avatar\/photo\/pamcastle.jpg",
        "IsPremium": true,
        "IsKitchenHelper": false,
        "PremiumExpiryDate": null,
        "MemberSince": null,
        "IsUsingRecurly": false,
        "FirstName": null,
        "LastName": null
      },
      "IsPrivate": false,
      "HideFromPublicSearch": false,
      "IsBookmark": null,
      "BookmarkURL": null,
      "YieldNumber": 6,
      "QualityScore": 0,
      "CreationDate": "\/Date(1192182876583)\/",
      "MaxImageSquare": 256,
      "TotalTries": 121,
      "HeroPhotoUrl": "http:\/\/photos.bigoven.com\/recipe\/hero\/easy-crockpot-chicken-breasts-3.jpg"
    },
    {
      "RecipeID": 158142,
      "Title": "Brie and Apple Chicken Breasts",
      "Cuisine": "American",
      "Category": "Main Dish",
      "Subcategory": "Poultry - Chicken",
      "Microcategory": "",
      "StarRating": 4.5454545454546,
      "StarRatingIMG": null,
      "WebURL": "http:\/\/www.bigoven.com\/recipe\/brie-and-apple-chicken-breasts\/158142",
      "ImageURL": "http:\/\/redirect.bigoven.com\/pics\/brie-and-apple-chicken-breasts-2.jpg",
      "ImageURL120": "http:\/\/redirect.bigoven.com\/pics\/rs\/120\/brie-and-apple-chicken-breasts-2.jpg",
      "ReviewCount": 96,
      "Poster": {
        "UserID": 16150,
        "UserName": "cabassakat",
        "ImageURL48": "http:\/\/images.bigoven.com\/image\/upload\/t_recipe-48,d_avatar-default.png\/avatar-default.png",
        "PhotoUrl": "http:\/\/photos.bigoven.com\/avatar\/photo\/avatar-default.png",
        "IsPremium": false,
        "IsKitchenHelper": false,
        "PremiumExpiryDate": null,
        "MemberSince": null,
        "IsUsingRecurly": false,
        "FirstName": null,
        "LastName": null
      },
      "IsPrivate": false,
      "HideFromPublicSearch": false,
      "IsBookmark": null,
      "BookmarkURL": null,
      "YieldNumber": 4,
      "QualityScore": 0,
      "CreationDate": "\/Date(1106227043000)\/",
      "MaxImageSquare": 256,
      "TotalTries": 556,
      "HeroPhotoUrl": "http:\/\/photos.bigoven.com\/recipe\/hero\/brie-and-apple-chicken-breasts-2.jpg"
    },
    {
      "RecipeID": 127259,
      "Title": "Spinach-Stuffed Chicken Breasts",
      "Cuisine": "American",
      "Category": "Main Dish",
      "Subcategory": "Poultry - Chicken",
      "Microcategory": "",
      "StarRating": 4.6666666666667,
      "StarRatingIMG": null,
      "WebURL": "http:\/\/www.bigoven.com\/recipe\/spinach-stuffed-chicken-breasts\/127259",
      "ImageURL": "http:\/\/photos.bigoven.com\/recipe\/hero\/spinach-stuffed-chicken-breast-b9e94f.jpg",
      "ImageURL120": "http:\/\/photos.bigoven.com\/recipe\/hero\/spinach-stuffed-chicken-breast-b9e94f.jpg",
      "ReviewCount": 3,
      "Poster": null,
      "IsPrivate": false,
      "HideFromPublicSearch": false,
      "IsBookmark": null,
      "BookmarkURL": null,
      "YieldNumber": 6,
      "QualityScore": 0,
      "CreationDate": "\/Date(1072915200000)\/",
      "MaxImageSquare": 1280,
      "TotalTries": 140,
      "HeroPhotoUrl": "http:\/\/photos.bigoven.com\/recipe\/hero\/spinach-stuffed-chicken-breast-b9e94f.jpg"
    },
    {
      "RecipeID": 158653,
      "Title": "Chicken Breasts Normandy",
      "Cuisine": "American",
      "Category": "Main Dish",
      "Subcategory": "Poultry - Chicken",
      "Microcategory": "",
      "StarRating": 4,
      "StarRatingIMG": null,
      "WebURL": "http:\/\/www.bigoven.com\/recipe\/chicken-breasts-normandy\/158653",
      "ImageURL": "http:\/\/redirect.bigoven.com\/pics\/chicken-breasts-normandy-2.jpg",
      "ImageURL120": "http:\/\/redirect.bigoven.com\/pics\/rs\/120\/chicken-breasts-normandy-2.jpg",
      "ReviewCount": 5,
      "Poster": {
        "UserID": 21250,
        "UserName": "tyson",
        "ImageURL48": "http:\/\/images.bigoven.com\/image\/upload\/t_recipe-48,d_avatar-default.png\/avatar\/06070701101821250.jpg",
        "PhotoUrl": "http:\/\/photos.bigoven.com\/avatar\/photo\/06070701101821250.jpg",
        "IsPremium": false,
        "IsKitchenHelper": false,
        "PremiumExpiryDate": null,
        "MemberSince": null,
        "IsUsingRecurly": false,
        "FirstName": null,
        "LastName": null
      },
      "IsPrivate": false,
      "HideFromPublicSearch": false,
      "IsBookmark": null,
      "BookmarkURL": null,
      "YieldNumber": 4,
      "QualityScore": 0,
      "CreationDate": "\/Date(1121554554790)\/",
      "MaxImageSquare": 256,
      "TotalTries": 31,
      "HeroPhotoUrl": "http:\/\/photos.bigoven.com\/recipe\/hero\/chicken-breasts-normandy-2.jpg"
    },
    {
      "RecipeID": 158703,
      "Title": "South of the Border Chicken Breasts",
      "Cuisine": "Mexican",
      "Category": "Main Dish",
      "Subcategory": "Poultry - Chicken",
      "Microcategory": "",
      "StarRating": 3.5,
      "StarRatingIMG": null,
      "WebURL": "http:\/\/www.bigoven.com\/recipe\/south-of-the-border-chicken-breasts\/158703",
      "ImageURL": "http:\/\/redirect.bigoven.com\/pics\/south-of-the-border-chicken-breasts-2.jpg",
      "ImageURL120": "http:\/\/redirect.bigoven.com\/pics\/rs\/120\/south-of-the-border-chicken-breasts-2.jpg",
      "ReviewCount": 2,
      "Poster": {
        "UserID": 21250,
        "UserName": "tyson",
        "ImageURL48": "http:\/\/images.bigoven.com\/image\/upload\/t_recipe-48,d_avatar-default.png\/avatar\/06070701101821250.jpg",
        "PhotoUrl": "http:\/\/photos.bigoven.com\/avatar\/photo\/06070701101821250.jpg",
        "IsPremium": false,
        "IsKitchenHelper": false,
        "PremiumExpiryDate": null,
        "MemberSince": null,
        "IsUsingRecurly": false,
        "FirstName": null,
        "LastName": null
      },
      "IsPrivate": false,
      "HideFromPublicSearch": false,
      "IsBookmark": null,
      "BookmarkURL": null,
      "YieldNumber": 4,
      "QualityScore": 0,
      "CreationDate": "\/Date(1121736083683)\/",
      "MaxImageSquare": 256,
      "TotalTries": 62,
      "HeroPhotoUrl": "http:\/\/photos.bigoven.com\/recipe\/hero\/south-of-the-border-chicken-breasts-2.jpg"
    },
    {
      "RecipeID": 158716,
      "Title": "Triple Citrus Chicken Breasts",
      "Cuisine": "American",
      "Category": "Main Dish",
      "Subcategory": "Poultry - Chicken",
      "Microcategory": "",
      "StarRating": 4.1724137931035,
      "StarRatingIMG": null,
      "WebURL": "http:\/\/www.bigoven.com\/recipe\/triple-citrus-chicken-breasts\/158716",
      "ImageURL": "http:\/\/redirect.bigoven.com\/pics\/triple-citrus-chicken-breasts-3.jpg",
      "ImageURL120": "http:\/\/redirect.bigoven.com\/pics\/rs\/120\/triple-citrus-chicken-breasts-3.jpg",
      "ReviewCount": 30,
      "Poster": {
        "UserID": 21250,
        "UserName": "tyson",
        "ImageURL48": "http:\/\/images.bigoven.com\/image\/upload\/t_recipe-48,d_avatar-default.png\/avatar\/06070701101821250.jpg",
        "PhotoUrl": "http:\/\/photos.bigoven.com\/avatar\/photo\/06070701101821250.jpg",
        "IsPremium": false,
        "IsKitchenHelper": false,
        "PremiumExpiryDate": null,
        "MemberSince": null,
        "IsUsingRecurly": false,
        "FirstName": null,
        "LastName": null
      },
      "IsPrivate": false,
      "HideFromPublicSearch": false,
      "IsBookmark": null,
      "BookmarkURL": null,
      "YieldNumber": 6,
      "QualityScore": 0,
      "CreationDate": "\/Date(1121736212420)\/",
      "MaxImageSquare": 256,
      "TotalTries": 331,
      "HeroPhotoUrl": "http:\/\/photos.bigoven.com\/recipe\/hero\/triple-citrus-chicken-breasts-3.jpg"
    },
    {
      "RecipeID": 179919,
      "Title": "Almond Crusted Chicken Breast",
      "Cuisine": "American",
      "Category": "Main Dish",
      "Subcategory": "Poultry - Chicken",
      "Microcategory": "",
      "StarRating": 5,
      "StarRatingIMG": null,
      "WebURL": "http:\/\/www.bigoven.com\/recipe\/almond-crusted-chicken-breast\/179919",
      "ImageURL": "http:\/\/redirect.bigoven.com\/pics\/almond-crusted-chicken-breast.jpg",
      "ImageURL120": "http:\/\/redirect.bigoven.com\/pics\/rs\/120\/almond-crusted-chicken-breast.jpg",
      "ReviewCount": 1,
      "Poster": {
        "UserID": 753655,
        "UserName": "jsvendblad",
        "ImageURL48": "http:\/\/images.bigoven.com\/image\/upload\/t_recipe-48,d_avatar-default.png\/avatar\/200410021811753655.jpg",
        "PhotoUrl": "http:\/\/photos.bigoven.com\/avatar\/photo\/200410021811753655.jpg",
        "IsPremium": true,
        "IsKitchenHelper": false,
        "PremiumExpiryDate": null,
        "MemberSince": null,
        "IsUsingRecurly": false,
        "FirstName": null,
        "LastName": null
      },
      "IsPrivate": false,
      "HideFromPublicSearch": false,
      "IsBookmark": null,
      "BookmarkURL": null,
      "YieldNumber": 2,
      "QualityScore": 0,
      "CreationDate": "\/Date(1268248319000)\/",
      "MaxImageSquare": 640,
      "TotalTries": 62,
      "HeroPhotoUrl": "http:\/\/photos.bigoven.com\/recipe\/hero\/almond-crusted-chicken-breast.jpg"
    }
  ];