window.addEventListener('load', function(){

	var area = document.getElementById('ts__area'),
		oElm = {};

	function createDiv(cl){
		var d = document.createElement('div');
		d.className = cl;
		area.appendChild( d );
		return d;
	}

	TSEvent.addListener(
		area,
		'start move end',
		function(e){

			e.srcEvent.preventDefault();

			var l = e.manager.circles.length,
				c = l ? e.manager.circles[l-1] : null,
				i;

			for( i in e.manager.fingers ){
				oElm[i] = oElm[i] || null;
			}
			if( c ){
				oElm.c = oElm.c || null;
			}

			for( i in oElm ){

				var t = i === 'c' ? c : e.manager.fingers[i],
					d = oElm[i];

				if( t ){

					if(  i === 'c' ){
						var cl = 'ts__circle',
							pt = t,
							r = t.clientRay,
							a = t.rotationAngle;
					} else {
						var cl = 'ts__touch',
							pt = t.touches[ t.touches.length - 1 ],
							r = 25,
							a = 0;
					}

					d = d || ( oElm[i] = createDiv(cl) );
					Object.assign( d.style, {
						top: (pt.clientY - r) + 'px',
						left: (pt.clientX - r) + 'px',
						width: (r * 2) + 'px',
						height: (r * 2) + 'px',
						transform: 'rotate(-' + a + 'rad)'
					} );

				} else {
					d.parentNode.removeChild( d );
					delete oElm[i];
				}
			}
		}
	);
	
}, false);