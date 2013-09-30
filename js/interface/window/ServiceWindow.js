function ServiceWindow() {
	
	BaseWindow.call( this, 280, 120 );
	
	this.addBitmap( PathHelper.getResPathLoginInterface("win_service"), 0 );
	
	this.draggable = true;
	
	var buttonSelect = new InputButton( Interface.Button.Select, 42, 20 );
	
	buttonSelect.addListener( this );
	
	buttonSelect.addBitmap( PathHelper.getResPathLoginInterface("btn_ok"), 0 );
	buttonSelect.addBitmap( PathHelper.getResPathLoginInterface("btn_ok_a"), 1 );
	buttonSelect.addBitmap( PathHelper.getResPathLoginInterface("btn_ok_b"), 2 );
	
	this.addComponent( buttonSelect, InterfaceAlignment.Right, InterfaceAlignment.Bottom, -50, -4 );
	
	var buttonCancel = new InputButton( Interface.Button.Cancel, 42, 20 );
	
	buttonCancel.addListener( this );
	
	buttonCancel.addBitmap( PathHelper.getResPathLoginInterface("btn_cancel"), 0 );
	buttonCancel.addBitmap( PathHelper.getResPathLoginInterface("btn_cancel_a"), 1 );
	buttonCancel.addBitmap( PathHelper.getResPathLoginInterface("btn_cancel_b"), 2 );
	
	this.addComponent( buttonCancel, InterfaceAlignment.Right, InterfaceAlignment.Bottom, -4, -4 );
	
	this.list = new SelectionList( 260, 60 );
	
	this.addComponent( this.list, InterfaceAlignment.Center, '25px' );
	
};

ServiceWindow.prototype = Object.create( BaseWindow.prototype );

ServiceWindow.prototype.addService = function( serviceName, serviceId ) {
	
	this.list.addItem( serviceName, serviceId );
	
};

ServiceWindow.prototype.__onEvent = function( button ) {
	
	var value = this.list.__selected >= 0 
		&& this.list.__selected < this.list.__items.length
			? this.list.__items[ this.list.__selected ].value
			: -1;
	
	this.onEvent({
		window: this,
		action: button.__event,
		serverId: value
	});

};
