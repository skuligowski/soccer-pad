var express = require('express'),
	fs = require('fs'),
	path = require('path'),
	moment = require('moment'),
	access_logfile = fs.createWriteStream('./access.log', {flags: 'a'});
	

var app = express(),
	data = {},
	srcDir = '../src', 
	partialExt = '.html',
	partialsCache = {},
	partialsMapping = {},

	walk = function(dir, done) {
		var results = [];
		fs.readdir(dir, function(err, list) {
			if (err) return done(err);
			var i = 0;
			(function next() {
				var file = list[i++];
				if (!file) return done(null, results);
				file = dir + '/' + file;
				fs.stat(file, function(err, stat) {
					if (stat && stat.isDirectory()) {
						walk(file, function(err, res) {
							results = results.concat(res);
							next();
						});
					} else {
						results.push(file);
						next();
					}
				});
			})();
		});
	},

	isPartial = function(url) {
		return url.indexOf(partialExt) > -1;
	};

var registerServices = function(app) {
	walk('services', function(err, files) {
		for(var i = 0, max = files.length; i < max; i++) {
			var service = require('./'+files[i]);
			if (service.init) {
				console.log('Registering service: ' + path.basename(files[i], '.js'));
				service.init(app);
			}
		}
			
	});
};

var refreshPartials = function(callback) {
	walk(srcDir, function(err, files) {
		for(var i = 0; i < files.length; i++) {
			if (isPartial(files[i])) {      
				
				var partial = fs.readFileSync(files[i]);
				partialsCache[files[i]] = renderTemplates(partial.toString());

				var name = path.basename(files[i], partialExt);
				name = name.replace(/(-|_)(.)/g, function(all, firstSign, letter) {
					return letter.toUpperCase();
				});
				partialsMapping[name] = files[i];

				console.log('Refreshing ' + name + ' (' + files[i] + ')');				
			}
		}
		
		if (callback)
			callback();
	});
};

var includeRegExp = new RegExp("<%include([^>]+)%>", "gim");
var templateRegExp = new RegExp("<%template([^>]+)%>", "gim");

var getAttr = function(attr, content) {
	var regExp = new RegExp(attr + '="([0-9a-zA-Z\/_.-]+)"');
	var attrMatch = content.match(regExp);
	if (!attrMatch)
		return null;
	
	return attrMatch[1];					
}

var renderTemplates = function(html) {
	return html.replace(templateRegExp, function(all, content) {
		var id = getAttr('id', content),
			src = getAttr('src', content);
		
		return '<script id="' + id + '" type="text/ng-template"><%include src="' + src + '"%></script>'  
	});		
}

var includeFile = function(dir, html) {
	
	var matches = html.match(includeRegExp);

	if (!matches)
		return html;
		
	for(var i = 0, max = matches.length; i < max; i++) {
		var src = getAttr('src', matches[i]),
			absolutePath = path.normalize(dir + '/' + src),
			partialContent = partialsCache[absolutePath];
		
		if (typeof partialContent !== "undefined") {			
			partialContent = includeFile(path.dirname(absolutePath), partialContent);
			html = html.replace(matches[i], partialContent);
		} else {
			console.log('Partial not found:' + absolutePath);
		}
	}

	return html;
}

app.use(function(req, res, next) {
	if (isPartial(req.path)) 
		return refreshPartials(next);	
	next();
});
app.use(function(req, res, next) {
	if (!isPartial(req.path))
		return next();
	
	var partialHtml = partialsCache[srcDir + req.path];
	if (!partialHtml)
		return next();

	var html = includeFile(srcDir, partialHtml);
	res.send(html);
});
app.use(express.static(__dirname + '/' + srcDir, {maxAge: 0, index: '-'}));
app.use(express.logger({stream: access_logfile }));
app.use(function(req, res, next) {
	var partialName = path.basename(req.path),
		partialPath = partialsMapping[partialName];

	if (partialPath) {
		console.log('Template ' + partialName + ' requested, found at: ' + partialPath);
		var html = includeFile(path.dirname(partialPath), partialsCache[partialPath]);
		return res.send(html);
	}
	next();
});

registerServices(app);
refreshPartials();

var port = parseInt(process.argv[2]) || 8000;
app.listen(port);
console.log('Listening on port: ' + port);