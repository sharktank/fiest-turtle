'use strict';

var React = require('react');

var Player = React.createClass({
  render: function() {
    return (
      <div className="player">
        Hello, world!
      </div>
    );
  }
});

React.render(
  <Player />,
  document.getElementById('player')
);
