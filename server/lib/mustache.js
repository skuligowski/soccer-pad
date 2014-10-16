var fs = require('fs'),
	mustache = require('mustache');

mustache.tags = ['@{{', '}}'];

module.exports = function(filePath, options, callback) {
	fs.readFile(filePath, function (err, content) {
		if (err) throw new Error(err);
		return callback(null, mustache.render(content.toString(), options));
	});
};
