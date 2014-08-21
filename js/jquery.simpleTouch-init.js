(function($) {
	
	//cached elements
	var $logpane,
		pluginName = 'simpleTouch';
	
	//-- Start handlers --
		
		function touchStatusHandler(evt, data) {
			console.log('touchStatusChange - phase: '+data.phase+'; dir: '+data.direction+'; dist: ('+data.distance.x+', '+data.distance.y+')');
		}
		
		function moveHandler(evt, data) {
			console.log('move '+data.direction+'; dist: ('+data.distance.x+', '+data.distance.y+');');
		}
		
		function swipeHandler(evt, data) {
			console.log('swipe '+data.direction+'; dist: ('+data.distance.x+', '+data.distance.y+');');
		}
		
		function swipeMoveHandler(evt, data) {
			console.log('swipemove: '+data.direction+'; dist: ('+data.distance.x+', '+data.distance.y+')');
		}

	//-- End handlers --

	
	//-- Start init functions --
		function initTouchTest() {

			var options = {
				swipe: swipeHandler,
				triggerOnTouchEnd: false,
				mouseEmulation: true,
				allowPageScroll: 'none'
			}

			$('#toucharea').simpleTouch(options)
				//*
				.on('touchStatusChange.'+pluginName, touchStatusHandler)
				.on('move.'+pluginName, moveHandler)
				.on('swipe.'+pluginName, swipeHandler)
				.on('swipeMove.'+pluginName, swipeMoveHandler);
				//*/
		}
		
	//-- End init functions --
		
	function init() {
		initTouchTest();
	}
	
	$(document).ready(function() {
		init();
	});
	
})(jQuery);
