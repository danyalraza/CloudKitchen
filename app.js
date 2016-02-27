var http = require('http');

var apiKey = "1a2pNH4Ed5Yt15zsqR28Q2MUXJt4gG7B";

function recipeSelect(intent, session, callback){
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
                speechOutput = speechOutput + recipesArray[x].Title + ", ";

                repromptText = repromptText + (x+1).toString() + " - " + recipesArray[x].Title + ", ";
                repromptText = repromptText + recipesArray[x].Title + ", ";
                topFiveRecipes.push(recipesArray[x]);
            }

            console.log(topFiveRecipes);

            console.log(speechOutput);

            var sessionAttributes = {
                    "speechOutput": repromptText,
                    "repromptText": repromptText
                    // "currentQuestionIndex": currentQuestionIndex
                };

            // callback(sessionAttributes, buildSpeechletResponse("card", speechOutput, repromptText, false));
        })
    }).end();
}

recipeSelect({
	slots: {
		Recipe: {
			value: "chicken breast"
		}
	}
});


  // Set up the request
  