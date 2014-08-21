/*
 * simpleTouch - jQuery Plugin
 *
 */
(function($) {

	var pluginName = 'simpleTouch';
	
	$.fn[pluginName] = function(options) {
		if (!this) return false;

		var $this = $(this);
		
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
		var fsData;
		
		//-- let's get started :) --
		
		if (options) {
			$.extend(fsDefaults, options);
		}
		
		return this.each(function() {
			
			/*-- Start handlers -- --*/
			
				/**
				* Handle the start of a touch
				* @param {event} evt A touchstart event or an enhanced mousedown event containing some of a touchstart event's properties
				* @returns {undefined}
				*/
				var touchStartHandler = function(evt) {

					if (fsTouchEnded) {
						//then it's really the start of a new touch
						fsTouchEnded = false;
						resetEvtVars();
						setPhase(fsC.PHASE_START_MOVE);
					} else {
						//a finger was added to an existing touch
					}
			
					var touch = evt.touches[0];
					fsData.start = getTouchPos(touch);
					
					//now process the other event variables
					setEventData(evt);
					triggerStatusChangeEvent();
					
				};//touchStartHandler
				

				/**
				* Handle a touch move
				* @param {event} evt A touchmove event or an enhanced mousemove event containing some of a touchmove event's properties
				* @returns {undefined}
				*/
				var touchMoveHandler = function(evt) {
					setEventData(evt);
					
					//Check if we need to prevent default event (page scroll) or not
					handleDefaultScroll(evt);
					
					//If we trigger whilst dragging, not on touch end, then calculate now...
					if (!fsDefaults.triggerOnTouchEnd && distanceHasPassedThreshold()) {
						// if the user swiped more than the minimum length, perform the appropriate action
						//2 possibilities: if swipeEvents haven't been fired yet, fire swipeHandlers; otherwise trigger swipeMove
						setPhase(fsC.PHASE_SWIPE);
						
						if (!fsSwipeEventFired) {
							triggerSwipeEvents();
						} else {
							triggerSimpleTouchEvent(fsC.EVENT_SWIPE_MOVE);
						}
					} else {
						setPhase(fsC.PHASE_MOVE);
					}
					triggerSimpleTouchEvent(fsC.EVENT_MOVE);

					triggerStatusChangeEvent();
				};
				
				
				/**
				* handle the end of a touch - check if it's really the end, or just one finger removed
				* @param {event} evt A touchend event or an enhanced mouseup event containing some of a touchend event's properties
				* @returns {undefined}
				*/
				var touchEndHandler = function(evt) {
					evt.preventDefault();

					//check if this is really the end of the touch, or that only the number of touching fingers has changed
					if (!evt.touches.length) {
						//it's really the end of this touch, and not just one finger being lifted
						//we must not update the event data, because we want it to contain the last know position
						setPhase(fsC.PHASE_END);
						
						if (!distanceHasPassedThreshold()) {
							setPhase(fsC.PHASE_CANCEL);
						} else if (fsDefaults.triggerOnTouchEnd) {
							triggerSwipeEvents();
						}
						
						triggerStatusChangeEvent();
					}
				};
			
				
				/**
				* when current status changes, trigger a change status event
				* @returns {undefined}
				*/
				var triggerStatusChangeEvent = function() {
					//update status and send statusChange event when status changed
					if (fsData.phase != fsData.prevPhase) {
						triggerSimpleTouchEvent(fsC.EVENT_TOUCH_STATUS_CHANGE);
					}
				};
			
			/*-- End handlers -- --*/
			
			
			/*-- Start fsData object functions --*/

				/**
				* reset vars that change on every touch-cycle
				* @param {event} evt Description
				* @returns {undefined}
				*/
				var resetEvtVars = function() {
					fsSwipeEventFired = false;
					fsData = {
						trackpoints: []
					};
				};
				
				
				/**
				* update the fsData object with current data
				* @param {event} evt Description
				* @returns {undefined}
				*/
				var setEventData = function(evt) {
					//processes all relevant data for an event
					var touch = evt.touches[0];

					//fsData.start has been set in touchStartHandler; make sure not to override it here
					//because this function gets called upon every event
					fsData.end = getTouchPos(touch);
					fsData.distance = getDistanceObj(fsData.start, fsData.end);
					fsData.direction = getDirection(fsData.start, fsData.end);

					addTrackPoint();
					fsData.speed = getCurrentSpeed();

					//now add general evt vars to fsData object
					fsData.originalEvent = evt;
				};
				
				
				/**
				* set the current phase in cycle (i.e. start, move, swipe)
				* @param {string} phs The current phase. Must be defined in fsC
				* @returns {undefined}
				*/
				var setPhase = function(phs) {
					//sets the new phase
					fsData.prevPhase = fsData.phase;
					fsData.phase = phs;
					if (phs === fsC.PHASE_CANCEL || phs === fsC.PHASE_END) {
						fsTouchEnded = true;
					}
				};
			
			/*-- End fsData object functions --*/

			
			/*-- Start trigger functions --*/
			
				
				/**
				* trigger an event with this plugin's namespace (i.e. swipeMove.simplePlugin, etc)
				* @param {string} evtName The (non-namespaced) name of the event to fire
				* @returns {undefined}
				*/
				var triggerSimpleTouchEvent = function(evtName) {
					//suffix evtName with namespace
					evtName += '.'+pluginName;
					$this.trigger(evtName, fsData);
				};
				
				
				/**
				* trigger swipeEvents - 'swipe' and the appropriate direction-events ('swipeLeft' etc)
				* @returns {undefined}
				*/
				var triggerSwipeEvents = function() {
					//trigger all appropriate swipeHandlers
					fsSwipeEventFired = true;
					
					//trigger catch all event handler
					triggerSimpleTouchEvent('swipe');
					
					//trigger direction specific event handlers
					var direction = fsData.direction,
						evts = [];//TODO: kan deze niet maar 1x gedefinieerd worden?
						evts[fsC.LEFT] = 'swipeLeft';
						evts[fsC.RIGHT] = 'swipeRight';
						evts[fsC.UP] = 'swipeUp';
						evts[fsC.DOWN] = 'swipeDown';
						triggerSimpleTouchEvent(evts[direction]);
				};
				
			/*-- End trigger functions --*/
			
			/*-- Start mousefunctions --*/
				
				/**
				* enhance a mouse event to make it look like a touch event and then call the corresponding touchEventHandler
				* @param {function} touchEventHandler The handler function to call (like touchendHandler for mouseup)
				* @param {event} evt A mouse event
				* @returns {undefined}
				*/
				var mimicTouchEvent = function(touchEventHandler, evt) {
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
				};
				
				
				/**
				* handle a mousemove event - enhance and then handle as touchmove
				* @param {event} evt Description
				* @returns {undefined}
				*/
				var mousemoveHandler = function(evt) {
					mimicTouchEvent(touchMoveHandler, evt);
				};
				
				
				/**
				* handle a mousedown event - enhance and then handle as touchstart
				* @param {event} evt Description
				* @returns {undefined}
				*/
				var mousedownHandler = function(evt) {
					evt.preventDefault();//this is neccessary to prevent the browser's default dragging behaviour!
					//bind movemouse; we do it here to prevent too much move events firing
					$this.on('mousemove', mousemoveHandler);
					mimicTouchEvent(touchStartHandler, evt);
				};
				
				
				/**
				* handle a mouseup event - enhance and then handle as touchend
				* @param {event} evt Description
				* @returns {undefined}
				*/
				var mouseupHandler = function(evt) {
					//unbind movemouse, so we don't have to keep tracking when we don't need it
					$this.off('mousemove', mousemoveHandler);
					mimicTouchEvent(touchEndHandler, evt);
				};
			/*-- End mousefunctions --*/
			
			
				
			/**
			* Checks direction of the swipe and the value allowPageScroll to see if we should allow or prevent the default behaviour from occurring.
			* This will essentially allow page scrolling or not when the user is swiping on a touchSwipe object.
			* @param {event} evt A touchmove event or an enhanced mousemove event
			* @returns {undefined}
			*/
			var handleDefaultScroll = function(evt) {
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
				
			};
			
			/*-- Start helper functions --*/
			
				/**
				* returns the x and y position of a member of the event.touches array
				* @param {object} touch An element touch event's touches array
				* @returns {object} Object {x,y}
				*/
				var getTouchPos = function(touch) {
					var p = {
						x: touch.pageX,
						y: touch.pageY
					}
					return p;
				};
			

				/**
				* get the direction of the move
				* @param {object} start Object {x,y} starting point of the touch cycle
				* @param {object} end Object {x,y} current or ending point of the touch cycle
				* @returns {string} one of the constants in fcC for up, down, left or right
				*/
				var getDirection = function(start, end) {
					var dx = end.x - start.x;
					var dy = end.y - start.y;
					if (Math.abs(dx) >= Math.abs(dy)) {
						//we're moving horizontally
						return ( (dx > 0) ? fsC.RIGHT : fsC.LEFT);
					} else {
						return ( (dy > 0) ? fsC.DOWN : fsC.UP);
					}
				};
				

				/**
				* get the total distance moved since the start
				* @param {object} start Object {x,y} starting point of the touch cycle
				* @param {object} end Object {x,y} current or ending point of the touch cycle
				* @returns {object} {x,y}
				*/
				var getDistanceObj = function(start, end) {
					var x = end.x - start.x;
					var y = end.y - start.y;
					return {x:x, y:y};
				};
				

				/**
				* Check if the moved distance has passed the swipe-treshold
				* @returns {boolean}
				*/
				var distanceHasPassedThreshold = function() {
					var distance = fsData.distance,
						dx = Math.abs(distance.x),
						dy = Math.abs(distance.y);

					return (Math.max(dx,dy) >= fsDefaults.swipeThreshold);
				};


				/**
				* add a point to the array of points along the swipe trajectory for speed calculation
				* @returns {undefined}
				*/
				var addTrackPoint = function() {
					var maxPoints = 5,//number of points to keep track of
						now = new Date().getTime(),
						trackpoint = {
							point: fsData.end,
							timestamp: now
						},
						trackpoints = fsData.trackpoints;
						
					trackpoints.push(trackpoint);
					if (trackpoints.length > maxPoints) {
						trackpoints.shift();
					}
				};


				/**
				* calculate the current moving speed in px/msec
				* @returns {undefined}
				*/
				var getCurrentSpeed = function() {
					var speed = {x:0, y:0},
						timeTreshold = 100,//treshold in msecs between first and last timestamp to use in calculation
						trackpoints = fsData.trackpoints,
						lastIdx = trackpoints.length-1,
						firstPoint,
						lastPoint = trackpoints[lastIdx],
						lastTimestamp = lastPoint.timestamp,
						earliestTimestamp = lastTimestamp - timeTreshold;
						//console.log(lastPoint);

					if (lastIdx > 0) {

						for (var i=0; i<lastIdx; i++) {
							firstPoint = trackpoints[i];
							if (firstPoint.timestamp > earliestTimestamp) {
								//then we can use this timestamp as start for speed calculation
								break;
							}
						}

						if (firstPoint !== lastPoint) {
							//then we have at least 2 points
							var dt = lastPoint.timestamp - firstPoint.timestamp,
								dx = lastPoint.point.x - firstPoint.point.x,
								dy = lastPoint.point.y - firstPoint.point.y,
								speedX = dx/dt,
								speedY = dy/dt;

							speed = {
								x: speedX,
								y: speedY
							};
						}
					}

					return speed;
				};
				
				
			/*-- End helper functions --*/
			

			/*-- Start initialization --*/

			var init = function() {
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
			}

			init();
				
		});//this.each

	};//$.fn[pluginName] = function(options)
	
})(jQuery);