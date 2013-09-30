var Minimap = function(width, height) {

	BaseWindow.call( this, width, height );
	
	this.processBackground = true;
	
	this.gatX = 0;
	this.gatY = 0;
	this.gatWidth = 400;
	this.gatHeight = 400;
	this.gatDirection = 0;

};

Minimap.prototype = Object.create( BaseWindow.prototype );

Minimap.prototype.setMap = function( mapName ) {
	
	this.addBitmap(PathHelper.getMinimapResPath(mapName), 0);

};

Minimap.prototype.setPosition = function(x, y, width, height, direction) {
	
	this.gatX = x;
	this.gatY = y;
	this.gatWidth = width;
	this.gatHeight = height;
	this.gatDirection = direction;
	
	this.__needsUpdate = true;
	this.refresh();
	
};

Minimap.prototype.draw = function( ctx, sx, sy ) {

	BaseWindow.prototype.draw.call(this, ctx, sx, sy);
	
	// Draw marker

	ctx.save();
	
	ctx.fillStyle = "#ffffff";
	ctx.stokeStyle = "#000000";
	
	//ctx.fillRect(, , 3, 3 );
	
	var x = sx + this.width * this.gatX / this.gatWidth;
	var y = sy + this.height * (1.0 - this.gatY / this.gatHeight);
	
	//ctx.translate(-x, -y);
	
	ctx.translate(x, y);
	ctx.rotate( 45 * this.gatDirection * Math.PI / 180 );
	
	ctx.beginPath();
	
	ctx.moveTo(0, 0);
	ctx.lineTo(0 - 5, 0 - 4);
	ctx.lineTo(0 + 0, 0 + 6);
	ctx.lineTo(0 + 5, 0 - 4);
	ctx.lineTo(0 + 0, 0 + 0);
	
	ctx.stroke();
	ctx.fill();
	
	ctx.closePath();
	
	
	ctx.restore();

};
