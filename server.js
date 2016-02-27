var http = require('http');
var Firebase = require("firebase");
var express = require("express");

var app = express.createServer();



app.get('/search/:searchkey', function(request, response, next) {
  var searchkey = request.params.searchkey;

}

function
