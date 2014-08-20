(function($) {
	
	$.fn.touchEffects = function(options){
		var defaults = {
		};
		if(options) {$.extend(defaults, options);}
		
		function init(obj) {
		}
		
		return this.each(function() {
			init(this);
		});
	};
})(jQuery);

jQuery(document).ready(function($) {
	$(".touchEffects").touchEffects();
});
