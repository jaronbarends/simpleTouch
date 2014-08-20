/*
 * simpleTouch - jQuery Plugin
 *
 */
(function($) {

	var pluginName = 'simpleTouch';
	
	$.fn[pluginName] = function(options) {
		if (!this) return false;
		
		// Default thresholds & swipe functions
		var fsDefaults = {
					
			swipeThreshold: 75,// int - The number of pixels that the user must move their finger by before it is considered a swipe
			mouseEmulation: true,//Boolean, if true, when the browser doesn't support touch, the mouse can be used for swiping
			triggerOnTouchEnd: true,// Boolean, if true, the swipe events are triggered when the touching ends is received (user releases all fingers).  If false, it will be triggered on reaching the swipeThreshold
			allowPageScroll: 'auto' /* How the browser handles page scrolls when the user is swiping on a touchSwipe object. 
				'auto' : all undefined swipes will cause the page to scroll in that direction.
 				'none' : the page will not scroll when user swipes.
 				'horizontal' : will force page to scroll on horizontal swipes.
 				'vertical' : will force page to scroll on vertical swipes.
			*/
		};
		
		//Constants
		var fsC = {
			LEFT: 'left',
			RIGHT: 'right',
			UP: 'up',
			DOWN: 'down',
		
			NONE: 'none',
			HORIZONTAL: 'horizontal',
			VERTICAL: 'vertical',
			AUTO: 'auto',
		
			PHASE_START_MOVE: 'startMove',
			PHASE_MOVE: 'move',
			PHASE_SWIPE: 'swipe',
			PHASE_END: 'end',
			PHASE_CANCEL: 'cancel',

			EVENT_TOUCH_STATUS_CHANGE: 'touchStatusChange',
			EVENT_MOVE: 'move',
			EVENT_SWIPE_MOVE: 'swipeMove'
		};
		
		// vars vor keeping track of events statuses
		var fsSwipeEventFired = false,
			fsTouchEnded = true;
			
		//object to pass data around
		var fsData = {};
		
		//-- let's get started :) --
		
		if (options) {
			$.extend(fsDefaults, options);
		}
		
		return this.each(function() {
			
			/*-- Start handlers -- --*/
			
				function touchStartHandler(evt) {

					if (fsTouchEnded) {
						//then it's really the start of a new touch
						fsTouchEnded = false;
						initEvtVars();
						setPhase(fsC.PHASE_START_MOVE);
					} else {
						//a finger was added to an existing touch
					}
			
					var touch = evt.touches[0];
					fsData.start = getTouchPos(touch);
					
					//now process the other event variables
					setEventData(evt);
					triggerStatusHandler(evt);
					
				}
				
				function touchMoveHandler(evt) {
					
					setEventData(evt);
					
					//Check if we need to prevent default event (page scroll) or not
					handleDefaultScroll(evt);
					
					//If we trigger whilst dragging, not on touch end, then calculate now...
					if (!fsDefaults.triggerOnTouchEnd && distanceHasPassedThreshold()) {
						// if the user swiped more than the minimum length, perform the appropriate action
						//2 possibilities: if swipeEvents haven't been fired yet, fire swipeHandlers; otherwise trigger swipeMove
						setPhase(fsC.PHASE_SWIPE);
						
						if (!fsSwipeEventFired) {
							triggerSwipeHandlers(evt);
						} else {
							triggerTouchEvent(fsC.EVENT_SWIPE_MOVE);
						}
					} else {
						setPhase(fsC.PHASE_MOVE);
					}
					triggerTouchEvent(fsC.EVENT_MOVE);

					triggerStatusHandler(evt);
				}
				
				function touchEndHandler(evt) {
					evt.preventDefault();

					//check if this is really the end of the touch, or that only the number of touching fingers has changed
					if (!evt.touches.length) {
						//it's really the end of this touch, and not just one finger being lifted
						//we must not update the event data, because we want it to contain the last know position
						setPhase(fsC.PHASE_END);
						
						if (!distanceHasPassedThreshold()) {
							setPhase(fsC.PHASE_CANCEL);
						} else if (fsDefaults.triggerOnTouchEnd) {
							triggerSwipeHandlers(evt);
						}
						
						triggerStatusHandler(evt);
					}
				}
			
				function triggerStatusHandler(evt) {
					//update status and send statusChange event when status changed
					if (fsData.phase != fsData.prevPhase) {
						triggerTouchEvent(fsC.EVENT_TOUCH_STATUS_CHANGE);
					}
				}
			
			/*-- End handlers -- --*/
			
			
			/*-- Start fsData object functions --*/

				function initEvtVars() {
					fsSwipeEventFired = false;
					fsData = {};
				}
				
				function setEventData(evt) {
					//processes all relevant data for an event
					var touch = evt.touches[0];

					//fsData.start has been set in touchStartHandler; make sure not to override it here
					//because this function gets called upon every event
					fsData.end = getTouchPos(touch);
					fsData.distance = getDistanceObj(fsData.start, fsData.end);
					fsData.direction = getDirection(fsData.start, fsData.end);

					//now add general evt vars to fsData object
					fsData.originalEvent = evt;
				}
				
				function setPhase(phs) {
					//sets the new phase
					fsData.prevPhase = fsData.phase;
					fsData.phase = phs;
					if (phs === fsC.PHASE_CANCEL || phs === fsC.PHASE_END) {
						fsTouchEnded = true;
					}
				}
			
			/*-- End fsData object functions --*/

			
			/*-- Start trigger functions --*/
			
				function triggerTouchEvent(evtName) {
					//suffix evtName with namespace
					evtName += '.'+pluginName;
					$this.trigger(evtName, fsData);
				}
				
				function triggerSwipeHandlers(evt) {
					//trigger all appropriate swipeHandlers
					fsSwipeEventFired = true;
					
					//trigger catch all event handler
					triggerTouchEvent('swipe');
					
					//trigger direction specific event handlers
					var direction = fsData.direction,
						evts = [];//TODO: kan deze niet maar 1x gedefinieerd worden?
						evts[fsC.LEFT] = 'swipeLeft';
						evts[fsC.RIGHT] = 'swipeRight';
						evts[fsC.UP] = 'swipeUp';
						evts[fsC.DOWN] = 'swipeDown';
						triggerTouchEvent(evts[direction]);
				}
				
			/*-- End trigger functions --*/
			
			/*-- Start mousefunctions --*/
				function mimicTouchEvent(touchEventHandler, evt) {
					//adds stuff to mouse event to make it look like a touch event
					var touches = [];
					if (touchEventHandler !== touchEndHandler) {
						touches.push({
							pageX: evt.pageX,
							pageY: evt.pageY
						});
					}
					evt.touches = touches;
					//now mimic a touchStart event
					touchEventHandler.call(this, evt);
				}
				
				function mousemoveHandler(evt) {
					mimicTouchEvent(touchMoveHandler, evt);
				}
				
				function mousedownHandler(evt) {
					evt.preventDefault();//this is neccessary to prevent the browser's default dragging behaviour!
					//bind movemouse; we do it here to prevent too much move events firing
					$this.on('mousemove', mousemoveHandler);
					mimicTouchEvent(touchStartHandler, evt);
				}
				
				function mouseupHandler(evt) {
					//unbind movemouse, so we don't have to keep tracking when we don't need it
					$this.off('mousemove', mousemoveHandler);
					mimicTouchEvent(touchEndHandler, evt);
				}
			/*-- End mousefunctions --*/
			
			
			/*
			 * Checks direction of the swipe and the value allowPageScroll to see if we should allow or prevent the default behaviour from occurring.
			 * This will essentially allow page scrolling or not when the user is swiping on a touchSwipe object.
			 */
			function handleDefaultScroll(evt) {
				if( fsDefaults.allowPageScroll == fsC.NONE ) {
					evt.preventDefault();
				} else {
					var auto = (fsDefaults.allowPageScroll == fsC.AUTO);
					
					switch(fsData.direction) {
						case fsC.LEFT :
							if ( (fsDefaults.swipeLeft && auto) || (!auto && fsDefaults.allowPageScroll!=fsC.HORIZONTAL)) {
								evt.preventDefault();
							}
							break;
						
						case fsC.RIGHT :
							if ( (fsDefaults.swipeRight && auto) || (!auto && fsDefaults.allowPageScroll!=fsC.HORIZONTAL)) {
								evt.preventDefault();
							}
							break;

						case fsC.UP :
							if ( (fsDefaults.swipeUp && auto) || (!auto && fsDefaults.allowPageScroll!=fsC.VERTICAL)) {
								evt.preventDefault();
							}
							break;
						
						case fsC.DOWN :	
							if ( (fsDefaults.swipeDown && auto) || (!auto && fsDefaults.allowPageScroll!=fsC.VERTICAL)) {
								evt.preventDefault();
							}
							break;
					}
				}
				
			}
			
			/*-- Start helper functions --*/
			
				function getTouchPos(touch) {
					//returns the x and y position of a member of the event.touches array
					var p = {
						x: touch.pageX,
						y: touch.pageY
					}
					return p;
				}
			
				function getDirection(start, end) {
					var dx = end.x - start.x;
					var dy = end.y - start.y;
					if (Math.abs(dx) >= Math.abs(dy)) {
						//we're moving horizontally
						return ( (dx > 0) ? fsC.RIGHT : fsC.LEFT);
					} else {
						return ( (dy > 0) ? fsC.DOWN : fsC.UP);
					}
				}
				
				function getDistanceObj(start, end) {
					var x = end.x - start.x;
					var y = end.y - start.y;
					return {x:x, y:y};
				}
				
				function getDistance(point) {
					return Math.sqrt(Math.pow(point.x,2) + Math.pow(point.y,2));
				}
				
				function distanceHasPassedThreshold() {
					var distance = fsData.distance,
						dx = Math.abs(distance.x),
						dy = Math.abs(distance.y);

					return (Math.max(dx,dy) >= fsDefaults.swipeThreshold);
				}
				
			/*-- End helper functions --*/
			

			/*-- Start initialization --*/

			var $this = $(this);
			if ('ontouchstart' in window) {
				try {
					this.addEventListener('touchstart', touchStartHandler, false);
					this.addEventListener('touchmove', touchMoveHandler, false);
					this.addEventListener('touchend', touchEndHandler, false);
				} catch(e) {
					//touch not supported
				}
			} else {
				//bind stuff to mouse events
				$this.on('mousedown', mousedownHandler);
				$this.on('mouseup', mouseupHandler);
			}
				
		});
	};
	
})(jQuery);