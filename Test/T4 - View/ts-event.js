( function(){

	// Finger
	function TSFinger(t, e){
		this.id = t.identifier;
		this.timeStamp = e.timeStamp;
		this.touches = [];
		this.lastTouches = TSFinger.lastTouches[ this.id ];
		this.add(t, e);
	}

	Object.assign(
		TSFinger,
		{
			lastTouches: {},

			prototype: {
				constructor: TSFinger,

				add: function(t, e){
					t.srcEvent = e;
					this.touches.push(t);
					return this;
				},

				rmv: function(){
					TSFinger.lastTouches[ this.id ] = this.touches;
					return this;
				}

			}
		}
	);

	// Circle
	function TSCircle(e){
		this.timeStamp = e.timeStamp;
		this.touches = [];

		this.clientX = null;
		this.clientY = null;
		this.clientRay = null;
		this.pageX = null;
		this.pageY = null;
		this.pageRay = null;
		this.screenX = null;
		this.screenY = null;
		this.screenRay = null;
		this.rotationAngle = null;
	}

	Object.assign(
		TSCircle,
		{
			diff: function(c1, c2){
				var d = false, p;

				if( c1.touches.length == c2.touches.length ){
					for( p in c1 ){
						if( p != 'touches' && p != 'timeStamp' && c1[p] !== c2[p] ){
							d = true;
							break;
						}
					}
				} else {
					d = true;
				}
				return d;
			},

			prototype: {
				constructor: TSCircle,

				init: function(t1, t2){
					var aCoord = [ 'client', 'page', 'screen' ],
						c = this, y;
						
					aCoord.forEach( function(coord){
						c[coord+'X'] = t1[coord+'X'] + ( t2[coord+'X'] - t1[coord+'X'] ) / 2;
						c[coord+'Y'] = t1[coord+'Y'] + ( t2[coord+'Y'] - t1[coord+'Y'] ) / 2;
						c[coord+'Ray'] = Math.sqrt( Math.pow( t1[coord+'X'] - t2[coord+'X'], 2) + Math.pow( t1[coord+'Y'] - t2[coord+'Y'], 2) ) / 2;
					} );

					y = t2.screenY - t1.screenY;
					this.rotationAngle = ( y > 0 ? 2 * Math.PI : 0) + Math.atan2(t2.screenX - t1.screenX, t2.screenY - t1.screenY);
					this.touches.push(t1, t2);
					return this;
				}
			}
		}
	);

	// Manager
	function TSManager(elm){
		this.element = elm;
		this.fingers = {};
		this.circles = [];
		this.listener = {};
		TSManager.add( this.init() );
	}

	Object.assign(
		TSManager,
		{
			// Config
			TAP: 200,
			DOUBLETAP: 400,
			HOLD: 1000,

			// Instance
			aManager: [],

			add: function(mng){
				mng.id = this.aManager.push(mng);
				mng.element.setAttribute('data-ts-manager', mng.id);
				return this;
			},

			get: function(elm){
				var id = elm.getAttribute('data-ts-manager');
				if( id ){
					return this.aManager[id-1];
				}
			},

			// Event
			start: function(e){
				var mng = TSManager.get(this),
					fings = mng.addFinger(e),
					bNewCirc = mng.updCircle(e),
					oFingEvt = {};

				// START
				if( mng.hasListener('start') ){
					oFingEvt.start = fings;
				}

				// HOLD
				if( mng.hasListener('hold') ){
					setTimeout(
						function(){
							var aFing = [];
							fings.forEach( function(fing){
								if( fing.touches.length == 1 && mng.fingers[ fing.id ] && mng.fingers[ fing.id ] === fing ){
									aFing.push(fing);
								}
							} );
							if( aFing.length ){
								mng.event('hold', e, aFing);
							}
						},
						TSManager.HOLD
					);
				}

				// EVENT
				mng.event(oFingEvt, e);
			},

			move: function(e){
				var mng = TSManager.get(this),
					fings = mng.updFinger(e),
					bNewCirc = mng.updCircle(e),
					oFingEvt = {},
					typ;

				// MOVE
				if( mng.hasListener('move') ){
					oFingEvt.move = fings;
				}

				// SWIPE TOP / BOTTOM / LEFT / RIGHT
				if( mng.hasListener('swipeTop', 'swipeBottom', 'swipeLeft', 'swipeRight') ){
					fings.forEach( function(fing){
						var l = fing.touches.length,
							dx = fing.touches[l-1].screenX - fing.touches[l-2].screenX,
							dy = fing.touches[l-1].screenY - fing.touches[l-2].screenY;

						if( dy != 0 ){
							typ = dy < 0 ? 'swipeTop' : 'swipeBottom';
							oFingEvt[typ] = oFingEvt[typ] || [];
							oFingEvt[typ].push(fing);
						}
						if( dx != 0 ){
							typ = dx < 0 ? 'swipeLeft' : 'swipeRight';
							oFingEvt[typ] = oFingEvt[typ] || [];
							oFingEvt[typ].push(fing);
						}
					} );
				}

				// PINCH / SPREAD / ROTATE
				if( mng.hasListener('pinch', 'spread', 'rotate') && bNewCirc ){
					var l = mng.circles.length,
						c = mng.circles[l-1],
						pc = mng.circles[l-2],
						aFing = [];

					c.touches.forEach( function(touch){
						fings.forEach( function(fing){
							if( fing.id == touch.identifier ){
								aFing.push(fing);
							}
						} );
					} );

					if( c.screenRay != pc.screenRay ){
						typ = pc.screenRay > c.screenRay ? 'pinch' : 'spread';
						oFingEvt[typ] = aFing;
					}
					if( c.rotationAngle != pc.rotationAngle ){
						oFingEvt['rotate'] = aFing;
					}
				}

				// EVENT
				mng.event(oFingEvt, e);

			},

			end: function(e){
				var mng = TSManager.get(this),
					fings = mng.rmvFinger(e),
					bNewCirc = mng.updCircle(e),
					oFingEvt = {},
					typ;

				// END
				if( mng.hasListener('end') ){
					oFingEvt.end = fings;
				}

				// PRESS / TAP / DOUBLETAP
				if( mng.hasListener('press', 'tap', 'doubleTap') ){
					fings.forEach( function(fing){
						// check si pas de MOVE
						if( fing.touches.length == 2 ){
							var diff = fing.touches[1].srcEvent.timeStamp - fing.touches[0].srcEvent.timeStamp,
								last = fing.lastTouches;

							if( diff > TSManager.TAP ){
								typ = 'press';
							} else {
								// check si LAST et pas de MOVE
								if( last && last.length == 2 ){
									diff = fing.touches[1].srcEvent.timeStamp - last[0].srcEvent.timeStamp;
									typ = diff > TSManager.DOUBLETAP ? 'tap' : 'doubleTap';
								} else {
									typ = 'tap';
								}
							}
							oFingEvt[typ] = oFingEvt[typ] || [];
							oFingEvt[typ].push(fing);
						}
					} );
				}

				// EVENT
				mng.event(oFingEvt, e);
			},

			// Prototype
			prototype: {
				constructor: TSManager,

				// Methodes
				init: function(){
					this.element.addEventListener('touchstart', TSManager.start, false);
					this.element.addEventListener('touchmove', TSManager.move, false);
					this.element.addEventListener('touchend', TSManager.end, false);
					this.element.addEventListener('touchcancel', TSManager.end, false);
					return this;
				},
				
					// Finger
				addFinger: function(e){
					var mng = this,
						aFings = [];

					Array.prototype.forEach.call(
						e.changedTouches,
						function(t){
							var f = mng.fingers[ t.identifier ] = new TSFinger( t, e );
							aFings.push(f);
						}
					);
					return aFings;
				},
				
				updFinger: function(e){
					var mng = this,
						aFings = [];

					Array.prototype.forEach.call(
						e.changedTouches,
						function(t){
							var f = mng.fingers[ t.identifier ];
							aFings.push( f.add(t, e) );
						}
					);
					return aFings;
				},
				
				rmvFinger: function(e){
					var mng = this,
						aFings = [];

					Array.prototype.forEach.call(
						e.changedTouches,
						function(t){
							var f = mng.fingers[ t.identifier ];
							aFings.push( f.add(t, e).rmv() );
							delete( mng.fingers[ t.identifier ] );
						}
					);
					return aFings;
				},

					// Circle
				addCircle: function(e, aFing){
					aFing = aFing || [];
					var c = new TSCircle(e),
						l = aFing.length,
						bDiff = false;

					if( l == 2 ){
						c.init(aFing[0].touches[ aFing[0].touches.length-1 ], aFing[1].touches[ aFing[1].touches.length-1 ]);
						bDiff = true;
					}
					if( this.circles.length ){
						bDiff = TSCircle.diff( c, this.circles[ this.circles.length-1 ] );
					}
					if( bDiff ){
						this.circles.push(c);
					}
					return bDiff;
				},

				updCircle: function(e){
					var aFing = [], 
						aFingUse = [],
						l = 0, f;

					for( f in this.fingers ){
						aFing.push( this.fingers[f] );
						l++;
					}

					if( l > 2 ){
						var i = 0, m = 0,
							j, t1, t2, d;

						for( ; i < l; i++ ){
							for( j = i + 1; j < l; j++ ){
								t1 = aFing[i].touches[ aFing[i].touches.length-1 ];
								t2 = aFing[j].touches[ aFing[j].touches.length-1 ];
								d = Math.sqrt( Math.pow( t1.screenX - t2.screenX, 2) + Math.pow( t1.screenY - t2.screenY, 2) );
								if( d > m ){
									m = d;
									aFingUse = [ aFing[i], aFing[j] ];
								}
							}
						}
					} else if( l == 2 ){
						aFingUse = aFing;
					}
					return this.addCircle(e, aFingUse);
				},

				// Listener
				on: function(e, f) {
					var o = e || {}, a;
					if (f) {
						o = {};
						e.split(' ').forEach( function(e){
							o[e] = f;
						} );
					}
					for (e in o) {
						a = this.listener[e] = this.listener[e] || [];
						a.push(o[e]);
					}
					return this;
				},

				off: function(e, f) {
					var o = e, a, i;
					if (f) {
						o = {};
						e.split(' ').forEach( function(e){
							o[e] = f;
						} );
					}
					for (e in o) {
						a = this.listener[e];
						i = a && a.indexOf(o);
						if (i != null && i != -1) {
							a.splice(i, 1);
						}
					}
					return this;
				},

				trigger: function() {
					var that = this,
						evt = Array.prototype.shift.call(arguments),
						args = arguments;
					evt.split(' ').forEach( function(e){
						var a = that.listener[e], i = 0, l;
						if (a) {
							l = a.length;
							for (; i < l; i++) {
								a[i].apply(that.element, args);
							}
						}
					} );
					return this;
				},

				event: function(e, s, f){
					var o = e;
					if( f ){
						o = {};
						e.split(' ').forEach( function(e){
							o[e] = f;
						} );
					}
					for ( e in o ){
						this.trigger(e, {
							type: e,
							srcEvent: s,
							manager: this,
							fingers: o[e]
						} );
					}
					return this;
				},

				hasListener: function(){
					var l = arguments.length,
						r = false, i = 0;

					for( ; i < l; i++ ){
						if( this.listener[ arguments[i] ] && this.listener[ arguments[i] ].length ){
							r = true;
							break;
						}
					}
					return r;
				}
			}
		}
	);

	// Module
	window.TSEvent = {
		can: 'ontouchstart' in window
			|| navigator.MaxTouchPoints > 0
			|| navigator.msMaxTouchPoints > 0,

		addListener: function(elm, evt, foo){
			if( this.can ){
				var mng = TSManager.get(elm) || new TSManager(elm);
				return mng.on(evt, foo);
			}
			return false;
		},

		removeListener: function(){
			if( this.can ){
				var mng = TSManager.get(elm);
				return mng && mng.off(evt, foo);
			}
			return false;
		}
	};

} )();