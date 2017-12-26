const assert = require('assert');
const ObjectID = require('mongodb').ObjectID;
const USERS = 'users';
const DEFAULT_INDEXES = { _id:'text'};

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use('/users/:id', bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function Users(db) {
  this.db = db;
  this.users = db.collection(USERS);
}

Users.prototype.find = function(query) {
  const searchSpec = { $text: { $search: query } };
  resulting = (this.users.find(searchSpec).toArray()).then((results) => console.log(results))
  return this.users.find(searchSpec).toArray();
}

Users.prototype.getUser = function(query) {
  const searchSpec = { $text: { $search: query } };
  return this.users.find(searchSpec).toArray().
    then(function(users) {
      return new Promise(function(resolve, reject) {
	if (users.length === 1) {
	  resolve(users[0]);
	}
	else {
	  reject(new Error(`cannot find user ${query}`));
	}
      });
    });
}

Users.prototype.deleteUser = function(id) {
  return this.users.deleteOne({_id
  : id}).
    then(function(results) {
      return new Promise(function(resolve, reject) {
	if (results.deletedCount === 1) {
        console.log("User Deleted Successfully");
	  resolve();
	}
	else {
	  reject(new Error(`cannot delete user ${id}`));
	}
      });
    });
}


Users.prototype.newUser = function(userinfo) {
  return this.users.insertOne(userinfo).
    then(function(results) {
      return new Promise((resolve) => resolve(results.insertedId));      
    });
}

Users.prototype.updateUser = function(id,userinfo) {
return this.users.updateOne({_id: id},{$set:userinfo}).
    then(function(results) {
      return new Promise(function(resolve, reject) {
	if (results.modifiedCount != 1) {
	  reject(new Error(`updated ${results.modifiedCount} users`));
	}
	else {
	  resolve();
	}
      });
    });
}



function initUsers(db, users=null) {
  return new Promise(function(resolve, reject) {

    const collection = db.collection(USERS);
      collection.createIndex(DEFAULT_INDEXES);
	resolve(db);
      });
}
module.exports = {
  Users: Users,
  initUsers: initUsers
};
