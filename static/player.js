var get = function(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
			if (xhr.status == 200 || xhr.status == 204) {
				callback(xhr.responseText);
			}
			else {
				alert('There was an error');
			}
		}
	};
	xhr.open("GET", url, true);
	xhr.send();
};

var post = function(url, data, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
			if (xhr.status == 200) {
				if (callback) {
					callback(xhr.responseText);
				}
			} else {
				alert('There was an error');
			}
		}
	};

	var postdata = new FormData();
	for (key in data) {
		postdata.append(key, data[key]);
	}
	xhr.open("POST", url, true);
	xhr.send(postdata);
};

var delegate = function(eventType, selector, handler) {
    return document.body.addEventListener(eventType, function(event) {
            var children = document.body.querySelectorAll(selector);
            for (var i = 0; i < children.length; i++) {
                if (children[i].contains(children[i], event.target)) {
                    handler(event, children[i]);
                    break;
                }
            }
        }
    );
};


var volume_control = document.getElementById('volume_control');
var seek_control = document.getElementById('seek_control');

var volume_display = document.getElementById('volume_display');
var seek_display = document.getElementById('seek_display');
var title_display = document.getElementById('title_display');
var image_display = document.getElementById('image_display');

var player_data = false;
var playing = false;
var tick_interval = false;


volume_control.addEventListener('change', function(e) {
	post('/volume', {'vol': e.target.value});
	player_data['volume'] = parseInt(e.target.value, 10);
	updatePlayerInterface();
});

seek_control.addEventListener('change', function(e) {
	post('/seek', {'seek': e.target.value});
	player_data['position'] = parseInt(e.target.value, 10);
	updatePlayerInterface();
	refreshPlayerData();
});

var refreshPlayerData = function() {
	get('/playerdata', function(data) {
		player_data = JSON.parse(data);
		updatePlayerInterface(player_data);
	});
};

var advancePlayerInterface = function() {
	console.log('advancing');
	if (player_data['status']) {
		player_data['position'] += 1000;
		updatePlayerInterface(player_data);
	}
};

var updatePlayerInterface = function(data) {
	volume_control.value = data['volume'];
	volume_display.textContent = data['volume'];

	if (data['length']) {
		// update seeker
		seek_control.setAttribute('max', data['length']);
		seek_control.value = data['position'];
		seek_display.textContent = friendlyTime(data['position']) + '/' + friendlyTime(data['length']);

		// update image thumbnail and title
		if (data['thumb']) {
			image_display.src = data['thumb'];
		}
		if (data['title']) {
			title_display.textContent = data['title'];
		}
	}

	if (playing && data['status'] == 0) {
		pause_player_tick();
	}
	if (!playing && data['status'] == 1) {
		resume_player_tick();
	}
};

var pause_player_tick = function() {
	playing = false;
	clearInterval(tick_interval);
};

var resume_player_tick = function() {
	playing = true;
	setInterval(advancePlayerInterface, 1000);
};

var friendlyTime = function(ms) {
	var seconds = Math.floor(ms / 1000);
	var hours = Math.floor(seconds / 3600);
	var seconds = seconds - hours * 3600;
	var minutes = Math.floor(seconds / 60);
	var seconds = seconds - minutes * 60;
	var output = []
	if (hours) {
		return hours + ":" + ("00"+minutes).substr(-2) + ":" + ("00" + seconds).substr(-2);
	} else if (minutes) {
		return minutes + ":" + ("00" + seconds).substr(-2);
	} else {
		return "" + seconds;
	}
};

refreshPlayerData();
setInterval(refreshPlayerData, 3 * 1000);

delegate('click', '.playsong', function(event, element) {
	window.scrollTo(0,0);
});



