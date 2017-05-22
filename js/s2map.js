var _ = require('underscore');

var Long = require('long');
var S2Map = {};

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
        strokeWeight: 2
      });
      return devicePolyline;
    }
  );

  for (var i in window.DevicePath) {
    window.DevicePath[i].setMap(S2Map.map);
  }

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
