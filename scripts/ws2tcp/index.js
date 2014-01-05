var ws = require('ws');
var net = require('net');

var argv = process.argv.splice(2);

if(argv.length < 2) {
    console.error('Usage error.');
    console.error('Example:');
    console.error('./ws2tcp 6899 127.0.0.1:6900 [<6120 127.0.0.1:6121> <5120 127.0.0.1:5121>...]');
    process.exit();
}

var count = 0;

for(var key = 0; key < argv.length; key = key + 2) {
    
    var src = argv[key];
    var dest = argv[key + 1].split(':');

    initProxy(src, dest);
    
}

function initProxy(src, dest) {
    
    var server = new ws.Server({ port: src }, function() {
        console.log('Websocket server open on port %s, fowarding to %s:%d', src, dest[0], dest[1]);
    });
    
    server.on('connection', function(wsocket) {
        
        var uid = ++count;

        console.log('Connection from %s:%d to %d -> %s:%d (%d)', wsocket._socket.remoteAddress, wsocket._socket.remotePort, src, dest[0], dest[1], uid);
        
        var tcp = net.connect(dest[1], dest[0]);
        
        tcp.on('connect', function() {
            console.log("TCP connect (%d)", uid);
        });
        
        wsocket.on('open', function () {
            console.log("WS open (%d)", uid);
        });

        tcp.on('data', function(data) {
            console.log("TCP <> WS (%d) -> %s", uid, data);

            wsocket.send(data, {binary: true});
        });

        wsocket.on('message', function(m,flags) {
            console.log("WS <> TCP (%d) -> %s", uid, m);
                
            tcp.write(m);
        });

        tcp.on('close', function(had_error) {
            console.log("TCP closed (%d)", uid);
            wsocket.removeAllListeners('close');
            wsocket.close();
        });

        wsocket.on('close', function() {
            console.log("WS closed (%d)", uid);
            tcp.removeAllListeners('close');
            tcp.end();
        });

        wsocket.on('error', function (e) {
            console.error("WS error (%d)", uid);
            console.error(e);
            
            wsocket.removeAllListeners('close');
            tcp.removeAllListeners('close');
            wsocket.close();
            tcp.end();
        });

        tcp.on('error', function (e) {
            console.error("TCP error (%d)", uid);
            console.error(e);
            
            wsocket.removeAllListeners('close');
            tcp.removeAllListeners('close');
            wsocket.close();
            tcp.end();
        });

    });

}