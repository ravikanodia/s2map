#!/bin/bash

browserify -e js/s2map.js -o target/app.js
cp index.html target/index.html
cp s2map.css target/s2map.css
cp js/sample.js target/sample.js
