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
		// 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov',
		'rtsp://106.107.181.243/user=admin&password=&channel=1&stream=0.sdp',
		'rtsp://106.107.181.243/user=admin&password=&channel=2&stream=0.sdp',
		'rtsp://106.107.181.243/user=admin&password=&channel=3&stream=0.sdp',
  		'rtsp://106.107.181.243/user=admin&password=&channel=4&stream=0.sdp',
		'rtsp://106.107.181.243/user=admin&password=&channel=5&stream=0.sdp',
		'rtsp://106.107.181.243/user=admin&password=&channel=6&stream=0.sdp',
		'rtsp://114.33.126.228/user=admin&password=&channel=1&stream=0.sdp',
		'rtsp://220.132.94.244/user=admin&password=&channel=1&stream=0.sdp',
		'rtsp://220.132.94.244/user=admin&password=&channel=2&stream=0.sdp',
		'rtsp://220.132.94.244/user=admin&password=&channel=3&stream=0.sdp',
		'rtsp://220.132.94.244/user=admin&password=&channel=4&stream=0.sdp',
		'rtsp://220.132.94.244/user=admin&password=&channel=5&stream=0.sdp',
		'rtsp://60.251.229.163/user=admin&password=&channel=1&stream=0.sdp',
		'rtsp://60.251.229.163/user=admin&password=&channel=2&stream=0.sdp',
		'rtsp://60.251.229.163/user=admin&password=&channel=3&stream=0.sdp',
		'rtsp://60.251.229.163/user=admin&password=&channel=4&stream=0.sdp',
		'rtsp://60.251.229.163/user=admin&password=&channel=5&stream=0.sdp',
		'rtsp://60.251.229.163/user=admin&password=&channel=6&stream=0.sdp',
		'rtsp://60.251.229.163/user=admin&password=&channel=7&stream=0.sdp',
		'rtsp://60.251.229.163/user=admin&password=&channel=9&stream=0.sdp',
		'rtsp://60.251.229.163/user=admin&password=&channel=10&stream=0.sdp',
		'rtsp://60.251.229.163/user=admin&password=&channel=11&stream=0.sdp',
		'rtsp://60.251.229.163/user=admin&password=&channel=12&stream=0.sdp',
		'rtsp://59.126.20.93/user=admin&password=&channel=1&stream=0.sdp',

		'rtsp://59.126.20.93/user=admin&password=&channel=2&stream=0.sdp',
		'rtsp://59.126.20.93/user=admin&password=&channel=3&stream=0.sdp',
		'rtsp://59.126.20.93/user=admin&password=&channel=4&stream=0.sdp',
		'rtsp://59.126.20.93/user=admin&password=&channel=5&stream=0.sdp',
		'rtsp://59.126.20.93/user=admin&password=&channel=6&stream=0.sdp',

		'rtsp://122.117.242.57/user=admin&password=&channel=1&stream=0.sdp',
		'rtsp://122.117.242.57/user=admin&password=&channel=2stream=0.sdp',
		'rtsp://122.117.242.57/user=admin&password=&channel=3&stream=0.sdp',
		'rtsp://122.117.242.57/user=admin&password=&channel=4&stream=0.sdp',
		'rtsp://122.117.242.57/user=admin&password=&channel=5&stream=0.sdp',
		'rtsp://122.117.242.57/user=admin&password=&channel=6&stream=0.sdp',
		'rtsp://122.117.242.57/user=admin&password=&channel=7&stream=0.sdp',
		'rtsp://122.117.242.57/user=admin&password=&channel=8&stream=0.sdp',

		'rtsp://106.107.181.243/user=admin&password=&channel=4&stream=0.sdp',
		'rtsp://106.107.181.243/user=admin&password=&channel=5&stream=0.sdp',
		'rtsp://106.107.181.243/user=admin&password=&channel=6&stream=0.sdp',

		'rtsp://192.168.1.200/user=admin&password=&channel=4&stream=0.sdp',
		'rtsp://192.168.1.200/user=admin&password=&channel=3&stream=0.sdp',
		'rtsp://192.168.1.200/user=admin&password=&channel=2&stream=0.sdp'
	].map(function(uri, i) {
		var stream = new rtsp.FFMpeg({input: uri, resolution: '1280*720', quality: 14});
		stream.on('start', function() {
			console.log('stream ' + i + ' started');
		});
		stream.on('stop', function() {
			console.log('stream ' + i + ' stopped');
		});
		return stream;
	})

	function sleep(waitMsec) {
		var startMsec = new Date()
		while (new Date() - startMsec < waitMsec) {}
	}

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
	})
	sleep(250)
});

io.on('connection', function(socket) {
	socket.emit('start', cams.length);
});

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});
