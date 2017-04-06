window.addEventListener('error', function(e){
	alert(e.message);
}, false);

window.addEventListener('load', function(){
	var area = {
		touchstart: document.getElementById('log__start'),
		touchmove: document.getElementById('log__move'),
		touchend: document.getElementById('log__end')
	};
	
	function log(e){
		var s = '<div class="log__event">';
		Array.prototype.forEach.call( e.changedTouches, function(t){
			s += '<span class="log__touch">' + t.identifier + '</span>';
		} );
		s += '</div>';
		area[e.type].innerHTML = s + area[e.type].innerHTML;
	}
	
	document.addEventListener('touchstart', log, false);
	document.addEventListener('touchmove', log, false);
	document.addEventListener('touchend', log, false);
	
}, false);