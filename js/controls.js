var _ = require('underscore');
var React = require('react');

// Email from Tye specified 'left-cornering-hard', 'right-cornering-hard',
// and 'acceleration-hard', but the actual data set uses 'corner-left-hard'
// and 'corner-right-hard', while acceleration is not mentioned.
var dangerousEvent = {
  'acceleration-hard': { color: '#FF0000', label: 'A' },
  'braking-hard': { color: '#FF00FF', label: 'B' },
  'corner-left-hard': { color: '#FFFF00', label: 'L' },
  'corner-right-hard': { color: '#00FFFF', label: 'R' },
  'severe-g-event': { color: '#0000FF', label: 'G' }
};

class TripsButton extends React.Component {
  render() {
    return React.createElement(
      'button',
      {
        className: "trip-button",
        onClick: this.props.onClick
      },
      'Trip Outlines'
    );
  }
}

class DangerousEventButton extends React.Component {
  render() {
    return React.createElement(
      'button',
      {
        className: "danger-button",
        onClick: this.props.onClick
      },
      this.props.label
    );
  }
};

class DangerousEventButtons extends React.Component {
  constructor(props) {
    super(props);
    
    var contents = {
      shown: {},
      dangerousEventRegions: props.dangerousEventRegions,
      getMap: props.getMap
    }
    this.state = contents;

    this.createToggleHandler = function(eventType) {
      return (unused_event) => {
        var shown = this.state.shown[eventType];
        var map = shown ? null : this.state.getMap();
        _.each(this.state.dangerousEventRegions[eventType],
          regionObject => { regionObject.region.setMap(map) });
        this.state.shown[eventType] = !shown;
      }
    };
  }
  
  render() {
    return React.createElement(
      'div',
      { className: 'dangerous-buttons'},
      React.createElement(
        DangerousEventButton,
        {
          label: "Braking Hard",
          onClick: this.createToggleHandler('braking-hard')
        }
      ),
      React.createElement(
        DangerousEventButton,
        {
          label: "Hard Corner Left",
          onClick: this.createToggleHandler('corner-left-hard')
        }
      ),
      React.createElement(
        DangerousEventButton,
        {
          label: "Hard Corner Right",
          onClick: this.createToggleHandler('corner-right-hard')
        }
      ),
      React.createElement(
        DangerousEventButton,
        {
          label: "Severe G Event",
          onClick: this.createToggleHandler('severe-g-event')
        }
      ),
    );
  }
}

class Controls extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dangerousEventRegions: props.dangerousEventRegions,
      // NB: This is a getter function defined at a higher level, because the
      // actual Map object isn't available at pageload time.
      getMap: props.getMap
    }
  }

  render() {
    return React.createElement(
      'div',
      {},
      React.createElement(TripsButton),
      React.createElement(
         DangerousEventButtons,
         { 
           dangerousEventRegions: this.state.dangerousEventRegions,
           getMap: this.state.getMap
         }));
  }
}

module.exports = Controls;
