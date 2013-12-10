$(function() {
	var map_is_on = false;
	var zoomLevel = 1.0;
	var dictation_mode = false;
	var bladeRunnerMode = false;
	var scrollSpeed = 800;
	var scrollContainer = $('html, body');
	var currentDirection = null;
	var currentSpeed = null;
	
	$('body').css({ '-webkit-transition': '0.3s ease-in-out' });
	var blurred = false;

	if (typeof String.prototype.startsWith !== 'function') {
		String.prototype.startsWith = function (str){
			return this.slice(0, str.length) === str;
		};
	}
	if (typeof String.prototype.endsWith !== 'function') {
		String.prototype.endsWith = function (str){
			return this.slice(-str.length) === str;
		};
	}

	function isScrolledIntoView(elem) {
		var docViewTop = $(window).scrollTop();
		var docViewBottom = docViewTop + $(window).height();

		var elemTop = $(elem).offset().top;
		var elemBottom = elemTop + $(elem).height();

		return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom)
		  && (elemBottom <= docViewBottom) &&  (elemTop >= docViewTop) );
	}

	function clearMapTags() {
		$('.numTag').remove();
		map_is_on = false;
	}
	
	function startScrolling( direction, speed ) {
		if ( direction === "up" ) {operator = "-=";}
		if ( direction === "down" ) {operator = "+=";}
		currentDirection = direction;
		currentSpeed = speed;
		scrollContainer.stop();
		scrollContainer.animate(
			{scrollTop: operator + document.body.scrollHeight},
			{
				duration: speed * document.body.scrollHeight / 50,
				easing: 'linear',
				complete: function() { currentSpeed = null; }
			}
		);
	}
	
	function switch_mode(turn_on) {
		if (turn_on) {
			dictation_mode = true;
		} else {
			dictation_mode = false;
		}
		chrome.runtime.sendMessage({greeting: {dictModeOn : dictation_mode} }, function(response) {
			console.log(response);
		});
	}
			
	function inform_input_page(turn_on) {
		document.getElementById('modeSwitch').click();
	}
	
	var commandCenter = (function () {
		//verifies that method exists before calling it
		this.call = function( command ){
			console.log("Page has received command: " + command);
			if (window.location.origin === 'https://handsfreechrome.com/input.html') {
				return -1;
			}
			console.log(command);
			if ( command.split(" ")[0] + command.split(" ")[1] === "goto" ) {
				console.log("calling goto");
				console.log(command.split(" ")[2]);
				this.go_to(command.split(" ")[2]);
			}
			if ( typeof( this[command] ) === 'function' ) {
					this[command]();
				return 1;
			}
			return 0;
		};
		this.map = function() {
			if (!map_is_on){
				var n = 1;
				$('a,button,input').each(function(){
					if ( isScrolledIntoView(this) && VISIBILITY.isVisible(this) ) {
					
						var id = n;
						var a = $(this).offset();									
						$('body').append('<span class="numTag" id="' + id + '" style="background:white; border: 1px solid black; font-size: 10pt; position:absolute; z-index:999;">' + id + '</span>');
						$('#'+id).css({left: a.left - 25, top: a.top});
						
						var self = this;
						switch( this.tagName)
						{
						case 'A':
							$('#'+id).click(function(){
								setTimeout(function() { self.click(); }, 10);
							});
							break;
						case 'BUTTON':
							$('#'+id).click(function(){
								self.click();
							});
							break;
						//needs to only switch_mode on certain types of input, not all
						case 'INPUT':
							$('#'+id).click(function(){
								self.focus();
								switch_mode(true);
							});
							break;
						}
						n++;
					}
				});
				map_is_on = true;
				return;
			}
			else {
				clearMapTags();
				return;
			}
		};
		this.other = function() {
			if (!map_is_on){
				var n = 1;
				$('span,img').each(function(){
					if ( isScrolledIntoView(this) && VISIBILITY.isVisible(this) ) {
						var id = n;
						var offset = $(this).offset();
						$('body').append('<span class="numTag" id="' + id + '" style="background:white; border: 1px solid black; font-size: 10pt; position:absolute; z-index:999;">' + id + '</span>');
						$('#'+id).css({left: offset.left - 25, top: offset.top});
						var span = this;
						$('#'+id).click(function(){
							setTimeout(function() { span.click(); }, 10);
						});
						n++;
					}
				});
				map_is_on = true;
				return;
			}
			else {
				clearMapTags();
				return;
			}
		};
		//we're going to have to make it an added function of this extension that whenever chrome says "oops did you mean..." it auto-redirects to google or something
		//otherwise the extension stops working completely because there's no control script because we're not on an http page
		this.go_to = function(destination) {
			if (destination === "undefined") {
				console.log("skipping a fake");
				return;
			}
			if ( !destination.endsWith(".com") && !destination.endsWith(".edu") && !destination.endsWith(".gov") && !destination.endsWith(".org") ) {
				if (destination.endsWith(".") ) {
					destination = destination.slice(0,-1);
				}
				destination += ".com";
			}
			console.log("about to go to " + destination);
			window.location.href = "http://www." + destination;
		};
		this.home = function() {
			window.location.href = "https://www.google.com";
		}
		this.down = function() {
			scrollContainer.stop();
			clearMapTags();
			var amount = '+=' + 200;
			$('html, body').animate(
				{ scrollTop: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		};
		this.up = function() {
			scrollContainer.stop();
			clearMapTags();
			var amount = '-=' + 200;
			$('html, body').animate(
				{ scrollTop: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		};
		this.right = function() {
			clearMapTags();
			var amount = '+=' + 200;
				$('html, body').animate(
				{ scrollLeft: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		};
		this.left = function() {
			clearMapTags();
			var amount = '-=' + 200;
				$('html, body').animate(
				{ scrollLeft: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		};
		this.fall = function() {
			scrollContainer.stop();
			clearMapTags();
			var amount = '+=' + window.innerHeight;
			$('html, body').animate(
				{ scrollTop: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		};
		this.rise = function() {
			scrollContainer.stop();
			clearMapTags();
			var amount = '-=' + window.innerHeight;
			$('html, body').animate(
				{ scrollTop: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
			return;
		};
		this.back = function() {
			window.history.back();
			return;
		};
		this.forward = function() {
			window.history.forward();
			return;
		};
		this.top1 = function() {
			console.log("called top!");
			scrollContainer.stop();
			clearMapTags();
			$('html,body').animate(
				{ scrollTop: $('html,body').offset().top },
				{ duration: 'fast', easing: 'swing'}
			);
			return;
		};
		this.bottom = function() {
			scrollContainer.stop();
			clearMapTags();
			$('html,body').animate(
				{ scrollTop: $(document).height() },
				{ duration: 'fast', easing: 'swing'}
			);
			return;
		};
		this.reload = function() {
			location.reload();
			return;
		};
		this.zoom = function() {
			if (bladeRunnerMode) {
				$('body').css({ '-webkit-filter': 'blur(5px)' });
			}
			$('html, body').animate(
				{ zoom: zoomLevel + 0.2 },
				{ duration: 'slow', easing: 'linear' }
			);
			zoomLevel = zoomLevel + 0.2;
			return;
		};
		this.zoom_out = function() {
			$('body').css({ '-webkit-filter': 'blur(0px)' });
			$('html, body').animate(
				{ zoom: zoomLevel - 0.2 },
				{ duration: 'slow', easing: 'swing' }
			);
			//document.body.style.zoom = zoomLevel - 0.2;
			zoomLevel = zoomLevel - 0.2;
			return;
		};
		this.zoom_normal = function() {
			$('body').css({ '-webkit-filter': 'blur(0px)' });
			$('html, body').animate(
				{ zoom: 1.0 },
				{ duration: 'slow', easing: 'swing' }
			);
			zoomLevel = 1.0;
			return;
		};
		this.enhance = function() {
			if (bladeRunnerMode) {
				$('body').css({ '-webkit-filter': 'blur(0px)' });
			}
			return;
		};
		this.help = function() {
			console.log("not implemented");
		};
		this.slower = function() {
			if (currentSpeed) {
				currentSpeed += 250;
			}
			if (currentDirection) {
				startScrolling( currentDirection, currentSpeed );
			}
		};
		this.faster = function() {
			if (currentSpeed) {
				currentSpeed -= 250;
			}
			if (currentSpeed <= 0) { currentSpeed = 5; }
			console.log(currentSpeed);
			if (currentDirection) {
				startScrolling( currentDirection, currentSpeed );
			}
		};
		this.stop = function() {
			scrollContainer.stop();
		};
		this.toggle_BR_mode = function() {
			bladeRunnerMode = !bladeRunnerMode;
		};
		this.keep_scrolling_down = function() {
			startScrolling( "down", scrollSpeed );
		};
		this.keep_scrolling_up = function() {
			startScrolling( "up", scrollSpeed );
		};
		this.keep_scrolling_right = function() {
			console.log("not implemented");
		};
		this.keep_scrolling_left = function() {
			console.log("not implemented");
		};
		return {
			'call'			: call,
			'map'			: map,
			'other'			: other,
			'go_to'			: go_to,
			'home'			: home,
			'down'			: down,
			'up'			: up,
			'op'			: up, //misheard word
			'right'			: right,
			'left'			: left,
			'fall'			: fall,
			'song'			: fall, //misheard word
			'rise'			: rise,
			'frys'			: rise, //misheard word
			'back'			: back,
			'forward'		: forward,
			'top'			: top1,
			'bottom'		: bottom,
			'reload'		: reload,
			'refresh'		: reload,
			'zoom'			: zoom,
			'zoom in'		: zoom,
			'zoom out'		: zoom_out,
			'zoom normal'	: zoom_normal,
			'enhance'		: enhance,
			'help'			: help,
			'slower'		: slower,
			'faster'		: faster,
			'stop'			: stop,
			'Blade Runner mode'		: toggle_BR_mode,
			'keep scrolling down'	: keep_scrolling_down,
			'keep scrolling up'		: keep_scrolling_up,
			'keep scrolling right'	: keep_scrolling_right,
			'keep scrolling left'	: keep_scrolling_left
		};
	}());
	
	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			if (window.location.href === 'https://handsfreechrome.com/input.html') {
				inform_input_page(request.dictModeOn);
				return;
			} else {
				if (!dictation_mode) {
					if (commandCenter.call(request) === 0) {
						if (request === "att") request = "8";
						if (request === "sex") request = "6";
						$('#'+request).trigger("click");
						clearMapTags();
					}
				} else {
					console.log("dictation mode is on.");
				}
				return;
			}
		});
});