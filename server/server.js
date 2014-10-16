var express = require('express'),
    https = require('https'),
    bodyParser = require('body-parser'),
    compress = require('compression')(),
    fs = require('fs'),
    path = require('path'),
    config = require('./config'),
    mime = require('mime'),
    mustache = require('./lib/mustache');

express.static.mime.define({
    'application/x-font-woff': ['woff'],
    'application/font-woff': ['woff']
});

var app = express(),
    srcDir = path.join(__dirname, '..', 'dist');

app.use(bodyParser.json());
app.use(compress);

app.engine('html', mustache);
app.set('view engine', 'html');
app.set('views', srcDir);

require('./services/soccer-service')(app);

app.use('/css', express.static(path.join(srcDir, 'css')));
app.use('/fonts', express.static(path.join(srcDir, 'fonts')));
app.use('/app', express.static(path.join(srcDir, 'app')));
app.use('/vendor', express.static(path.join(srcDir, 'vendor')));
app.use('/img', express.static(path.join(srcDir, 'img')));

app.get('/*', function(req, res, next) {
    if (req.path.indexOf('.') === -1 || req.path.indexOf('.html') !== -1) {
        return res.render('index', {});
    }
    next();
});

app.listen(config.listenPort);
console.log('Express server listening on port ' + config.listenPort);
