jQuery(function($){
	var app	= {
		debug:	true,
		params:	{
			// ajaxBase:	'http://127.0.0.1:5000/',
			// ajaxBase:	'http://192.168.0.10:5000/',
			ajaxBase:	'/',
			timeoutMins:	61, // +1 from server timeout
			gallery:	{
				timer:		{
					duration: 10,	// seconds
				},
				elementID:	'#galleria',
				urls:	{
					theme:	'js/galleria-1.5.7/galleria/themes/classic/galleria.classic.js',
					data:	'data/gallery.json',
					images:	'img/gallery/lrg/',
					thumbs:	'img/gallery/sml/',
				},
			},
		},
		init:	function(){
			console.log('app.init');
			app.gallery.init();
			app.error.init();
		},
		quit:	function(reset){
			console.log('app.quit');
			app.gallery.timer.quit();
			// stop server processes
			$.ajax({
				method:		'POST',
				url:		app.params.ajaxBase + 'quit',
				timeout:	app.utils.getTimeoutSeconds(),
			})
				.done(function(data, textStatus, jqXHR){
					console.log('app.data',	data);
					if(app.utils.isValidJqXHR(jqXHR)){
						if(
								typeof reset !== 'undefined'
							&&	reset === true
						){
							console.log('Quitting and resetting');
							// reset app by refreshing the page
							location.reload();
						}
					}else{
						console.error('Invalid jqXHR');
					}
				})
				.fail(function(jqXHR, textStatus, errorThrown){
					console.error(app.utils.getJqXHRError(jqXHR));
				});
		},
		gallery:	{
			init:	function(){
				console.log('app.gallery.init');
				app.gallery.galleria.configure();
				app.gallery.galleria.loadTheme();
				app.gallery.data.load(); // loads data, parses data, runs galleria and starts timer
			},
			data:	{
				load:	function(){
					console.log('app.gallery.data.load');
					$.getJSON(app.params.gallery.urls.data, function(data){
						// console.log(data);
						app.gallery.galleria.run(data);
					}).fail(function(jqxhr, textStatus, error) {
						console.error('Error loading gallery data');
					});
				},
				parse:	function(data){
					console.log('app.gallery.data.parse');
					var dataOut = [];
					$.each(data, function(k, v) {
						dataOut.push({
							id:				k,
							title:			v.title,
							description:	v.description,
							image:			app.params.gallery.urls.images + v.fileName + '.jpg',
							thumb:			app.params.gallery.urls.thumbs + v.fileName + '.jpg',
							projectionFile:	v.fileName + '.mp4',
						});
					});
					// console.log(dataOut);
					return dataOut;
				},
			},
			galleria:	{
				galleria:	null,
				configure:	function(){
					console.log('app.gallery.galleria.configure');
					Galleria.configure({
						debug: true,
						showCounter: false,
						// showInfo: false,
						initialTransition: 'fade',
						responsive: true,
						transitionSpeed: 5000,
						trueFullscreen: true,
						fullscreenDoubleTap: false,
						lightbox: false,
						maxScaleRatio: 1,
						idleMode: false,
						swipe: 'enforced',
						// TOUCH:	true,
						// MOBILE:	true,
						extend: function(options) {
							var galleria = this;
							app.gallery.galleria.galleria = galleria;
							// galleria.unbind();
							galleria.bind('loadfinish', function(e) {
								console.log(e.galleriaData);
								app.projector.project(e.galleriaData.projectionFile);
							});
							galleria.bind('image', function(e) {
								console.log('galleria.bind.image');
								app.gallery.timer.reset();
							});
						}
					});
				},
				loadTheme:	function(){
					console.log('app.gallery.galleria.loadTheme');
					Galleria.loadTheme(app.params.gallery.urls.theme);
				},
				run:	function(data){
					console.log('app.gallery.galleria.run');
					Galleria.run(app.params.gallery.elementID, {
						dataSource: app.gallery.data.parse(data)
					});
					app.gallery.timer.init();
				},
				nextSlide:	function(){
					console.log('app.gallery.galleria.nextSlide');
					app.gallery.galleria.galleria.next(); // need to reset here if the slideshow is changed manually
				}
			},
			timer:	{
				elapsed:		0,	// seconds
				stepper:		null,
				stepInterval:	100,
				interval:		null,
				init:		function(){
					console.log('app.gallery.timer.init');
					this.ui.init();
					this.interval = setInterval(this.stepperCB, this.stepInterval);
				},
				stepperCB:	function(){
					// console.log('app.gallery.timer.stepperCB');
					app.gallery.timer.elapsed += app.gallery.timer.stepInterval;
					var percentComplete = (app.gallery.timer.elapsed) / (app.params.gallery.timer.duration * 10);
					app.gallery.timer.ui.setBarWidth(percentComplete);
					if(app.gallery.timer.elapsed / 1000 >= app.params.gallery.timer.duration){
						app.gallery.galleria.nextSlide();
						app.gallery.timer.reset();	// need to reset here or stepper will try to step again while loading image
					}
				},
				reset:		function(){
					console.log('app.gallery.timer.reset');
					app.gallery.timer.elapsed = 0;
					app.gallery.timer.ui.setBarWidth(0);
				},
				quit:		function(){
					clearInterval(this.interval);
				},
				ui:	{
					bar:	null,
					init:	function(){
						console.log('app.gallery.timer.ui.init');
						this.bar = $('#timer-bar');
						this.setBarWidth(0);
					},
					setBarWidth:	function(width){
						this.bar.width(width + '%');
					}
				}
			},
		},
		projector:	{
			project:	function(fileName){
				console.log(app.params.ajaxBase + 'projector/project/' + fileName);
				$.ajax({
						method:		'POST',
						url:		app.params.ajaxBase + 'projector/project/' + fileName,
						timeout:	app.utils.getTimeoutSeconds(),
					})
						.done(function(data, textStatus, jqXHR){
							console.log('app.data',	data);
							if(app.utils.isValidJqXHR(jqXHR)){
								// if(!app.apps.current.isPrevious(app.apps.expressions.name))
									// app.quit(true);
							}else{
								app.error.raise('Invalid jqXHR');
							}
						})
						.fail(function(jqXHR, textStatus, errorThrown){
							// app.error.raise('failed to load image');
							app.error.raise(app.utils.getJqXHRError(jqXHR));
						});
			}
		},
		error:		{
			init:	function(){
				console.log('app.error.init');
				this.ui.init();
			},
			ui:	{
				errorWrap:	null,
				errorMsg:	null,
				resetBtn:	null,
				init:	function(){
					console.log('app.error.ui.init');
					this.errorWrap	= $('#error-wrap');
					this.errorMsg	= $('#error-msg');
					this.resetBtn	= $('#reset-btn')
						.on('click', app.error.events.reset);
				},
				msg:	{
					update:	function(msg){
						console.log('app.error.ui.msg.update', msg);
						app.error.ui.errorMsg.text(msg);
					},
				},
				hide:	function(){
					console.log('app.error.ui.hide');
					this.errorWrap.removeClass('visible');
				},
				show:	function(){
					console.log('app.error.ui.show');
					this.errorWrap.addClass('visible');
				},
			},
			events:	{
				reset:	function(event){
					console.log('app.error.events.reset');
					app.utils.cancelDefaultEvent(event);
					app.quit(true);
				},
				show:	function(msg){
					console.log('app.error.events.show');
					app.error.ui.msg.update(msg);
					app.error.ui.show();
				},
				hide:	function(){
					console.log('app.error.events.hide');
					app.error.ui.hide();
				}
			},
			raise:	function(msg){
				console.error('app.error.raise', msg);
				this.events.show(msg);
				// allow app to auto-reset on timeout errors
				if(
						msg == 'Response timeout'
					||	msg == 'timeout'
				){
					app.quit(true);
				}else{
					app.quit();
				}
			}
		},
		utils:	{
			getTimeoutSeconds:	function(){
				return app.params.timeoutMins * 60 * 1000;
			},
			isValidJqXHR:	function(jqXHR){
				console.log('app.utils.isValidJqXHR', jqXHR);
				return (
					typeof jqXHR.responseJSON	!== 'undefined'
					&&	(
							typeof jqXHR.responseJSON.errors	!== 'undefined'
						||	(
								typeof	jqXHR.responseJSON.data			!== 'undefined'
							&&	typeof	jqXHR.responseJSON.data.success !== 'undefined'
							&& 			jqXHR.responseJSON.data.success	== true
						)
					)
				) ? true : false;
			},
			getJqXHRError:	function(jqXHR){
				console.log('app.utils.getJqXHRError', jqXHR);
				if(
					typeof jqXHR.responseJSON	!== 'undefined'
					&& typeof jqXHR.responseJSON.errors	!== 'undefined'
				)
					return jqXHR.responseJSON.errors[0];
				else if(typeof jqXHR.statusText	!== 'undefined')
					return jqXHR.statusText;
				return 'unknown error';
			},
			cancelDefaultEvent:	function(event){
				console.log('app.utils.cancelDefaultEvent', event);
				if(typeof event !== 'undefined'){
					event.preventDefault();
					event.stopPropagation();
				}
			},
		}
	};
	app.init();
});