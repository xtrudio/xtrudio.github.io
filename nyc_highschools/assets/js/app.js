var schoolDBN;

var map,
  featureList,
  stationSearch = [],
  districtSearch = [],
  highSearch = [];

$(window).resize(function () {
  sizeLayerControl();
});

$(document).on('click', '.feature-row', function (e) {
  $(document).off('mouseout', '.feature-row', clearHighlight);
  sidebarClick(parseInt($(this).attr('id'), 10));
});

if (!('ontouchstart' in window)) {
  $(document).on('mouseover', '.feature-row', function (e) {
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

$('#about-btn').click(function () {
  $('#aboutModal').modal('show');
  $('.navbar-collapse.in').collapse('hide');
  return false;
});

$('#full-extent-btn').click(function () {
  map.fitBounds(districts.getBounds());
  $('.navbar-collapse.in').collapse('hide');
  return false;
});

$('#legend-btn').click(function () {
  $('#legendModal').modal('show');
  $('.navbar-collapse.in').collapse('hide');
  return false;
});

$('#login-btn').click(function () {
  $('#loginModal').modal('show');
  $('.navbar-collapse.in').collapse('hide');
  return false;
});

$('#list-btn').click(function () {
  animateSidebar();
  hideBtn();
  return false;
});

$('#nav-btn').click(function () {
  $('.navbar-collapse').collapse('toggle');
  return false;
});

$('#sidebar-toggle-btn').click(function () {
  animateSidebar();
  // hideBtn();
  return false;
});

$('#legend-hide-btn').click(function () {
  hideLegend();
  return false;
});

function hideLegend() {
  let x = document.getElementsByClassName('leaflet-control-layers');

  if (x[0].style.display === 'none') {
    x[0].style.display = 'block';
    document.getElementById('chevron').className = 'fa fa-chevron-right';
  } else {
    x[0].style.display = 'none';
    document.getElementById('chevron').className = 'fa fa-chevron-left';
  }
}

function animateSidebar() {
  $('#sidebar').animate(
    {
      width: 'toggle',
    },
    350,
    function () {
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
  // layer.fire('click');
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $('#sidebar').hide();
    map.invalidateSize();
  }
}

function syncSidebar() {
  /* Empty sidebar features */
  $('#feature-list tbody').empty();

  /* Loop through high schools layer and add only features which are in the map bounds */
  highs.eachLayer(function (layer) {
    if (map.hasLayer(highLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $('#feature-list tbody').append(
          '<tr class="feature-row" id="' +
            L.stamp(layer) +
            '" lat="' +
            layer.getLatLng().lat +
            '" lng="' +
            layer.getLatLng().lng +
            '"><td style="vertical-align: middle;"><svg version="1.1" id="Layer_1" focusable="false" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"         x="0px" y="0px" width="16px" height="16px" viewBox="4 4 16 16" enable-background="new 4 4 16 16" xml:space="preserve">      <path fill="' +
            highSchoolColors[layer.feature.properties.FOCUS] +
            '" d="M12,5.025c-3.854,0-6.975,3.122-6.975,6.975S8.146,18.975,12,18.975s6.975-3.121,6.975-6.975S15.854,5.025,12,5.025z"/>            </svg></td><td class="feature-name">' +
            layer.feature.properties.NAME +
            '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>'
        );
      }
    }
  });

  /* Update list.js featureList */
  featureList = new List('features', {
    valueNames: ['feature-name'],
  });
  featureList.sort('feature-name', {
    order: 'asc',
  });
}

/* Basemap Layers */
var cartoLight = L.tileLayer(
  'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
  {
    minZoom: 10,
    maxZoom: 16,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>',
  }
);

/* Overlay Layers */
var highlight = L.geoJson(null);
var highlightStyle = {
  color: 'red',
  weight: 5,
  fill: false,
  opacity: 1,
  radius: 10,
};

/* Districts Layer */
var districts = L.geoJson(null, {
  style: function (feature) {
    return {
      color: 'orange',
      fill: false,
      weight: 2,
      opacity: 0.3,
      clickable: false,
    };
  },
  onEachFeature: function (feature, layer) {
    districtSearch.push({
      name: feature.properties.SchoolDist,
      source: 'Districts',
      id: L.stamp(layer),
      bounds: layer.getBounds(),
    });
  },
});
$.getJSON('data/districts.json', function (data) {
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
  R: '#FCCC0A',
};

var subwayLines = L.geoJson(null, {
  style: function (feature) {
    return {
      color: subwayColors[feature.properties.rt_symbol],
      weight: 2,
      opacity: 1,
    };
  },

  onEachFeature: function (feature, layer) {
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
        click: function (e) {
          $('#feature-title').html(feature.properties.name);
          $('#feature-info').html(content);
          $('#featureModal').modal('show');
        },
      });
    }
    layer.on({
      mouseover: function (e) {
        var layer = e.target;
        layer.setStyle({
          weight: 2,
          // color: '#00FFFF',
          opacity: 1,
        });
        if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
        }
      },
      mouseout: function (e) {
        subwayLines.resetStyle(e.target);
      },
    });
  },
});
$.getJSON('data/subway.json', function (data) {
  subwayLines.addData(data);
});

/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 12,
});

/* Empty layer placeholder to add to layer control for listening when to add/remove stations to markerClusters layer */
var stationLayer = L.geoJson(null);
var stations = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: 'assets/img/station.png',
        iconSize: [16, 18],
        iconAnchor: [8, 18],
        popupAnchor: [0, -25],
      }),
      title: feature.properties.line,
      riseOnHover: true,
    });
  },
  onEachFeature: function (feature, layer) {
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
        click: function (e) {
          $('#feature-title').html(feature.properties.name);
          $('#feature-info').html(content);
          $('#featureModal').modal('show');
          highlight
            .clearLayers()
            .addLayer(
              L.circleMarker(
                [
                  feature.geometry.coordinates[1],
                  feature.geometry.coordinates[0],
                ],
                highlightStyle
              )
            );
        },
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
        lng: layer.feature.geometry.coordinates[0],
      });
    }
  },
});
$.getJSON('data/stations.json', function (data) {
  stations.addData(data);
  // map.addLayer(stationLayer);
});

//Create a color dictionary based on school emphasis
var highSchoolColors = {
  'Animal Science': '#00deb9',
  'Health Professions': '#00de94',
  'Computer Science & Technology': '#00de6f',
  'Computer Science, Math & Technology': '#00de4a',
  Architecture: '#00de25',
  Engineering: '#00de00',
  'Environmental Science': '#25de00',
  'Science & Math': '#4ade00',
  'Humanities & Interdisciplinary': '#de9400',
  'Law & Government': '#de6f00',
  'Project-Based Learning': '#de4a00',
  Teaching: '#de2500',
  Communications: '#de0000',
  'Film/Video': '#de00cf',
  'Performing Arts': '#cc00de',
  'Visual Art & Design': '#a700de',
  'Performing Arts/Visual Art & Design': '#8100de',
  'Culinary Arts': '#006fde',
  'Hospitality, Travel, & Tourism': '#0094de',
  Business: '#0025de',
  JROTC: '#00b9de',
};

// var subwayLines = L.geoJson(null, {
//   style: function (feature) {
//     return {
//       color: subwayColors[feature.properties.rt_symbol],
//       weight: 2,
//       opacity: 1,
//     };
//   },

/* Empty layer placeholder to add to layer control for listening when to add/remove high schools to markerClusters layer */

var ALayer = L.geoJson(null);
var highLayer = L.geoJson(null);
var highs = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    var school_marker = {
      radius: 6,
      fillColor: highSchoolColors[feature.properties.FOCUS],
      stroke: false,
      // weight: 1,
      // opacity: 1,
      fillOpacity: 1,
    };
    var marker = L.circleMarker(latlng, school_marker);

    return marker;
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content =
        "<table class='table table-striped table-bordered table-condensed'>" +
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
        '<tr><th>Fax</th><td>' +
        feature.properties.FAX +
        '</td></tr>' +
        "<tr><th>Website</th><td><a class='url-break' href='" +
        feature.properties.WEBSITE +
        "' target='_blank'>" +
        feature.properties.WEBSITE +
        '</a></td></tr>' +
        '<tr><th>Subway</th><td>' +
        feature.properties.SUBWAY +
        '</td></tr>' +
        '<tr><th>Bus</th><td>' +
        feature.properties.BUS +
        '</td></tr>' +
        '<tr><th colspan="2" class="table-cat">Overview</th></tr>' +
        '<tr><td colspan="2">' +
        feature.properties.OVERVIEW +
        '</td></tr>' +
        '<tr><th colspan="2" class="table-cat">Performance</th></tr>' +
        '<tr><th colspan="2">' +
        feature.properties.GRADUATION_RATE * 100 +
        '% <span class="table-par">of students graduate in four years</span></th></tr>' +
        '<tr><td colspan="2" class ="chart"><div id="chart-title">Graduation Rate Comparison Chart</div><div class="chartbox"> <canvas id="graduationChart"></canvas></div></div></td></tr>' +
        '<tr><th colspan="2">' +
        feature.properties.COLLEGE_RATE * 100 +
        '% <span class="table-par">of students enroll in college or career programs</span></th></tr>' +
        '<tr><td colspan="2" class ="chart"><div id="chart-title">College Admission Rate Comparison Chart</div><div class="chartbox"> <canvas id="collegeChart"></canvas></div></div></td></tr>' +
        '<tr><th colspan="2">' +
        feature.properties.ATTENDANCE_RATE * 100 +
        '% <span class="table-par">student attendance rate</span></th></tr>' +
        '<tr><td colspan="2" class ="chart"><div id="chart-title">Attendance Rate Comparison Chart</div><div class="chartbox"> <canvas id="attendanceChart"></canvas></div></div></td></tr>' +
        '<tr><th colspan="2">' +
        feature.properties.SAFETY_RATE * 100 +
        '% <span class="table-par">of students feel safe in the hallways, bathrooms, locker room, and cafeteria</span></th></tr>' +
        '<tr><td colspan="2" class ="chart"><div id="chart-title">Safety Comparison Chart</div><div class="chartbox"> <canvas id="safetyChart"></canvas></div></div></td></tr>' +
        '<tr><th colspan="2">' +
        feature.properties.MIX_RATE * 100 +
        '% <span class="table-par">of students think that the mix of programs, courses and activities is adequate.</span></th></tr>' +
        '<tr><td colspan="2" class ="chart"><div id="chart-title">Curriculum Mix Comparison Chart</div><div class="chartbox"> <canvas id="mixChart"></canvas></div></div></td></tr>' +
        "<tr><td colspan='2' ><a class='url-break' href='" +
        feature.properties.URL +
        "' target='_blank'>See the DOE School Quality Snapshot</a></td></tr>" +
        '<tr><th colspan="2" class="table-cat">Academics</th></tr>' +
        '<tr><th>Emphasis</th><td>' +
        feature.properties.FOCUS +
        '</td></tr>' +
        '<tr><th>Program Description</th><td>' +
        feature.properties.PROGRAMDESCRIPTION +
        '</td></tr>' +
        '<tr><th>Main Program</th><td>' +
        feature.properties.PROGRAM1 +
        '</td></tr>' +
        '<tr><th>Languages</th><td>' +
        feature.properties.LANGUAGES +
        '</td></tr>' +
        '<tr><th>Academic Opportunities</th><td>' +
        feature.properties.ACADEMICOPS1 +
        '</td></tr>' +
        '<tr><th>Advanced Placement</th><td>' +
        feature.properties.ADVPLACEMENT +
        '</td></tr>' +
        '<tr><th>Admission Method</th><td>' +
        feature.properties.ADMISSION_METHOD +
        '</td></tr>' +
        '<tr><th>Admission Priority</th><td>' +
        feature.properties.ADMISSION_PRIORITY +
        '</td></tr>' +
        '<tr><th colspan="2" class="table-cat">Activties</th></tr>' +
        '<tr><th>Activities</th><td>' +
        feature.properties.ACTIVITIES +
        '</td></tr>' +
        '<tr><th>Girls Team Sports</th><td>' +
        feature.properties.SPORTS_GIRLS +
        '</td></tr>' +
        '<tr><th>Boys Team Sports</th><td>' +
        feature.properties.SPORTS_BOYS +
        '</td></tr>' +
        '<tr><th colspan="2" class="table-cat">Additional School Information</th></tr>' +
        '<tr><th>Enrollment</th><td>' +
        feature.properties.ENROLLMENT +
        '</td></tr>' +
        '<tr><td colspan="2" class ="chart"><div id="chart-title">Enrollment Comparison Chart</div><div class="chartbox"> <canvas id="enrollmentChart"></canvas></div></div></td></tr>' +
        '<tr><th>Grades</th><td>' +
        feature.properties.GRADES2018 +
        '</td></tr>' +
        '<tr><th>School Hours</th><td>' +
        feature.properties.START_TIME +
        ' to ' +
        feature.properties.END_TIME +
        '</td></tr>' +
        '<tr><th>Programs</th><td>' +
        feature.properties.ADDINFO +
        '</td></tr>' +
        '<table>';
      var pop =
        '<h5>' +
        feature.properties.NAME +
        '</h5>' +
        // '<img width="16" height="16" src="assets/img/blueCircle.png">' +
        '<h6 style="color:' +
        highSchoolColors[feature.properties.FOCUS] +
        '">' +
        feature.properties.FOCUS +
        '</h6>';
      layer.on({
        click: function (e) {
          $('#feature-title').html(feature.properties.NAME);
          $('#feature-dbn').html('(' + feature.properties.DBN + ')');
          $('#feature-info').html(content);
          $('#featureModal').modal('show');
          initGraduationChart();
          initCollegeChart();
          initSafetyChart();
          initMixChart();
          initAttendanceChart();
          initEnrollmentChart();
          schoolDBN = feature.properties.DBN;
          // console.log(feature.properties.DBN);
          highlight
            .clearLayers()
            .addLayer(
              L.circleMarker(
                [
                  feature.geometry.coordinates[1],
                  feature.geometry.coordinates[0],
                ],
                highlightStyle
              )
            );
        },
      });
      layer.bindPopup(pop, {
        closeButton: false,
        offset: L.point(0, 0),
      });
      layer.on('mouseover', function () {
        layer.openPopup();
      });
      layer.on('mouseout', function () {
        layer.closePopup();
      });
      // $('#feature-list tbody').append(function () {
      //   if (feature.properties.FOCUS == 'Humanities & Interdisciplinary') {
      //     return (
      //       '<tr class="feature-row" id="' +
      //       L.stamp(layer) +
      //       '" lat="' +
      //       layer.getLatLng().lat +
      //       '" lng="' +
      //       layer.getLatLng().lng +
      //       '"><td style="vertical-align: middle;"><img width="16" height="16" src="assets/img/socialCircle.png"></td><td class="feature-name">' +
      //       'boo' +
      //       '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>'
      //     );
      //   }
      // });
      highSearch.push({
        name: layer.feature.properties.NAME,
        address: layer.feature.properties.ADRESS1,
        source: 'Highs',
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0],
      });
    }
  },
});
$.getJSON('data/high.json', function (data) {
  highs.addData(data);
  map.addLayer(highLayer);
});

map = L.map('map', {
  zoom: 10,
  center: [40.7, -73.97],
  layers: [cartoLight, districts, markerClusters, highlight],
  zoomControl: false,
  attributionControl: false,
});

/* Layer control listeners that allow for a single markerClusters layer */
map.on('overlayadd', function (e) {
  // if (e.layer === elementaryLayer) {
  //   markerClusters.addLayer(elementarys);
  //   syncSidebar();
  // }
  // if (e.layer === middleLayer) {
  //   markerClusters.addLayer(middles);
  //   syncSidebar();
  // }
  if (e.layer === highLayer) {
    markerClusters.addLayer(highs);
    syncSidebar();
  }
});

map.on('overlayremove', function (e) {
  // if (e.layer === elementaryLayer) {
  //   markerClusters.removeLayer(elementarys);
  //   syncSidebar();
  // }
  // if (e.layer === middleLayer) {
  //   markerClusters.removeLayer(middles);
  //   syncSidebar();
  // }
  if (e.layer === highLayer) {
    markerClusters.removeLayer(highs);
    syncSidebar();
  }
});

/* Filter sidebar feature list to only show features in current map bounds */
map.on('moveend', function (e) {
  syncSidebar();
});

/* Clear feature highlight when map is clicked */
map.on('click', function (e) {
  highlight.clearLayers();
});

/* Attribution control */
function updateAttribution(e) {
  $.each(map._layers, function (index, layer) {
    if (layer.getAttribution) {
      $('#attribution').html(layer.getAttribution());
    }
  });
}
map.on('layeradd', updateAttribution);
map.on('layerremove', updateAttribution);

var attributionControl = L.control({
  position: 'bottomright',
});
attributionControl.onAdd = function (map) {
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
    zoomHomeTitle: 'Zoom home',
  },

  onAdd: function (map) {
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

  onRemove: function (map) {
    map.off('zoomend zoomlevelschange', this._updateDisabled, this);
  },

  _zoomIn: function (e) {
    this._map.zoomIn(e.shiftKey ? 3 : 1);
  },

  _zoomOut: function (e) {
    this._map.zoomOut(e.shiftKey ? 3 : 1);
  },

  _zoomHome: function (e) {
    map.setView([40.7, -73.97], 10);
  },

  _createButton: function (html, title, className, container, fn) {
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

  _updateDisabled: function () {
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
  },
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
      fillOpacity: 0.8,
    },
    circleStyle: {
      weight: 1,
      clickable: false,
    },
    icon: 'fa fa-location-arrow',
    metric: false,
    strings: {
      title: 'My location',
      popup: 'You are within {distance} {unit} from this point',
      outsideMapBoundsMsg: 'You seem located outside the boundaries of the map',
    },
    locateOptions: {
      maxZoom: 16,
      watch: true,
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 10000,
    },
  })
  .addTo(map);

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

var baseLayers = {
  'Street Map': cartoLight,
};

var groupedOverlays = {
  Layers: {
    "&nbsp;High Schools</br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src='assets/img/stemCircle.png' width='12' height='12'>&nbsp;STEM</br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src='assets/img/socialCircle.png' width='12' height='12'>&nbsp;Social Studies</br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src='assets/img/artCircle.png' width='12' height='12'>&nbsp;Arts</br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src='assets/img/otherCircle.png' width='12' height='12'>&nbsp;Other": highLayer,
  },
  Reference: {
    "<img src='assets/img/district.png' width='16' height='16'>&nbsp;School Districts": districts,
    "<img src='assets/img/lines.png' width='16' height='16'>&nbsp;Subway Lines": subwayLines,
    "<img src='assets/img/station.png' width='16' height='18'>&nbsp;Stations": stations,
  },
};

var layerControl = L.control
  .groupedLayers(baseLayers, groupedOverlays, {
    collapsed: isCollapsed,
  })
  .addTo(map);

/* Highlight search box text on click */
$('#searchbox').click(function () {
  $(this).select();
});

/* Prevent hitting enter from refreshing the page */
$('#searchbox').keypress(function (e) {
  if (e.which == 13) {
    e.preventDefault();
  }
});

$('#featureModal').on('hidden.bs.modal', function (e) {
  $(document).on('mouseout', '.feature-row', clearHighlight);
});

$('#chartModal').on('hidden.bs.modal', function (e) {
  $(document).on('mouseout', '.feature-row', clearHighlight);
});
/* Typeahead search functionality */
$(document).one('ajaxStop', function () {
  $('#loading').hide();
  sizeLayerControl();
  /* Fit map to districts bounds */
  map.fitBounds(districts.getBounds());
  featureList = new List('features', { valueNames: ['feature-name'] });
  featureList.sort('feature-name', { order: 'asc' });

  var districtsBH = new Bloodhound({
    name: 'Districts',
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: districtSearch,
    limit: 10,
  });

  var highsBH = new Bloodhound({
    name: 'Highs',
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: highSearch,
    limit: 10,
  });

  var geonamesBH = new Bloodhound({
    name: 'GeoNames',
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
      url:
        'http://api.geonames.org/searchJSON?username=bootleaf&featureClass=P&maxRows=5&countryCode=US&name_startsWith=%QUERY',
      filter: function (data) {
        return $.map(data.geonames, function (result) {
          return {
            name: result.name + ', ' + result.adminCode1,
            lat: result.lat,
            lng: result.lng,
            source: 'GeoNames',
          };
        });
      },
      ajax: {
        beforeSend: function (jqXHR, settings) {
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
        complete: function (jqXHR, status) {
          $('#searchicon')
            .removeClass('fa-refresh fa-spin')
            .addClass('fa-search');
        },
      },
    },
    limit: 10,
  });
  districtsBH.initialize();

  highsBH.initialize();
  geonamesBH.initialize();

  /* instantiate the typeahead UI */
  $('#searchbox')
    .typeahead(
      {
        minLength: 3,
        highlight: true,
        hint: false,
      },
      {
        name: 'Districts',
        displayKey: 'name',
        source: districtsBH.ttAdapter(),
        templates: {
          header: "<h5 class='typeahead-header'>Districts</h5>",
        },
      },

      {
        name: 'Highs',
        displayKey: 'name',
        source: highsBH.ttAdapter(),
        templates: {
          header:
            "<h5 class='typeahead-header'><img src='assets/img/blueCircle.png' width='14' height='14'>&nbsp;High Schools</h5>",
          suggestion: Handlebars.compile(
            ['{{name}}<br>&nbsp;<small>{{address}}</small>'].join('')
          ),
        },
      },
      {
        name: 'GeoNames',
        displayKey: 'name',
        source: geonamesBH.ttAdapter(),
        templates: {
          header:
            "<h5 class='typeahead-header'><img src='assets/img/globe.png' width=18'' height='18'>&nbsp;Places</h5>",
        },
      }
    )
    .on('typeahead:selected', function (obj, datum) {
      if (datum.source === 'Districts') {
        map.fitBounds(datum.bounds);
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
    .on('typeahead:opened', function () {
      $('.navbar-collapse.in').css(
        'max-height',
        $(document).height() - $('.navbar-header').height()
      );
      $('.navbar-collapse.in').css(
        'height',
        $(document).height() - $('.navbar-header').height()
      );
    })
    .on('typeahead:closed', function () {
      $('.navbar-collapse.in').css('max-height', '');
      $('.navbar-collapse.in').css('height', '');
    });
  $('.twitter-typeahead').css('position', 'static');
  $('.twitter-typeahead').css('display', 'block');
});

map.on('zoomend', function (e) {
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

//*****************Graduation Chart************ */
function initGraduationChart() {
  d3.csv('data/graduation.csv').then(makeChart);

  function makeChart(schools) {
    var schoolLabels = schools.map(function (d) {
      return d.DBN;
    });
    var gradRate = schools.map(function (d) {
      return d.GRADUATION_RATE * 100;
    });
    var schoolColors = schools.map(function (d) {
      return d.DBN === schoolDBN ? '#ff0000' : '#0064b4';
    });
    // console.log(schoolDBN);
    // console.log(schoolColors);
    var chart = new Chart('graduationChart', {
      type: 'bar',
      options: {
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false,
              },
              ticks: {
                display: false,
              },
            },
          ],
        },
        // maintainAspectRatio: true,
        legend: {
          display: false,
        },
      },
      data: {
        labels: schoolLabels,
        datasets: [
          {
            data: gradRate,
            backgroundColor: schoolColors,
          },
        ],
      },
    });
  }
}

//*****************College Chart************ */
function initCollegeChart() {
  d3.csv('data/college.csv').then(makeChart);

  function makeChart(schools) {
    var schoolLabels = schools.map(function (d) {
      return d.DBN;
    });
    var collegeRate = schools.map(function (d) {
      return d.COLLEGE_RATE * 100;
    });
    var schoolColors = schools.map(function (d) {
      return d.DBN === schoolDBN ? '#ff0000' : '#0064b4';
    });
    var chart = new Chart('collegeChart', {
      type: 'bar',
      options: {
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false,
              },
              ticks: {
                display: false,
              },
            },
          ],
        },
        // maintainAspectRatio: true,
        legend: {
          display: false,
        },
      },
      data: {
        labels: schoolLabels,
        datasets: [
          {
            data: collegeRate,
            backgroundColor: schoolColors,
          },
        ],
      },
    });
  }
}

//*****************Attendance Chart************ */
function initAttendanceChart() {
  d3.csv('data/attendance.csv').then(makeChart);

  function makeChart(schools) {
    var schoolLabels = schools.map(function (d) {
      return d.DBN;
    });
    var attendanceRate = schools.map(function (d) {
      return d.ATTENDANCE_RATE * 100;
    });
    var schoolColors = schools.map(function (d) {
      return d.DBN === schoolDBN ? '#ff0000' : '#0064b4';
    });
    // console.log(schoolDBN);
    // console.log(schoolColors);
    var chart = new Chart('attendanceChart', {
      type: 'bar',
      options: {
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false,
              },
              ticks: {
                display: false,
              },
            },
          ],
        },
        // maintainAspectRatio: true,
        legend: {
          display: false,
        },
      },
      data: {
        labels: schoolLabels,
        datasets: [
          {
            data: attendanceRate,
            backgroundColor: schoolColors,
          },
        ],
      },
    });
  }
}

//*****************Safety Chart************ */
function initSafetyChart() {
  d3.csv('data/safety.csv').then(makeChart);

  function makeChart(schools) {
    var schoolLabels = schools.map(function (d) {
      return d.DBN;
    });
    var safetyRate = schools.map(function (d) {
      return d.SAFETY_RATE * 100;
    });
    var schoolColors = schools.map(function (d) {
      return d.DBN === schoolDBN ? '#ff0000' : '#0064b4';
    });
    // console.log(schoolDBN);
    // console.log(schoolColors);
    var chart = new Chart('safetyChart', {
      type: 'bar',
      options: {
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false,
              },
              ticks: {
                display: false,
              },
            },
          ],
        },
        // maintainAspectRatio: true,
        legend: {
          display: false,
        },
      },
      data: {
        labels: schoolLabels,
        datasets: [
          {
            data: safetyRate,
            backgroundColor: schoolColors,
          },
        ],
      },
    });
  }
}

//*****************Mix Chart************ */
function initMixChart() {
  d3.csv('data/mix.csv').then(makeChart);

  function makeChart(schools) {
    var schoolLabels = schools.map(function (d) {
      return d.DBN;
    });
    var mixRate = schools.map(function (d) {
      return d.MIX_RATE * 100;
    });
    var schoolColors = schools.map(function (d) {
      return d.DBN === schoolDBN ? '#ff0000' : '#0064b4';
    });
    var chart = new Chart('mixChart', {
      type: 'bar',
      options: {
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false,
              },
              ticks: {
                display: false,
              },
            },
          ],
        },
        maintainAspectRatio: true,
        legend: {
          display: false,
        },
      },
      data: {
        labels: schoolLabels,
        datasets: [
          {
            data: mixRate,
            backgroundColor: schoolColors,
          },
        ],
      },
    });
  }
}

//*****************Enrollment Chart************ */
function initEnrollmentChart() {
  d3.csv('data/enrollment.csv').then(makeChart);

  function makeChart(schools) {
    var schoolLabels = schools.map(function (d) {
      return d.DBN;
    });
    var enrollmentRate = schools.map(function (d) {
      return d.ENROLLMENT;
    });
    var schoolColors = schools.map(function (d) {
      return d.DBN === schoolDBN ? '#ff0000' : '#0064b4';
    });
    var chart = new Chart('enrollmentChart', {
      type: 'bar',
      options: {
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false,
              },
              ticks: {
                display: false,
              },
            },
          ],
        },
        maintainAspectRatio: true,
        legend: {
          display: false,
        },
      },
      data: {
        labels: schoolLabels,
        datasets: [
          {
            data: enrollmentRate,
            backgroundColor: schoolColors,
          },
        ],
      },
    });
  }
}
