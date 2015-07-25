var videoID = "dQw4w9WgXcQ";

var SongId = "youtube:"+videoID;

var UNSTARTED = -1;
var ENDED = 0;
var PLAYING=1;
var PAUSED=2;
var BUFFERING=3;
var VIDEO_CUED=5;

function loadJS(src, callback) {
    var s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onreadystatechange = s.onload = function() {
        var state = s.readyState;
        if (!callback.done && (!state || /loaded|complete/.test(state))) {
            callback.done = true;
            callback();
        }
    };
    document.getElementsByTagName('head')[0].appendChild(s);
}

function waitUntilYTLoads(callback) {
  if (YT.Player != null){
    callback()
  } else {
    setTimeout(waitUntilYTLoads.bind(null,callback), 500);
  }
}

// A function to make streams for us
var StreamMaker = function(){
  var registeredListeners = [];
  return {
    // Have an observe function, so
    // people who are interested can
    // get notified when there is an update
    observe: function(callback){
      registeredListeners.push(callback)
    },

    // Add a value to this stream
    // Once added, will notify all
    // interested parties
    update: function(value){
      registeredListeners.forEach(function(cb){
        cb(value);
      })
    }
  }
}

var randomStr = function(){
  return btoa((Math.random()+"").substr(2));
}

// Sets up a youtube iframe, and returns a promise
// containing a player obj
var YoutubeSetup = function(videoID) {
  return new Promise(function(resolve, reject){
    // TODO handle failed network error
    var playerContainer = document.createElement("div");
    var domID = randomStr();
    playerContainer.id = domID;
    document.body.appendChild(playerContainer);

    loadJS("https://www.youtube.com/iframe_api",
    waitUntilYTLoads.bind(null, function(){
      console.log("Player: ", YT.Player)
      console.log("Playing: ", videoID)
      var player = new YT.Player(playerContainer.id, {
        height: '0',
        width: '0',
        videoId: videoID,
        events: {
          'onReady': function(){
            document.getElementById(domID).style.display="none"
            resolve(player);
          },
          'onStateChange': function(stateChange){
            // TODO: figure out what state changes this emits, and emit our own types
            console.log("Emitting state: ", stateChange);
          }
        }
      });
    }))
})
}

var playerToMeta = function(player){
  var data = player.getVideoData();
  var meta = {};
  meta.name = data.title;
  meta.artist = data.author;
  meta.album = player.getVideoUrl();
  meta.duration = player.getDuration();
  return meta;
}

var SongControllerMaker = function(videoID, resolve, reject){
  var updateStream = StreamMaker();
  // This function creates an <iframe> (and YouTube player)
  // after the API code downloads.


  YoutubeSetup(videoID).then(function(player){

    // update while song is playing
    var timeUpdates = setInterval(function(){
      if (player.getPlayerState() === ENDED) {
        updateStream({
          type:"SongFinished"
        })
      } else if (player.getPlayerState() === PLAYING){
        updateStream.update({
          type:"SongPlaying",
          time:player.getCurrentTime()
        });
      }
    }, 1e3);

    resolve({
      play: function(){
        player.playVideo();
        updateStream.update({type:"SongPlayed"});
      },
      pause: function(){
        player.pauseVideo();
        updateStream.update({type:"SongPaused"});
      },
      jumpTo: function(timeInSeconds){
        player.seekTo(timeInSeconds, true);
        updateStream.update({
          type:"SongPlaying",
          time:timeInSeconds
        });
      },
      getId: function(){
        return videoID;
      },
      getMeta: function(){
        // TODO
        return playerToMeta(player);
      },
      getPlayer: function(){
        return player;
      },
      onPlayUpdate: function(cb){
        updateStream.observe(cb);
      },
      cleanUp: function(){
        player.destroy();
      },
    });
  }).catch(reject);
}

var MusicSource = {
  playSong: function(id){
    return new Promise(function(resolve, reject){
      var videoID = id.substr(id.indexOf(":")+1)
      SongControllerMaker(videoID, resolve, reject);
    })
  },
  songInfo: function(songId){
    return SongMeta
  },
  searchSongs: function(query){
    return [SongId]
  }
}

module.exports.MusicSource = MusicSource;
