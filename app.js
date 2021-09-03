//Require modules
const bodyParser = require("body-parser");
const ejs = require("ejs");
const express = require("express");
const mongoose = require("mongoose");
//Assign express() as app as per convention
const app = express();

//Connect to mongoDB via mongoose through promise
main().catch(err => console.log(err));
async function main() {
  //Create new local mongoDB named wikiDB
  await mongoose.connect("mongodb://localhost:27017/wikiDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}

//Initialize ejs
app.set('view engine', 'ejs');
//Use body-parser and public static files to be used by express
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//Create article schema
const articleSchema = {
  title: String,
  content: String
};
//Create article model
const Article = mongoose.model("Article", articleSchema);

//Chainable route handler for /articles location
app.route("/articles")
.get(function(req, res) {
  Article.find({}, function(err, foundArticles) {
    if (!err) {
      res.send(foundArticles);
    } else {
      res.send(err);
    }

  });
})
.post(function(req, res) {
  //Insert new article
  const article = new Article({
    title: req.body.title,
    content: req.body.content
  });
  article.save();
})
.delete(function(req, res) {
  Article.deleteMany(function(err) {
    if (!err) {
      res.send("TARGETS DELETED");
    } else {
      res.send("TARGETS HAVE EVADED DELETION");
    }
  });
});

//Chained get request for specific article in collection
app.route("/articles/:articleTitle")
  .get(function(req, res){

    Article.findOne({title: req.params.articleTitle}, function(err, foundArticle) {
        if (foundArticle) {
          res.send(foundArticle);
        } else {
          res.send("No articles matching title!");
        }
      });
  })

  .put(function(req,res){
    Article.replaceOne(
      {title: req.params.articleTitle},
      {title: req.body.title, content: req.body.content},
      // {overwrite: true},
      function(err) {
        if (!err) {
          res.send("Article updated!");
        } else {
          res.send("No updates here!");
        }
      }
    );
  })

  .patch(function(req,res) {
    Article.updateOne(
      {title: req.params.articleTitle},
      {$set: {title: req.body.title}},
      function(err) {
        if (!err) {
          res.send("Updated field!");
        }
      }
    );
  })

  .delete(function(req,res) {
    Article.deleteOne(
      {title: req.body.title},
      function(err) {
        if (!err) {
          res.send("Delete success!");
        } else {
          res.send("Delete fizz...");
        }
      }
    );
  });

//Listen in on server startup
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
