var Ragnarok = function( document ) {
	
	if(!(this instanceof Ragnarok)) {
		return new Ragnarok;
	}

	EventHandler.call( this );
	
	this.graphics = {
		scene: new SceneManager(),
		gui: new InterfaceManager( document )
	};
	
	this.input = new InputEventHandler( document );
	this.session = new RONetworkSession();
	
	this.session.attachEventListener("OnServerReject", function() {
	
		console.warn("We were rejected from the server. Resetting.");
	
		this.reset();
		this.displayLogin();
	
	});
	
	window.ragnarok = this;
	
};

Ragnarok.prototype = Object.create(EventHandler.prototype);

Ragnarok.prototype.init = function() {

	this.graphics.gui.init();
	this.graphics.scene.Init();
	this.ready();

};

Ragnarok.prototype.ready = function() {
	
	// Client is ready to start
	
	this.attachGuiInput();
	
	this.displayLogin();
	
	SoundPlayer.playBgm("01");
	
};

Ragnarok.prototype.reset = function() {
	
	this.session.Reset();
	this.init();
	
};

Ragnarok.prototype.attachGuiInput = function() {
	this.input.attachEventListener("mousemove", this.graphics.gui.mouseMoveEvent );
	this.input.attachEventListener("mouseup", this.graphics.gui.mouseUpEvent );
	this.input.attachEventListener("mousedown", this.graphics.gui.mouseDownEvent );
};

Ragnarok.prototype.detachGuiInput = function() {
	this.input.detachEventListener("mousemove", this.graphics.gui.mouseMoveEvent );
	this.input.detachEventListener("mouseup", this.graphics.gui.mouseUpEvent );
	this.input.detachEventListener("mousedown", this.graphics.gui.mouseDownEvent );
};

Ragnarok.prototype.attachSceneInput = function() {
	this.input.attachEventListener("mousemove", this.graphics.scene.loader.mouseMoveEvent );
	this.input.attachEventListener("mouseup", this.graphics.scene.loader.mouseUpEvent );
	this.input.attachEventListener("mousedown", this.graphics.scene.loader.mouseDownEvent );
};

Ragnarok.prototype.detachSceneInput = function() {
	this.input.detachEventListener("mousemove", this.graphics.scene.loader.mouseMoveEvent );
	this.input.detachEventListener("mouseup", this.graphics.scene.loader.mouseUpEvent );
	this.input.detachEventListener("mousedown", this.graphics.scene.loader.mouseDownEvent );
};

Ragnarok.prototype.displayLogin = function() {
	
	var window = this.graphics.gui.create( Interface.LoginWindow );
	
	window.onEvent = (function( event ) {
				
		if( event.action == Interface.Button.Login ) {
			
			// TODO: validate input here
			
			this.graphics.gui.remove( event.window );
			this.userRequestLogin(event.username, event.password);
			
		} else if( event.action == Interface.Button.Exit ) {
			// TODO: Exit native application
		}
		
	}).bind(this);
	
	window.userTextField.data = 'gamemaster';
	window.passwordTextField.data = 'poring';
	
	this.graphics.gui.add(window, InterfaceAlignment.Center, InterfaceAlignment.Center);
	
};

Ragnarok.prototype.userRequestLogin = function(username, password) {

	// Connect to host
	this.session.Init();
	
	this.session.attachEventListener("OnSessionError", function() {
		console.error("Game session error!"); 
	});
	
	this.session.attachEventListener("OnSessionReady", (function() {
		this.session.Authenticate(username, password);
	}).bind(this));
	
	this.session.attachEventListener("OnAuthenticationResponse", (function(success) {
		
		if(success) {
			this.displayServiceSelect();
		} else {
			console.error('Error: Login was rejected');
		}
	
	}).bind(this));

	
};

Ragnarok.prototype.displayServiceSelect = function() {

	var window = this.graphics.gui.create( Interface.ServiceWindow );
	
	var services = this.session.GetServiceList();
	
	for( var i = 0; i < services.length; i++ )
		window.addService( services[i].name, services[i].id );
	
	window.onEvent = (function( event ) {
		
		if( event.action == Interface.Button.Select ) {
			
			this.graphics.gui.remove( event.window );
			this.onStateServiceSelected( event.serverId );
			
		} else if( event.action == Interface.Button.Cancel ) {
			
			// Service select has been canceled
			
			this.graphics.gui.remove( event.window );
			this.reset();
			
		}
		
	}).bind(this);
	
	this.graphics.gui.add(window, InterfaceAlignment.Center, InterfaceAlignment.Center);

};


Ragnarok.prototype.onPlayerMove = function(moveData) {
	
	if(this.PCActor.gatPosition.x != moveData[0] 
		&& this.PCActor.gatPosition.y != moveData[1]) {
		console.warn("Player had incorrect position");
	}
	
	this.PCActor.MoveToGatPosition(moveData[2], moveData[3]);
	
};

Ragnarok.prototype.playerRequestMove = function(gatPosition) {
	
	this.session.MovePlayer(gatPosition.x, gatPosition.y);
	
};

Ragnarok.prototype.CreateAttachment = function(obj, n, ttype) {
	// REMOVe THIS SHIT CODE!
	var q = Deferred();
	var sprFileObject = null;
	var actFileObject = null;
	
	var scene = this.graphics.scene.scene;
	
	q	.then(ResourceLoader.getSpr.bind(this, n + ".spr"))
		.then(function(data) {
			sprFileObject = new SprParser(data);
		});
		
	q	.then(ResourceLoader.getAct.bind(this, n + ".act"))
		.then(function(data) {
			actFileObject = new ActParser(data);
		});
		
	q	.finally(function() {
			
		obj.SetAttachment(ttype, sprFileObject, actFileObject);
		
		obj.addAttachmentToScene(scene, ttype);
		
	});

}

Ragnarok.prototype.createMainInterface = function() {

	// Setup chat window and listen for player chat

	this.chatWindow = this.graphics.gui.create( Interface.ChatWindow );
	
	this.chatWindow.onEvent = (function(msg) {
		if(msg && typeof msg == "string" && msg.length > 0) {
			this.chatWindow.pushHistory( msg );
			this.session.PlayerChat(msg);
		}
	}).bind(this);
	
	this.session.attachEventListener("OnPlayerChat", (function(msg) {
		this.chatWindow.writeLine(msg);
	}).bind(this));
	
	this.minimap = new Minimap(128, 128);
	
};

Ragnarok.prototype.displayMainInterface = function() {
	
	// Add chat window
	
	this.graphics.gui.add(
		this.chatWindow, 
		InterfaceAlignment.Left, 
		InterfaceAlignment.Bottom
	);
	
	// Minimap
	
	
	this.minimap.setMap( this.graphics.scene.getCurrentMapName() );
	
	this.graphics.gui.add(this.minimap, InterfaceAlignment.Right, InterfaceAlignment.Top, -10, 10);
	
	var actor = this.graphics.scene.entityMap.get(this.session.pc.GID);
	
	actor.attachEventListener("OnGatPositionChange", (function( position ) {
		
		this.minimap.setPosition(
			position.x, 
			position.y, 
			// move these to constructor...
			this.graphics.scene.loader.gatFileObject.width, 
			this.graphics.scene.loader.gatFileObject.height, 
			actor.standingDirection
		);
	
	}).bind(this));

};

Ragnarok.prototype.onGameEnter = function() {

	// Display interface

	this.graphics.gui.clearBackground();
	
	this.displayMainInterface();

	// Music
	
	var rswName = this.graphics.scene.getCurrentMapName();
	
	if(Settings.music && rswName in mp3NameTable) {
		SoundPlayer.playBgm(mp3NameTable[rswName]);
	}
	
};

Ragnarok.prototype.setupSceneHandlers = function() {

	this.session.attachEventListener("OnActorAppear", (function(session_actor) {
		
		console.warn("Actor appeared");
		
		this.graphics.scene.AddEntity(
			session_actor.GID,
			session_actor
		);
		
	}).bind(this));
	
	this.session.attachEventListener("OnActorVanish", (function(session_actor) {
		
		console.warn("Actor vanished");
		
		this.graphics.scene.RemoveEntity(
			session_actor.GID
		);
		
	}).bind(this));
	
	this.session.attachEventListener("OnActorPositionChange", (function(session_actor) {
		
		console.warn("Actor changed position");
		
		this.graphics.scene.SetEntityPosition(
			session_actor.GID,
			session_actor.x,
			session_actor.y
		);
		
	}).bind(this));
	
	this.session.attachEventListener("OnActorMovement", (function(session_actor) {
		
		console.warn("Actor moved");
		
		this.graphics.scene.MoveEntityPosition(
			session_actor.GID,
			session_actor.x,
			session_actor.y,
			session_actor.x1,
			session_actor.y1,
			session_actor.moveStartTime
		);
		
	}).bind(this));

};

// Called when map name is received from zone server
Ragnarok.prototype.onStateLoadMap = function() {
	
	console.log('Info: Zone server accepted us, starting to load map');
	console.log('Info: Map is ' + this.session.GetMapName());
	
	this.createMainInterface();
	
	// Load scene
	
	this.graphics.scene.Load(this.session.GetMapName().replace(/gat$/, "rsw"));
	
	this.graphics.scene.attachEventListener("OnSceneLoadDone", (function() {
		
		// Add player to scene
		this.graphics.scene.AddEntity(
			this.session.pc.GID,
			this.session.pc.actor
		);
		
		// Update position
		this.graphics.scene.SetEntityPosition(
			this.session.pc.GID,
			this.session.pc.actor.x,
			this.session.pc.actor.y
		);
		
		this.setupSceneHandlers();
		
		// Bind camera to player character
		this.graphics.scene.bindActorToCamera(this.session.pc.GID);
		
		// Enable input to scene
		
		// Misc
		this.onGameEnter();
				
		//this.graphics.scene.attachEventListener("OnPCRequestMove", this.playerRequestMove.bind(this));
		this.graphics.scene.attachEventListener("OnMoveRequest", this.playerRequestMove.bind(this));
		
		// Start rendering
		this.graphics.scene.Start();
		
		// Must be done after starting
		this.attachSceneInput();
		
		// Report to session that we're ready to continue
		this.session.ReportSceneReady(); 
		
	}).bind(this));
	
	//this.PCActor = new SpriteActor(this.graphics.scene);
	//this.PCActor.MovementSpeed = this.session.pc.actor.speed;
	
	
	/*
	
	this.graphics.scene.loadMap(this.session.GetMapName().replace(/gat$/, "rsw"))
		.then((function() {
			
			// Load actor
			
			var bodyRes = PathHelper.getClassBodyResPath(this.session.pc.actor.job, this.session.pc.actor.Sex);
			var headRes = PathHelper.getHeadResPath(this.session.pc.actor.head, this.session.pc.actor.Sex);
			
			Deferred()
				.then(this.CreateAttachment.bind(this, this.PCActor, bodyRes, SpriteActor.Attachment.BODY))
				.then(this.CreateAttachment.bind(this, this.PCActor, headRes, SpriteActor.Attachment.HEAD))
				.then((function() {
					
					this.graphics.scene.start(); 
					
					this.PCActor.SetGatPosition(
						this.session.GetPCStatus(GameVar.CURXPOS),
						this.session.GetPCStatus(GameVar.CURYPOS)
					);
					
					this.attachSceneInput();
					
					this.PCActor.Direction = this.session.GetPCStatus(GameVar.CURDIR);
					
					setInterval((function() {
						this.PCActor.Update(this.graphics.scene.camera);
					}).bind(this), 10);
					
					this.graphics.scene.bindCamera(this.PCActor);
					
					this.graphics.scene.attachEventListener("OnPCRequestMove", this.playerRequestMove.bind(this));
					
					this.session.attachEventListener("OnPCMove", this.onPlayerMove.bind(this));
					
					console.log("Starting scene");
					
				}).bind(this));
			
		}).bind(this))
		.then((function() { 
			
			this.session.ReportSceneReady(); 
		}).bind(this));
	
	*/
	
};

// Called when character is selected
Ragnarok.prototype.onStateCharacterSelected = function( charID ) {
	
	// Network send character select
	
	this.session.attachEventListener("OnMapChangeRequestResponse", (function(response) {
		
		if( response ) {
			console.log("Map change request OK ...");
			this.onStateLoadMap();
		} else {
			console.error('Error: Zone server authentication request rejected');
			this.reset();
		}
		
	}).bind(this));
	
	// Setup handlers to scene
	
	this.session.SelectCharacter(charID);
	
}

// Called when client is ready to list characters
Ragnarok.prototype.onStateCharSelect = function() {
	
	var charSelectWindow = this.graphics.gui.create( Interface.CharSelect );
	
	var accountData = this.session.GetAccountCharInfo();
	
	for( var i = 0; i < accountData.length && i < 3; i++ ) {
		
		var data = Object.create(accountData[i]);
		
		data.name = charCodeArrayToString(data.name);
		
		charSelectWindow.addCharacter( data );
		
	}
	
	charSelectWindow.onEvent = (function( event ) {
		
		// Select character
		if( event.action == Interface.Button.Select ) {
			
			// validation should be done first
			// simple for now...
			if( event.charId === null ) {
				return;
			}
			
			this.graphics.gui.remove( event.window );
			
			this.onStateCharacterSelected( event.charId );
			
		} else if( event.action == Interface.Button.Cancel ) {
			
			this.graphics.gui.remove( event.window );
			this.reset();
			
		}
		
	}).bind(this);
	
	this.graphics.gui.add(
		charSelectWindow,
		InterfaceAlignment.Center, 
		InterfaceAlignment.Center
	);

};

// Called when the user has requested access to a server
Ragnarok.prototype.onStateServiceSelected = function( serviceID ) {

	this.session.attachEventListener("OnAccountCharSelect", (function(success) {
		if( success ) {
			this.onStateCharSelect();
		} else {
			console.error('Error: Server access was denied');
			this.reset();
		}
	}).bind(this));

	this.session.SelectService(serviceID);

}

