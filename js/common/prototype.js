Uint8Array.prototype.toString = function() {
	
	var tmp = Array( this.length );
	
	for( var i = 0; i < this.length; i++ ) {
	
		if( this[i] === 0 )
			break;
		
		tmp[i] = String.fromCharCode( this[i] );
		
	}
	
	return tmp.join('');
	
};

var charCodeArrayToString = function( array ) {

	var tmp = Array( array.length );
	
	for( var i = 0; i < array.length; i++ ) {
	
		if( array[i] === 0 )
			break;
		
		tmp[i] = String.fromCharCode( array[i] );
		
	}
	
	return tmp.join('');

};

String.prototype.toUint8Array = function( len ) {
	
	len = len ? len : this.length;
	
	var tmp = new Uint8Array( len );
	
	for( var i = 0; i < len; i++ ) {
		
		tmp[i] = this.charCodeAt(i) || 0;
	}

	return tmp;
	
};

DataView.prototype.getVector3 = function( offset ) {
	return new Float32Array( this.buffer.slice( offset, offset + 12 ) );
};

DataView.prototype.getString = function( offset, length ) {
	return (new Uint8Array( this.buffer, offset, length )).toString();
};
