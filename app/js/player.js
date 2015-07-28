'use strict';

var React = require('react');
var SpaceJam = require('../../plugins/space-jam-music-source/src/index');
var SoundCloud = require('../../plugins/soundcloud/src/index');
var sc;

window.SoundCloud = SoundCloud

SoundCloud.MusicSource.playSong('soundcloud:https://soundcloud.com/southeastern-records/24-frames').then(function(SongController) {
  sc = SongController;
});

module.exports = React.createClass({
  onPlay: function() {
    sc.play();
  },
  onPause: function() {
    sc.pause();
  },
  render: function() {
    return (
      <div className="player">
        <button onClick={this.onPlay}>Play</button>
        <button onClick={this.onPause}>Pause</button>
      </div>
    );
  }
});
