/*
 * simpleTouch - jQuery Plugin
 *
 * This jQuery plugin will only run on devices running Mobile Webkit based browsers (iOS 2.0+, android 2.2+)
 */
;(function($) {

	'use strict';
	
	$.fn.simpleTouch = function(options) {
		if (!this) {
			return false;
		}

		var $this;
		
		// Default thresholds & swipe functions
		var defaults = {
					
			swipeThreshold: 75,// int - The number of pixels that the user must move their finger by before it is considered a swipe
			mouseEmulation: false,//Boolean, if true, when the browser doesn't support touch, the mouse can be used for swiping
			triggerOnTouchEnd: true,// Boolean, if true, the swipe events are triggered when the touching ends is received (user releases all fingers).  If false, it will be triggered on reaching the swipeThreshold
			allowPageScroll: "auto" /* How the browser handles page scrolls when the user is swiping on a touchSwipe object. 
				"auto" : all undefined swipes will cause the page to scroll in that direction.
 				"none" : the page will not scroll when user swipes.
 				"horizontal" : will force page to scroll on horizontal swipes.
 				"vertical" : will force page to scroll on vertical swipes.
			*/
		};
		
		//Constants
		var LEFT = "left",
			RIGHT = "right",
			UP = "up",
			DOWN = "down",
		
			NONE = "none",
			HORIZONTAL = "horizontal",
			VERTICAL = "vertical",
			AUTO = "auto",
		
			PHASE_START_MOVE = "startMove",
			PHASE_MOVE = "move",
			PHASE_SWIPE = "swipe",
			PHASE_END = "end",
			PHASE_CANCEL = "cancel";
		
		// vars vor keeping track of events statuses
		var swipeEventFired = false,
			touchEnded = true;
			
		// tap vars
		var touchStartTime,
			TAP_MAX_DURATION = 100;/* max duration in msec between touch and release to trigger tap */
		
		//object to pass data around
		var data = {};
		


		//-- let's get started :) --
		
		if (options) {
			$.extend(defaults, options);
		}
		
		return this.each(function() {

			/*-- Start helper functions --*/

				
				/**
				* get the x and y position of a member of the event.touches array
				* @param {object} touch element in the event.touches array
				* @returns {object} {x,y}
				*/
				var getTouchPos = function(touch) {
					var p = {
						x: touch.pageX,
						y: touch.pageY
					};

					return p;
				};
				
				/**
				* get the gesture's direction
				* @param {string} varname Description
				* @returns {string} contstant RIGHT, LEFT, DOWN or UP
				*/
				var getDirection = function(start, end) {
					var dx = end.x - start.x;
					var dy = end.y - start.y;
					if (Math.abs(dx) >= Math.abs(dy)) {
						//we're moving horizontally
						return ( (dx > 0) ? RIGHT : LEFT);
					}
					return ( (dy > 0) ? DOWN : UP);
				};
				
				/**
				* get object containing distance between start and end point
				* @param {object} start This move's starting position {x,y}
				* @param {object} end This move's current position {x,y}
				* @returns {object} {x,y}
				*/
				var getDistanceObj = function(start, end) {
					var x = end.x - start.x;
					var y = end.y - start.y;
					return {x:x, y:y};
				};
				
				/**
				* check if the current distance is bigger than the swipe threshold
				* @returns {boolean}
				*/
				var distanceHasPassedThreshold = function() {
					var distance = data.touch.distance;
					var dx = Math.abs(distance.x);
					var dy = Math.abs(distance.y);
					return (Math.max(dx,dy) >= defaults.swipeThreshold);
				};
				

			/*-- End helper functions --*/
			

			/*-- Start data object functions --*/


				/**
				* Initialize vars to keep track of what's going on in a touch cycle
				* @returns {undefined}
				*/
				var initEvtVars = function() {
					swipeEventFired = false;
				};
				
				/**
				* put all event data into data object
				* @param {event} evt The event that occurred
				* @returns {undefined}
				*/
				var setEventData = function(evt) {
					var touch = evt.touches[0],
						tObj = data.touch,
						propName;

					tObj.end = getTouchPos(touch);
					tObj.distance = getDistanceObj(tObj.start, tObj.end);
					tObj.direction = getDirection(tObj.start, tObj.end);
					data.touch = tObj;

					//we're only interested in one finger; put all of its data in the "root" of the data object for easy access
					for (propName in data.touch) {
						data[propName] = data.touch[propName];
					}
					
					//now add general evt vars to data object
					data.originalEvent = evt;
				};
				
				/**
				* Set the new touch phase (startMove, move, swipe, end, etc)
				* @param {string} phs The name of the new phase
				* @returns {undefined}
				*/
				var setPhase = function(phs) {
					//sets the new phase
					data.prevPhase = data.phase;
					data.phase = phs;
					if (phs === PHASE_CANCEL || phs === PHASE_END) {
						touchEnded = true;
					}
				};
			

			/*-- End data object functions --*/


			
			/*-- Start trigger functions --*/
			
				
				/**
				* trigger a touch event
				* with name format eventName.touchEvent
				* and with corresponding data object
				* @param {string} evtName The name of the event to trigger
				* @returns {undefined}
				*/
				var triggerTouchEvent = function(evtName) {
					//suffix evtName with namespace
					evtName += '.touchEvent';
					$this.trigger(evtName, data);
				};
				
				
				/**
				* trigger appropriate swipe events
				* @param {event} evt The event that occurred (e.g. touchMove, touchEnd, ...)
				* @returns {undefined}
				*/
				var triggerSwipeEvents = function(evt) {
					//trigger all appropriate swipeHandlers
					swipeEventFired = true;

					//trigger general swipe event (can be used for stuff you want to do on any swipe)
					triggerTouchEvent('swipe');
					
					//trigger direction specific event
					var direction = data.touch.direction;
					var evts = [];

					evts[LEFT] = 'swipeLeft';
					evts[RIGHT] = 'swipeRight';
					evts[UP] = 'swipeUp';
					evts[DOWN] = 'swipeDown';

					triggerTouchEvent(evts[direction]);
				};
				

			/*-- End trigger functions --*/
			

			/**
			* Check if default browser scrolling behaviour has to be cancelled during touchmove
			* @param {event} evt The touchmove event
			* @returns {undefined}
			*/
			var handleDefaultScroll = function(evt) {
				if( defaults.allowPageScroll === NONE ) {
					evt.preventDefault();
				} else {
					var auto = (defaults.allowPageScroll === AUTO);
					
					switch(data.touch.direction) {
						case LEFT :
							if ( (defaults.swipeLeft && auto) || (!auto && defaults.allowPageScroll !== HORIZONTAL)) {
								evt.preventDefault();
							}
							break;
						
						case RIGHT :
							if ( (defaults.swipeRight && auto) || (!auto && defaults.allowPageScroll !== HORIZONTAL)) {
								evt.preventDefault();
							}
							break;

						case UP :
							if ( (defaults.swipeUp && auto) || (!auto && defaults.allowPageScroll !== VERTICAL)) {
								evt.preventDefault();
							}
							break;
						
						case DOWN :	
							if ( (defaults.swipeDown && auto) || (!auto && defaults.allowPageScroll !== VERTICAL)) {
								evt.preventDefault();
							}
							break;
					}
				}
				
			};





			/*-- Start tap functions -- --*/


				/**
				* Start a tap
				* Register its timestamp so we can check later if the touch was short enough to be a tap
				* @param {event} evt The touch event
				* @returns {undefined}
				*/
				var startTap = function(evt) {
					touchStartTime = new Date().getTime();
				};
				

				/**
				* Check if the touch's duration was short enough to count as a tap
				* @param {evt} event The touch end event
				* @returns {undefined}
				*/
				var checkTap = function(evt) {
					var touchEndTime = new Date().getTime();
					if ((touchEndTime - touchStartTime) <= TAP_MAX_DURATION) {
						triggerTouchEvent('tap');
					}
				};
				

			/*-- End tap functions -- --*/



			/*-- Start touch handlers -- --*/
			
				
				/**
				* Check if touch status has changed; if so, trigger touchStatus event
				* @param {event} varname The event causing the status change (touchstart, touchmove, etc)
				* @returns {undefined}
				*/
				var triggerStatusHandler = function(evt) {
					//update status
					if (data.phase !== data.prevPhase) {
						triggerTouchEvent('touchStatus');
					}
				};
			

				/**
				* handle Touch start
				* @param {event} evt Touch event
				* @returns {undefined}
				*/
				var touchStartHandler = function(evt) {
					if (touchEnded) {
						//then it's really the start of a new touch (otherwise, a finger was added to an existing touch cycle)
						touchEnded = false;
						initEvtVars();
						setPhase(PHASE_START_MOVE);
						startTap(evt);
					}

					//get the starting coordinates of the first finger's touch (we're going to keep track of one touch only)
					data.touch = {
						start: getTouchPos(evt.touches[0])
					};
					
					//now process the other event variables
					setEventData(evt);
					triggerStatusHandler(evt);
				};
				
				
				/**
				* handle touchMove event
				* trigger appropriate events (move, swipe or swipeMove)
				* @param {event} evt The touchmove event
				* @returns {undefined}
				*/
				var touchMoveHandler = function(evt) {
					
					setEventData(evt);
					
					//check if we need to prevent default event (page scroll) or not
					handleDefaultScroll(evt);
					
					//if we trigger whilst dragging, not on touch end, then calculate now...
					if (!defaults.triggerOnTouchEnd && distanceHasPassedThreshold()) {
						// if the user swiped more than the minimum length, perform the appropriate action
						//2 possibilities: if swipeEvents haven't been fired yet, fire swipeHandlers; otherwise trigger swipeMove
						setPhase(PHASE_SWIPE);
						
						if (!swipeEventFired) {
							triggerSwipeEvents(evt);
						} else {
							triggerTouchEvent('swipeMove');
						}
					} else {
						setPhase(PHASE_MOVE);
					}
					triggerTouchEvent('move');
					triggerStatusHandler(evt);
				};
				
				
				/**
				* handle touchEnd event
				* checks if tap or swipe event has to be triggered
				* @param {event} evt The touchend event
				* @returns {undefined}
				*/
				var touchEndHandler = function(evt) {
					evt.preventDefault();
					
					if (!evt.touches.length) {
						//it's really the end of this touch, or we want to end the touch when touchCount changes
						//we must not update the event data, because we want it to contain the last know position
						setPhase(PHASE_END);
						
						checkTap(evt);
						
						if (!distanceHasPassedThreshold()) {
							setPhase(PHASE_CANCEL);
							triggerTouchEvent('swipeCancel');
						} else if (defaults.triggerOnTouchEnd) {
							triggerSwipeEvents(evt);
						}
						
						triggerStatusHandler(evt);
					}
				};
			
			/*-- End touch handlers -- --*/
			


			/*-- Start mouse event functions --*/
				

				/**
				* add stuff to a mouse event to make it look like a touch event
				* @param {function} touchEventHandler The touch event handler to call
				* @param {event} evt The original mouse event
				* @returns {undefined}
				*/
				var mimicTouchEvent = function(touchEventHandler, evt) {
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
				* make mousemove event look like touchmove event
				* @param {event} evt The original mousemove event
				* @returns {undefined}
				*/
				var mousemoveHandler = function(evt) {
					mimicTouchEvent(touchMoveHandler, evt);
				};
				
				/**
				* make mousedown event look like touchstart event
				* and bind mousemove event to $this (so mousemoveHandler will only be called after mouse down)
				* @param {event} evt The original mouse down event
				* @returns {undefined}
				*/
				var mousedownHandler = function(evt) {
					evt.preventDefault();//this is neccessary to prevent the browser's default dragging behaviour!
					$this.bind('mousemove', mousemoveHandler);
					mimicTouchEvent(touchStartHandler, evt);
				};
				
				/**
				* make mouseup event look like touchend event
				* and unbind mousemove event from $this (so mousemoveHandler won't be called anymore)
				* @param {event} evt The original mouse down event
				* @returns {undefined}
				*/
				var mouseupHandler = function(evt) {
					$(this).unbind('mousemove', mousemoveHandler);
					mimicTouchEvent(touchEndHandler, evt);
				};


			/*-- End mouse event functions --*/
			


			/*-- Start initialization functions --*/
			
			/**
			* initialize the plugin
			* @param {dom element} that The element(s) the plugin is called upon
			* @returns {undefined}
			*/
			var init = function(that) {
				$this = $(that);
				if (window.hasOwnProperty('ontouchstart')) {
					try {
						that.addEventListener("touchstart", touchStartHandler, false);
						that.addEventListener("touchmove", touchMoveHandler, false);
						that.addEventListener("touchend", touchEndHandler, false);
						that.addEventListener("touchcancel", touchEndHandler, false);
					} catch(ignore) {
						//touch not supported; give param the name ignore to make it clear we're not doing anything with it
					}
				} else {
					//bind stuff to mouse events
					$this.bind("mousedown", mousedownHandler);
					$this.bind("mouseup", mouseupHandler);
				}
			};

			/*-- Start initialization functions --*/


			//do the actual initialization
			init(this);
				
		});
	};

})(jQuery);