var clientID = "451c998c1c9daf78a255d0900d35000f"
var SC = require("./SCSDK")
var Widget = require("./playerAPI")

var randomStr = function(){
  return btoa((Math.random()+"").substr(2));
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

var playerToMeta = function(player){
  var data = player.getVideoData();
  var meta = {};
  meta.name = data.title;
  meta.artist = data.author;
  meta.album = player.getVideoUrl();
  meta.duration = player.getDuration();
  return meta;
}

var SongControllerMaker = function(songURL, resolve, reject){
  var updateStream = StreamMaker();

  var playerContainer = document.createElement("iframe");
  var domID = randomStr();
  playerContainer.id = domID;
  playerContainer.src = "https://w.soundcloud.com/player/?url="+songURL;
  document.body.appendChild(playerContainer);
  playerContainer.style.display = "none";
  var player = SC.Widget(domID);

  // update while song is playing
  var timeUpdates = setInterval(function(){
    player.isPaused(function(isPaused){
      player.getPosition(function(positionInMillis){
        if (!isPaused){
          updateStream.update({
            type:"SongPlaying",
            time:positionInMillis/1000
          });
        }
      })
    })
  }, 1e3);

  player.bind(SC.Widget.Events.PLAY_PROGRESS, function(playProgress){
    updateStream.update({
      type:"SongPlaying",
      time:playProgress.currentPosition/1000
    });
  })
  resolve({
    play: function(){
      player.play();
      updateStream.update({type:"SongPlayed"});
    },
    pause: function(){
      player.pause();
      updateStream.update({type:"SongPaused"});
    },
    jumpTo: function(timeInSeconds){
      player.seekTo(timeInSeconds*1000);
      updateStream.update({
        type:"SongPlaying",
        time:timeInSeconds
      });
    },
    getId: function(){
      return "soundcloud:"+songURL;
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
      document.body.removeChild(audio);
      clearInterval(timeUpdates);
    },
  });
}

var MusicSource = {
  playSong: function(id){
    return new Promise(function(resolve, reject){
      var songURL = id.substr(id.indexOf(":")+1)
      SongControllerMaker(songURL, resolve, reject);
    })
  },
  songInfo: function(songId){
    return {}
  },
  searchSongs: function(query){
    return new Promise(function(resolve, reject){
      SC.get('/tracks', { q: query }, function(tracks) {
        console.log("Search: ", tracks);
        resolve(tracks.map(function(track){
          return {
            name: track.title,
            songID: track.permalink_url,
            Artist: track.user.permalink,
            Album: track.tag_list,
            AlbumArt: track.artwork_url,
            AlbumArt64 : null,
            Duration : track.duration
          }
        }));

        resolve(tracks);
      });
    })
  }
}

module.exports.MusicSource = MusicSource;
