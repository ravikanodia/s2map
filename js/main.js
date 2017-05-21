requirejs(['s2map', './s2geometry', './sample'],
  function(s2map, s2geometry, sample) {
    console.log("main running. s2geometry: " + s2geometry);
    window.S2Map = s2map;
    window.S2Geometry = s2geometry;
    window.Sample = sample;
  });
