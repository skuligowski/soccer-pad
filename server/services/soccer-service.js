var MongoClient = require('mongodb').MongoClient;
var myDb;

var connect = function() {
	MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {

      if(err) { 
      	console.log(err);
      	return;	
      };
      myDb = db;
      var collection = myDb.collection('test_players');
		//collection.drop();

    });  
}

connect();

exports.init = function(server) {

	server.get('/players', function(req, res){
		var collection = myDb.collection('test_players');
		collection.find().sort({name: 1}).toArray(function(err, results) {
			res.send(results);
		});
	});

	server.get('/players/add/:name', function(req, res) {
		var collection = myDb.collection('test_players'),
			lcName = req.params.name.toLowerCase();
		
		collection.update(
			{uid: lcName}, 
			{ $set: {
				name: req.params.name,
				uid: lcName
			} }, 
			{upsert: true, safe: false}
		);
		res.send({
			result: 'ok'
		});

	});
}


