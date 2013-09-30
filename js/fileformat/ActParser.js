var ActParser = function( buffer ) {
	this.actions = [];
	this.events = [];
	this.delays = [];
	this.parseStructure( buffer );
};

ActParser.prototype = {};

ActParser.prototype.parseStructure = function( buffer ) {
	
	var data = new DataView( buffer );
	var p = 0;
	
	this.header = {
		magic: data.getString( p, 2 ),
		version: -1,
		actionCount: 0
	}
	
	p += 2;
	
	if( this.header.magic != 'AC' ) {
		throw "ActParser: File format error; uknown identifier";
	}
	
	this.header.version = data.getUint16( p, true );
	this.header.actionCount = data.getUint16( p + 2, true );
	
	p += 4;
	
	// Skip uknown bytes "reserved"
	p = 16;
	
	var action;
		
	for( var i = 0; i < this.header.actionCount; i++ ) {
		
		var frameCount = data.getUint32( p, true );
				
		p += 4;
		
		action = [];
		
		var frame;
		var attachments;
		
		for( var j = 0; j < frameCount; j++ ) {
			
			// Skip uknown bytes "range_unknown"
			p += 32;
			
			var spriteCount = data.getUint32( p, true );
			
			p += 4;
			
			frame = [];
			
			var sprite;
			
			for( var k = 0; k < spriteCount; k++ ) {
				
				sprite = {
					x: data.getInt32( p, true ),
					y: data.getInt32( p + 4, true ),
					id: data.getInt32( p + 8, true ),
					flipped: ( data.getInt32( p + 12, true ) != 0 ),
					color: [ 255, 255, 255, 255 ],
					angle: 0,
					type: 'palette',
					scaleX: 1.0,
					scaleY: 1.0,
					width: 0,
					height: 0
				}
				
				p += 16;
				
				if( this.header.version >= 0x200 ) {
					
					sprite.color = new Uint8Array( buffer.slice( p, p + 4 ) );
					
					p += 4;
					
				}
				
				if( this.header.version >= 0x204 ) {
					
					sprite.scaleX = data.getFloat32( p, true );
					sprite.scaleY = data.getFloat32( p + 4, true );
					
					p += 8;
					
				} else if( this.header.version >= 0x200 ) {
					
					sprite.scaleX = data.getFloat32( p, true );
					sprite.scaleY = sprite.scaleX;
					
					p += 4;
					
				}
				
				if( this.header.version >= 0x200 ) {
					
					sprite.angle = data.getInt32( p, true );
					sprite.type = ( data.getInt32( p + 4, true ) == 0 )
						? 'palette'
						: 'rgba';
						
					p += 8;
					
				}
				
				if( this.header.version >= 0x205 ) {
					
					sprite.width = data.getInt32( p, true );
					sprite.height = data.getInt32( p + 4, true );
					
					p += 8;
					
				}
				
				frame.push( sprite );
				
			}
			
			var eventIndex = -1;
			
			if( this.header.version > 0x200 ) {
				
				eventIndex = data.getUint32( p, true );
				
				p += 4;
				
			}
			
			var attachments = [];
			
			if( this.header.version >= 0x203 ) {
				
				var attachmentPointerCount = data.getInt32( p, true );
				
				p += 4;
				
				for( var k = 0; k < attachmentPointerCount; k++ ) {
					
					// Skip reserved bytes "reserved"
					p += 4;
					
					attachments.push({
						x: data.getInt32( p, true ),
						y: data.getInt32( p + 4, true ),
						attribute: data.getUint32( p + 8, true )
					});
					
					p += 12;
					
				}
			}
			
			action.push({
				sprites: frame,
				eventIndex: eventIndex,
				attachmentPointers: attachments
			});
			
		}
		
		this.actions.push( action );
	}
	
	if( this.header.version >= 0x201 ) {
	
		var eventCount = data.getUint32( p, true );
		
		p += 4;
		
		for( var i = 0; i < eventCount; i++ ) {
			
			this.events.push(
				data.getString( p, 40 )
			);
			
			p += 40;
			
		}
	
	}
	
	for( var i = 0; i < this.header.actionCount; i++ ) {
	
		if( this.header.version >= 0x202 ) {
			
			this.delays.push( data.getFloat32( p, true ) );
			
			p += 4;
			
		} else {
		
			this.delays.push( 4.0 );
		
		}
	
	}
	
};

ActParser.prototype.getBoundingBox = function( action_id, frame_id ) {
	
	var box = new BoundingBox();
	
	var bx0 = 0;
	var by0 = 0;
	var bx1 = 0;
	var by1 = 0;
	
	if( action_id < 0 || action_id > this.actions.length ) {
		console.warn("ACT :: Invalid action index");
		return box;
	}
	
	var action = this.actions[ action_id ];
	
	if( frame_id < 0 || frame_id > action.length ) {
		console.warn("ACT :: Invalid frame index");
		return box;
	}
	
	var sprites = action[ frame_id ].sprites;
	
	for( var i = 0; i < sprites.length; i++ ) {
		
		var sprite = sprites[i];
		
		if(sprite.id < 0) {
			// Sprite is invisible
			continue;
		}
		
		var spriteFrameData = sprite.type == 'palette'
				? spriteObj.frames[sprite.id]
				: spriteObj.bitmaps[sprite.id];
		
		var spr_width = sprite.width || spriteFrameData.width;
		var spr_height = sprite.height || spriteFrameData.height;
		
		var bbox = [
			0, // 0 top-left x
			0, // 1 top-left y
			spr_width, // 2 bottom-right x
			spr_height, // 3 bottom-right y
			spr_width, // 4 top-right x
			0, // 5 top-right y
			0, // 6 bottom-left x
			spr_height // 7 bottom-left y
		];
		
		// translate center
		bbox[0] += -spr_width/2;
		bbox[1] += -spr_height/2;
		bbox[2] += -spr_width/2;
		bbox[3] += -spr_height/2;
		
		bbox[4] += -spr_width/2;
		bbox[5] += -spr_height/2;
		bbox[6] += -spr_width/2;
		bbox[7] += -spr_height/2;
		
		// rotate 
		var x0, y0, t = sprite.angle * Math.PI / 180;
		
		x0 = bbox[0];
		y0 = bbox[1];
		
		bbox[0] = x0 * Math.cos(t) - y0 * Math.sin(t);
		bbox[1] = x0 * Math.sin(t) + y0 * Math.cos(t);
		
		x0 = bbox[2];
		y0 = bbox[3];
		
		bbox[2] = x0 * Math.cos(t) - y0 * Math.sin(t);
		bbox[3] = x0 * Math.sin(t) + y0 * Math.cos(t);
		
		x0 = bbox[4];
		y0 = bbox[5];
		
		bbox[4] = x0 * Math.cos(t) - y0 * Math.sin(t);
		bbox[5] = x0 * Math.sin(t) + y0 * Math.cos(t);
		
		x0 = bbox[6];
		y0 = bbox[7];
		
		bbox[6] = x0 * Math.cos(t) - y0 * Math.sin(t);
		bbox[7] = x0 * Math.sin(t) + y0 * Math.cos(t);
		
		if(sprite.flipped) {
			bbox[0] *= -1;
			bbox[2] *= -1;
			bbox[4] *= -1;
			bbox[6] *= -1;
		}
		
		// scale
		bbox[0] *= sprite.scaleX;
		bbox[1] *= sprite.scaleY;
		bbox[2] *= sprite.scaleX;
		bbox[3] *= sprite.scaleY;
		
		bbox[4] *= sprite.scaleX;
		bbox[5] *= sprite.scaleY;
		bbox[6] *= sprite.scaleX;
		bbox[7] *= sprite.scaleY;
		
		// translate dx
		bbox[0] += sprite.x;
		bbox[1] += sprite.y;
		bbox[2] += sprite.x;
		bbox[3] += sprite.y;
		
		bbox[4] += sprite.x;
		bbox[5] += sprite.y;
		bbox[6] += sprite.x;
		bbox[7] += sprite.y;
		
		var sbx0 = Math.min(bbox[0], bbox[2], bbox[4], bbox[6]);
		var sby0 = Math.min(bbox[1], bbox[3], bbox[5], bbox[7]);
		var sbx1 = Math.max(bbox[0], bbox[2], bbox[4], bbox[6]);
		var sby1 = Math.max(bbox[1], bbox[3], bbox[5], bbox[7]);
	
		bx0 = Math.min(bx0, sbx0);
		by0 = Math.min(by0, sby0);
		bx1 = Math.max(bx1, sbx1);
		by1 = Math.max(by1, sby1);
	
	}
	
	return [bx0, by0, bx1, by1];
	
};