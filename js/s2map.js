var S2Map = {};
S2Map.init = function() {
  var florida = {lat: 29, lng: -82};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 7,
    center: florida
  });
  var marker = new google.maps.Marker({
    position: florida,
    map: map
  });
};

window.S2Map = S2Map;
window.S2Geometry = require('s2-geometry');

if (window.googleMapLoaded) {
  window.S2Map.init();
}
