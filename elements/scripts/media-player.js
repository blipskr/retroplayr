document.addEventListener("DOMContentLoaded", function() { initialiseMediaPlayer(); }, false);
var mediaPlayer;
function initialiseMediaPlayer() {
    mediaPlayer = document.getElementById('media-video');
    mediaPlayer.controls = true;
}

function togglePlayPause() {
    var btn = document.getElementById('play-pause-button');
    if (mediaPlayer.paused || mediaPlayer.ended) {
       btn.title = 'pause';
           btn.innerHTML = 'pause';
           btn.className = 'pause';
           mediaPlayer.play();
        }
        else {
           btn.title = 'play';
           btn.innerHTML = 'play';
           btn.className = 'play';
           mediaPlayer.pause();
        }
     }

     function changeButtonType(btn, value) {
        btn.title = value;
        btn.innerHTML = value;
        btn.className = value;
     }

     function stopPlayer() {
        mediaPlayer.pause();
        mediaPlayer.currentTime = 0;
     }

     function changeVolume(direction) {
        if (direction === '+') mediaPlayer.volume += mediaPlayer.volume == 1 ? 0 : 0.1;
        else mediaPlayer.volume -= (mediaPlayer.volume == 0 ? 0 : 0.1);
        mediaPlayer.volume = parseFloat(mediaPlayer.volume).toFixed(1);
     }


     function toggleMute() {
        var btn = document.getElementById('mute-button');
        if (mediaPlayer.muted) {
           changeButtonType(btn, 'mute');
           mediaPlayer.muted = false;
        }
        else {
           changeButtonType(btn, 'unmute');
           mediaPlayer.muted = true;
        }
     }



     function replayMedia() {
        resetPlayer();
        mediaPlayer.play();
     }


     function resetPlayer() {
        mediaPlayer.currentTime = 0;
        changeButtonType(playPauseBtn, 'play');
     }


     mediaPlayer.addEventListener('timeupdate', updateProgressBar, false);


function updateProgressBar() {
    var progressBar = document.getElementById('progress-bar');
    var percentage = Math.floor((100 / mediaPlayer.duration) *
    mediaPlayer.currentTime);
    progressBar.value = percentage;
    progressBar.innerHTML = percentage + '% played';
}

     function resetPlayer() {
        progressBar.value = 0;
        mediaPlayer.currentTime = 0;
        changeButtonType(playPauseBtn, 'play');
     }

     mediaPlayer.addEventListener('play', function() {
        var btn = document.getElementById('play-pause-button');
        changeButtonType(btn, 'pause');
     }, false);

     mediaPlayer.addEventListener('pause', function() {
        var btn = document.getElementById('play-pause-button');
        changeButtonType(btn, play);
     }, false);


     mediaPlayer.addEventListener('volumechange', function(e) {
        var btn = document.getElementById('mute-button');
        if (mediaPlayer.muted) changeButtonType(btn, 'unmute');
        else changeButtonType(btn, 'mute');
     }, false);


     function loadVideo() {
        for (var i = 0; i < arguments.length; i++) {
           var file = arguments[i].split('.');
           var ext = file[file.length - 1];
           if (canPlayVideo(ext)) {
              resetMediaPlayer();
              mediaPlayer.src = arguments[i];
              mediaPlayer.load();
              break;
           }
        }
     }


     function canPlayVideo(ext) {
        var ableToPlay = mediaPlayer.canPlayType('video/' + ext);
        if (ableToPlay == '') return false;
        else return true;
     } 
