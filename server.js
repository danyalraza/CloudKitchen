var http = require('http');
var Firebase = require("firebase");
var express = require("express");
var session = new Firebase('https://fiery-heat-3854.firebaseio.com/');
var path = require('path');

var app = express();

var apiKey="1a2pNH4Ed5Yt15zsqR28Q2MUXJt4gG7B";

app.get('/api/search/:searchkey', function(request, response) {
  var recipeName = request.params.searchkey;
  var host = "api.bigoven.com"
  var path = "/recipes?pg=1&rpp=25&title_kw="
            + recipeName
            + "&api_key=" + apiKey + "&sort=quality";
  console.log(recipeName);
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
      res.on("data", function (chunk) {
          output += chunk
      })
      res.on("error", console.log)
      res.on("end", function () {
          recipesObject = JSON.parse(output);
          response.json(recipesObject);
      })
  }).end();
});

app.get('/api/favourites', function(request, response) {
  session.once("value", function(data) {
      response.json(data.val().Favourites);
  });
});

app.post('/api/favourites', function(request, response) {
  // Insert route for handling favourites
  response.send('');
});

app.get('*', function(request, response) {
  response.sendFile((path.join(__dirname + '/index.html')));
});





app.listen(port=8000);
console.log("Listening on port " + 8000);
