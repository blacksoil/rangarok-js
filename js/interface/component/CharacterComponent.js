var CharacterComponent = function( charInfo, width, height ) {

	width = width || 139;
	height = height || 144;

	InterfaceComponent.call( this, width, height );
	
	this.__charInfo = charInfo;
	this.__attachments = {};
	this.__action = 0;
	this.__needsUpdate = true;
	
	this.__empty = this.__charInfo ? false : true;
	
	this.__canvas = document.createElement('canvas');
	
	this.__canvas.width = this.width;
	this.__canvas.height = this.height;
	
	this.__context = this.__canvas.getContext('2d');
	
	if( !this.__empty ) {
		
		var self = this;
		
		// Body
		
		var attachments = {};
		
		attachments["head"] = PathHelper.getHeadResPath(
			charInfo.head, 
			charInfo.Sex
		);
		
		attachments["body"] = PathHelper.getClassBodyResPath(
			charInfo.job, 
			charInfo.Sex
		);
		
		if( charInfo.accessory2 > 0 ) 
			attachments["top"] = PathHelper.getAccessoryResPath(
				charInfo.accessory2, 
				charInfo.Sex
			);
		
		if( charInfo.accessory3 > 0 )
			attachments["mid"] = PathHelper.getAccessoryResPath(
				charInfo.accessory3, 
				charInfo.Sex 
			);
		
		if( charInfo.accessory > 0 )
			attachments["bottom"] = PathHelper.getAccessoryResPath(
				charInfo.accessory, 
				charInfo.Sex 
			);
		
		for(var i in attachments) {
			
			(function(attachmentType, resourcePath) {
			
				var loader = Deferred();
				var spr, act;
				
				loader
					.then( ResourceLoader.getSpriteObjectTask( resourcePath ) )
					.then( function(data) { spr = data; } );
				
				loader
					.then( ResourceLoader.getActorObjectTask( resourcePath ) )
					.then( function(data) { act = data; } );
				
				loader.finally((function() {
					
					this.setAttachment( attachmentType, {
						sprite: spr,
						actor: act
					} );
					
				}).bind( this ));
				
			}).bind( this )( i, attachments[i] );
			
			
		}
		
	}
	
};

CharacterComponent.prototype = Object.create( InterfaceComponent.prototype );

CharacterComponent.prototype.onInputDown = function( event ) {
	// Check button, perhaps?
	this.fireEvent();
};

// Sets a new attachment to the actor
// valid types: "body", "hair", "accessory" (head bottom), "accessory2" (head mid), "accessory3" (head top)
CharacterComponent.prototype.setAttachment = function( type, obj ) {
	this.__attachments[ type ] = obj;
	this.__needsUpdate = true;
	this.refresh();
};

CharacterComponent.prototype.draw = function( context, sx, sy ) {
	
	if( this.__empty ) {
		return;
	}
	
	if( this.__needsUpdate ) {	
		
		if( !this.__attachments.body ) {
			return;
		}
		
		this.drawAttachment( this.__context, 'body', 0, 0, 0 );
		
		var bodyPointer = this.__attachments.body.actor.actions[ this.__action ][0].attachmentPointers[0];
		
		if( this.__attachments.head ) {
			
			var headPointer = this.__attachments.head.actor.actions[ this.__action ][0].attachmentPointers[0];
			
			this.drawAttachment(
				this.__context, 
				'head', 
				0, 
				bodyPointer.x - headPointer.x,
				bodyPointer.y - headPointer.y
			);
		}
		
		var views = ['bottom', 'mid', 'top'];
		
		for( var i = 0; i < views.length; i++ ) {
		
			var loc = views[i];
			
			if( this.__attachments[loc] ) {
				
				var locPointer = this.__attachments[loc].actor.actions[ this.__action ][0].attachmentPointers[0];
				
				this.drawAttachment(
					this.__context, 
					loc, 
					0,  
					bodyPointer.x - locPointer.x, 
					bodyPointer.y - locPointer.y
				);
				
			}
		
		}
		
		this.__needsUpdate = false;
		
	}
	
	context.drawImage( this.__canvas, sx, sy );
	
};

CharacterComponent.prototype.drawAttachment = function( context, type, frameNo, dx, dy ) {
	
	var sprActor = this.__attachments[type];
	var sprite = sprActor.sprite;
	var frameData = sprActor.actor.actions[ this.__action ][ frameNo ].sprites;

	var tmpCanvas = document.createElement('canvas');
	var tmpContext = tmpCanvas.getContext('2d');

	for( var i = 0; i < frameData.length; i++ ) {
		
		var dispInfo = frameData[i];
		
		if( dispInfo.id < 0 )
			continue;
		
		var width, height, data;
		
		if( dispInfo.type == 'rgba' ) {
			width = sprite.getRgbaFrameWidth( dispInfo.id );
			height = sprite.getRgbaFrameHeight( dispInfo.id );
			data = sprite.getRgbaFrameDataRgba( dispInfo.id );
		} else {
			width = sprite.getIndexedFrameWidth( dispInfo.id );
			height = sprite.getIndexedFrameHeight( dispInfo.id );
			data = sprite.getIndexedFrameDataRgba( dispInfo.id );
		}
		
		// Create sprite from image data
		
		tmpCanvas.width = width;
		tmpCanvas.height = height;
		
		var imgd = tmpContext.createImageData( width, height );
		
		for( var p = 0; p < 4 * width * height; p++ ) {
			imgd.data[p] = data[p];
		}
		
		tmpContext.putImageData( imgd, 0, 0 );
		
		// Draw to proper canvas
		
		context.save();
		
		var sx = dispInfo.scaleX * ( dispInfo.flipped ? -1 : 1 );
		var sy = dispInfo.scaleY;
		var theta = Math.PI * dispInfo.angle / 180 * ( dispInfo.flipped ? -1 : 1 );
		var alpha = dispInfo.color[0] / 255;
		
		var cos_a = Math.cos( theta );
		var sin_a = Math.sin( theta );
		
		var x0 = -width / 2;
		var y0 = -height / 2;
		var x = context.canvas.width / 2 + dispInfo.x + dx;
		var y = 4 * context.canvas.height / 5 + dispInfo.y + dy;
		
		// Setup transformation matrix:
		// translate_center_canvas * translation * rotation * scale * translate_center_sprite
		// m11	m21	dx
		// m12	m22	dy
		var trans = [
			sx * cos_a, -sy * sin_a, sx * x0 * cos_a - sy * y0 * sin_a + x,
			sx * sin_a, sy * cos_a, sy * y0 * cos_a + sy * x0 * sin_a + y
		];
		
		// m11, m12, m21, m22, dx, dy 
		context.transform( trans[0], trans[3], trans[1], trans[4], trans[2], trans[5] );
		
		if( alpha < 1 ) {
			context.globalAlpha = alpha;
		}
		
		context.drawImage( tmpCanvas, 0, 0 );
		
		context.restore();
		
	}

};
