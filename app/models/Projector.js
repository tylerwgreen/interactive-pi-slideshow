var execFile	= require('child_process').execFile;
var fs			= require('fs');

var Projector		= {
	params:	{
		binDir:		'/home/pi/interactive-pi-slideshow/bin/',
		// photoDir:	'/home/pi/interactive-pi-slideshow/web/img/gallery/huge/',
		// audioDir:	'/media/pi/TYLERTHUMB1/audio/media-player/music/',
		// audioDir:	'/media/pi/TYLERTHUMB1/audio/media-player/field-recordings/',
	},
	/* init:	function(){
		console.log('Projector.init');
		// this.expressions.init();
	}, */
	/* current:		{
		current:	null,
		previous:	null,
		reset:	function(){
			this.previous	= null;
			this.current	= null;
		},
		set:	function(app){
			console.log('Projector.current.set', app);
			this.previous	= this.current;
			this.current	= app;
		},
		get:	function(){
			console.log('Projector.current.get', this.current);
			return this.current;
		},
		isPrevious:	function(app){
			console.log('Projector.current.isPrevious', this.previous);
			return app == this.previous	? true : false;
		},
		isCurrent:	function(app){
			console.log('Projector.current.isCurrent', this.current);
			return app == this.current	? true : false;
		}
	}, */
	quit:		function(params){
		console.log('Projector.quit');
		// Projector.current.reset();
		// Projector.expressions.quitter.quit();
		child = execFile(
			Projector.params.binDir + 'quit-playback',
			[],
			function(error, stdout, stderr){
				if(error){
					// console.log('Projector.quit.error.error');
					// console.log(error);
					console.log('Projector.quit.error.stderr');
					console.log(stderr);
					params.errorCB(error);
				}else{
					console.log('Projector.quit.success.stdout');
					console.log(stdout);
					params.successCB();
				}
			}
		);
	},
	project:	function(params){
		console.log('Projector.project');
		// if(Projector.current.isCurrent(Projector.dustyLoops.name))
			// return;
		// Projector.current.set(Projector.dustyLoops.name);
		child		= execFile(
			Projector.params.binDir + 'projector-project',
			[params.fileName],
			function(error, stdout, stderr){
				if(error){
					// console.log('Projector.dustyLoops.play.error.error');
					// console.log(error);
					console.log('Projector.project.error.stderr');
					console.log(stderr);
					params.errorCB(error);
				}else{
					console.log('Projector.project.success.stdout');
					console.log(stdout);
					params.successCB();
				}
			}
		);
	},
	/* expressions:	{
		name:		'expressions',
		callbacks:	{
			error:		null,
			success:	null,
			callError:		function(){
				console.log('Projector.expressions.callbacks.callError');
				if(this.error != null){
					this.error();
					this.error		= null;
					this.success	= null;
				}
			},
			callSuccess:	function(){
				console.log('Projector.expressions.callbacks.callSuccess');
				if(this.success != null){
					this.success();
					this.error		= null;
					this.success	= null;
				}
			}
		},
		init:	function(){
			console.log('Projector.expressions.init');
			this.files.init();
		},
		quitter:	{
			_quit:		false,
			quit:		function(){
				console.log('Projector.expressions.quitter.quit');
				this._quit	= true;
			},
			reset:		function(){
				console.log('Projector.expressions.quitter.reset');
				this._quit	= false;
			},
			hasQuit:	function(){
				console.log('Projector.expressions.quitter.hasQuit');
				return this._quit;
			}
		},
		play:	function(params){
			console.log('Projector.expressions.play');
			if(Projector.current.isCurrent(Projector.expressions.name))
				return;
			Projector.expressions.quitter.reset();
			Projector.current.set(Projector.expressions.name);
			this.callbacks.error	= params.errorCB;
			this.callbacks.success	= params.successCB;
			this.videoPlayer.start();
			this.audioPlayer.start();
		},
		videoPlayer:	{
			start:	function(){
				console.log('Projector.expressions.videoPlayer.start');
				child	= execFile(
					Projector.params.binDir + 'expressions-play-video',
					[Projector.expressions.files.video.random()],
					function(error, stdout, stderr){
						if(error){
							// console.log('Projector.expressions.play.error.error');
							// console.log(error);
							console.log('Projector.expressions.play.error.stderr');
							console.log(stderr);
							Projector.expressions.callbacks.callError(error);
						}else{
							console.log('Projector.expressions.play.success.stdout');
							console.log(stdout);
							if(
									Projector.current.isPrevious(Projector.expressions.name)
								||	Projector.expressions.quitter.hasQuit()
							){
								console.log('Calling expressions success');
								Projector.expressions.callbacks.callSuccess();
							}else{
								console.log('Playing another expressions video');
								Projector.expressions.videoPlayer.start();
							}
						}
					}
				);
			}
		},
		audioPlayer:	{
			start:	function(){
				console.log('Projector.expressions.audioPlayer.start');
				child	= execFile(
					Projector.params.binDir + 'expressions-play-audio',
					[Projector.expressions.files.audio.random()],
					function(error, stdout, stderr){
						if(error){
							// console.log('Projector.expressions.play.error.error');
							// console.log(error);
							console.log('Projector.expressions.play.error.stderr');
							console.log(stderr);
							Projector.expressions.callbacks.callError(error);
						}else{
							console.log('Projector.expressions.play.success.stdout');
							console.log(stdout);
							if(
								Projector.current.isPrevious(Projector.expressions.name)
								||	Projector.expressions.quitter.hasQuit()
							){
								console.log('Calling expressions success');
								Projector.expressions.callbacks.callSuccess();
							}else{
								console.log('Playing another expressions audio');
								Projector.expressions.audioPlayer.start();
							}
						}
					}
				);
			}
		},
		files:	{
			init:	function(){
				console.log('Projector.expressions.files.init');
				this.video.init();
				this.audio.init();
			},
			video: {
				files:	[],
				file:	null,
				init:	function(){
					console.log('Projector.expressions.files.video.init');
					fs.readdir(Projector.params.videoDir, (err, files) => {
						files.forEach(function(file){
							Projector.expressions.files.video.files.push(file);
						});
					});
				},
				random:	function(){
					console.log('Projector.expressions.files.video.random');
					var file	= this.files[Math.floor(Math.random() * this.files.length)];
					if(file == this.file)
						return Projector.expressions.files.video.random();
					this.file = file;
					return file;
				}
			},
			audio: {
				files:	[],
				file:	null,
				init:	function(){
					console.log('Projector.expressions.files.audio.init');
					fs.readdir(Projector.params.audioDir, (err, files) => {
						files.forEach(function(file){
							Projector.expressions.files.audio.files.push(file);
						});
					});
				},
				random:	function(){
					console.log('Projector.expressions.files.audio.random');
					var file	= this.files[Math.floor(Math.random() * this.files.length)];
					if(file == this.file)
						return Projector.expressions.files.audio.random();
					this.file = file;
					return file;
				}
			},
		}
	}, */
	/* puppetPeople:	{
		name:		'puppetPeople',
		play:		function(params){
			console.log('Projector.puppetPeople.play');
			if(Projector.current.isCurrent(Projector.puppetPeople.name))
				return;
			Projector.current.set(Projector.puppetPeople.name);
			child	= execFile(
				Projector.params.binDir + 'puppet-people-play',
				[],
				function(error, stdout, stderr){
					if(error){
						// console.log('Projector.puppetPeople.play.error.error');
						// console.log(error);
						console.log('Projector.puppetPeople.play.error.stderr');
						console.log(stderr);
						params.errorCB(error);
					}else{
						console.log('Projector.puppetPeople.play.success.stdout');
						console.log(stdout);
						params.successCB();
					}
				}
			);
		},
	}, */
	/* dustyLoops:		{
		name:		'dustyLoops',
		play:		function(params){
			console.log('Projector.dustyLoops.play');
			if(Projector.current.isCurrent(Projector.dustyLoops.name))
				return;
			Projector.current.set(Projector.dustyLoops.name);
			child		= execFile(
				Projector.params.binDir + 'dusty-loops-play',
				[],
				function(error, stdout, stderr){
					if(error){
						// console.log('Projector.dustyLoops.play.error.error');
						// console.log(error);
						console.log('Projector.dustyLoops.play.error.stderr');
						console.log(stderr);
						params.errorCB(error);
					}else{
						console.log('Projector.dustyLoops.play.success.stdout');
						console.log(stdout);
						params.successCB();
					}
				}
			);
		},
	} */
};
module.exports = Projector;