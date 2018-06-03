/**
 * Include dependencies
 */
var express	= require('express');
var fs		= require('fs');
var morgan	= require('morgan');
var path	= require('path');
var rfs		= require('rotating-file-stream');
var timeout	= require('connect-timeout');
var timeoutMins	= 60;
var paths	= {
	app:	'/app/',
	models:	'/app/models/',
	views:	'/app/views/',
	logs:	'/logs/',
	web:	'/web/',
	bin:	'/bin/',
	audio:	'/assets/audio/field-recordings/',
	video:	'/assets/video/gallery/',
};

/**
 * Load and init models
 */
var Projector	= require(path.join(__dirname, paths.models, 'Projector'));
var Audio		= require(path.join(__dirname, paths.models, 'Audio'));
Projector.init({
	binDir: path.join(__dirname, paths.bin),
	videoDir: path.join(__dirname, paths.video),
});
Audio.init({
	binDir: path.join(__dirname, paths.bin),
	audioDir: path.join(__dirname, paths.audio),
});
// return;

// app settings
/**
 * App Settings
 */
var port		= 5000
var logger		= {
	debug:		true,
	// debug:		false,
	// format:		'combined',	// DEFAULT - Standard Apache combined log output.
	// format:		'tiny',		// The minimal output.
	format:		'dev',		// Concise output colored by response status for development use.
	options:	{
		skip: function(req, res){
			// only log error responses
			if(!logger.debug)
				return res.statusCode < 400
		},
	},
	stream:		{
		file:		'access.log',
		config:		{
			interval:	'1d', // rotate daily 
			path:		path.join(__dirname, paths.logs),
		}
	},
}

/**
 * Start app
 */
var app = express();

/**
 * Middleware
 */
// ensure log directory exists
fs.existsSync(logger.stream.config.path) || fs.mkdirSync(logger.stream.config.path)
// create a rotating write stream
var accessLogStream = rfs(logger.stream.file, logger.stream.config)
logger.options.stream = accessLogStream;
// setup the logger
app.use(morgan(logger.format, logger.options))
// timeout
app.use(timeout(getTimeoutSeconds()));
// mobile User Agent to force touch controls
/* app.use(function(req, res, next){
	// console.log('mobile header');
	res.header('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1')
	next();
}); */
// !!! must be last middleware !!!
app.use(haltOnTimedout);
function haltOnTimedout(req, res, next){
	// console.log('haltOnTimedout', req.timedout);
	if(!req.timedout)
		next();
}
function getTimeoutSeconds(){
	// console.log('getTimeoutSeconds');
	return timeoutMins * 60 * 1000;
}

/**
 * Routes
 */
// static files
app.use(express.static(path.join(__dirname, paths.web)));
app.get('/', function(req, res, next){
	console.log('/');
	res.sendFile(path.join(__dirname, paths.views, 'index.html'));
});
/** Projector */
app.post('/projector/project/:fileName', function(req, res, next){
// app.all('/projector/project/', function(req, res, next){
	console.log('/projector/project/:' + req.params.fileName);
/* res.json({
	data:	{
		success:	true,
	}
}); */
	Projector.project({
		fileName:	req.params.fileName,
		errorCB:	function(error){
			console.log('/projector/project - errorCB');
			console.log(error);
			if(res.headersSent){
				res.end('{errors:"error"}');
			}else{
				res.status(500).json({
					errors: ['projector/project failed'],
				});
			}
		},
		successCB:	function(){
			console.log('/projector/project - successCB');
			if(res.headersSent){
				res.end('{errors:"error"}');
			}else{
				res.json({
					data:	{
						success:	true,
					}
				});
			}
		}
	});
});
app.post('/quit', function(req, res, next){
// app.all('/quit', function(req, res, next){
	console.log('/quit');
	// console.log(req.params);
/* res.json({
	data:	{
		success:	true,
	}
}); */
	/* Projector.quit({
		errorCB:	function(error){
			console.log('/quit - errorCB');
			console.log(error);
			if(res.headersSent){
				res.end('{errors:"error"}');
			}else{
				res.status(500).json({
					errors: ['Quit failed'],
				});
			}
		},
		successCB:	function(){
			console.log('/quit - successCB');
			if(res.headersSent){
				res.end('{errors:"error"}');
			}else{
				res.json({
					data:	{
						success:	true,
					}
				});
			}
		}
	}); */
});

/**
 * 404's - forward to error handler
 */
app.use(function(req, res, next){
	console.log('404', req.url);
	var err = new Error('Not Found:' + req.url);
	err.status = 404;
	next(err);
});

/**
 * Error handler
 */
app.use(function(err, req, res, next){
	console.log('Error: ' + err.message);
	res.status(err.status || 500);
	var msg = err.message || 'Unknown error';
	if(res.headersSent){
		console.log('headersSent');
		res.end('{errors:"' + err.message + '"}');
	}else{
		console.log('headersNotSent');
		// for json errors
		if(req.xhr) {
			console.log('sendJSON');
			res.json({
				errors: [msg]
			})
		}else{
			console.log('sendTEXT');
			res.send('Error: ' + msg);
		}
	}
});

/**
 * Server
 */
var server = app.listen(port, function(){
	console.log('Start server');
	var host = server.address().address || 'localhost'
	var port = server.address().port
});
server.setTimeout(getTimeoutSeconds());
module.exports = app;