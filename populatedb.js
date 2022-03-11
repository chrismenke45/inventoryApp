#! /usr/bin/env node

console.log('This script populates some test items and categorys to the database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Item = require('./models/item')
var Category = require('./models/category')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var items = []
var categorys = []

function categoryCreate(name, description, cb) {
  categorydetail = {name, description }
  
  var category = new Category(categorydetail);
       
  category.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Category: ' + category);
    categorys.push(category)
    cb(null, category)
  }  );
}

function itemCreate(name, description, category, price, number_in_stock, cb) {
  itemdetail = { 
    name,
    description,
    category,
    price,
    number_in_stock,
  }
    
  var item = new Item(itemdetail);    
  item.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Item: ' + item);
    items.push(item)
    cb(null, item)
  }  );
}



function createCategorys(cb) {
    async.series([
        function(callback) {
          categoryCreate('Food', 'Everything to keep you family happy and healthy', callback);
        },
        function(callback) {
            categoryCreate('Electronics', 'TVs, Cellphones, Video Games, Computers and more...', callback);
        },
        function(callback) {
            categoryCreate('Apparel', 'Clothing for every occasion', callback);
        },
        function(callback) {
            categoryCreate('Outdoors', 'Whatever you need for your next adventure', callback);
        },
        function(callback) {
            categoryCreate('Pharmacy', 'For all your RX needs', callback);
        },
        ],
        // optional callback
        cb);
}


function createItems(cb) {
    async.parallel([
        function(callback) {
          itemCreate('Honey', 'Wildflower honey from the mountains of Colorado', categorys[0], 6, 19, callback);
        },
        function(callback) {
            itemCreate('Half Dozen Apples', 'Fresh from Avila Valley Orchard. Crisp, and perfect for a pie', categorys[1], 7, 5, callback);
        },
        function(callback) {
            itemCreate('Takis', 'Your favorite spicy chip', categorys[0], 2, 10, callback);
        },
        function(callback) {
            itemCreate('Nintendo Switch', 'The newest gsming platform from Nintendo. The first crossover at-home and handheld console', categorys[0], 300, 2, callback);
        },
        function(callback) {
            itemCreate('Crash Pad', 'Protection for bouldering outside. Have a soft place to land', categorys[3], 180, 1, callback);
        },
        function(callback) {
            itemCreate('Cold Water Wax', 'Surf Wax for water temperatures below 60F', categorys[3], 3, 6, callback);
        },
        function(callback) {
            itemCreate('Advil', 'Relief from everyday pain', categorys[4], 3.50, 5, callback);
        },
        ],
        // optional callback
        cb);
}


async.series([
    createCategorys,
    createItems,
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    // All done, disconnect from database
    mongoose.connection.close();
});