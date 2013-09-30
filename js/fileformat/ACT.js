var ACT = {};

ACT.FileType = {
	BODY: 0,
	HEAD: 1,
	HEAD_TOP: 2,
	HEAD_MID: 3,
	HEAD_BOTTOM: 4,
	WEAPON: 5,
	WEAPON_TWOHAND: 6,
	SHIELD: 7,
	ITEM: 8
};

ACT.ActorObject = function() {
	this.header = new ACT.ActorObject.FileHeader;
	this.actions = [];
	this.events = [];
};

ACT.ActorObject.FileHeader = function() {
	this.magic = "";
	this.version = -1;
};

ACT.ActorObject.FileHeader.prototype.isCompatibleWith = function( version ) {
	return this.version >= version;
};

ACT.ActorObject.Action = function() {
	this.frames = [];
	this.delay = 4.0;
};

ACT.ActorObject.Frame = function() {
	this.layers = [];
	this.eventIndex = -1;
	this.attachmentPointers = [];
};

ACT.ActorObject.Event = function( name ) {
	this.name = name;
};

ACT.ActorObject.Layer = function() {
	this.x = 0;
	this.y = 0;
	this.id = -1;
	this.flipped = false;
	this.color = [ 255, 255, 255, 255 ];
	this.angle = 0;
	this.type = ACT.ActorObject.Layer.Type.PALFrame;
	this.scaleX = 1.0;
	this.scaleY = 1.0;
	this.width = 0;
	this.height = 0;
};

ACT.ActorObject.Layer.Type = {
	RGBAFrame: 0,
	PALFrame: 1
};

ACT.ActorObject.AttachmentPointer = function() {
	this.x = 0;
	this.y = 0;
	this.attribute = ACT.ActorObject.AttachmentPointer.Attribute.NONE;
};

ACT.ActorObject.AttachmentPointer.Attribute = {
	NONE: -1
};

ACT.ACTLoader = function( fileType ) {
	this.fileType = fileType;
	this.version = 0;
	this.data = null;
	this.actorObject = new ACT.ActorObject;
};

ACT.ACTLoader.prototype.setDataFromBuffer = function( fileBuffer ) {

	this.data = new DataView( fileBuffer );
	
};

ACT.ACTLoader.prototype.parseActorObject = function() {
	
	try {
	
		this.parseStructure();
	
	} catch(e) {
	
		throw e;
	
	}

};

ACT.ACTLoader.prototype.__defineGetter__("ActorObject", function() {
	
	return this.actorObject;
	
});

ACT.ACTLoader.prototype.parseStructure = function() {
	
	var p = 0;

	var header = this.actorObject.header;

	header.magic = this.data.getString( p, 2 );

	p += 2;
	
	if( header.magic != "AC" ) {
		throw "ActParser: File format error; uknown identifier";
	}
	
	header.version = this.data.getUint16( p, true );
	
	this.version = header.version;
	
	var actionCount = this.data.getUint16( p + 2, true );

	p += 4;
	
	// Skip uknown bytes (reserved)
	p = 16;
	
	this.actorObject.actions = Array( actionCount );
	
	try {
		
		this.parseActions( this.actorObject.actions, p );
		
	} catch(e) {
		
		throw e;
		
	}
	
	/* Events */
	
	if( this.actorObject.header.isCompatibleWith( 0x201 ) ) {
	
		var eventCount = data.getUint32( p, true );
		
		p += 4;
		
		this.actorObject.events = Array( eventCount );
		
		for( var i = 0; i < eventCount; i++ ) {
			
			var event = new ACT.ActorObject.Event;
			
			event.name = data.getString( p, 40 );
			
			p += 40;
			
			this.actorObject.events[ i ] = event;
			
		}
	
	}
	
	/* Action delays */
	
	if( this.actorObject.header.isCompatibleWith( 0x202 ) ) {
	
		for( var i = 0; i < this.actorObject.actions.length; i++ ) {
			
			this.actorObject.actions[ i ].delay = data.getFloat32( p, true );
			
			p += 4;
			
		}
		
	}
	
	return p;

};

ACT.ACTLoader.prototype.parseActions = function( actions, offset ) {

	var p = offset;
	
	for( var i = 0; i < actions.length; i++ ) {	
		
		var action = new ACT.ActorObject.Action;
		var frameCount = this.data.getUint32( p, true );
		
		action.frames = Array( frameCount );
		
		p += 4;
		
		try {
			
			p = this.parseFrames( action.frames, p );
			
		} catch(e) {
		
			throw e;
		
		}
		
		actions[i] = action;
		
	}

	return p;

};

ACT.ACTLoader.prototype.parseFrames = function( frames, offset ) {
	
	var p = offset;
	
	for( var i = 0; i < frames.length; i++ ) {
		
		var frame = new ACT.ActorObject.Frame;
		
		// Skip unknown bytes "range_unknown"
		p += 32;
		
		var spriteCount = this.data.getUint32( p, true );
		
		p += 4;
		
		frame.layers = Array( spriteCount );
		
		/* Bitmap layers */
		
		try {
			
			p = this.parseLayers( frame.layers, p );
			
		} catch(e) {
		
			throw e;
		
		}
		
		/* Event index */
		
		if( this.actorObject.header.isCompatibleWith( 0x200 ) ) {
				
			frame.eventIndex = data.getUint32( p, true );
			
			p += 4;
			
		}
		
		/* Attachment pointers */
			
		if( this.actorObject.header.isCompatibleWith( 0x203 ) ) {
			
			var attachmentCount = data.getInt32( p, true );
			
			frame.attachmentPointers = Array( attachmentCount );
			
			p += 4;
			
			for( var j = 0; j < attachmentPointerCount; j++ ) {
				
				var ap = new ACT.ActorObject.AttachmentPointer;
				
				// Skip reserved bytes "reserved"
				p += 4;
				
				ap.x = data.getInt32( p, true );
				ap.y = data.getInt32( p + 4, true );
				ap.attribute = data.getUint32( p + 8, true );
				
				p += 12;
				
				frame.attachmentPointers[ j ] = ap;
				
			}
		}
				
		frames[ i ] = frame;
			
	}
	
	return p;
	
};

ACT.ACTLoader.prototype.parseLayers = function( layers, data, offset ) {

	var p = offset;
	var header = this.actorObject.header;
	
	for( var i = 0; i < layers.length; i++ ) {
	
		var layer = new ACT.ActorObject.Layer;
	
		layer.x = this.data.getInt32( p, true );
		layer.y = this.data.getInt32( p + 4, true );
		layer.id = this.data.getInt32( p + 8, true );
		layer.flipped = this.data.getInt32( p + 12, true ) != 0;
		
		p += 16;
		
		if( header.isCompatibleWith( 0x200 ) ) {
			
			layer.color = new Uint8Array( buffer.slice( p, p + 4 ) );
			
			p += 4;
			
		}
				
		if( header.isCompatibleWith( 0x204 ) ) {
			
			layer.scaleX = data.getFloat32( p, true );
			layer.scaleY = data.getFloat32( p + 4, true );
			
			p += 8;
			
		} else if( header.isCompatibleWith( 0x200 ) ) {
			
			layer.scaleX = layer.scaleY = data.getFloat32( p, true );
			
			p += 4;
			
		}
		
		if( header.isCompatibleWith( 0x200 ) ) {
			
			layer.angle = data.getInt32( p, true );
			
			var type = data.getInt32( p + 4, true ) == 0;
			
			layer.type = type 
				? ACT.ActorObject.Layer.Type.PALFrame
				: ACT.ActorObject.Layer.Type.RGBAFrame;
			
			p += 8;
			
		}
		
		if( header.isCompatibleWith( 0x205 ) ) {
			
			layer.width = data.getInt32( p, true );
			layer.height = data.getInt32( p + 4, true );
			
			p += 8;
			
		}
		
		layers[i] = layer;
		
	}
	
	return p;

}
