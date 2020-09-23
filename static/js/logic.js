// Get the dataset for the visualization using the URL of this JSON
// select 'All Earthquakes from the Past 7 Days' https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
    console.log(data.features);
  });


// First, set up the features about the data markers -- radius sizes, colour shades
function createFeatures(earthquakeData) {

    // Include popups that provide additional information about the earthquake when a marker is clicked.
    function onEachFeature(feature, layer) {
        // 'place' contains the address
        layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    // Data markers should reflect the magnitude of the earthquake in their size and color. 

    // Function to determine marker size based on population
    function markerSize(magintude) {
        return magintude * 8000;
    }

    // Define function to set the circle color based on the magnitudes according to the reference map screenshot
    //Earthquakes with higher magnitudes should appear larger and darker in color.
    function circleColor(magnitude) {
        if (magnitude < 1) {
          return "#ccff33"
        }
        else if (magnitude < 2) {
          return "#ffff33"
        }
        else if (magnitude < 3) {
          return "#ffcc33"
        }
        else if (magnitude < 4) {
          return "#ff9933"
        }
        else if (magnitude < 5) {
          return "#ff6633"
        }
        else {
          return "#ff3333"
        }
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function(earthquakeData, latlng) {
            return L.circle(latlng, {
              radius: markerSize(earthquakeData.properties.mag),
              color: circleColor(earthquakeData.properties.mag),
              fillOpacity: 0.7
            });
        },
        onEachFeature: onEachFeature
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

// Create a map using Leaflet that plots all of the earthquakes from your data set based on their longitude and latitude.
function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Create a legend that will provide context for the map data.
  var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            magnitude = [0, 1, 2, 3, 4, 5],
            labels = [];

        div.innerHTML += "<h4 style='margin:4px'>Magnitude</h4>"

        for (var i = 0; i < magnitude.length; i++) {
            div.innerHTML +=
                '<i style="background:' + Color(magnitude[i] + 1) + '"></i> ' +
                magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
        }

        return div;
    };
    legend.addTo(mymap);

}


