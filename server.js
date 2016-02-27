var http = require('http');
var Firebase = require("firebase");
var express = require("express");

var app = express();

var apiKey="1a2pNH4Ed5Yt15zsqR28Q2MUXJt4gG7B";

var findRecipeByName = function(recipeName, callback) {
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
  var req = http.request(post_options, function(res) {
      var output = "";
      var recipesObject = {};
      var recipesArray = [];
      var topFiveRecipes = [];

      res.on("data", function (chunk) {
          output += chunk
      })
      res.on("error", console.log);
      res.on("end", function () {
          return output;
      })
  }).end();
}

app.get('/search/:searchkey', function(request, response, next) {
  var searchkey = request.params.searchkey;
  findRecipeByName(searchkey, function(error, recipes) {
    if (error) return error;
    return response.render(recipes);
  });
});

app.listen(port=8000);
