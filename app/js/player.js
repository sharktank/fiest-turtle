'use strict';

var React = require('react');
var SpaceJam = require('../../plugins/space-jam-music-source/src/index');
var sc;

SpaceJam.MusicSource.playSong('spacejam:windfall').then(function(SongController) {
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

