var driver = neo4j.driver(
    "neo4j+s://3effa4bb.databases.neo4j.io",
    neo4j.auth.basic("neo4j", "hbXCOJhXVAg-74XFppyQVcXhG_1IwP7O4GqeGdN0xVI"),
);

popoto.runner.DRIVER = driver

// Define the list of label provider to customize the graph behavior:
// Only two labels are used in Neo4j movie graph example: "Movie" and "Person"
popoto.provider.node.Provider = {
    "Restaurant": {
        "returnAttributes": ["title", "address", "city", "state", "postalCode", "phone", "website", "totalScore", "reviewsCount", "location_lat", "location_lng", "imageUrl", "url", "price", "description"],
        "constraintAttribute": "title",
        "displayResults": function (resultElement) {
            resultElement
                .on("click", function (r) {
                    // Fly to restaurant location when clicked
                    if (r.attributes.location_lat && r.attributes.location_lng) {
                        flyToLocation(r);
                    }
                });
                
            resultElement
                .append("span")
                .attr("class", "result-title")
                .text(function (d) {
                    return d.attributes.title;
                });
                
            resultElement
                .append("div")
                .text(function (d) {
                    let infoText = '';
                    if (d.attributes.address) infoText += d.attributes.address;
                    if (d.attributes.city) infoText += (infoText ? ' · ' : '') + d.attributes.city;
                    if (d.attributes.state) infoText += (infoText ? ' · ' : '') + d.attributes.state;
                    if (d.attributes.phone) infoText += (infoText ? ' · ' : '') + d.attributes.phone;
                    return infoText;
                });
        }
    },
    "Category": {
        "returnAttributes": ["name"],
        "constraintAttribute": "name"
    },
    "OpeningHour": {
        "returnAttributes": ["day", "hours"],
        "constraintAttribute": "day"
    }
};

// Enable the query viewer
popoto.queryviewer.CYPHER_DISPLAY = true;
popoto.queryviewer.QUERY_DISPLAYED = true;

// Enable the cypher viewer
popoto.cypherviewer.HIDE = false;

// Set results page size
popoto.result.RESULTS_PAGE_SIZE = 15;
popoto.query.MAX_RESULTS_COUNT = 2000;

// Initialize Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoicG90YXRvdGFydSIsImEiOiJjamU3NXM1bTUwOGRqMnBvNWkzdjByNWV0In0.2NMoyG2zRd8X8BMQht_gAg';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v10',
    center: [-74.0066, 40.7135],
    zoom: 10,
    pitch: 45,
    bearing: -17.6
});

// Add zoom and rotation controls to the map
map.addControl(new mapboxgl.NavigationControl());

map.on('load', function() {
    // Add 3D buildings layer
    var layers = map.getStyle().layers;
    
    var labelLayerId;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
            labelLayerId = layers[i].id;
            break;
        }
    }
    
    map.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
                "interpolate", ["linear"], ["zoom"],
                15, 0,
                15.05, ["get", "height"]
            ],
            'fill-extrusion-base': [
                "interpolate", ["linear"], ["zoom"],
                15, 0,
                15.05, ["get", "min_height"]
            ],
            'fill-extrusion-opacity': .6
        }
    }, labelLayerId);
    
    // Add empty GeoJSON source for results
    map.addSource('results', {
        type: 'geojson', 
        data: {
            "type": "FeatureCollection",
            "features": []
        }
    });
    
    // Establish database connection and start Popoto
    driver.verifyConnectivity().then(function () {
        // Start the generation using parameter as root label of the query
        popoto.start("Restaurant");
    }).catch(function (error) {
        document.getElementById("modal").style.display = "block";
        document.getElementById("error-content").innerText = error;
        console.error(error);
    });
});

/**
 * Add a listener on result received to update map
 */
popoto.result.onResultReceived(
    function (resultObjects) {
        var geojson = createGeojson(resultObjects);
        if (map.getSource('results')) {
            map.getSource('results').setData(geojson);
        }
        
        // Remove existing markers
        d3.selectAll(".marker").remove();
        
        // Add new markers
        geojson.features.forEach(function (marker, i) {
            // Create marker element
            var el = document.createElement('div');
            el.id = "marker-" + i;
            el.className = 'marker';
            
            // Add marker to map
            new mapboxgl.Marker(el, {offset: [0, -18]})
                .setLngLat(marker.geometry.coordinates)
                .addTo(map);
            
            // Add click event for popup
            el.addEventListener('click', function (e) {
                // Fly to the point
                flyToStore(marker);
                
                // Show popup
                createPopUp(marker);
                
                e.stopPropagation();
            });
        });
        
        // Fit map to results bounds if there are results
        if (geojson.features.length > 0) {
            map.fitBounds(computeBounds(geojson), {
                padding: 40
            });
        }
    }
);

/**
 * Fly to a specific location
 */
function flyToLocation(result) {
    if (result.attributes.location_lat && result.attributes.location_lng) {
        map.flyTo({
            center: [Number(result.attributes.location_lng), Number(result.attributes.location_lat)],
            zoom: 10
        });
        
        // Create a popup for this location
        createPopUpForResult(result);
    }
}

/**
 * Fly to a store location from map marker
 */
function flyToStore(currentFeature) {
    map.flyTo({
        center: currentFeature.geometry.coordinates,
        zoom: 13
    });
}

/**
 * Create a popup for a map feature
 */
function createPopUp(currentFeature) {
    var popUps = document.getElementsByClassName('mapboxgl-popup');
    // Check if there is already a popup on the map and if so, remove it
    if (popUps[0]) popUps[0].remove();
    
    var popup = new mapboxgl.Popup({closeOnClick: false})
        .setLngLat(currentFeature.geometry.coordinates)
        .setHTML('<h3>' + currentFeature.properties.name + '</h3>' +
            '<h4>' + currentFeature.properties.address + '</h4>')
        .addTo(map);
}

/**
 * Create a popup for a result object
 */
function createPopUpForResult(result) {
    var popUps = document.getElementsByClassName('mapboxgl-popup');
    // Check if there is already a popup on the map and if so, remove it
    if (popUps[0]) popUps[0].remove();
    
    var popup = new mapboxgl.Popup({closeOnClick: false})
        .setLngLat([Number(result.attributes.location_lng), Number(result.attributes.location_lat)])
        .setHTML('<h3>' + result.attributes.title + '</h3>' +
            '<h4>' + (result.attributes.address || '') + '</h4>')
        .addTo(map);
}

/**
 * Compute bounds for a GeoJSON object
 */
function computeBounds(geojson) {
    // Ensure there are features
    if (!geojson.features.length) {
        return new mapboxgl.LngLatBounds([-180, -90], [180, 90]);
    }
    
    // Extract coordinates
    var coordinates = geojson.features.map(function (feature) {
        return feature.geometry.coordinates;
    });
    
    // Calculate bounds
    return coordinates.reduce(function (bounds, coord) {
        return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
}

/**
 * Create a GeoJSON object from result objects
 */
function createGeojson(resultObjects) {
    var features = [];
    
    for (var i = 0; i < resultObjects.length; i++) {
        var longitude = Number(resultObjects[i].attributes.location_lng);
        var latitude = Number(resultObjects[i].attributes.location_lat);
        
        if (longitude && latitude) {
            features.push({
                "resultObject": resultObjects[i],
                "type": "Feature",
                properties: {
                    "name": resultObjects[i].attributes.title,
                    "address": resultObjects[i].attributes.address,
                    "city": resultObjects[i].attributes.city,
                    "state": resultObjects[i].attributes.state,
                    "phone": resultObjects[i].attributes.phone
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        longitude,
                        latitude
                    ]
                }
            })
        }
    }
    
    return {
        "type": "FeatureCollection",
        "features": features
    };
}
