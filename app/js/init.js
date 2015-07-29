'use strict';

var React = require('react');
var Player = require('./player');
var simpleStream = require('simple-stream');
var Stream = simpleStream.Stream;

React.render(
  <Player isFollowingStream={Stream()} broadcastNameStream={Stream()} isBroadCastingStream={Stream()} />,
  document.getElementById('player')
);
