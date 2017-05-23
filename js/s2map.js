var _ = require('underscore');

var Long = require('long');
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

S2Map.init = function() {
  var florida = {lat: 29, lng: -82};
  var sv = {lat: 37.4, lng: -122};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: sv
  });
  var marker = new google.maps.Marker({
    position: sv,
    map: map
  });

  S2Map.map = map;

  window.DeviceSample = _.groupBy(
    window.Sample.data,
    function(message) {
      return message.event[1];
    });
  window.DevicePath = _.mapObject(
    window.DeviceSample,
    function(devicePath, deviceId) {
      var devicePathCoords =
        _.map(
          _.sortBy(
            _.filter(
              devicePath,
              // 1000000000000001 is a valid S2 cell id, but in this data set
              // it is used to represent an "unknown" location (e.g. due to a
              // poor GPS signal)
              function(message) { return message.event[2] != "1000000000000001"; }
            ),
            function(message) { return message.event[3].video_start; }
          ),
          S2Map.getLatLngForMessage);
      var devicePolyline = new google.maps.Polyline({
        path: devicePathCoords,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: S2Map.map
      });
      return devicePolyline;
    }
  );

  // Tye's email describes the message format as
  // [message_id, device_id, s2_cell_id, message_params], but it's actually
  // [message_id, device_id, s2_cell_id, message_params, event_type]
  window.DangerousEventMarker = _.map(
    _.filter(
      window.Sample.data,
      message => _.contains(_.keys(dangerousEvent), message.event[4])
    ),
   // window.Sample.data,
    message => [message.event[4], new google.maps.Marker({
      position: S2Map.getLatLngForMessage(message),
      map: S2Map.map,
      label: dangerousEvent[message.event[4]].label
    })]
  );

};


S2Map.getLatLngForMessage = function(message) {
  var id = Long.fromString(message.event[2], true, 16).toString();
  var key = S2Geometry.S2.idToKey(id);
  //console.log("raw id: " + message.event[2] + ", converted: " + id + "; key: " + key);
  return S2Geometry.S2.keyToLatLng(key);
};

S2Map.drawPathByDriverId = function(driver) {
  var driverMessages = window.DriverSample[driver];
  if (!driverMessages) {

  }

};


window.S2Map = S2Map;
window.S2Geometry = require('s2-geometry');

if (window.googleMapLoaded) {
  window.S2Map.init();
}
