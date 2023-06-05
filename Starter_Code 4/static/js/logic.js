// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


// Perform a GET request to the query URL.
d3.json(queryUrl).then(function (data) {
  console.log(data.features);
  // Using the features array sent back in the API data, create a GeoJSON layer, and add it to the map.

  // 1.
  // Pass the features to a createFeatures() function:
  createFeatures(data.features);

});

// A function to determine the marker size based on the population
function markerSize(magnitude) {
  return Math.max(3, magnitude * 5);
}

function markerColor(feature) {
  let depth = feature.geometry.coordinates[2];

  if (depth > 100) {
    return "#ff6600";
  } else if ( depth > 75) {
    return "#ff9933";
  } else if (depth > 50) {
    return "#ffcc00";
  } else if (depth > 25) {
    return "#ffff00";
  } else {
    return "#cccc00";
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
    fillOpacity: .9,
    fillColor: markerColor(feature),
    color: "#000000",
    radius: markerSize(feature.properties.mag)
    // stroke: true,
    // weight: 0.5
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

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlays object.
  let overlayMaps = {
    Earthquakes: earthquakes
  }

  // Create a new map.
  // Edit the code to add the earthquake data to the layers.
  let myMap = L.map("map", {
    center: [
      39.09, -117.71
    ],
    zoom: 4.6,
    layers: [street, earthquakes]
  });

  L.control.Legend({
    position: "bottomleft",
    legends: [{
        label: "Marker1",
        type: "circle",
        url: "marker/marker-red.png",
    }]
  }).addTo(map);

  // Create a layer control that contains our baseMaps.
  // Be sure to add an overlay Layer that contains the earthquake GeoJSON.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  
}





// // let baseURL = "https://data.cityofnewyork.us/resource/fhrw-4uyv.json?";
// // let date = "$where=created_date between'2016-01-01T00:00:00' and '2017-01-01T00:00:00'";
// let magnitude = earthquakes.features.properties.mag
// let depth = earthquakes.features.geometry.coordinates

// // Assemble the API query URL.
// let url = queryURL + date + complaint + limit;

// // Get the data with d3.
// d3.json(url).then(function(response) {

//   // Create a new marker cluster group.
//   let markers = L.markerClusterGroup();

//   // Loop through the data.
//   for (let i = 0; i < response.length; i++) {

//     // Set the data location property to a variable.
//     let location = response[i].location;

//     // Check for the location property.
//     if (location) {

//       // Add a new marker to the cluster group, and bind a popup.
//       markers.addLayer(L.marker([location.coordinates[1], location.coordinates[0]])
//         .bindPopup(response[i].descriptor));
//     }

//   }

//   // Add our marker cluster layer to the map.
//   myMap.addLayer(markers);

// });