$(function() {
	var map_is_on = false;
	var zoomLevel = parseFloat(document.body.style.zoom);
	var bladeRunnerMode = false;

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

	var speakToMe = function(command) {
		console.log("Page has received command: " + command);
		// chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
		// console.log(response.farewell);
		// });
		if (window.location.origin = 'https://handsfreechrome.com') {
			return;
		}
		if (command == "map") {
			if (!map_is_on){
				var n = 1;
				$('a').each(function(){
					if ( isScrolledIntoView(this) /*&& $(this).is(":visible")*/ ) {
						var id = n;
						var a = $(this).offset();
						var destination = $(this).attr('href');
						$('body').append('<span class="numTag" id="' + id + '" style="background:white; border: 1px solid black; font-size: 10pt; position:absolute; z-index:999;">' + id + '</span>');
						$('#'+id).css({left: a.left - 25, top: a.top});
						$('#'+id).click(function(){
							window.location.href = destination;
						});
						n++;
					}
				});
				map_is_on = true;
			}
			else {
				clearMapTags();
			}
		}
		if (command == "down") {
			clearMapTags();
			//window.scrollBy(0,200);
			var amount = '+=' + 200;
			$('html, body').animate(
				{ scrollTop: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
		}
		if (command == "up") {
			clearMapTags();
			//window.scrollBy(0,-200);
			var amount = '-=' + 200;
			$('html, body').animate(
				{ scrollTop: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
		}
		if (command == "fall") {
			clearMapTags();
			//window.scrollBy(0, window.innerHeight);
			var amount = '+=' + window.innerHeight;
			$('html, body').animate(
				{ scrollTop: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
		}
		if (command == "rise" || command == "frys") {
			clearMapTags();
			//window.scrollBy(0, -window.innerHeight);
			var amount = '-=' + window.innerHeight;
			$('html, body').animate(
				{ scrollTop: amount }, 
				{ duration: 'slow', easing: 'swing' }
			);
		}
		if (command == "back") {
			window.history.back();
		}
		if (command == "forward") {
			window.history.forward();
		}
		if (command == "top") {
			clearMapTags();
			//window.scrollTo(0, 0);
			$('html,body').animate(
				{ scrollTop: $('html,body').offset().top },
				{ duration: 'fast', easing: 'swing'}
			);
		}
		if (command == "bottom") {
			clearMapTags();
			// window.scrollTo(0, document.body.scrollHeight);
			$('html,body').animate(
				{ scrollTop: $(document).height() },
				{ duration: 'fast', easing: 'swing'}
			);
		}
		if (command == "reload" || command == "refresh") {
			location.reload();
		}
		if (command == "zoom") {
			document.body.style.zoom = zoomLevel + 0.2;
			if (bladeRunnerMode) {
				//blur page
			}
		}
		if (command == "zoom out") {
			document.body.style.zoom = zoomLevel - 0.2;
		}
		if (bladeRunnerMode && command == "enhance") {
			//unblur page
		}
		else {
			$('#'+command).trigger("click");
		}
	};

	chrome.runtime.onMessage.addListener(
	  function(request, sender, sendResponse) {
		speakToMe(request);
	  });
});