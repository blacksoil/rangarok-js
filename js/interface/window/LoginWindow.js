function LoginWindow() {
	
	BaseWindow.call( this, 280, 120 );
	
	this.addBitmap( PathHelper.getResPathLoginInterface("win_login"), 0 );
	
	this.draggable = true;
	
	// Add buttons
	
	var buttonLogin = new InputButton( Interface.Button.Login, 42, 20 );
	var buttonExit = new InputButton( Interface.Button.Exit, 42, 20 );
	
	buttonLogin.addBitmap( PathHelper.getResPathLoginInterface("btn_connect"), 0 );
	buttonLogin.addBitmap( PathHelper.getResPathLoginInterface("btn_connect_a"), 1 );
	buttonLogin.addBitmap( PathHelper.getResPathLoginInterface("btn_connect_b"), 2 );
	
	buttonExit.addBitmap( PathHelper.getResPathLoginInterface("btn_exit"), 0 );
	buttonExit.addBitmap( PathHelper.getResPathLoginInterface("btn_exit_a"), 1 );
	buttonExit.addBitmap( PathHelper.getResPathLoginInterface("btn_exit_b"), 2 );
	
	buttonLogin.addListener( this );
	buttonExit.addListener( this );
	
	this.addComponent( buttonLogin, InterfaceAlignment.Right, InterfaceAlignment.Bottom, -50, -4 );
	this.addComponent( buttonExit, InterfaceAlignment.Right, InterfaceAlignment.Bottom, -4, -4 );
	
	// Set-up text fields
	
	this.userTextField = new DOMTextInput( 120, 15, 'text' );
	this.passwordTextField = new DOMTextInput( 120, 15, 'password' );
	
	this.addComponent( this.userTextField, '95px', '31px' );
	this.addComponent( this.passwordTextField, '95px', '63px' );
	
};

LoginWindow.prototype = Object.create( BaseWindow.prototype );

LoginWindow.prototype.__onEvent = function( button ) {
	
	this.onEvent({
		window: this,
		action: button.__event,
		username: this.userTextField.data,
		password: this.passwordTextField.data
	});
	
};
