window.addEventListener('error', function(e){
	alert(e.message);
}, false);

window.addEventListener('load', function(){
	var area = [], i = 0;
	for(; i < 5; i++){
		area.push(document.getElementById('log__' + i));
	}
	
	alert(area);
	
	function log(e){
		Array.prototype.forEach.call( e.changedTouches, function(t){
			var a = area[ t.identifier ];
			a && (a.className = 'log__touch log__' + e.type);
		} );
	}
	
	document.addEventListener('touchstart', log, false);
	document.addEventListener('touchmove', log, false);
	document.addEventListener('touchend', log, false);
	
}, false);