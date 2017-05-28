var _ = require('underscore');
var Long = require('long');
var React = require('react');
var ReactDOM = require('react-dom');
var Controls = require('./controls');
var S2Map = {};

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
// These would be a good use case for promises.
window.DangerousEventCombinedRegion = {};
window.DevicePath = {};

S2Map.init = function() {
  var sv = {lat: 37.4, lng: -122};
  var map = new google.maps.Map(document.getElementById('map'), {
     zoom: 10,
     center: sv
  });
  S2Map.map = map;

  window.DeviceSample = _.groupBy(
    _.filter(
      window.Sample.data,
      // 1000000000000001 is a valid S2 cell id, but in this data set it is
      // used to represent an "unknown" location (e.g. due to poor GPS signal)
      message => { 
        return message.event[2] != "1000000000000001" &&
          message.event[4] == 'vehicle-state'
      }
    ),
    message => message.event[1]
  );
  _.each(
    window.DeviceSample,
    function(devicePath, deviceId) {
      window.DevicePath[deviceId] = new google.maps.Polyline({
        path: _.map(devicePath, S2Map.getLatLngForMessage),
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: S2Map.map
      });
    }
  );

  window.DangerousEventSample = _.groupBy(
    _.filter(
      window.Sample.data,
      message => (message.event[2] != "1000000000000001" && 
      _.contains(_.keys(dangerousEvent), message.event[4]))
    ),
    message => message.event[4]
  );
  
  // Tye's email describes the message format as
  // [message_id, device_id, s2_cell_id, message_params], but it's actually
  // [message_id, device_id, s2_cell_id, message_params, event_type]
  _.each(
    window.DangerousEventSample,
    function(dangerousEvents, eventType) {
      var combinedRegions = {};
      _.each(
        dangerousEvents,
        function(message) {
          var key = S2Map.getKeyForMessage(message);
          var combinedKey = S2Map.getKeyForMessage(message)
            .slice(0, 20) + "10";
          if (combinedRegions[combinedKey]) {
            return;
          }
          var corners = S2Geometry.S2.S2Cell.FromHilbertQuadKey(combinedKey).getCornerLatLngs();
          corners[4] = corners[0];
          var combinedRegion = new google.maps.Polygon({
            paths: corners,
            strokeColor: dangerousEvent[message.event[4]].color,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: dangerousEvent[message.event[4]].color,
            fillOpacity: .2,
            map: S2Map.map
          });
          combinedRegions[combinedKey] = {
            corners: corners,
            region: combinedRegion
          };
        }
      );
      window.DangerousEventCombinedRegion[eventType] = combinedRegions;
    }
  );
};

S2Map.getKeyForMessage = function(message) {
  return S2Geometry.S2.idToKey(
    Long.fromString(message.event[2], true, 16).toString());
}

S2Map.getLatLngForMessage = function(message) {
  return S2Geometry.S2.keyToLatLng(
    S2Map.getKeyForMessage(message));
};

S2Map.getCornersForMessage = function(message) {
  return S2Geometry.S2.S2Cell
    .FromHilbertQuadKey(S2Map.getKeyForMessage(message))
    .getCornerLatLngs();
};

window.S2Map = S2Map;
window.S2Geometry = require('s2-geometry');

if (window.googleMapLoaded) {
  window.S2Map.init();
}

ReactDOM.render(
  React.createElement(
    Controls,
    {
      devicePath: window.DevicePath,
      dangerousEventRegions: window.DangerousEventCombinedRegion,
      getMap: () => window.S2Map.map
    }),
  document.getElementById('controls'));

