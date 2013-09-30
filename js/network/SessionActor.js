var ROSessionActor = function(charInfo) {
	
	this.x = -1;
	this.y = -1;
	this.x1 = -1;
	this.y1 = -1;
	this.moveStartTime = -1;
	
	if(charInfo !== undefined)
		this.UpdateCharInfo(charInfo);
};

ROSessionActor.prototype.UpdateCharInfo = function(charInfo) {
	for(var i in charInfo) {
		this.UpdateParameter(i, charInfo[i]);
	}
};

ROSessionActor.prototype.UpdateParameter = function(param, value) {
	
	if(param == "name" && typeof value != "string") {
		value = charCodeArrayToString(value);
	}
		
	this[param] = value;
};