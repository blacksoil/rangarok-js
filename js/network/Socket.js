// Mediator for different socket types

var NetSocket = function( remoteAddr, port, type ) {

	EventHandler.call( this );

	this.socket = null;
	this.type = type || 0;

	if( type == NetSocket.Type.TCP4 ) {
		
		var net = require("net");
		
		this.socket = new net.Socket;
		
		this.socket.connect(port, remoteAddr);
		
		this.socket.on( "connect",  this.tcpOnOpen.bind( this ) );
		this.socket.on( "data",  this.tcpOnMessage.bind( this ) );
		this.socket.on( "error",  this.tcpOnError.bind( this ) );
		
	
	} else {
	
		var socketUri = "ws://" + remoteAddr + ":" + String(port);
	
		this.socket = new WebSocket( socketUri, ["binary"] );
		this.socket.binaryType = "arraybuffer";
	
		this.socket.onopen = this.webSocketOnOpen.bind( this );
		this.socket.onerror = this.webSocketOnError.bind( this );
		this.socket.onmessage = this.webSocketOnMessage.bind( this );
	
	}

};

NetSocket.Type = {
	WEBSOCKET: 0,
	TCP4: 1
};

NetSocket.Helper = {


	toArrayBuffer: function( buffer ) {
		
		var ab = new ArrayBuffer(buffer.length);
		var view = new Uint8Array(ab);
		
		for (var i = 0; i < buffer.length; ++i) {
			view[i] = buffer[i];
		}
		
		return ab;
	},
	
	toBuffer: function( arrayBuffer ) {
	
		var buffer = new Buffer( arrayBuffer.byteLength );
		var view = new Uint8Array( arrayBuffer );
		
		for(var i = 0; i < buffer.length; i++ ) {
			buffer[i] = view[i];
		}
		
		return buffer;
	
	}

};

NetSocket.prototype = Object.create( EventHandler.prototype );

NetSocket.prototype.write = function( arrayBuffer ) {
	
	if( this.type == NetSocket.Type.TCP4 ) {
		
		var buf = NetSocket.Helper.toBuffer( arrayBuffer );
		
		this.socket.write( buf );
	
	} else {
		
		this.socket.send( arrayBuffer );
	
	}

};

NetSocket.prototype.close = function() {

	if( this.type == NetSocket.Type.TCP4 ) {
		
		this.socket.destroy();
	
	} else {
	
		this.socket.close();
	
	}

};

NetSocket.prototype.webSocketOnOpen = function( e ) {
	this._fireEvent("OnOpen", true);
};

NetSocket.prototype.webSocketOnError = function( e ) {
	this._fireEvent("OnError", true);
};

NetSocket.prototype.webSocketOnMessage = function( e ) {
	this._fireEvent("OnMessage", e.data);
};

NetSocket.prototype.tcpOnOpen = function( e ) {
	this._fireEvent("OnOpen", true);
};

NetSocket.prototype.tcpOnError = function( e ) {
	console.warn( "NetSocket: TCP socket error", e );
	this._fireEvent("OnError", true);
};

NetSocket.prototype.tcpOnMessage = function( buffer ) {
	
	if(!(buffer instanceof Buffer)) {
		console.log( data );
		throw "NetSocket: Received message is not a buffer";
	}
	
	if(buffer.length < 1) {
		console.log("Received zero length buffer");
		return;
	}
	
	var ab = NetSocket.Helper.toArrayBuffer( buffer );
	
	this._fireEvent("OnMessage", ab);
};



