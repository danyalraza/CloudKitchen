var http = require('http');

var apiKey = "1a2pNH4Ed5Yt15zsqR28Q2MUXJt4gG7B";

function recipeSearch(recipeName){
    recipeName = recipeName.replace(/\s/g, '%20');

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
        res.on("data", function (chunk) {
            output += chunk
        })
        res.on("error", console.log)
        res.on("end", function () {
            recipesObject = JSON.parse(output);
            recipesArray = recipesObject.Results.reverse();
            console.log(recipesArray);
        })
    }).end();
}

recipeSearch('chicken breast');


  // Set up the request
  