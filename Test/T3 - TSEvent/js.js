window.addEventListener('error', function(e){
	alert(e.message);
}, false);

window.addEventListener('load', function(){

	var area = document.getElementById('ts__area'),
		log = document.getElementById('ts__log');

	TSEvent.addListener(
		area,
		'start hold ' +
		'move swipeRight swipeLeft swipeTop swipeBottom spread pinch rotate ' +
		'end press tap doubleTap',
		function(e){

			e.srcEvent.preventDefault();

			var l = e.manager.circles.length,
				c = l ? e.manager.circles[l-1] : null,
				n = 0, i;
			for( i in e.manager.fingers ){
				n++;
			}

			log.innerHTML = '<h1>' + e.type + '</h1>' +
				'<div>' + e.fingers.length + ' finger(s) event</div>' + 
				'<div>' + n + ' finger(s) manager</div>';
			if( c && c.touches.length ){
				log.innerHTML += '<div>Has valide circle</div>';
			}
		}
	);
	
}, false);