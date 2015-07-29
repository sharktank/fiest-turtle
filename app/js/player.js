'use strict';

var React = require('react');
var Firebase = require("firebase");
var SpaceJam = require('../../plugins/space-jam-music-source/src/index');
var simpleStream = require('simple-stream');
var Stream = simpleStream.Stream;
var mergeStreams = simpleStream.mergeStreams;
var sc;
var songID = 'spacejam:windfall'

var fbRef = new Firebase("https://fiesta-turtle.firebaseio.com/");

// Stream that updates when a user is playing
// TODO fix this along with the sc hack
var playingStream = Stream();

SpaceJam.MusicSource.playSong(songID).then(function(SongController) {
  sc = SongController;
  sc.onPlayUpdate(function(update){
    if (update.type == "SongPlaying") {
      playingStream.update(update);
    }
  });

});

module.exports = React.createClass({
  componentWillMount: function(){
    this.props.isFollowingStream.observe(function(isFollowing){
      this.setState({isFollowing:isFollowing});
    }.bind(this));

    this.props.isBroadCastingStream.observe(function(isBroadcasting){
      this.setState({isBroadcasting: isBroadcasting});
    }.bind(this));

    var broadcastingAndBroadcastNameStream = mergeStreams(this.props.broadcastNameStream, this.props.isBroadCastingStream,
      function(broadcastName, isBroadcasting){
        return isBroadcasting ? broadcastName : null;
      }
    );

    var playingAndBroadcastStream = mergeStreams(playingStream, broadcastingAndBroadcastNameStream,
      function(playUpdate, broadcastName){
        if (broadcastName != null && playUpdate != null) {
          console.log("Broadcasting song!")
          fbRef.child(broadcastName).set({
            songMeta: {songID: songID},
            currentSeek: playUpdate.time,
            nextSong: null
          })
        }
      }
    )

  },

  getInitialState: function(){
    return {
      isFollowing: false,
      isBroadcasting: false,
      broadcastName: ""
    };
  },

  onFollow: function(){
    if (!this.state.isBroadcasting) {
      this.props.isFollowingStream.update(!this.state.isFollowing);
      var broadcastMessageStream = Stream();
      //TODO fix hacky way of following and not cleaning up after myself
      fbRef.child(this.state.broadcastName).on("value", function(v){
        broadcastMessageStream.update(v.val());
      })

      broadcastMessageStream.observe(function(v){
        console.log("Following along at:", v)
        sc.play();
        sc.jumpTo(v.currentSeek);
      })
    }
  },

  onBroadcast: function(){
    // TODO fix this, since it only allows people to change broadcast names
    // if they unfollow and refollow
    // hack for now
    // since I don't want to debounce broadcast name changes

    if (!this.state.isFollowing) {
      this.props.isBroadCastingStream.update(!this.state.isBroadcasting);
      this.props.broadcastNameStream.update(this.state.broadcastName)
    }
  },

  onPlay: function() {
    sc.play();
  },
  onPause: function() {
    sc.pause();
  },
  updateBroadcastName: function(event) {
    this.setState({broadcastName: event.target.value});
  },
  render: function() {
    return (
      <div className="player">
        <button onClick={this.onPlay}>Play</button>
        <button onClick={this.onPause}>Pause</button>
        <div> You are currently {this.state.isFollowing ? "" : "not"} Following </div>
        <button onClick={this.onFollow}> {this.state.isFollowing ? "un" : ""}follow</button>
        <button onClick={this.onBroadcast}> {this.state.isBroadcasting ? "un" : ""}broadcast!</button>
        <span> broadcast name: </span>
        <input type="text" value={this.state.broadcastName} onChange={this.updateBroadcastName} />
      </div>
    );
  }
});
