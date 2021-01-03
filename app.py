import json

import pafy
import vlc

from youtube_search import YoutubeSearch
from flask import Flask
from flask import request, render_template, make_response

app = Flask(__name__)

# Raspberry Pi: 0 is HDMI, 1 is Analog
sound_card = 1

vlc_volume = 80
vlc_player = None
vlc_instance = None
video = None

def initialize_vlc(card=0):
	global vlc_player
	global vlc_instance

	vlc_instance = vlc.Instance()
	vlc_player = vlc_instance.media_player_new()
	devices = []
	mods = vlc_player.audio_output_device_enum()
	if mods:
	    mod = mods
	    while mod:
	        mod = mod.contents
	        devices.append(mod.device)
	        mod = mod.next
	vlc.libvlc_audio_output_device_list_release(mods)
	vlc_player.audio_output_device_set(None, devices[card])
	vlc_player.audio_set_volume(vlc_volume)


initialize_vlc(sound_card)


@app.route('/', methods=['GET'])
def index():
	global vlc_player
	global video
	return render_template('home.html')

@app.route('/search', methods=['GET'])
def search():
	term = request.args.get('search', "")
	results = YoutubeSearch(term, max_results=10)
	return render_template('results.html', term=term, results=results)

@app.route('/playerdata')
def playerdata():
	global vlc_player
	global video

	data = {
		'volume': vlc_player.audio_get_volume(),
		'status': vlc_player.is_playing(),
		'position': False,
		'length': False,
		'title': False,
		'thumb': False,
	}

	if video:
		data['position'] = vlc_player.get_time()
		data['length'] = vlc_player.get_length()
		data['title'] = video.title
		data['thumb'] = video.bigthumb

	return json.dumps(data)


@app.route('/play/<video_id>')
def play(video_id=None):
	global vlc_player
	global video
	# url = "https://www.youtube.com/watch?v=RknoDIN4j04"
	url = "https://www.youtube.com/watch?v={}".format(video_id)
	video = pafy.new(url)
	best = video.getbestaudio()
	vlc_player.set_mrl(best.url)
	vlc_player.play()
	return make_response("audio is playing", 204)

@app.route('/stop')
def stop():
	global vlc_player
	vlc_player.stop()
	return "Player stopped"

@app.route('/volume', methods=['POST'])
def volume():
	global vlc_player
	vol = int(request.form.get('vol'))
	vlc_player.audio_set_volume(vol)
	return "Volume set to {}".format(vol)

@app.route('/seek', methods=['POST'])
def seek():
	global vlc_player
	seek = int(request.form.get('seek'))
	vlc_player.set_time(seek)
	return "Seeked to {}".format(seek)

@app.route('/control', methods=['POST'])
def control():
	global vlc_player
	action = request.form.get('action')
	if action == 'pause':
		vlc_player.pause()
		return "Pause toggled"
	if action == 'stop':
		vlc_player.stop()
		return "Stopped"
