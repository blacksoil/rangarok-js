var ScrollBar = function(width, height, scrollButtonHeight, scrollBarHeight, scrollUp, scrollDown, scrollBg, scrollBar ) {
	
	BaseWindow.call(this, width, height);
	
	this.backgroundRepeat = true;
	
	this.addBitmap( scrollBg, 0 );
	
	var bScrollUp = new InputButton( Interface.Button.Select, width, scrollButtonHeight );
	var bScrollDown = new InputButton( Interface.Button.Select, width, scrollButtonHeight );
	
	bScrollUp.__useHover = false;
	bScrollDown.__useHover = false;
	bScrollUp.__useActive = false;
	bScrollDown.__useActive = false;
	
	bScrollUp.addBitmap( scrollUp, 0 );
	bScrollDown.addBitmap( scrollDown, 0 );
	
	this.addComponent( bScrollUp, InterfaceAlignment.Left, InterfaceAlignment.Top, 0, 0 );
	this.addComponent( bScrollDown, InterfaceAlignment.Left, InterfaceAlignment.Bottom, 0, 0 );
	
};

ScrollBar.prototype = Object.create( BaseWindow.prototype );
