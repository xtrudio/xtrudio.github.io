let log = console.log;
var mymap;
var lyrOSM;
var lyrWatercolor;
var lyrCartoLight;
var lyrStations;
var lyrStationsBuffer;
var jsnStationsBuffer;
var lyrSubwayLines;
var lyrLots;
var lyrLotPoints;
var lyrZones;
var lyrSearch;
var mrkCurrentLocation;
var ctlAttribute;
var ctlScale;
var ctlFullScreen;
var ctlMouseposition;
var ctlEasybutton;
var ctlSidebar;
var ctlLayers;
var ctlStyle;
var objBasemaps;
var objOverlays;
var arStations = [];
var arLotIDs = [];
var arLots = [];

//  ********* Map Initialization ****************

mymap = L.map('mapdiv', {
  center: [40.7, -73.8],
  zoom: 11,
  minZoom: 10,
  maxZoom: 17,
  fullscreenControl: true,
  // fullscreenControlOptions: {
  //   position: 'topleft',
  // },
  attributionControl: false,
});

// ctlSidebar = L.control.sidebar('side-bar').addTo(mymap);

ctlAttribute = L.control.attribution().addTo(mymap);
ctlAttribute.addAttribution('CartoLight');
ctlAttribute.addAttribution(
  '&copy; <a href="http://xtrudio.com">Horia Popa</a>'
);

ctlScale = L.control
  .scale({
    position: 'bottomleft',
    metric: false,
    maxWidth: 200,
  })
  .addTo(mymap);

ctlMouseposition = L.control.mousePosition().addTo(mymap);

//   *********** Layer Initialization **********

// lyrOSM = L.tileLayer.provider('OpenStreetMap.Mapnik');
// lyrCartoLight = L.tileLayer(
//   'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
//   {
//     minNativeZoom: 9,
//     maxNativeZoom: 17,
//     subdomains: '1234',
//     bounds: L.latLngBounds([39.3682, -75.9374], [42.0329, -71.7187]),
//   }
// );

// mymap.addLayer(lyrCartoLight);

// **************  Zoning Districts Layer *************

lyrZones = L.geoJSON.ajax('data/zoning.json', {
  style: styleZones,
  onEachFeature: processZones,
});
// .bindTooltip('Zone...')
// .addTo(mymap);

lyrZones.on('data:loaded', function () {
  // log('zones');
});

// **************  Subway Lines Layer *************

lyrSubwayLines = L.geoJSON.ajax('data/subLines.json', {
  style: styleSubwayLines,
});
// .addTo(mymap);

// **************  Subway Stations Layer *************
function returnStationMarker(json, latlng) {
  return L.circle(latlng, {
    radius: 12,
    weight: 2,
    color: '#444',
    fillColor: 'gray',
    fillOpacity: 0.5,
  });
}
lyrStations = L.geoJSON
  .ajax('data/stations.json', {
    pointToLayer: returnStationMarker,
    onEachFeature: processStations,
  });
  // .bindTooltip();
// .addTo(mymap);
lyrStations.bringToFront();

// **************  Vacant Lots Polygon Layer *************

lyrLots = L.geoJSON
  .ajax('data/nyc_vacantlots_poly_tg.json', {
    style: styleLots,
    onEachFeature: processLots,
    filter: filterLots,
  })
  .bringToFront()
  .addTo(mymap);
// log('lots loaded');
// log(arLotIDs);
lyrLots.on('data:loaded', function () {
  // log(data);
  arLotIDs.sort(function (a, b) {
    // log(arLotIDs[0]);
    return a - b;
  });

  $('#txtFindLot').autocomplete({
    source: arLotIDs,
  });
});

// **************  Vacant Lots Centerpoint Layer *************

// function LotMarker(json, latlng) {
//   return L.circle(latlng, {
//     radius: 3,
//     weight: 1,
//     color: 'red',
//     // fillColor: 'gray',
//     fillOpacity: 1,
//   });
// }

// lyrLotPoints = L.geoJSON
//   .ajax('data/lots_point.json', {
//     pointToLayer: LotMarker,
//     onEachFeature: processLotPoints,
//   })
//   .bindTooltip();
//   lyrLotPoints.addTo(mymap);
// lyrLotPoints.bringToFront();

function LotMarker(json, latlng) {
  return L.circle(latlng, {
    radius: 8,
    weight: 2,
    color: 'red',
    // fillColor: 'gray',
    fillOpacity: 1,
  });
}

// ********* Setup Layer Control  ***************

objBasemaps = {
  // 'Carto Light': lyrCartoLight,
  // 'Open Street Maps': lyrOSM,
};

objOverlays = {
  'Vacant Lots': lyrLots,
  'Subway Stations': lyrStations,
  'Subway Lines': lyrSubwayLines,
  Zones: lyrZones,
};
//
ctlLayers = L.control.layers(objBasemaps, objOverlays).addTo(mymap);

// **************  Locate function *************

mymap.on('locationfound', function (e) {
  // log(e);
  if (mrkCurrentLocation) {
    mrkCurrentLocation.remove();
  }
  mrkCurrentLocation = L.circle(e.latlng, {
    radius: e.accuracy / 2,
  }).addTo(mymap);
  mymap.setView(e.latlng, 14);
});

mymap.on('locationerror', function (e) {
  // log(e);
  alert('Location was not found');
});

// **************  Map Search Control *************

var searchControl = new L.Control.Search({
  layer: lyrZones,
  propertyName: 'NTAName',
  marker: false,
  moveToLocation: function (latlng, title, mymap) {
    mymap.fitBounds(latlng.layer.getBounds());
    var zoom = mymap.getBoundsZoom(latlng.layer.getBounds());
    mymap.setView(latlng, zoom); // access the zoom
    // lyrZones.bringToFront();
  },
});

searchControl
  .on('search:locationfound', function (e) {
    e.layer.setStyle({ fillColor: '#3f0', color: '#0f0' });
    if (e.layer._popup) e.layer.openPopup();
  })
  .on('search:collapsed', function (e) {
    lyrNTAS.eachLayer(function (layer) {
      //restore feature color
      lyrNTAS.resetStyle(layer);
    });
  });

mymap.addControl(searchControl);
//initialize search control//

//  ********* Vacant Lots Functions

function styleLots(json) {
  var att = json.properties;
  switch (att.TYPE) {
    case 'Block assemblage':
      return {
        color: '#428045',
        fillColor: '#6acc6f',
      };
    // break;
    case 'Waterfront':
      return {
        color: '#b08100',
        fillColor: '#ffbb00',
      };
    // break;
    case 'Corner':
      return {
        color: '#74498a',
        fillColor: '#ae6dcf',
      }; // break;
    case 'Through':
      return {
        color: '#8a0f0f',
        fillColor: '#f01a1a',
      };
    // break;
    case 'Inside':
      return {
        color: '#1560bd',
        fillColor: '#1a7af0',
      };
    // break;
    case 'Interior lot':
      return {
        color: '#3c6e73',
        fillColor: '#6ac4cc',
      };
    // break;
    case 'Island lot':
      return {
        color: '#5a733c',
        fillColor: '#aad971',
      };
    // break;
    case 'Alley lot':
      return {
        color: '#6e5f59',
        fillColor: '#917e76',
      };
    // break;
  }
}

function processLots(feature, lyr) {
  // log(lyr);
  var att = feature.properties;
  var geo = feature.geometry;
  lyr.bindTooltip(
    '<h5>Lot ID: ' +
      att.id +
      '</h5>Area: ' +
      att.AREA +
      ' sq. ft. <br>Front: ' +
      att.FRONT +
      ' ft.'
  );

  arLotIDs.push(att.id);
  arLots.push(att.id, geo.coordinates);
  lyr.on('click', function () {
    document.getElementById('infoPanel').style.display = 'block';
    var att = lyr.feature.properties;
    $('#content-area').html(
      '<h4 >Lot description</h4><p><strong>Address:</strong> ' +
        att.ADDRESS +
        '</p><p><strong>Type:</strong> ' +
        att.TYPE +
        '</p><p><strong>Zoning District:</strong> ' +
        att.ZONING +
        '</p><p><strong>FAR:</strong> ' +
        att.FAR +
        '</p><p><strong>Front</strong>: ' +
        att.FRONT +
        ' ft. </p><p><strong>Depth</strong>: ' +
        att.DEPTH +
        ' ft. </p><p><strong>Area</strong> ' +
        att.AREA +
        ' sq. ft. </p><p><strong>Asessment:</strong> $' +
        att.ASESSMENT +
        ' </p>'
    );
  });
}

function filterLots(json) {
  var arLotFilter = [];
  $('input[name=fltLot]').each(function () {
    if (this.checked) {
      arLotFilter.push(this.value);
    }
  });

  var att = json.properties;
  switch (att.TYPE) {
    case 'Block':
      return arLotFilter.indexOf('Block') >= 0;
    // break;
    case 'Waterfront':
      return arLotFilter.indexOf('Waterfront') >= 0;
    // break;
    case 'Through':
      return arLotFilter.indexOf('Through') >= 0;
    // break;
    case 'Interior':
      return arLotFilter.indexOf('Interior') >= 0;
    // break;
    case 'Corner':
      return arLotFilter.indexOf('Corner') >= 0;
    // break;
    case 'Inside':
      return arLotFilter.indexOf('Inside') >= 0;
    // break;
    default:
      return arLotFilter.indexOf('Other') >= 0;
    // break;
  }
  // if (att.ZONING == 'REMOVED') {
  //   return false;
  // } else {
  //   // log('lots filtered');
  //   return true;
  // }
}

$('#txtFindLot').on('keyup paste', function () {
  log('lots found');
  var val = $('#txtFindLot').val();
  log(val);
  testLayerAttribute(
    arLotIDs,
    val,
    'Lot ID',
    '#divFindLot',
    '#divLotError',
    '#btnFindLot'
  );
});

$('#btnFindLot').click(function () {
  var val = $('#txtFindLot').val();
  var lyr = returnLayerByAttribute(lyrLots, 'id', val);
  if (lyr) {
    if (lyrSearch) {
      lyrSearch.remove();
    }
    lyrSearch = L.geoJSON(lyr.toGeoJSON(), {
      style: {
        color: 'red',
        weight: 10,
        opacity: 0.5,
        fillOpacity: 0,
      },
    }).addTo(mymap);
    mymap.fitBounds(lyr.getBounds().pad(1));
    var att = lyr.feature.properties;
    $('#divLotData').html(
      '<h4>Lot description</h4><p><span>Address:</span> ' +
        att.ADDRESS +
        '</p><h5>Type: ' +
        att.TYPE +
        '</h5><h5>Zoning District: ' +
        att.ZONING +
        '</h5><h5>FAR: ' +
        att.FAR +
        '</h5><h5>Front: ' +
        att.FRONT +
        ' ft. </h5><h5>Depth: ' +
        att.DEPTH +
        ' ft. </h5><h5>Area: ' +
        att.AREA +
        ' sq. ft. </h5><h5>Asessment: $' +
        att.ASESSMENT +
        ' </h5>'
    );
    $('#divLotError').html('');
  } else {
    $('#divLotError').html('**** Lot ID not found ****');
  }
});

$('#lblLot').click(function () {
  $('#divLotData').toggle();
});

$('#btnLotFilterAll').click(function () {
  $('input[name=fltLot]').prop('checked', true);
});
$('#btnLotFilterNone').click(function () {
  $('input[name=fltLot]').prop('checked', false);
});
$('#btnLotFilter').click(function () {
  arLotIDs = [];
  lyrLots.refresh();
});
//  ********* Zones Functions

function processZones(json, lyr) {
  var att = json.properties;
  lyr.bindTooltip('<strong> ' + att.ZONE + '</strong>');
  lyr.on({
    mouseover: function (e) {
      e.target.setStyle({ fillColor: 'yellow', opacity: 1 });
    },
    mouseout: (e) => lyrZones.resetStyle(e.target),
  });
  // arLotIDs.push(att.id);

  //  ********* Display info on the right panel
  // lyr.on('click', function () {
  //   document.getElementById('infoPanel').style.display = 'block';
  //   var att = lyr.feature.properties;
  //   $('#content-area').html(
  //     '<h4 >Hood</h4><h5>Name: ' + att.NTAName + '</h5><h5>'
  //   );
  // });
}

function styleZones(json) {
  var att = json.properties;
  switch (att.ZONE) {
    case 'R1-1':
    case 'R1-2':
    case 'R1-2A':
      return {
        opacity: 0.2,
        weight: 1,
        color: '#428045',
        fillColor: '#6acc6f',
      };
    // break;
    case 'R2':
    case 'R2A':
    case 'R2X':
      return {
        opacity: 0.2,
        weight: 1,
        color: '#b08100',
        fillColor: '#ffbb00',
      };
    // break;
    case 'R3-1':
    case 'R3-2':
    case 'R3A':
    case 'R3X':
      return {
        opacity: 0.2,
        weight: 1,
        color: '#74498a',
        fillColor: '#ae6dcf',
      }; // break;
    case 'R4':
    case 'R4-1':
    case 'R4A':
    case 'R4B':
      return {
        opacity: 0.2,
        weight: 1,
        color: '#8a0f0f',
        fillColor: '#f01a1a',
      };
    // break;
    case 'R5':
    case 'R5A':
    case 'R5B':
    case 'R5D':
      return {
        opacity: 0.2,
        weight: 1,
        color: '#1560bd',
        fillColor: '#1a7af0',
      };
    // break;
    case 'R6':
    case 'R6A':
    case 'R6B':
      return {
        opacity: 0.2,
        weight: 1,
        color: '#3c6e73',
        fillColor: '#6ac4cc',
      };
    // break;
    case 'R7-1':
    case 'R7-2':
    case 'R7-3':
    case 'R7A':
    case 'R7B':
    case 'R7D':
    case 'R7X':
      return {
        opacity: 0.2,
        weight: 1,
        color: '#63733c',
        fillColor: '#c6d971',
      };
    // break;
    case 'R8':
    case 'R8A':
    case 'R8B':
    case 'R8X':
      return {
        opacity: 0.2,
        weight: 1,
        color: '#1560bd',
        fillColor: '#1a7af0',
      };
    // break;
    case 'R9':
    case 'R9A':
    case 'R9B':
    case 'R9X':
      return {
        opacity: 0.2,
        weight: 1,
        color: '#966526',
        fillColor: '#b67f37',
      };
    // break;
    case 'R10':
    case 'R10A':
    case 'R10H':
      return {
        opacity: 0.2,
        weight: 1,
        color: '#6e5f59',
        fillColor: '#917e76',
      };
    // break;
    default:
      return {
        opacity: 0.2,
        weight: 1,
        color: '#666666',
        fillColor: '#555555',
      };
  }
}

//  ********* Subway Lines Functions

function styleSubwayLines(json) {
  var att = json.properties;
  switch (att.route_id) {
    case '1':
    case '2':
    case '3':
      return {
        weight: 2,
        color: '#ee352e',
      };
    // break;
    case '4':
    case '5':
    case '6':
      return {
        weight: 2,
        color: '#00933c',
      };
    // break;
    case '7':
      return {
        weight: 2,
        color: '#b933ad',
      };
    // break;
    case 'A':
    case 'C':
    case 'E':
    case 'H':
      return {
        weight: 2,
        color: '#0039a6',
      };
    // break;
    case 'B':
    case 'D':
    case 'F':
    case 'M':
      return {
        weight: 2,
        color: '#ff6319',
      };
    // break;
    case 'G':
      return {
        weight: 2,
        color: '#6cbe45',
      };
    // break;
    case 'J':
    case 'Z':
      return {
        weight: 2,
        color: '#996633',
      };
    // break;
    case 'L':
      return {
        weight: 2,
        color: '#a7a9ac',
      };
    // break;
    case 'N':
    case 'Q':
    case 'R':
      return {
        weight: 2,
        color: '#fccc0a',
      };
    // break;
    case 'SI':
      return {
        weight: 2,
        color: '#B933AD',
      };
    // break;
    default:
      return {
        weight: 2,
        color: '#a7a9ac',
      };
  }
}
//  *********  Stations Functions  ************

function processStations(json, lyr) {
  var att = json.properties;
  lyr.bindTooltip('<strong>' + att.name + '</strong><br>' + att.line +'<br>' + att.notes);
  arStations.push(json.geometry);
  // lyr.on('click', function () {
  //   document.getElementById('infoPanel').style.display = 'block';
  //   var att = lyr.feature.properties;
  //   $('#content-area').html(
  //     '<h4 >Lot description</h4><h5>Address: ' +
  //       att.ADDRESS +
  //       '</h5><h5>Type: ' +
  //       att.TYPE +
  //       '</h5><h5>Zoning District: ' +
  //       att.ZONING +
  //       '</h5><h5>FAR: ' +
  //       att.FAR +
  //       '</h5><h5>Front: ' +
  //       att.FRONT +
  //       ' ft. </h5><h5>Depth: ' +
  //       att.DEPTH +
  //       ' ft. </h5><h5>Area: ' +
  //       att.AREA +
  //       ' sq. ft. </h5><h5>Asessment: $' +
  //       att.ASESSMENT +
  //       ' </h5>'
  //   );
  // });
}

//  *********  Lot Points Functions  ************

function processLotPoints(json, lyr) {
  var att = json.properties;
  lyr.bindTooltip('<h5>' + 'att.name' + '</h5>');
  // arStations.push(json.geometry);
  // lyr.on('click', function () {
  //   document.getElementById('infoPanel').style.display = 'block';
  //   var att = lyr.feature.properties;
  //   $('#content-area').html(
  //     '<h4 >Lot description</h4><h5>Address: ' +
  //       att.ADDRESS +
  //       '</h5><h5>Type: ' +
  //       att.TYPE +
  //       '</h5><h5>Zoning District: ' +
  //       att.ZONING +
  //       '</h5><h5>FAR: ' +
  //       att.FAR +
  //       '</h5><h5>Front: ' +
  //       att.FRONT +
  //       ' ft. </h5><h5>Depth: ' +
  //       att.DEPTH +
  //       ' ft. </h5><h5>Area: ' +
  //       att.AREA +
  //       ' sq. ft. </h5><h5>Asessment: $' +
  //       att.ASESSMENT +
  //       ' </h5>'
  //   );
  // });
}

//  *********  jQuery Event Handlers  ************

$('#btnLocate').click(function () {
  mymap.locate();
});

$('#btnShowLegend').click(function () {
  $('#legend').toggle();
});

// ************    Legend Functions    ************

// *** Display info

$('#lgndBlock').click(function () {
  document.getElementById('infoPanel').style.display = 'block';
  $('#content-area').load('./text/lotTypes.txt #p1');
});
$('#lgndWaterfront').click(function () {
  document.getElementById('infoPanel').style.display = 'block';
  $('#content-area').load('./text/lotTypes.txt #p2');
});

$('#lgndCorner').click(function () {
  document.getElementById('infoPanel').style.display = 'block';
  $('#content-area').load('./text/lotTypes.txt #p3');
});

$('#lgndThrough').click(function () {
  document.getElementById('infoPanel').style.display = 'block';
  $('#content-area').load('./text/lotTypes.txt #p4');
});

$('#lgndInside').click(function () {
  document.getElementById('infoPanel').style.display = 'block';
  $('#content-area').load('./text/lotTypes.txt #p5');
});

$('#lgndInterior').click(function () {
  document.getElementById('infoPanel').style.display = 'block';
  $('#content-area').load('./text/lotTypes.txt #p6');
});

$('#lgndIsland').click(function () {
  document.getElementById('infoPanel').style.display = 'block';
  $('#content-area').load('./text/lotTypes.txt #p7');
});

$('#lgndAlley').click(function () {
  document.getElementById('infoPanel').style.display = 'block';
  $('#content-area').load('./text/lotTypes.txt #p8');
});

$('#lgndR1').click(function () {
  document.getElementById('infoPanel').style.display = 'block';
  $('#content-area').load('./text/zones.txt #p1');
});

// ************    Nav Functions

$('#btnAbout').click(function () {
  document.getElementById('infoPanel').style.display = 'block';
  $('#content-area').load('./text/about.txt');
});

$('#btnFeatures').click(function () {
  document.getElementById('infoPanel').style.display = 'block';
  $('#content-area').load('./text/features.txt');
});

$('#btnData').click(function () {
  document.getElementById('infoPanel').style.display = 'block';
  $('#content-area').load('./text/data.txt');
});

// *** Hide Legend Item

$('#btnSubLines').click(function () {
  $('#lgndSubLinesItems').toggle();
});

$('#btnLots').click(function () {
  $('#lgndLotsItems').toggle();
});

$('#btnZones').click(function () {
  $('#lgndZonesItems').toggle();
});

//  ***********  General Functions *********

const toggleButton = document.getElementsByClassName('toggle-button')[0];
const navbarLinks = document.getElementsByClassName('mynavbar-links')[0];

toggleButton.addEventListener('click', () => {
  navbarLinks.classList.toggle('active');
});

function summarizePoints(fcPoint, prop) {
  lot = turf.featureCollection([lot]);
  lot = turf.collect(lot, fcPoint, prop, prop + 'Vals');
}

function summarizeArray(ar) {
  var arUnique = [];
  var arCount = [];
  for (let i = 0; i < ar.length; i++) {
    let idx = arUnique.indexOf(ar[i]);
    if (idx < 0) {
      arUnique.push(ar[i]);
      arCount.push(1);
    } else {
      arCount[idx] = arCount[idx] + 1;
    }
  }
  return [arUnique, arCount];
}
function closeInfoPanel() {
  document.getElementById('infoPanel').style.display = 'none';
}

function LatLngToArrayString(ll) {
  return '[' + ll.lat.toFixed(5) + ', ' + ll.lng.toFixed(5) + ']';
}

function returnLayerByAttribute(lyr, att, val) {
  var arLayers = lyr.getLayers();
  for (i = 0; i < arLayers.length - 1; i++) {
    var ftrVal = arLayers[i].feature.properties[att];
    if (ftrVal == val) {
      return arLayers[i];
    }
  }
  return false;
}

function testLayerAttribute(ar, val, att, fg, err, btn) {
  if (ar.indexOf(val) < 0) {
    $(fg).addClass('has-error');
    $(err).html('**** ' + att + ' NOT FOUND ****');
    $(btn).attr('disabled', true);
  } else {
    $(fg).removeClass('has-error');
    $(err).html('');
    $(btn).attr('disabled', false);
  }
}

// ******Limit visibility by zoom
mymap.on('zoomend', function (e) {
  // if (mymap.getZoom() <= 17 && mymap.getZoom() >= 14) {
  //   mymap.addLayer(lyrLots);
  // } else if (mymap.getZoom() > 17 || mymap.getZoom() < 14) {
  //   mymap.removeLayer(lyrLots);
  // }
  if (mymap.getZoom() <= 16 && mymap.getZoom() >= 15) {
    mymap.addLayer(lyrSubwayLines);
  } else if (mymap.getZoom() > 16 || mymap.getZoom() < 15) {
    mymap.removeLayer(lyrSubwayLines);
  }
  if (mymap.getZoom() <= 16 && mymap.getZoom() >= 15) {
    mymap.addLayer(lyrStations);
  } else if (mymap.getZoom() > 16 || mymap.getZoom() < 15) {
    mymap.removeLayer(lyrStations);
  }
});

// // *************** Points in Polygons **************
// log(lyrLotPointsTurf);
// var points = turf.featureCollection(arLotPointsTurf);
// log(points);
