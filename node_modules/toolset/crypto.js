var _ 					= require('underscore');
var nodecrypto 			= require('crypto');
var uuid 				= require('./uuid.js');

function crypto() {
	
}

// List file by extention in any subdirectory
crypto.prototype.md5 = function(data) {
	var md5sum = nodecrypto.createHash('md5');
	md5sum.update(data);
	return md5sum.digest('hex');
}
crypto.prototype.uuid = function() {
	var md5sum = nodecrypto.createHash('md5');
	md5sum.update(uuid.v4());
	return md5sum.digest('hex');
}

exports.main = new crypto();