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
	//-- End handlers --
	
	//-- Start logging functions --
		function logTouchEvent(data) {
			$('#lasteventlog').text(data.lastEvent);
			$('#phaselog').text(data.phase);
			
			//log touch data
			var prf = 't0-';
			$('#'+prf+'x').text(data.end.x);
			$('#'+prf+'y').text(data.end.y);
			$('#'+prf+'dir').text(data.direction);
			$('#'+prf+'dist').text(data.distance.x+', '+data.distance.y);
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
				//.on('touchStatus.touchEvent', touchStatusHandler)
				//.on('swipeMove.touchEvent', swipeMoveHandler)
				.on('swipe.touchEvent', swipeHandler);
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
				clearTouches();
			});
		}
		
		function clearTouches() {
			prf = 't0-';
			clearElm(prf+'x');
			clearElm(prf+'y');
			clearElm(prf+'dir');
			clearElm(prf+'dist');
		}
		
		function clearElm(id) {
			$('#'+id).html('');
		}
	
		function log(msg) {
			var t = $logpane.html();
			$logpane.html(msg+'<br>'+t);
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
