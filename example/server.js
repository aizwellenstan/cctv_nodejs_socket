const app = require('express')()
	, server = require('http').Server(app)
	, io = require('socket.io')(server)
	, rtsp = require('../lib/rtsp-ffmpeg')
	;
// use rtsp = require('rtsp-ffmpeg') instead if you have install the package
server.listen(6147, function(){
	console.log('Listening on localhost:6147');
});


var cams = ['rtsp://192.168.1.200/user=admin&password=&channel=2&stream=0.sdp',
		'rtsp://106.107.181.243/user=admin&password=&channel=1&stream=0.sdp',
		'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov'
		// , 'rtsp://192.168.68.111/h264main'
		// , 'udp://localhost:1234'
	].map(function(uri, i) {
		var stream = new rtsp.FFMpeg({input: uri, resolution: '1280*720', quality: 14});
		stream.on('start', function() {
			console.log('stream ' + i + ' started');
		});
		stream.on('stop', function() {
			console.log('stream ' + i + ' stopped');
		});
		return stream;
	});

cams.forEach(function(camStream, i) {
	var ns = io.of('/cam' + i);
	ns.on('connection', function(wsocket) {
		console.log('connected to /cam' + i);
		var pipeStream = function(data) {
			wsocket.emit('data', data);
		};
		camStream.on('data', pipeStream);

		wsocket.on('disconnect', function() {
			console.log('disconnected from /cam' + i);
			camStream.removeListener('data', pipeStream);
		});
	});
});

io.on('connection', function(socket) {
	socket.emit('start', cams.length);
});

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});
