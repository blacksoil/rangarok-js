if(Map === undefined) {
	
	var Map = function() {
		this.data = {};
	};
	
	Map.prototype.set = function(str, obj) { this.data[str] = obj; };
	Map.prototype.get = function(str) { return this.data[str]; };
	Map.prototype.has = function(str) { return this.data[str] !== undefined; };
	Map.prototype.delete = function(str) { return (this.data[str] = undefined) === undefined; };
};

window.requestAnimationFrame = window.requestAnimationFrame
	|| window.webkitRequestAnimationFrame
	|| window.mozRequestAnimationFrame
	|| window.oRequestAnimationFrame
	|| window.msRequestAnimationFrame;

window.requestFileSystem  = window.requestFileSystem 
	|| window.webkitRequestFileSystem;