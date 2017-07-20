'use strict';

// DONE: Install and require the NPM Postgres package 'pg' into your server.js, and ensure that it is then listed as a dependency in your package.json
//installed postgres (pg) time took: 10min
const fs = require('fs');
const express = require('express');
const pg = require('pg');

// DONE: Require in body-parser for post requests in our server. If you want to know more about what this does, read the docs!
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const app = express();

//Didnt have to change anything because I'm using a mac. Time took: 1min
// DONE?: Complete the connection string for the url that will connect to your local postgres database
// Windows and Linux users; You should have retained the user/pw from the pre-work for this course.
    // Your url may require that it's composed of additional information including user and password
    // const conString = 'postgres://USER:PASSWORD@HOST:PORT/DBNAME';
    // make sure you save that password as an environment variable, and read it in using process.env (like how we read process.env.PORT above). NEVER commit a password, token, or any form of credential in your code. That is what environment variables are for.
const conString = 'postgres://localhost:5432';

//Took 5min just looked over notes and tried to get a better understanding of what pg does
// DONE: Our pg module has a Client constructor that accepts one argument: the conString we just defined.
//       This is how it knows the URL and, for Windows and Linux users, our username and password for our
//       database when client.connect is called on line 26. Thus, we need to pass our conString into our
//       pg.Client() call.
const client = new pg.Client(conString);

// DONE: Use the client object to connect to our DB.
client.connect();


// DONE: Install the middleware plugins so that our app is aware and can use the body-parser module
//Made sure that package.json has all of our dependencies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./public'));


// DONE: Routes for requesting HTML resources
app.get('/new', function(request, response) {
  // DONE: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`?
  //What part of CRUD is being enacted/managed by this particular piece of code?
// There are no corresponding methods in article.js
// when the /new route is hit, server.js opens up the new.html page
// #5 in the diagram is being used and #4 and #5 are as well, READ is being used here
  response.sendFile('new.html', {root: './public'});
});

// DONE: Routes for making API calls to use CRUD Operations on our database
app.get('/articles', function(request, response) {
  // DONE: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // Article.fetchAll() is being used and server.js is querying the database #3
  //the response object sends the data if it matched the query and the view displays it  #4 and #5
  //READ from CRUD is being used here
  client.query('SELECT * FROM articles')
  .then(function(result) {
    response.send(result.rows);
  })
  .catch(function(err) {
    console.error(err)
  })
});

app.post('/articles', function(request, response) {
  // DONE: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`?
  //What part of CRUD is being enacted/managed by this particular piece of code?
  // The insertRecord() function from article.js is using an ajax PUT request to update the database
  //with a new article. #2 and #3 in the diagram are being used here
  //READ and UPDATE from CRUD are being used
  client.query(
    `INSERT INTO
    articles(title, author, "authorUrl", category, "publishedOn", body)
    VALUES ($1, $2, $3, $4, $5, $6);
    `,
    [
      request.body.title,
      request.body.author,
      request.body.authorUrl,
      request.body.category,
      request.body.publishedOn,
      request.body.body
    ]
  )
  .then(function() {
    response.send('insert complete')
  })
  .catch(function(err) {
    console.error(err);
  });
});

app.put('/articles/:id', function(request, response) {
  // DONE: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`?
  //What part of CRUD is being enacted/managed by this particular piece of code?
  //updateRecord() from articles.js was used here. It used a POST request.
  //server.js then queried the database and using SQL targeted the matching article and reset its associated data
  // numbers from the diagram used were #2 for the request and #3 for the query/update
  //CREATE and UPDATE are being used here!
  client.query(
    `UPDATE articles
    SET
      title=$1, author=$2, "authorUrl"=$3, category=$4, "publishedOn"=$5, body=$6
    WHERE article_id=$7;
    `,
    [
      request.body.title,
      request.body.author,
      request.body.authorUrl,
      request.body.category,
      request.body.publishedOn,
      request.body.body,
      request.params.id
    ]
  )
  .then(function() {
    response.send('update complete')
  })
  .catch(function(err) {
    console.error(err);
  });
});

app.delete('/articles/:id', function(request, response) {
  // DONE: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // deleteRecord() method is being used here, #2 and #3 from the diagram is being used here
  //DELETE from crud is being used here
  client.query(
    `DELETE FROM articles WHERE article_id=$1;`,
    [request.params.id]
  )
  .then(function() {
    response.send('Delete complete')
  })
  .catch(function(err) {
    console.error(err);
  });
});

app.delete('/articles', function(request, response) {
  // DONE: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // truncateTable() method is being used here to delete multiple articles
  //DELETE from CRUD is being used here and #2 and #3 from the diagram is being used here
  client.query(
    'DELETE FROM articles;'
  )
  .then(function() {
    response.send('Delete complete')
  })
  .catch(function(err) {
    console.error(err);
  });
});

// DONE: What is this function invocation doing?
// calls loadDB which initiates the empty SQL table to which we can add our articles
loadDB();

app.listen(PORT, function() {
  console.log(`Server started on port ${PORT}!`);
});


//////// ** DATABASE LOADER ** ////////
////////////////////////////////////////
function loadArticles() {
  // DONE: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  //loadArticles() checks if the postgres database is empty and if it is, populates it with the JSON data
  //from data/hackerIpsum.json, no methods from articles.js are being used.
  //in this code sections #3 and #4 of the diagram are being used
  //UPDATE from CRUD is being used
  client.query('SELECT COUNT(*) FROM articles')
  .then(result => {
    // DONE: result.rows is an array of objects that Postgres returns as a response to a query.
    //         If there is nothing on the table, then result.rows[0] will be undefined, which will
    //         make count undefined. parseInt(undefined) returns NaN. !NaN evaluates to true.
    //         Therefore, if there is nothing on the table, line 151 will evaluate to true and
    //         enter into the code block.
    if(!parseInt(result.rows[0].count)) {
      fs.readFile('./public/data/hackerIpsum.json', (err, fd) => {
        JSON.parse(fd.toString()).forEach(ele => {
          client.query(`
            INSERT INTO
            articles(title, author, "authorUrl", category, "publishedOn", body)
            VALUES ($1, $2, $3, $4, $5, $6);
          `,
            [ele.title, ele.author, ele.authorUrl, ele.category, ele.publishedOn, ele.body]
          )
        })
      })
    }
  })
}

function loadDB() {
  // DONE: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  //This is the method that sets up the initial SQL database if one doesnt already exist.
  //No methods from articles.js are being used,
  //in this code sections #3 and #4 of the diagram are being used
//CREATE from CRUD is being used here
  client.query(`
    CREATE TABLE IF NOT EXISTS articles (
      article_id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      "authorUrl" VARCHAR (255),
      category VARCHAR(20),
      "publishedOn" DATE,
      body TEXT NOT NULL);`
    )
    .then(function() {
      loadArticles();
    })
    .catch(function(err) {
      console.error(err);
    }
  );
}
