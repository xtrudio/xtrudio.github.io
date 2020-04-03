var map,
  featureList,
  stationSearch = [],
  districtSearch = [],
  elementarySearch = [],
  middleSearch = [],
  highSearch = [];

$(window).resize(function() {
  sizeLayerControl();
});

$(document).on('click', '.feature-row', function(e) {
  $(document).off('mouseout', '.feature-row', clearHighlight);
  sidebarClick(parseInt($(this).attr('id'), 10));
});

if (!('ontouchstart' in window)) {
  $(document).on('mouseover', '.feature-row', function(e) {
    highlight
      .clearLayers()
      .addLayer(
        L.circleMarker(
          [$(this).attr('lat'), $(this).attr('lng')],
          highlightStyle
        )
      );
  });
}

$(document).on('mouseout', '.feature-row', clearHighlight);

$('#about-btn').click(function() {
  $('#aboutModal').modal('show');
  $('.navbar-collapse.in').collapse('hide');
  return false;
});

$('#full-extent-btn').click(function() {
  map.fitBounds(districts.getBounds());
  $('.navbar-collapse.in').collapse('hide');
  return false;
});

$('#legend-btn').click(function() {
  $('#legendModal').modal('show');
  $('.navbar-collapse.in').collapse('hide');
  return false;
});

$('#login-btn').click(function() {
  $('#loginModal').modal('show');
  $('.navbar-collapse.in').collapse('hide');
  return false;
});

$('#list-btn').click(function() {
  animateSidebar();
  return false;
});

$('#nav-btn').click(function() {
  $('.navbar-collapse').collapse('toggle');
  return false;
});

$('#sidebar-toggle-btn').click(function() {
  animateSidebar();
  return false;
});

$('#sidebar-hide-btn').click(function() {
  animateSidebar();
  return false;
});
$('#sidebar-show-btn').click(function() {
  animateSidebar();
  return false;
});

function animateSidebar() {
  $('#sidebar').animate(
    {
      width: 'toggle'
    },
    350,
    function() {
      map.invalidateSize();
    }
  );
}

function sizeLayerControl() {
  $('.leaflet-control-layers').css('max-height', $('#map').height() - 50);
}

function clearHighlight() {
  highlight.clearLayers();
}

function sidebarClick(id) {
  var layer = markerClusters.getLayer(id);
  map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 16);
  layer.fire('click');
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $('#sidebar').hide();
    map.invalidateSize();
  }
}

function syncSidebar() {
  /* Empty sidebar features */
  $('#feature-list tbody').empty();

  /* Loop through elementary schools layer and add only features which are in the map bounds */
  elementarys.eachLayer(function(layer) {
    if (map.hasLayer(elementaryLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $('#feature-list tbody').append(
          '<tr class="feature-row" id="' +
            L.stamp(layer) +
            '" lat="' +
            layer.getLatLng().lat +
            '" lng="' +
            layer.getLatLng().lng +
            '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/elementary.png"></td><td class="feature-name">' +
            layer.feature.properties.NAME +
            '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>'
        );
      }
    }
  });

  /* Loop through middle schools layer and add only features which are in the map bounds */
  middles.eachLayer(function(layer) {
    if (map.hasLayer(middleLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $('#feature-list tbody').append(
          '<tr class="feature-row" id="' +
            L.stamp(layer) +
            '" lat="' +
            layer.getLatLng().lat +
            '" lng="' +
            layer.getLatLng().lng +
            '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/middle.png"></td><td class="feature-name">' +
            layer.feature.properties.NAME +
            '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>'
        );
      }
    }
  });

  /* Loop through high schools layer and add only features which are in the map bounds */
  highs.eachLayer(function(layer) {
    if (map.hasLayer(highLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $('#feature-list tbody').append(
          '<tr class="feature-row" id="' +
            L.stamp(layer) +
            '" lat="' +
            layer.getLatLng().lat +
            '" lng="' +
            layer.getLatLng().lng +
            '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/high.png"></td><td class="feature-name">' +
            layer.feature.properties.NAME +
            '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>'
        );
      }
    }
  });

  /* Update list.js featureList */
  featureList = new List('features', {
    valueNames: ['feature-name']
  });
  featureList.sort('feature-name', {
    order: 'asc'
  });
}

/* Basemap Layers */
var cartoLight = L.tileLayer(
  'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
  {
    minZoom: 10,
    maxZoom: 16,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
  }
);

/* Overlay Layers */
var highlight = L.geoJson(null);
var highlightStyle = {
  stroke: false,
  fillColor: '#00FFFF',
  fillOpacity: 0.5,
  radius: 10
};

/* Districts Layer */
var districts = L.geoJson(null, {
  style: function(feature) {
    return {
      color: 'orange',
      fill: false,
      weight: 2,
      opacity: 0.3,
      clickable: true
    };
  },
  onEachFeature: function(feature, layer) {
    districtSearch.push({
      name: layer.feature.properties.SchoolDist,
      source: 'Districts',
      id: L.stamp(layer),
      bounds: layer.getBounds()
    });
  }
});
$.getJSON('data/districts.json', function(data) {
  districts.addData(data);
});

//Create a color dictionary based on subway route_id
var subwayColors = {
  '1': '#EE352E',
  '2': '#EE352E',
  '3': '#EE352E',
  '4': '#00933C',
  '5': '#00933C',
  '6': '#00933C',
  '7': '#B933AD',
  A: '#0039A6',
  C: '#0039A6',
  E: '#0039A6',
  SI: '#fd9a00',
  H: '#fd9a00',
  B: '#FF6319',
  D: '#FF6319',
  F: '#FF6319',
  M: '#FF6319',
  G: '#6CBE45',
  J: '#996633',
  Z: '#996633',
  L: '#A7A9AC',
  N: '#FCCC0A',
  Q: '#FCCC0A',
  R: '#FCCC0A'
};

var subwayLines = L.geoJson(null, {
  style: function(feature) {
    return {
      color: subwayColors[feature.properties.rt_symbol],
      weight: 2,
      opacity: 1
    };
  },

  onEachFeature: function(feature, layer) {
    if (feature.properties) {
      var content =
        "<table class='table table-striped table-bordered table-condensed'>" +
        '<tr><th>Division</th><td>' +
        feature.properties.name +
        '</td></tr>' +
        '<tr><th>Line</th><td>' +
        feature.properties.rt_symbol +
        '</td></tr>' +
        '<table>';
      layer.on({
        click: function(e) {
          $('#feature-title').html(feature.properties.name);
          $('#feature-info').html(content);
          $('#featureModal').modal('show');
        }
      });
    }
    layer.on({
      mouseover: function(e) {
        var layer = e.target;
        layer.setStyle({
          weight: 2,
          // color: '#00FFFF',
          opacity: 1
        });
        if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
        }
      },
      mouseout: function(e) {
        subwayLines.resetStyle(e.target);
      }
    });
  }
});
$.getJSON('data/subway.json', function(data) {
  subwayLines.addData(data);
});

/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 15
});

/* Empty layer placeholder to add to layer control for listening when to add/remove stations to markerClusters layer */
var stationLayer = L.geoJson(null);
var stations = L.geoJson(null, {
  pointToLayer: function(feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: 'assets/img/station.png',
        iconSize: [24, 27],
        iconAnchor: [12, 27],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.line,
      riseOnHover: true
    });
  },
  onEachFeature: function(feature, layer) {
    if (feature.properties) {
      var content =
        "<table class='table table-striped table-bordered table-condensed'>" +
        // '<tr><th>Station</th><td>' +
        // feature.properties.name +
        // '</td></tr>' +
        '<tr><th>Service</th><td>' +
        feature.properties.line +
        '</td></tr>' +
        '<tr><th>Schedule</th><td>' +
        feature.properties.notes +
        '</td></tr>' +
        '<table>';
      layer.on({
        click: function(e) {
          $('#feature-title').html(feature.properties.name);
          $('#feature-info').html(content);
          $('#featureModal').modal('show');
          highlight
            .clearLayers()
            .addLayer(
              L.circleMarker(
                [
                  feature.geometry.coordinates[1],
                  feature.geometry.coordinates[0]
                ],
                highlightStyle
              )
            );
        }
      });
      $('#feature-list tbody').append(
        '<tr class="feature-row" id="' +
          L.stamp(layer) +
          '" lat="' +
          layer.getLatLng().lat +
          '" lng="' +
          layer.getLatLng().lng +
          '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/station.png"></td><td class="feature-name">' +
          layer.feature.properties.name +
          '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>'
      );
      stationSearch.push({
        name: layer.feature.properties.name,
        address: layer.feature.properties.line,
        source: 'Stations',
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON('data/stations.json', function(data) {
  stations.addData(data);
  // map.addLayer(stationLayer);
});

/* Empty layer placeholder to add to layer control for listening when to add/remove elementary schools to markerClusters layer */
var elementaryLayer = L.geoJson(null);
var elementarys = L.geoJson(null, {
  pointToLayer: function(feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: 'assets/img/elementary.png',
        iconSize: [24, 27],
        iconAnchor: [12, 27],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.NAME,
      riseOnHover: true
    });
  },
  onEachFeature: function(feature, layer) {
    if (feature.properties) {
      var content =
        "<table class='table table-striped table-bordered table-condensed'>" +
        '<tr><th>Phone</th><td>' +
        feature.properties.TEL +
        '</td></tr>' +
        '<tr><th>Address</th><td>' +
        feature.properties.ADDRESS1 +
        '</td></tr>' +
        '<table>';
      layer.on({
        click: function(e) {
          $('#feature-title').html(feature.properties.NAME);
          $('#feature-info').html(content);
          $('#featureModal').modal('show');
          highlight
            .clearLayers()
            .addLayer(
              L.circleMarker(
                [
                  feature.geometry.coordinates[1],
                  feature.geometry.coordinates[0]
                ],
                highlightStyle
              )
            );
        }
      });
      $('#feature-list tbody').append(
        '<tr class="feature-row" id="' +
          L.stamp(layer) +
          '" lat="' +
          layer.getLatLng().lat +
          '" lng="' +
          layer.getLatLng().lng +
          '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/elementary.png"></td><td class="feature-name">' +
          layer.feature.properties.NAME +
          '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>'
      );
      elementarySearch.push({
        name: layer.feature.properties.NAME,
        address: layer.feature.properties.ADRESS1,
        source: 'Elementarys',
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON('data/elementary.json', function(data) {
  elementarys.addData(data);
  // map.addLayer(elementaryLayer);
});

/* Empty layer placeholder to add to layer control for listening when to add/remove middle schools to markerClusters layer */
var middleLayer = L.geoJson(null);
var middles = L.geoJson(null, {
  pointToLayer: function(feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: 'assets/img/middle.png',
        iconSize: [24, 27],
        iconAnchor: [12, 27],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.NAME,
      riseOnHover: true
    });
  },
  onEachFeature: function(feature, layer) {
    if (feature.properties) {
      var content =
        "<table class='table table-striped table-bordered table-condensed'>" +
        '<tr><th>Overview</th><td>' +
        feature.properties.OVERVIEW +
        '</td></tr>' +
        '<tr><th>Address</th><td>' +
        feature.properties.ADDRESS1 +
        ', ' +
        feature.properties.CITY +
        ', ' +
        feature.properties.STATE +
        ', ' +
        feature.properties.ZIP +
        '</td></tr>' +
        '<tr><th>Phone</th><td>' +
        feature.properties.TEL +
        '</td></tr>' +
        '<tr><th>Subway</th><td>' +
        feature.properties.SUBWAY +
        '</td></tr>' +
        '<tr><th>Bus</th><td>' +
        feature.properties.BUS +
        '</td></tr>' +
        "<tr><th>Website</th><td><a class='url-break' href='" +
        feature.properties.WEBSITE +
        "' target='_blank'>" +
        feature.properties.WEBSITE +
        '</a></td></tr>' +
        "<tr><th>DOE Info</th><td><a class='url-break' href='" +
        feature.properties.URL +
        "' target='_blank'>" +
        feature.properties.URL +
        '</a></td></tr>' +
        '<table>';
      layer.on({
        click: function(e) {
          $('#feature-title').html(feature.properties.NAME);
          $('#feature-info').html(content);
          $('#featureModal').modal('show');
          highlight
            .clearLayers()
            .addLayer(
              L.circleMarker(
                [
                  feature.geometry.coordinates[1],
                  feature.geometry.coordinates[0]
                ],
                highlightStyle
              )
            );
        }
      });
      $('#feature-list tbody').append(
        '<tr class="feature-row" id="' +
          L.stamp(layer) +
          '" lat="' +
          layer.getLatLng().lat +
          '" lng="' +
          layer.getLatLng().lng +
          '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/middle.png"></td><td class="feature-name">' +
          layer.feature.properties.NAME +
          '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>'
      );
      elementarySearch.push({
        name: layer.feature.properties.NAME,
        address: layer.feature.properties.ADRESS1,
        source: 'middles',
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON('data/middle.json', function(data) {
  middles.addData(data);
  // map.addLayer(middleLayer);
});

/* Empty layer placeholder to add to layer control for listening when to add/remove high schools to markerClusters layer */
var highLayer = L.geoJson(null);
var highs = L.geoJson(null, {
  pointToLayer: function(feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: 'assets/img/high.png',
        iconSize: [24, 27],
        iconAnchor: [12, 27],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.NAME,
      riseOnHover: true
    });
  },
  onEachFeature: function(feature, layer) {
    if (feature.properties) {
      var content =
        "<table class='table table-striped table-bordered table-condensed'>" +
        '<tr><th>Overview</th><td>' +
        feature.properties.OVERVIEW +
        '</td></tr>' +
        '<tr><th>Program</th><td>' +
        feature.properties.INTEREST +
        '</td></tr>' +
        '<tr><th>Enrollment</th><td>' +
        feature.properties.ENROLLMENT +
        '</td></tr>' +
        '<tr><th>Address</th><td>' +
        feature.properties.ADDRESS1 +
        ', ' +
        feature.properties.CITY +
        ', ' +
        feature.properties.STATE +
        ', ' +
        feature.properties.ZIP +
        '</td></tr>' +
        '<tr><th>Phone</th><td>' +
        feature.properties.TEL +
        '</td></tr>' +
        '<tr><th>Subway</th><td>' +
        feature.properties.SUBWAY +
        '</td></tr>' +
        '<tr><th>Bus</th><td>' +
        feature.properties.BUS +
        '</td></tr>' +
        "<tr><th>Website</th><td><a class='url-break' href='" +
        feature.properties.WEBSITE +
        "' target='_blank'>" +
        feature.properties.WEBSITE +
        '</a></td></tr>' +
        "<tr><th>DOE Info</th><td><a class='url-break' href='" +
        feature.properties.URL +
        "' target='_blank'>" +
        feature.properties.URL +
        '</a></td></tr>' +
        '<table>';
      layer.on({
        click: function(e) {
          $('#feature-title').html(feature.properties.NAME);
          $('#feature-info').html(content);
          $('#featureModal').modal('show');
          highlight
            .clearLayers()
            .addLayer(
              L.circleMarker(
                [
                  feature.geometry.coordinates[1],
                  feature.geometry.coordinates[0]
                ],
                highlightStyle
              )
            );
        }
      });
      $('#feature-list tbody').append(
        '<tr class="feature-row" id="' +
          L.stamp(layer) +
          '" lat="' +
          layer.getLatLng().lat +
          '" lng="' +
          layer.getLatLng().lng +
          '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/high.png"></td><td class="feature-name">' +
          layer.feature.properties.NAME +
          '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>'
      );
      highSearch.push({
        name: layer.feature.properties.NAME,
        address: layer.feature.properties.ADRESS1,
        source: 'highs',
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON('data/high.json', function(data) {
  highs.addData(data);
  // map.addLayer(highLayer);
});

map = L.map('map', {
  zoom: 10,
  center: [40.7, -73.97],
  layers: [cartoLight, districts, markerClusters, highlight],
  zoomControl: false,
  attributionControl: false
});

/* Layer control listeners that allow for a single markerClusters layer */
map.on('overlayadd', function(e) {
  if (e.layer === elementaryLayer) {
    markerClusters.addLayer(elementarys);
    syncSidebar();
  }
  if (e.layer === middleLayer) {
    markerClusters.addLayer(middles);
    syncSidebar();
  }
  if (e.layer === highLayer) {
    markerClusters.addLayer(highs);
    syncSidebar();
  }
});

map.on('overlayremove', function(e) {
  if (e.layer === elementaryLayer) {
    markerClusters.removeLayer(elementarys);
    syncSidebar();
  }
  if (e.layer === middleLayer) {
    markerClusters.removeLayer(middles);
    syncSidebar();
  }
  if (e.layer === highLayer) {
    markerClusters.removeLayer(highs);
    syncSidebar();
  }
});

/* Filter sidebar feature list to only show features in current map bounds */
map.on('moveend', function(e) {
  syncSidebar();
});

/* Clear feature highlight when map is clicked */
map.on('click', function(e) {
  highlight.clearLayers();
});

/* Attribution control */
function updateAttribution(e) {
  $.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      $('#attribution').html(layer.getAttribution());
    }
  });
}
map.on('layeradd', updateAttribution);
map.on('layerremove', updateAttribution);

var attributionControl = L.control({
  position: 'bottomright'
});
attributionControl.onAdd = function(map) {
  var div = L.DomUtil.create('div', 'leaflet-control-attribution');
  div.innerHTML =
    "<span class='hidden-xs'>Developed by <a href='http://xtrudio.com'>Horia Popa</a> | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
  return div;
};
map.addControl(attributionControl);

// var zoomControl = L.control
//   .zoom({
//     position: 'bottomright'
//   })
//   .addTo(map);

// custom zoom bar control that includes a Zoom Home function
L.Control.zoomHome = L.Control.extend({
  options: {
    position: 'bottomright',
    zoomInText: '<i class="fa fa-plus";></i>',
    zoomInTitle: 'Zoom in',
    zoomOutText: '<i class="fa fa-minus";></i>',
    zoomOutTitle: 'Zoom out',
    zoomHomeText: '<i class="fa fa-home" style="line-height:1.65;"></i>',
    zoomHomeTitle: 'Zoom home'
  },

  onAdd: function(map) {
    var controlName = 'gin-control-zoom',
      container = L.DomUtil.create('div', controlName + ' leaflet-bar'),
      options = this.options;

    this._zoomInButton = this._createButton(
      options.zoomInText,
      options.zoomInTitle,
      controlName + '-in',
      container,
      this._zoomIn
    );
    this._zoomHomeButton = this._createButton(
      options.zoomHomeText,
      options.zoomHomeTitle,
      controlName + '-home',
      container,
      this._zoomHome
    );
    this._zoomOutButton = this._createButton(
      options.zoomOutText,
      options.zoomOutTitle,
      controlName + '-out',
      container,
      this._zoomOut
    );

    this._updateDisabled();
    map.on('zoomend zoomlevelschange', this._updateDisabled, this);

    return container;
  },

  onRemove: function(map) {
    map.off('zoomend zoomlevelschange', this._updateDisabled, this);
  },

  _zoomIn: function(e) {
    this._map.zoomIn(e.shiftKey ? 3 : 1);
  },

  _zoomOut: function(e) {
    this._map.zoomOut(e.shiftKey ? 3 : 1);
  },

  _zoomHome: function(e) {
    map.setView([40.7, -73.97], 10);
  },

  _createButton: function(html, title, className, container, fn) {
    var link = L.DomUtil.create('a', className, container);
    link.innerHTML = html;
    link.href = '#';
    link.title = title;

    L.DomEvent.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
      .on(link, 'click', L.DomEvent.stop)
      .on(link, 'click', fn, this)
      .on(link, 'click', this._refocusOnMap, this);

    return link;
  },

  _updateDisabled: function() {
    var map = this._map,
      className = 'leaflet-disabled';

    L.DomUtil.removeClass(this._zoomInButton, className);
    L.DomUtil.removeClass(this._zoomOutButton, className);

    if (map._zoom === map.getMinZoom()) {
      L.DomUtil.addClass(this._zoomOutButton, className);
    }
    if (map._zoom === map.getMaxZoom()) {
      L.DomUtil.addClass(this._zoomInButton, className);
    }
  }
});
// add the new control to the map
var zoomHome = new L.Control.zoomHome();
zoomHome.addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control
  .locate({
    position: 'bottomright',
    drawCircle: true,
    follow: true,
    setView: true,
    keepCurrentZoomLevel: true,
    markerStyle: {
      weight: 1,
      opacity: 0.8,
      fillOpacity: 0.8
    },
    circleStyle: {
      weight: 1,
      clickable: false
    },
    icon: 'fa fa-location-arrow',
    metric: false,
    strings: {
      title: 'My location',
      popup: 'You are within {distance} {unit} from this point',
      outsideMapBoundsMsg: 'You seem located outside the boundaries of the map'
    },
    locateOptions: {
      maxZoom: 16,
      watch: true,
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 10000
    }
  })
  .addTo(map);

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}
var closeBtn = 'X';

var baseLayers = {
  'X': closeBtn
};

var groupedOverlays = {
  Schools: {
    "<img src='assets/img/elementary.png' width='16' height='18'>&nbsp;Elementary": elementaryLayer,
    "<img src='assets/img/middle.png' width='16' height='18'>&nbsp;Middle": middleLayer,
    "<img src='assets/img/high.png' width='16' height='18'>&nbsp;High": highLayer
  },
  Reference: {
    "<img src='assets/img/district.png' width='16' height='16'>&nbsp;School Districts": districts,
    "<img src='assets/img/lines.png' width='16' height='16'>&nbsp;Subway Lines": subwayLines,
    "<img src='assets/img/station.png' width='16' height='18'>&nbsp;Stations": stations
  }
};

var layerControl = L.control

  .groupedLayers( closeBtn, groupedOverlays, {
    collapsed: isCollapsed
  })
  .addTo(map);

/* Highlight search box text on click */
$('#searchbox').click(function() {
  $(this).select();
});

/* Prevent hitting enter from refreshing the page */
$('#searchbox').keypress(function(e) {
  if (e.which == 13) {
    e.preventDefault();
  }
});

$('#featureModal').on('hidden.bs.modal', function(e) {
  $(document).on('mouseout', '.feature-row', clearHighlight);
});

/* Typeahead search functionality */
$(document).one('ajaxStop', function() {
  $('#loading').hide();
  sizeLayerControl();
  /* Fit map to districts bounds */
  map.fitBounds(districts.getBounds());
  featureList = new List('features', { valueNames: ['feature-name'] });
  featureList.sort('feature-name', { order: 'asc' });

  var districtsBH = new Bloodhound({
    name: 'Districts',
    datumTokenizer: function(d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: districtSearch,
    limit: 10
  });

  var elementarysBH = new Bloodhound({
    name: 'Elementarys',
    datumTokenizer: function(d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: elementarySearch,
    limit: 10
  });

  var middlesBH = new Bloodhound({
    name: 'Middles',
    datumTokenizer: function(d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: middleSearch,
    limit: 10
  });

  var highsBH = new Bloodhound({
    name: 'Highs',
    datumTokenizer: function(d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: highSearch,
    limit: 10
  });

  var geonamesBH = new Bloodhound({
    name: 'GeoNames',
    datumTokenizer: function(d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
      url:
        'http://api.geonames.org/searchJSON?username=bootleaf&featureClass=P&maxRows=5&countryCode=US&name_startsWith=%QUERY',
      filter: function(data) {
        return $.map(data.geonames, function(result) {
          return {
            name: result.name + ', ' + result.adminCode1,
            lat: result.lat,
            lng: result.lng,
            source: 'GeoNames'
          };
        });
      },
      ajax: {
        beforeSend: function(jqXHR, settings) {
          settings.url +=
            '&east=' +
            map.getBounds().getEast() +
            '&west=' +
            map.getBounds().getWest() +
            '&north=' +
            map.getBounds().getNorth() +
            '&south=' +
            map.getBounds().getSouth();
          $('#searchicon')
            .removeClass('fa-search')
            .addClass('fa-refresh fa-spin');
        },
        complete: function(jqXHR, status) {
          $('#searchicon')
            .removeClass('fa-refresh fa-spin')
            .addClass('fa-search');
        }
      }
    },
    limit: 10
  });
  districtsBH.initialize();
  elementarysBH.initialize();
  middlesBH.initialize();
  highsBH.initialize();
  geonamesBH.initialize();

  /* instantiate the typeahead UI */
  $('#searchbox')
    .typeahead(
      {
        minLength: 3,
        highlight: true,
        hint: false
      },
      {
        name: 'Districts',
        displayKey: 'name',
        source: districtsBH.ttAdapter(),
        templates: {
          header: "<h5 class='typeahead-header'>Districts</h5>"
        }
      },
      {
        name: 'Elementarys',
        displayKey: 'name',
        source: elementarysBH.ttAdapter(),
        templates: {
          header:
            "<h5 class='typeahead-header'><img src='assets/img/elementary.png' width='16' height='18'>&nbsp;Elementary Schools</h5>",
          suggestion: Handlebars.compile(
            ['{{name}}<br>&nbsp;<small>{{address}}</small>'].join('')
          )
        }
      },
      {
        name: 'Middles',
        displayKey: 'name',
        source: middlesBH.ttAdapter(),
        templates: {
          header:
            "<h5 class='typeahead-header'><img src='assets/img/middle.png' width='16' height='18'>&nbsp;Middle Schools</h5>",
          suggestion: Handlebars.compile(
            ['{{name}}<br>&nbsp;<small>{{address}}</small>'].join('')
          )
        }
      },
      {
        name: 'Highs',
        displayKey: 'name',
        source: highsBH.ttAdapter(),
        templates: {
          header:
            "<h5 class='typeahead-header'><img src='assets/img/high.png' width='16' height='18'>&nbsp;High Schools</h5>",
          suggestion: Handlebars.compile(
            ['{{name}}<br>&nbsp;<small>{{address}}</small>'].join('')
          )
        }
      },
      {
        name: 'GeoNames',
        displayKey: 'name',
        source: geonamesBH.ttAdapter(),
        templates: {
          header:
            "<h5 class='typeahead-header'><img src='assets/img/globe.png' width=18'' height='18'>&nbsp;Places</h5>"
        }
      }
    )
    .on('typeahead:selected', function(obj, datum) {
      if (datum.source === 'Districts') {
        map.fitBounds(datum.bounds);
      }
      if (datum.source === 'Elementarys') {
        if (!map.hasLayer(elementaryLayer)) {
          map.addLayer(elementaryLayer);
        }
        map.setView([datum.lat, datum.lng], 16);
        if (map._layers[datum.id]) {
          map._layers[datum.id].fire('click');
        }
      }
      if (datum.source === 'Middles') {
        if (!map.hasLayer(middleLayer)) {
          map.addLayer(middleLayer);
        }
        map.setView([datum.lat, datum.lng], 16);
        if (map._layers[datum.id]) {
          map._layers[datum.id].fire('click');
        }
      }
      if (datum.source === 'Highs') {
        if (!map.hasLayer(highLayer)) {
          map.addLayer(highLayer);
        }
        map.setView([datum.lat, datum.lng], 16);
        if (map._layers[datum.id]) {
          map._layers[datum.id].fire('click');
        }
      }
      if (datum.source === 'GeoNames') {
        map.setView([datum.lat, datum.lng], 14);
      }
      if ($('.navbar-collapse').height() > 50) {
        $('.navbar-collapse').collapse('hide');
      }
    })
    .on('typeahead:opened', function() {
      $('.navbar-collapse.in').css(
        'max-height',
        $(document).height() - $('.navbar-header').height()
      );
      $('.navbar-collapse.in').css(
        'height',
        $(document).height() - $('.navbar-header').height()
      );
    })
    .on('typeahead:closed', function() {
      $('.navbar-collapse.in').css('max-height', '');
      $('.navbar-collapse.in').css('height', '');
    });
  $('.twitter-typeahead').css('position', 'static');
  $('.twitter-typeahead').css('display', 'block');
});

map.on('zoomend', function(e) {
  if (map.getZoom() <= 16 && map.getZoom() >= 15) {
    map.addLayer(subwayLines);
  } else if (map.getZoom() > 16 || map.getZoom() < 15) {
    map.removeLayer(subwayLines);
  }
  if (map.getZoom() <= 16 && map.getZoom() >= 15) {
    map.addLayer(stations);
  } else if (map.getZoom() > 16 || map.getZoom() < 15) {
    map.removeLayer(stations);
  }
});

// Leaflet patch to make layer control scrollable on touch browsers
var container = $('.leaflet-control-layers')[0];
if (!L.Browser.touch) {
  L.DomEvent.disableClickPropagation(container).disableScrollPropagation(
    container
  );
} else {
  L.DomEvent.disableClickPropagation(container);
}
