// Store our API endpoint as queryUrl.
const QUERY_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

const PLATE_QUERY_URL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

const COLOR_DEPTHS = [0, 25, 50, 75, 100];
const COLOR_COLORS = [
  "#cccc00",
  "#ffff00",
  "#ffcc00",
  "#ff9933",
  "#ff6600"      
];


// Perform a GET request to the query URL.
d3.json(QUERY_URL).then(function (data) {
  console.log(data.features);
  // Using the features array sent back in the API data, create a GeoJSON layer, and add it to the map.

  // 1.
  // Pass the features to a createFeatures() function:
  createFeatures(data.features);



  // A function to determine the marker size based on the population
  function markerSize(magnitude) {
    return Math.max(3, magnitude * 5);
  }

  function markerColor(feature) {
    let depth = feature.geometry.coordinates[2];

    if (depth > COLOR_DEPTHS[4]) {
      return COLOR_COLORS[4];
    } else if ( depth > COLOR_DEPTHS[3]) {
      return COLOR_COLORS[3];
    } else if (depth > COLOR_DEPTHS[2]) {
      return COLOR_COLORS[2];
    } else if (depth > COLOR_DEPTHS[1]) {
      return COLOR_COLORS[1];
    } else {
      return COLOR_COLORS[0];
    }

  }

  function popupContent(feature) {
    let date = new Date(feature.properties.time * 1000);
    let prop = feature.properties;
    let content = `Magnitude: ${prop.mag}<br>
                    Location: ${prop.place}<br>
                    Time: ${date}<br>
                    Depth(km): ${feature.geometry.coordinates[2]}`
    return content;
  }

  function pointToLayer(feature, latlng) {
    let marker = L.circleMarker(latlng);
    return marker;
  }

  function markerStyle(feature) {
    let style = {
      opacity: 1,
      fillOpacity: .6,
      fillColor: markerColor(feature),
      color: "#000000",
      radius: markerSize(feature.properties.mag),
      // stroke: true,
      weight: 1
    };
    return style;
  }

  function makePopUp(feature, layer) {
    layer.bindPopup(popupContent(feature));
  }

  // 2.
  function createFeatures(earthquakeData) {
    let featureStyle = {
      pointToLayer: pointToLayer,
      style: markerStyle,
      onEachFeature: makePopUp
    };

    // Save the earthquake data in a variable.
    let earthquakes = L.geoJSON(earthquakeData, featureStyle);

    // Pass the earthquake data to a createMap() function.
    createMap(earthquakes);

  }


  // 3.
  // createMap() takes the earthquake data and incorporates it into the visualization:

  function createMap(earthquakes) {
    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    var plates = new L.LayerGroup();

    // Create a baseMaps object.
    let baseMaps = {
      "Street Map": street,
      "Topographic Map": topo
    };

    // Create an overlays object.
    let overlayMaps = {
      Earthquakes: earthquakes,
      Plates: plates
    }

    // Create a new map.
    // Edit the code to add the earthquake data to the layers.
    let myMap = L.map("map", {
      center: [
        39.09, -117.71
      ],
      zoom: 4.6,
      layers: [street, earthquakes, plates]
    });

    // function getColor(d) {
    //   return d > 5 ? 'red' :
    //       d > 4 ? '#E64A19' :
    //       d > 3 ? '#EF6C00' :
    //       d > 2 ? '#FFA000' :
    //       d > 1 ? '#FFF176' :
    //       '#81C784';
    // }

    // function createLegend() {
        // Set up the legend
    let legend = L.control({
          position: 'bottomleft'
        });

        legend.onAdd = function() {
            let div = L.DomUtil.create('div', 'info legend');


            // loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 0; i < COLOR_DEPTHS.length; i++) {
                div.innerHTML +=
                    '<i class="circle" style="background-color:' + COLOR_COLORS[i] + '">&emsp; &emsp;</i>' +
                    COLOR_DEPTHS[i] + " km" + (COLOR_DEPTHS[i + 1] ? ' &ndash; ' + COLOR_DEPTHS[i + 1] + " km" + '<br>' : '+');
            }
            return div;
        };
        // return legend;
    legend.addTo(myMap)
    // createLegend().addTo(myMap)

    

    // Create a layer control that contains our baseMaps.
    // Be sure to add an overlay Layer that contains the earthquake GeoJSON.
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);


    // Add tectonic plates
    d3.json(PLATE_QUERY_URL).then(function(platedata) {
 
      L.geoJson(platedata, {
        color: "orange",
        weight: 2
      })
      .addTo(plates);
      
      });

}});
