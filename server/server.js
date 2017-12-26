const express = require('express');
const bodyParser = require('body-parser');


const OK = 200;
const CREATED = 201;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const SERVER_ERROR = 500;
const NO_CONTENT = 204;
const SEE_OTHER = 303;

function serve(port, model) {
  const app = express();
  app.locals.model = model;
  app.locals.port = port;
  setupRoutes(app);
  app.listen(port, function() {
    console.log(`listening on port ${port}`);
  });
}

function Users(db) {
  this.db = db;
  this.users = db.collection('users');
}

function setupRoutes(app) {
  app.use('/users/:id', bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.get('/users/:id', getUser(app));
  app.put('/users/:id', addUser(app));  
  app.delete('/users/:id', deleteUser(app));
  app.post('/users/:id', updateUser(app));
}

function requestUrl(req) {
  const port = req.app.locals.port;
  return `${req.protocol}://${req.hostname}:${port}${req.originalUrl}`;
}


  
module.exports = {
  serve: serve
}

    
function getUser(app) {
  return function(request, response) {
    const id = request.params.id;
    if (typeof id === 'undefined') {
      response.sendStatus(BAD_REQUEST);
    }
    else {
      request.app.locals.model.users.getUser(id).
	then((results) => response.json(results)).
	catch((err) => {
	  console.error(err);
	  response.sendStatus(NOT_FOUND);
	});
    }
  };
}

function deleteUser(app) {
  return function(request, response) {
    const id = request.params.id;
    if (typeof id === 'undefined') {
      response.sendStatus(BAD_REQUEST);
    }
    else {
      request.app.locals.model.users.deleteUser(id).
	then(() => response.end()).
	catch((err) => {
	  console.error(err);
	  response.sendStatus(NOT_FOUND);
	});
    }
  };
}


function addUser(app) {
  return function(request, response) {
    const userinfo = request.body;
    if (userinfo ==='undefined') {
      response.sendStatus(BAD_REQUEST);
    }
    else {
      request.app.locals.model.users.newUser(userinfo).
	then(() => response.sendStatus(CREATED)).
	catch((err) => {
	  console.error(err);
	  response.sendStatus(NO_CONTENT);
	});
    }
  };
}

function updateUser(app) {
  return function(request, response) {
    const id = request.params.id;
    const userinfo = request.body;
    if (userinfo==='undefined') {
      response.sendStatus(BAD_REQUEST);
    }
    else {
      request.app.locals.model.users.updateUser(id,userinfo).
	then(function(id) {
    response.append('Location', requestUrl(request));
	response.sendStatus(SEE_OTHER);
  }).
	catch((err) => {
	  console.error(err);
	  response.sendStatus(NOT_FOUND);
	});
    
  };
}
}
