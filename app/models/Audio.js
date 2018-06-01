var execFile	= require('child_process').execFile;
var fs			= require('fs');

var Audio		= {
	params:	{
		binDir:		null,
		audioDir:	null,
	},
	init:	function(params){
		console.log('Audio.init', params);
		// config params
		this.params.binDir = params.binDir;
		this.params.audioDir = params.audioDir;
		// test randomization
		/* this.files.init(function(){
			var its	= 25;
			for(var i = 0; i <= its; i++){
				console.log(i, Audio.files.random());
			}
		}); */
		this.files.init(Audio.playRandom);
	},
	playRandom:	function(){
		console.log('Audio.playRandom');
		child	= execFile(
			Audio.params.binDir + 'audio-play',
			[Audio.params.audioDir + Audio.files.random()],
			function(error, stdout, stderr){
				if(error){
					console.log('Audio.playRandom.error.stderr');
					console.log(stderr);
					// console.log(error);
				}else{
					console.log('Audio.playRandom.success.stdout');
					console.log(stdout);
					console.log('Playing another audio file');
					Audio.playRandom();
				}
			}
		);
	},
	files:	{
		file:	null,
		files:	{
			all:		[],
			available:	[],
		},
		init:	function(callback){
			console.log('Audio.files.init');
			fs.readdir(Audio.params.audioDir, (err, files) => {
				files.forEach(function(file){
					Audio.files.files.all.push(file);
					if(files.length === Audio.files.files.all.length){
						callback();
					}
				});
			});
		},
		random:	function(){
			if(Audio.files.files.available.length <= 0){
				Audio.files.files.available = Audio.files.files.all.slice(0); // copy all array into available
			}
			var file		= Audio.files.files.available[Math.floor(Math.random() * Audio.files.files.available.length)];
			var fileIndex	= Audio.files.files.available.indexOf(file);
			if(file === Audio.files.file)
				return Audio.files.random();
			Audio.files.files.available.splice(fileIndex, 1);
			Audio.files.file	= file;
			return file;
		}
	}
};
module.exports = Audio;