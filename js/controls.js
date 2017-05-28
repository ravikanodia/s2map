var _ = require('underscore');
var React = require('react');

class ToggleButton extends React.Component {
  render() {
    return React.createElement(
      'button',
      {
        className: "marker-toggle",
        onClick: this.props.onClick
      },
      this.props.label
    );
  }
};

class Controls extends React.Component {
  constructor(props) {
    super(props);
    
    var contents = {
      shown: {},
      dangerousEventRegions: props.dangerousEventRegions,
      devicePath: props.devicePath,
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

    this.toggleDevicePaths = function() {
      return (unused_event) => {
        var shown = this.state.shown['vehicle-state'];
        var map = shown ? null : this.state.getMap();
        _.each(this.state.devicePath,
          path => { path.setMap(map) });
        this.state.shown['vehicle-state'] = !shown;
      };
    };
  }
  
  render() {
    return React.createElement(
      'div',
      { className: 'toggle-buttons'},
      React.createElement(
        ToggleButton,
        {
          label: "Trip paths",
          onClick: this.toggleDevicePaths()
        }),
      React.createElement(
        ToggleButton,
        {
          label: "Braking Hard",
          onClick: this.createToggleHandler('braking-hard')
        }
      ),
      React.createElement(
        ToggleButton,
        {
          label: "Hard Corner Left",
          onClick: this.createToggleHandler('corner-left-hard')
        }
      ),
      React.createElement(
        ToggleButton,
        {
          label: "Hard Corner Right",
          onClick: this.createToggleHandler('corner-right-hard')
        }
      ),
      React.createElement(
        ToggleButton,
        {
          label: "Severe G Event",
          onClick: this.createToggleHandler('severe-g-event')
        }
      ),
    );
  }
}

module.exports = Controls;
