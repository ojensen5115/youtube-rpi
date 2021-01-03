# youtube-rpi

A system to play audio from youtube videos on a Raspberry Pi.

Do you have a Raspberry Pi media center? Do you want to play music from youtube videos? You could play a youtube video from X... but you'd need to turn on a screen, fire up a browser, watch a video, etc. You could download it with youtube-dl, extract the audio, then play it from mpd... but that's a pain. You could connect your phone via bluetooth and play the video on your phone... but then your phone needs to be playing the video.

This application is a small webserver designed to run on a Raspberry Pi that allows you to search YouTube and select videos whose audio you would like to play on-device, without needing X, a browser, or anything. Also no ads.

Dependencies:
* vlc (`apt install vlc`)
* the stuff in the requirements file (`pip install -r requirements.txt`)