var ChatWindow = function() {

	BaseWindow.call( this, 600, 195);

	this.lines = Array(10);
	this.alphaColor = 0.0;
	this.addBitmap(PathHelper.getResPathBasicInterface("dialog_bg"), 1);

	this.history = [];
	this.historyOffset = 0;

	// Scroll bar
	
	var scroll = new ScrollBar(
		10, this.height - 25, // w, h
		10, 4, // buttonHeight, barHeight
		PathHelper.getResPathBasicInterface("dialscr_up"),
		PathHelper.getResPathBasicInterface("dialscr_down"),
		PathHelper.getResPathBasicInterface("dialscr_bg2"),
		PathHelper.getResPathBasicInterface("dialsrc_bar")
	);

	this.addComponent( scroll, InterfaceAlignment.Right, InterfaceAlignment.Top, -7, 0 );

	// Buttons right
	
	// Right
	var buttonSelect = new InputButton( Interface.Button.Select, 11, 11 );
	
	buttonSelect.addListener( this );
	
	buttonSelect.addBitmap( PathHelper.getResPathBasicInterface("sys_base_off"), 0 );
	buttonSelect.addBitmap( PathHelper.getResPathBasicInterface("sys_base_on"), 1 );
	buttonSelect.addBitmap( PathHelper.getResPathBasicInterface("sys_base_on"), 2 );
	
	this.addComponent( buttonSelect, InterfaceAlignment.Right, InterfaceAlignment.Bottom, -4, -6 );

	// Left
	var buttonSelect = new InputButton( Interface.Button.Select, 11, 11 );
	
	buttonSelect.addListener( this );
	
	buttonSelect.addBitmap( PathHelper.getResPathBasicInterface("sys_base_off"), 0 );
	buttonSelect.addBitmap( PathHelper.getResPathBasicInterface("sys_base_on"), 1 );
	buttonSelect.addBitmap( PathHelper.getResPathBasicInterface("sys_base_on"), 2 );
	
	this.addComponent( buttonSelect, InterfaceAlignment.Right, InterfaceAlignment.Bottom, -17, -6 );
	
	// Main text input

	this.inputField = new DOMTextInput(460, 15, 'text');
	
	this.inputField.domElement.onkeyup = (function(e) {
		if(e.keyCode == 13) {
			this.__onEvent(this.inputField.data);
			this.inputField.data = "";
		}
		
		if(e.keyCode == 38 || e.keyCode == 40) { // UP
			
			if(this.history.length < 1)
				return;
		
			var t = this.historyOffset;
		
			if(e.keyCode == 40) {
				this.historyOffset = Math.max(this.historyOffset - 1, 1);
			} else {
				this.historyOffset = Math.min(this.historyOffset + 1, this.history.length );
			}
			
			if(this.historyOffset !== t) {
				this.inputField.data = this.history[ this.history.length - this.historyOffset ];
				this.inputField.domElement.select();			
			}
		}
		
	}).bind(this);
	
	this.addComponent(this.inputField, '115px', InterfaceAlignment.Bottom, null, -4);

};

ChatWindow.prototype = Object.create( BaseWindow.prototype );

ChatWindow.prototype.__onEvent = function(e) {	
	
	if(typeof e == "string") {
		this.onEvent(e);
	}
	else console.log(e);
};

ChatWindow.prototype.pushHistory = function(str) {
	this.history.push(str);
	this.historyOffset = 0;
};

ChatWindow.prototype.writeLine = function(str, color) {
	this.lines.shift();
	this.lines.push({
		message: str,
		color: color ? color : "#fff"
	});
	this.refresh();
};

ChatWindow.prototype.draw = function(ctx, sx, sy) {

	ctx.globalAlpha = 0.5;
	ctx.fillStyle = "black";
	ctx.fillRect(sx + 3, sy, this.width - 6, this.height);
	ctx.globalAlpha = 1.0;
	
	ctx.font = Settings.fontSize + "px " + Settings.fontFamily;
	ctx.textBaseline = "bottom";
	
	for(var i = 0; i < this.lines.length - 1; i++) {
		
		var line = this.lines[this.lines.length - i - 1];
	
		if( line ) {
			
			ctx.fillStyle = line.color;
			ctx.fillText(line.message, sx + 10, sy + this.height - 30 - 18 * i);
		}
	
	}
	
	var inputBg = this.__bitmaps[1];
	
	if(inputBg)
		ctx.drawImage(inputBg, sx, sy + this.height - inputBg.height);
	
	BaseWindow.prototype.draw.call(this, ctx, sx, sy);
	
};
