
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
var lyrLots2;
var lyrLotPointsResDen;
var lyrLotPointsBus;
var lyrZones;
var lyrSearch;
var mrkCurrentLocation;
var ctlAttribute;
var ctlScale;
var ctlFullScreen;
var ctlMouseposition;
var ctlEasybutton;
var fgpDrawnItems;
var ctlDraw;
var ctlSidebar;
var ctlMeasure;
var ctlLayers;
var ctlStyle;
var objBasemaps;
var objOverlays;
var arStations = [];
var arLotIDs = [];
var arLots = [];
var checkboxStates;



// d3.csv("data/resdens.csv").then(function(data) {
//   console.log(data[0]); // [{"Hello": "world"}, …]
// });

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

lyrOSM = L.tileLayer.provider('OpenStreetMap.Mapnik');
lyrCartoLight = L.tileLayer(
  'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
  {
    minNativeZoom: 9,
    maxNativeZoom: 17,
    subdomains: '1234',
    bounds: L.latLngBounds([39.3682, -75.9374], [42.0329, -71.7187]),
  }
);

mymap.addLayer(lyrCartoLight);



// **************  Zoning Districts Layer *************

lyrZones = L.geoJSON
  .ajax('data/zoning.json', {
    style: styleZones,
    onEachFeature: processZones,
  })
  // .bindTooltip('Zone...')
  .addTo(mymap);

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
lyrStations = L.geoJSON.ajax('data/stations.json', {
  pointToLayer: returnStationMarker,
  onEachFeature: processStations,
});
// .bindTooltip();
// .addTo(mymap);
lyrStations.bringToFront();

// **************  Vacant Lots Polygon Layer *************

// lyrLots = L.geoJSON.ajax('data/lots_poly.json', {
//     style: styleLots,
//     onEachFeature: processLots,
//     filter:  filterLots,
// });
//   .bringToFront()
//   .addTo(mymap);

lyrLots = L.geoJSON(null, {
  style: styleLots,
  onEachFeature: processLots,
  filter: (feature) => {
    const isTypeChecked = checkboxStates.types.includes(
      feature.properties.TYPE
    );
    const isAreaChecked = checkboxStates.areas.includes(
      feature.properties.AreaCAT
    );
    const isFarChecked = checkboxStates.fars.includes(
      feature.properties.FARCAT
    );
    return isTypeChecked && isFarChecked && isAreaChecked; //only true if all are true
  },
})
.addTo(mymap);
lyrLots.bringToFront();

function updateCheckboxStates() {
  checkboxStates = {
    types: [],
    areas: [],
    fars: [],
  };

  for (let input of document.querySelectorAll('input')) {
    if (input.checked) {
      switch (input.className) {
        case 'TYPE':
          checkboxStates.types.push(input.value);
          break;
        case 'areaCAT':
          checkboxStates.areas.push(input.value);
          break;
        case 'FARCAT':
          checkboxStates.fars.push(input.value);
          break;
      }
    }
  }
}

for (let input of document.querySelectorAll('input')) {
  //Listen to 'change' event of all inputs
  input.onchange = (e) => {
    lyrLots.clearLayers();
    updateCheckboxStates();

    $.getJSON('data/lots_poly.json', function (data) {
      lyrLots.addData(data);
      lyrLots.bringToFront();
    });
  };
}
var lotData;
/****** INIT ******/
updateCheckboxStates();
$.getJSON('data/lots_poly.json', function (data) {
  lyrLots.addData(data);
  lyrLots.bringToFront();
});
// log('lots loaded');
// log(arLotIDs);
// lyrLots.on('data:loaded', function () {
//   // log(data);
//   arLotIDs.sort(function (a, b) {
//     log(arLotIDs[0]);
//     return a - b;
//   });

//   $('#txtFindLot').autocomplete({
//     source: arLotIDs,
//   });
// });

// **************  Vacant Lots Point Layer *************

lyrLotPointsResDen = L.geoJSON
  .ajax('data/lots_point.json', {
    pointToLayer: function (feature, latlng) {
      let school_marker = {
        radius: 5,
        fillColor: resDenColors[feature.properties.class_resden],
        stroke: false,
        // weight: 1,
        // opacity: 1,
        fillOpacity: 0.4,
      };
      var marker = L.circleMarker(latlng, school_marker);
  
      return marker;
    },
    onEachFeature: processLotPoints,
  });
  // .bindTooltip();
  // lyrLotPointsResDen.addTo(mymap);
// lyrLotPoints.bringToFront();

lyrLotPointsBus = L.geoJSON
  .ajax('data/lots_point.json', {
    pointToLayer: function (feature, latlng) {
      var school_marker = {
        radius: 5,
        fillColor: busColors[feature.properties.class_bus],
        stroke: false,
        // weight: 1,
        // opacity: 1,
        fillOpacity: 0.4,
      };
      var marker = L.circleMarker(latlng, school_marker);
  
      return marker;
    },
    onEachFeature: processLotPoints,
  });
  // .bindTooltip();
  // lyrLotPointsBus.addTo(mymap);
// lyrLotPoints.bringToFront();


// ********* Setup Layer Control  ***************
/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}
objBasemaps = {
  'Carto Light': lyrCartoLight,
  'Open Street Map': lyrOSM,
};

objOverlays = {
  Reference: {
    Zoning: lyrZones,
  },
  Layers: {
    'Lots Poly': lyrLots,
    'Stations': lyrStations,
    'Subway Lines': lyrSubwayLines,
   },
  Analysis: {
    'Residential Density': lyrLotPointsResDen,
    'Proximity to Bus': lyrLotPointsBus

  },
  
};
//
ctlLayers = L.control
  .groupedLayers(objBasemaps, objOverlays, {
    collapsed: isCollapsed,
  })
  .addTo(mymap);

  

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
  layer: lyrLots,
  propertyName: 'id',
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
    lyrLots.eachLayer(function (layer) {
      //restore feature color
      lyrLots.resetStyle(layer);
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

// function filterLots(json) {
//   var arLotFilter = [];
//   $('input[name=fltLot]').each(function () {
//     if (this.checked) {
//       arLotFilter.push(this.value);
//       // log(this.value);
//     }
//   });

//   let att = json.properties;

//   switch (att.AreaCAT) {
//     case 'under 2500':
//       return arLotFilter.indexOf('under 2500') >= 0;
//     // break;
//     // case 'Waterfront':
//     //   return arLotFilterSize.indexOf('Waterfront') >= 0;
//     // // break;
//     // case 'Through':
//     //   return arLotFilterSize.indexOf('Through') >= 0;
//     // // break;
//     // case 'Interior':
//     //   return arLotFilterSize.indexOf('Interior') >= 0;
//     // // break;
//     // case 'Corner':
//     //   return arLotFilterSize.indexOf('Corner') >= 0;
//     // // break;
//     // case 'Inside':
//     //   return arLotFilterSize.indexOf('Inside') >= 0;
//     // // break;
//     default:
//       return arLotFilter.indexOf('Other') >= 0;
//     // break;
//   }
//   switch (att.TYPE) {
//     case 'Block':
//       return arLotFilter.indexOf('Block') >= 0;
//     // break;
//     case 'Waterfront':
//       return arLotFilter.indexOf('Waterfront') >= 0;
//     // break;
//     case 'Through':
//       return arLotFilter.indexOf('Through') >= 0;
//     // break;
//     case 'Interior':
//       return arLotFilter.indexOf('Interior') >= 0;
//     // break;
//     case 'Corner':
//       return arLotFilter.indexOf('Corner') >= 0;
//     // break;
//     case 'Inside':
//       return arLotFilter.indexOf('Inside') >= 0;
//     // break;
//     default:
//       return arLotFilter.indexOf('Other') >= 0;
//     // break;
//   }
// }

// function filterLotsByType(json) {
//   var arLotFilterType = [];
//   $('input[name=fltLot]').each(function () {
//     if (this.checked) {
//       arLotFilterType.push(this.value);
//       // log(this.value);
//     }
//   });

//   let att = json.properties;
//   switch (att.TYPE) {
//     case 'Block':
//       return arLotFilterType.indexOf('Block') >= 0;
//     // break;
//     case 'Waterfront':
//       return arLotFilterType.indexOf('Waterfront') >= 0;
//     // break;
//     case 'Through':
//       return arLotFilterType.indexOf('Through') >= 0;
//     // break;
//     case 'Interior':
//       return arLotFilterType.indexOf('Interior') >= 0;
//     // break;
//     case 'Corner':
//       return arLotFilterType.indexOf('Corner') >= 0;
//     // break;
//     case 'Inside':
//       return arLotFilterType.indexOf('Inside') >= 0;
//     // break;
//     default:
//       return arLotFilterType.indexOf('Other') >= 0;
//     // break;
//   }
// }

// function filterLotsbySize(json) {
//   var arLotFilterSize = [];
//   $('input[name=fltLotSize]').each(function () {
//     if (this.checked) {
//       arLotFilterSize.push(this.value);
//       log(this.value);
//     }
//   });

//   let att = json.properties;

//   switch (att.AreaCAT) {
//     case 'under 2500':
//       return arLotFilterSize.indexOf('under 2500') >= 0;
//     // break;
//     // case 'Waterfront':
//     //   return arLotFilterSize.indexOf('Waterfront') >= 0;
//     // // break;
//     // case 'Through':
//     //   return arLotFilterSize.indexOf('Through') >= 0;
//     // // break;
//     // case 'Interior':
//     //   return arLotFilterSize.indexOf('Interior') >= 0;
//     // // break;
//     // case 'Corner':
//     //   return arLotFilterSize.indexOf('Corner') >= 0;
//     // // break;
//     // case 'Inside':
//     //   return arLotFilterSize.indexOf('Inside') >= 0;
//     // // break;
//     default:
//       return arLotFilterSize.indexOf('Other') >= 0;
//     // break;
//   }

//   // if (att.ZONING == 'REMOVED') {
//   //   return false;
//   // } else {
//   //   // log('lots filtered');
//   //   return true;
//   // }
// }

$('#txtFindLot').on('keyup paste', function () {
  // log('lots found');
  var val = $('#txtFindLot').val();
  // log(val);
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

$('#btnLotFilterSizeAll').click(function () {
  $('input[name=fltLotSize]').prop('checked', true);
});
$('#btnLotFilterSizeNone').click(function () {
  $('input[name=fltLotSize]').prop('checked', false);
});
$('#btnLotFilterSize').click(function () {
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
  lyr.bindTooltip(
    '<strong>' + att.name + '</strong><br>' + att.line + '<br>' + att.notes
  );
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

//Create a color dictionary based res dens
var resDenColors = {
  'under 10000': '#ffde0a',
  '10000-15000': '#8fd744',
  '15000-20000': '#35b779',
  '20000-30000': '#21908d',
  '30000-40000': '#31688e',
  '40000-60000': '#443a82',
  'over 60000': '#5a066e',
};
var busColors = {
  '0-0.27': '#ffde0a',
  '0.27-0.60': '#8fd744',
  '0.60-0.63': '#35b779',
  '0.63-0.66': '#21908d',
  '0.66-0.81': '#31688e',
  '0.81-0.93': '#443a82',
  '0.93-1.00': '#5a066e',
};

function processLotPoints(json, lyr) {
  // var att = json.properties;
  // lyr.bindTooltip('<h5>' + 'att.name' + '</h5>');
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

$('#btnShowDivLot').click(function () {
  $('#divLot').toggle();
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

// ********  Legend Zones display functions

$('#lgndR1').click(function () {
  document.getElementById('infoPanel').style.display = 'block';
  $('#content-area').load('./text/zones.txt #p1');
});

$('#lgndR2').click(function () {
  document.getElementById('infoPanel').style.display = 'block';
  $('#content-area').load('./text/zones.txt #p2');
});

$('#lgndR3').click(function () {
  document.getElementById('infoPanel').style.display = 'block';
  $('#content-area').load('./text/zones.txt #p3');
});

$('#lgndR4').click(function () {
  document.getElementById('infoPanel').style.display = 'block';
  $('#content-area').load('./text/zones.txt #p4');
});

$('#lgndR5').click(function () {
  document.getElementById('infoPanel').style.display = 'block';
  $('#content-area').load('./text/zones.txt #p5');
});

$('#lgndR6').click(function () {
  document.getElementById('infoPanel').style.display = 'block';
  $('#content-area').load('./text/zones.txt #p6');
});

$('#lgndR7').click(function () {
  document.getElementById('infoPanel').style.display = 'block';
  $('#content-area').load('./text/zones.txt #p7');
});

$('#lgndR8').click(function () {
  document.getElementById('infoPanel').style.display = 'block';
  $('#content-area').load('./text/zones.txt #p8');
});

$('#lgndR9').click(function () {
  document.getElementById('infoPanel').style.display = 'block';
  $('#content-area').load('./text/zones.txt #p9');
});

$('#lgndR10').click(function () {
  document.getElementById('infoPanel').style.display = 'block';
  $('#content-area').load('./text/zones.txt #p10');
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
