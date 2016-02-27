var newObj = {};
newObj.Title = myObj.Title;
newObj.Ingredients = myObj.Ingredients
newObj.Instructions = myObj.Instructions;
var newstring = newObj.Instructions.replace(/[&\/\\#,+()$~%'":*?<>\r{}\n]/g, '').replace("..", "").trim();
var array = newstring.split('. ')
var replaceObj = [];
for (var i = 0; i < array.length; i ++) {
  replaceObj.push({
    step: i,
    instruction : array[i]
  })
}
newObj.Instructions = replaceObj;
newObj.CurrentStep = 0;
