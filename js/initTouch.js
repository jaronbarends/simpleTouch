(function($) {
	
	//cached elements
	var $logpane;
	
	//-- Start handlers --
		function swipeHandler(evt, data) {
			log('swipe '+data.direction+'; dist: ('+data.distance.x+', '+data.distance.y+');');
			data.lastEvent = 'swipe';
			logTouchEvent(data);
		}
		
		function swipeMoveHandler(evt, data) {
			log('swipemove: '+data.direction+'; dist: ('+data.distance.x+', '+data.distance.y+')');
			data.lastEvent = 'swipeMove';
			logTouchEvent(data);
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
			
			//log data for touches
			var touch = data.touch;
			$('#t0-x').text(touch.end.x);
			$('#t0-y').text(touch.end.y);
			$('#t0-dir').text(touch.direction);
			$('#t0-dist').text(touch.distance.x+', '+touch.distance.y);

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
			$('#toucharea').simpleTouch(options)
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
				//clear logs
				clearElm('lasteventlog');
				clearElm('phaselog');
				clearElm('touchcountlog');
				clearElm('prevtouchcountlog');
				clearTouches(0);
			});
		}
		
		function clearTouches(fromIdx) {
			var i = fromIdx;
			while (i < 4) {
				prf = 't'+i+'-';
				clearElm(prf+'x');
				clearElm(prf+'y');
				clearElm(prf+'dir');
				clearElm(prf+'dist');
				i++;
			}
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
