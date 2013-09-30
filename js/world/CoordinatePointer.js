var CoordinatePointer = function() {
	
	var geometry;
	
	geometry = new THREE.Geometry();
	geometry.dynamic = true;
	
	var h = 1 / 9;
	var w = 1 / 3;
	
	var f = geometry.faces;
	var v = geometry.vertices;
	
	// TOP LEFT CORNER
	
	v.push( new THREE.Vector3( 0, 0, 0 ) ); // top left
	v.push( new THREE.Vector3( w, 0, 0 ) ); // top right
	v.push( new THREE.Vector3( w, h, 0 ) ); // bottom right
	v.push( new THREE.Vector3( 0, h, 0 ) ); // bottom left
	f.push( new THREE.Face4( 0, 1, 2, 3 ) );
	
	v.push( new THREE.Vector3( 0, h, 0 ) ); // top left
	v.push( new THREE.Vector3( h, h, 0 ) ); // top right
	v.push( new THREE.Vector3( h, w, 0 ) ); // bottom right
	v.push( new THREE.Vector3( 0, w, 0 ) ); // bottom left
	f.push( new THREE.Face4( 4, 5, 6, 7 ));
	
	// TOP RIGHT CORNER
	v.push( new THREE.Vector3( 1 - w, 0, 0 ) ); // top left
	v.push( new THREE.Vector3( 1, 0, 0 ) ); // top right
	v.push( new THREE.Vector3( 1, h, 0 ) ); // bottom right
	v.push( new THREE.Vector3( 1 - w, h, 0 ) ); // bottom left
	f.push( new THREE.Face4( 8, 9, 10, 11 ) );
	
	v.push( new THREE.Vector3( 1 - h, h, 0 ) ); // top left
	v.push( new THREE.Vector3( 1, h, 0 ) ); // top right
	v.push( new THREE.Vector3( 1, w, 0 ) ); // bottom right
	v.push( new THREE.Vector3( 1 - h, w, 0 ) ); // bottom left
	f.push( new THREE.Face4( 12, 13, 14, 15 ) );
	
	// BOTTOM RIGHT CORNER
	v.push( new THREE.Vector3( 1 - w, 1 - h, 0 ) ); // top left
	v.push( new THREE.Vector3( 1, 1 - h, 0 ) ); // top right
	v.push( new THREE.Vector3( 1, 1, 0 ) ); // bottom right
	v.push( new THREE.Vector3( 1 - w, 1, 0 ) ); // bottom left
	f.push( new THREE.Face4( 16, 17, 18, 19 ) );
	
	v.push( new THREE.Vector3( 1 - h, 1 - w, 0 ) ); // top left
	v.push( new THREE.Vector3( 1, 1 - w, 0 ) ); // top right
	v.push( new THREE.Vector3( 1, 1 - h, 0 ) ); // bottom right
	v.push( new THREE.Vector3( 1 - h, 1 - h, 0 ) ); // bottom left
	f.push( new THREE.Face4( 20, 21, 22, 23 ) );
	
	// BOTTOM LEFT CORNER
	v.push( new THREE.Vector3( 0, 1 - h ) ); // top left
	v.push( new THREE.Vector3( w, 1 - h ) ); // top right
	v.push( new THREE.Vector3( w, 1, 0 ) ); // bottom right
	v.push( new THREE.Vector3( 0, 1, 0 ) ); // bottom left
	f.push( new THREE.Face4( 24, 25, 26, 27 ) );
	
	v.push( new THREE.Vector3( 0, 1 - w ) ); // top left
	v.push( new THREE.Vector3( h, 1 - w ) ); // top right
	v.push( new THREE.Vector3( h, 1 - h, 0 ) ); // bottom right
	v.push( new THREE.Vector3( 0, 1 - h, 0 ) ); // bottom left
	f.push( new THREE.Face4( 28, 29, 30, 31 ) );
	
	this.h = h;
	this.w = w;
	
	this.geometry = geometry;
	
	this._last = {
		h0: 0,
		h1: 0,
		h2: 0,
		h3: 0
	};
	
	this.mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
		color: 0x30E0A0, // 0x2ddb9d?
		opacity: 0.5,
		transparent: true,
		side: THREE.DoubleSide
	}));
	
	this.mesh.frustumCulled = false;
	
};

CoordinatePointer.prototype.setElevation = function( gatBlock ) {
	
	gatBlock = gatBlock || {};
	
	var h0 = gatBlock.upperLeftHeight || 0;
	var h1 = gatBlock.upperRightHeight || 0;
	var h2 = gatBlock.lowerLeftHeight || 0;
	var h3 = gatBlock.lowerRightHeight || 0;
	
	if(	this._last.h0 == h0 && this._last.h1 == h1 &&
		this._last.h2 == h2 && this._last.h3 == h3 ) {
		// Skip if this tile block has same heights as the previous one
		return;
	}
	
	var v = this.geometry.vertices;
	
	var s, t, p, h;
	
	for(var i = 0; i < v.length; i++) {
	
		s = v[i].x;
		t = v[i].y;
		
		if(s + t <= 1.0) {
			
			p = h0;
			h = p + s * ( h1 - p ) + t * ( h2 - p );
			
		} else {

			s = 1 - s;
			t = 1 - t;

			p = h3;
			h = p + s * ( h2 - p ) + t * ( h1 - p );
			
		}
		
		v[i].z = -h;

	}
	
	this.geometry.verticesNeedUpdate = true;
	
	this._last.h0 = h0;
	this._last.h1 = h1;
	this._last.h2 = h2;
	this._last.h3 = h3;
	
};
