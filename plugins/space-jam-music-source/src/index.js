var musicSource = "http://development.windball.divshot.io/windball_files/windfallisland.mp3";

var SongId = "spacejam:windfall"

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
var SongControllerMaker = function(){
  var audio = document.createElement("audio");
  audio.src = musicSource;
  document.body.appendChild(audio);
  var updateStream = StreamMaker();

  // update while song is playing
  var timeUpdates = setInterval(function(){
    if (!audio.paused){
      updateStream.update({
        type:"SongPlaying",
        time:audio.currentTime
      });
    }
  }, 1e3)

  return {
    play: function(){
      audio.play();
      updateStream.update({type:"SongPlayed"});
    },
    pause: function(){
      audio.pause();
      updateStream.update({type:"SongPaused"});
    },
    jumpTo: function(timeInSeconds){
      audio.currentTime = timeInSeconds;
      updateStream.update({
        type:"SongPlaying",
        time:timeInSeconds
      });
    },
    getId: function(){
      return SongId;
    },
    getMeta: function(){
      return SongMeta;
    },
    onPlayUpdate: function(cb){
      updateStream.observe(cb);
    },
    cleanUp: function(){
      document.body.removeChild(audio);
      clearInterval(timeUpdates);
    },
  }
}

var SongMeta = {
  name: "Space Jam",
  artist: "ol' MJ",
  Album: "Space Jambum",
  AlbumArt: "http://www.dudesnews.com/wp-content/uploads/2013/02/R-244574-1304676870.jpg",
  Duration: 307 * 1000 // 307 seconds
}

var MusicSource = {
  playSong: function(id){
    return new Promise(function(resolve, reject){
      if (id === SongId) {
        resolve(SongControllerMaker());
      } else {
        reject({error: "SONG_ID_NOT_FOUND"});
      }
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
