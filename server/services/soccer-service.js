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

	server.get('/api/players', function(req, res){
		var collection = myDb.collection('test_players');
		collection.find().sort({name: 1}).toArray(function(err, results) {
			res.send(results);
		});
	});

	server.post('/api/players/add', function(req, res) {
		var data = req.body; 
		var collection = myDb.collection('test_players'),
			lcName = data.name.toLowerCase();
		
		collection.update(
			{uid: lcName}, 
			{ $set: {
				name: data.name,
				uid: lcName
			} }, 
			{upsert: true, safe: true},
			function() {
				collection.find().sort({name: 1}).toArray(function(err, results) {
					res.send(results);
				});
			}
		);
		

	});
}


