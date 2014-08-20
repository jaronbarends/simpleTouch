(function($) {
	
	//cached elements
	var $logpane;
	
	//-- Start handlers --
		function swipeHandler(evt, data) {
			log('swipe '+data.direction+'; dist: ('+data.distance.x+', '+data.distance.y+'); f: '+data.touchCount);
			data.lastEvent = 'swipe';
			logTouchEvent(data);
		}
		
		function swipeMoveHandler(evt, data) {
			log('swipemove: '+data.direction+'; dist: ('+data.distance.x+', '+data.distance.y+') f:'+data.touchCount+' pf:'+data.prevTouchCount);
			data.lastEvent = 'swipeMove';
			logTouchEvent(data);
			
			var dist = data.distance;
			var c = {
				'left': dist.x+'px'
			}
			$(evt.target).css(c);
		}
		
		function touchStatusHandler(evt, data) {
			log('Status - phase: '+data.phase+'; dir: '+data.direction+'; dist: ('+data.distance.x+', '+data.distance.y+')');
			data.lastEvent = 'touchStatus';
			logTouchEvent(data);
		}
		
		function tapHandler(evt, data) {
			log('tapHandler');
			data.lastEvent = 'tap';
			logTouchEvent(data);
		}
		
		function doubleTapHandler(evt, data) {
			log('doubleTapHandler');
			data.lastEvent = 'doubleTap';
			logTouchEvent(data);
		}
		
		function touchCountChangeHandler(evt, data) {
			log('touchCountChangeHandler: f:'+data.touchCount+' pf:'+data.prevTouchCount);
			data.lastEvent = 'touchCountChange';
			logTouchEvent(data);
		}
	//-- End handlers --
	
	//-- Start logging functions --
		function logTouchEvent(data) {
			$('#lasteventlog').text(data.lastEvent);
			$('#phaselog').text(data.phase);
			$('#touchcountlog').text(data.touchCount);
			$('#prevtouchcountlog').text(data.prevTouchCount);
		}
	//-- End logging functions --
	
	//-- Start init functions --
		function initTouchTest() {
			var options = {
				swipe: swipeHandler,
				triggerOnTouchEnd: false,
				mouseEmulation: true,
				allowPageScroll: 'none'
			}
			$('.swipeable li').touchEvents(options)
				.bind('touchStatus.touchEvent', touchStatusHandler)
				.bind('swipe.touchEvent', swipeHandler)
				.bind('swipeMove.touchEvent', swipeMoveHandler)
				.bind('tap.touchEvent', tapHandler)
				.bind('doubleTap.touchEvent', doubleTapHandler);
		}
		
		function initVars() {
			$logpane = $('#log');
		}
	//-- End init functions --
		
	//-- Start helper functions --
		function initClear() {
			$('#clear').click(function(evt) {
				evt.preventDefault();
				$logpane.html('');
			});
		}
		
		function clearElm(id) {
			$('#'+id).html('');
		}
	
		function log(msg) {
			var t = $logpane.html();
			$logpane.html(msg+'<br>'+t);
		}
		
		function clog(msg) {
			if(typeof(console) !== "undefined") {
				if (typeof(msg) === "string") {
					console.log(msg);
				} else {
					console.dir(msg);
				}
			}
		}
	//-- End helper functions --
	
	function init() {
		initVars();
		initClear();
		initTouchTest();
	}
	
	$(document).ready(function() {
		init();
	});
	
})(jQuery);
