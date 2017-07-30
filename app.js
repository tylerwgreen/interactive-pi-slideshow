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
};
// var styling	= false;
var styling	= true;

/**
 * Load models
 */
/* var MediaPlayer		= require(path.join(__dirname, paths.models, 'MediaPlayer'));
if(!styling)
	MediaPlayer.init(); */

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
// mobile Usear Agent to force touch controls
app.use(function(req, res, next){
	// console.log('mobile header');
	res.header('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1')
	next();
});
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
/** Expressions */
/* app.post('/apps/expressions/play', function(req, res, next){
	console.log('/apps/expressions/play');
	// console.log(req.params);
	if(styling){
		setTimeout(function(){
			console.log('/apps/expressions - success');
			if(res.headersSent){
				res.end('{errors:"error"}');
			}else{
				res.json({
					data:	{
						success:	true,
					}
				});
			}
		}, 5000);
	}else{
		MediaPlayer.expressions.play({
			errorCB:	function(error){
				console.log('/apps/expressions/play - errorCB');
				console.log(error);
				if(res.headersSent){
					res.end('{errors:"error"}');
				}else{
					res.status(500).json({
						errors: ['Expressions play failed'],
					});
				}
			},
			successCB:	function(){
				console.log('/apps/expressions/play - successCB');
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
	}
}); */
/** Puppet People */
/* app.post('/apps/puppet-people/play', function(req, res, next){
	console.log('/apps/puppet-people/play');
	// console.log(req.params);
	if(styling){
		setTimeout(function(){
			console.log('/apps/puppet-people - success');
			if(res.headersSent){
				res.end('{errors:"error"}');
			}else{
				res.json({
					data:	{
						success:	true,
					}
				});
			}
		}, 5000);
	}else{
		MediaPlayer.puppetPeople.play({
			errorCB:	function(error){
				console.log('/apps/puppet-people/play - errorCB');
				console.log(error);
				if(res.headersSent){
					res.end('{errors:"error"}');
				}else{
					res.status(500).json({
						errors: ['Puppet People play failed'],
					});
				}
			},
			successCB:	function(){
				console.log('/apps/puppet-people/play - successCB');
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
	}
}); */
/** Dusty Loops */
/* app.post('/apps/dusty-loops/play', function(req, res, next){
	console.log('/apps/dusty-loops/play');
	// console.log(req.params);
	if(styling){
		setTimeout(function(){
			console.log('/apps/dusty-loops - success');
			if(res.headersSent){
				res.end('{errors:"error"}');
			}else{
				res.json({
					data:	{
						success:	true,
					}
				});
			}
		}, 5000);
	}else{
		MediaPlayer.dustyLoops.play({
			errorCB:	function(error){
				console.log('/apps/dusty-loops/play - errorCB');
				console.log(error);
				if(res.headersSent){
					res.end('{errors:"error"}');
				}else{
					res.status(500).json({
						errors: ['Dusty Loops play failed'],
					});
				}
			},
			successCB:	function(){
				console.log('/apps/dusty-loops/play - successCB');
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
	}
}); */
app.post('/quit', function(req, res, next){
	console.log('/quit');
	// console.log(req.params);
	if(styling){
		if(res.headersSent){
			res.end('{errors:"error"}');
		}else{
			res.json({
				data:	{
					success:	true,
				}
			});
		}
	}else{
		MediaPlayer.quit({
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
		});
	}
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