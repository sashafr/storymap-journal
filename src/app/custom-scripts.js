define(["dojo/topic", "esri/geometry/Extent","esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color", "esri/graphic"],
function(topic, Extent, SimpleFillSymbol, SimpleLineSymbol, Color, Graphic) {
  /*
  * Custom Javascript to be executed while the application is initializing goes here
  */

  // The application is ready
  topic.subscribe("tpl-ready", function(){
    /*
    * Custom Javascript to be executed when the application is ready goes here
    */
  });


  //Get the ids of the webmap and the layer
  var WEBMAP_ID = "5838281353a74323864fcbe816ee0f0e"; //the main map
  var WEBMAP_ID2 = "fdf287df06f24b20a016e712ffdcbb5c"; //the oral histories map
  var mapAlreadyLoaded = false; //this ensures that events happen only the first time the map loads

  //-----------------------------MAIN MAP---------------------------------------

  topic.subscribe("story-loaded-map", function(result){
    if ( result.id == WEBMAP_ID){
      //If the map loaded is the home page map

//------------INITIALIZE MAP AND LAYER---------------------------------
      var map = app.maps[WEBMAP_ID].response.map;
      console.log(map.graphicsLayerIds);
      map.graphics.enableMouseEvents();
      map.graphics.on("mouse-out", closeDialog);

      /*  var allLayers = map.allLayers.toArray();
      //uncomment this to get a list of all the layer ids on the map
      for (var i = 0; i < allLayers.length; i++) {
      console.log(allLayers[i].id);
      }*/

      var layer1 = map.getLayer("allFirstParcelsGeoOh_shapefile_6643_0");
      var layer2 = map.getLayer("Archive 26_shapefile_5898_0");
      layer2.setVisibility(false);
      var layer = layer1;
      for (var i = 0; i < layer.fields.length; i++){
        //uncomment to get the names and indexes of all fields in the layer
        //console.log("field index " + i + " is " + layer.fields[i].name);
      }

      //this will allow the map to resize when the sidebar is hidden
      map.autoResize = true;

      //put all the image field indexes in an array
      var imageFields = [];
      for (var i = 0; i < layer.fields.length; i++){
        var fieldName = layer.fields[i].name;
        var substring = "ImgSrc";
        if (fieldName.indexOf(substring) !== -1) {
          imageFields.push(i);
        }
      }

      var imageFields2 = [];
      for (var i = 0; i < layer2.fields.length; i++){
        var fieldName = layer2.fields[i].name;
        var substring = "ImgSrc";
        if (fieldName.indexOf(substring) !== -1) {
          imageFields2.push(i);
        }
      }

      function closeDialog() {
         map.graphics.clear();
       }
//---------------------------BUTTONS AND SELECTORS-----------------------
      //collapse or expand the narrative
      var collapseDiv = document.getElementById("collapseButton");
      var narrativeVisible = true;
      if (mapAlreadyLoaded== false) {
        collapseDiv.addEventListener('click', function() {
          var sidePanel = document.getElementById("sidePanel");
          var socialMedia = document.getElementById("socialDiv");
          if (narrativeVisible == true){
            sidePanel.style.width = "50px";
            socialMedia.style.display = "none";
            document.getElementById("collapse").textContent = "Show";
            document.getElementById("sliderDiv").style.left = "50%";
            narrativeVisible = false;
            return;
          }

          if (narrativeVisible == false) {
            sidePanel.style.width = "40%";
            socialMedia.style.display = "block";
            document.getElementById("collapse").textContent = "Hide";
            document.getElementById("sliderDiv").style.left = "60%";
            narrativeVisible = true;
            return;
          }
        }); //end click
      } //end if

  //toggle layer visibility
    if (mapAlreadyLoaded == false){
      document.getElementById("toggleLayers").addEventListener('click', function(){
        layer1.setVisibility(!layer1.visible);
        layer2.setVisibility(!layer2.visible);
        if (layer == layer1) {
          layer = layer2;
          return;
        }
        if (layer == layer2) {
          layer = layer1;
          return;
        }
      });
    }

    //show all records when the showAll button is clicked
    var showAll = document.getElementById("showAll");
    if (mapAlreadyLoaded == false) {
      showAll.addEventListener('click', function() {
        //reset the selector's value
        selector.selectedIndex = 0;
        document.getElementById("media_select").selectedIndex = 0;
        //clear currently displayed features
        for (var i = records.length - 1; i > -1; i--) {
          layer.remove(records[i]);
        }
        //add all features
        for (var i = 0; i < recordsList.length; i++){
          layer.add(recordsList[i]);
        }
      }); //end onclick
    }

  //get variables for the filter and slider
    var selector = document.getElementById("time_select");
    var slider = document.getElementById("dateRange");
    valueDiv = document.getElementById("sliderValue");
    valueDiv.innerHTML = "Date: " + slider.value;

  //create a list of all the features in the layer that won't be changed
  //by adding and removing features from the layer
    var records = layer.graphics;
    var recordsList = [];
    for (var i = 0, len = records.length; i < len; i++) {
      recordsList.push(records[i]);
    }

    //populate the selector dropdown with all possible values, eliminating repeats
    var selectorList = [];
    for (var i = 0, len = records.length; i < len; i++) {
      var number = records[i].attributes["Re_Use_Typ"];
      if (isInArray(number, selectorList) == false && number != " "){
        selectorList.push(number);
      }
    }

    //use this if the values in the selector are strings
    sortedList = selectorList.sort();

    //use this if the values in the selector are integers
    /*var sortedList = selectorList.sort(function(a, b){
      if(parseFloat(a) > parseFloat(b)){
        return 1;
      }
      else if (parseFloat(a) < parseFloat(b)){
        return -1;
      }
      else {
        return 0;
      }
    });*/
    //add the values to the dropdown
    for (var i = 0; i < sortedList.length; i++) {
      var optionElement = document.createElement("option");
      optionElement.innerHTML = sortedList[i];
      selector.appendChild(optionElement);
    }

    //call filter function when the selector is changed
    if (mapAlreadyLoaded == false) {
      selector.addEventListener('change', filterEquals);
      slider.addEventListener('change', filterGreaterThan);
    }

    var mediaSelector = document.getElementById("media_select");
    if (mapAlreadyLoaded == false) {
      mediaSelector.addEventListener('change', mediaFilter);
    }


    function isInArray(value, array) {
      return array.indexOf(value) > -1;
    }

  //------------------------FILTER FUNCTIONS-------------------------------

  //filter by photo, oral history or both
    function mediaFilter() {
      var firstImageField = imageFields[0];
      var firstImageName = layer.fields[firstImageField].name;
      var mediaType = mediaSelector.value;
      if (mediaType == "photo") {
        for (var i = records.length - 1; i>-1; i--) {
          layer.remove(records[i]);
        }
        for (var i = 0; i < recordsList.length; i++) {
          if (recordsList[i].attributes[firstImageName].length > 1) {
            layer.add(recordsList[i]);
          }
        }
      }

      if (mediaType == "oralhist") {
        for (var i = records.length - 1; i>-1; i--) {
          layer.remove(records[i]);
        }
        for (var i = 0; i < recordsList.length; i++) {
          if (recordsList[i].attributes["Narrator"].length > 1) {
            layer.add(recordsList[i]);
          }
        }
      }

      if (mediaType == "oralhist") {
        for (var i = records.length - 1; i>-1; i--) {
          layer.remove(records[i]);
        }
        for (var i = 0; i < recordsList.length; i++) {
          //if (recordsList[i].attributes["OralHist"].length > 1) {
          if (recordsList[i].attributes["Narrator"].length > 1) {
            layer.add(recordsList[i]);
          }
        }
      }

      if (mediaType == "both") {
        for (var i = records.length - 1; i>-1; i--) {
          layer.remove(records[i]);
        }
        for (var i = 0; i < recordsList.length; i++) {
          //if (recordsList[i].attributes[firstImageName].length > 1 && recordsList[i].attributes["OralHist"].length > 1) {
          if (recordsList[i].attributes[firstImageName].length > 1 && recordsList[i].attributes["Narrator"].length > 1) {
            layer.add(recordsList[i]);
          }
        }
      }
    } //end mediaFilter


    //filter function for the dropdown selector
    function filterEquals() {
      //clear all layers
      for (var i = records.length - 1; i>-1; i--) {
        layer.remove(records[i]);
      }
      var reuseType = selector.value;
      //add all features to the map that match the filter's value
      for (var i = 0; i < recordsList.length; i++) {
        if (recordsList[i].attributes["Re_Use_Typ"] == reuseType) {
          layer.add(recordsList[i]);
        }
      }
    } //end filter

    //filter function for the slider
    function filterGreaterThan(){
      valueDiv.innerHTML = "Date: " + slider.value;
      //clear all layers
      for (var i = records.length - 1; i>-1; i--) {
        layer.remove(records[i]);
      }
      var dateDemolished = slider.value;
      //add all features to the map that match the filter's value
      for (var i = 0; i < recordsList.length; i++) {
        if (recordsList[i].attributes["Date_Dem"] > dateDemolished) {
          layer.add(recordsList[i]);
        }
      }
    }

    var highlightSymbol = new SimpleFillSymbol(
          SimpleFillSymbol.STYLE_SOLID,
          new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID,
            new Color([255,0,0]), 3
          ),
          new Color([125,125,125,0.35])
        );

  /* layer.on("mouse-over", function(evt){
      var highlightGraphic = new Graphic(evt.graphic.geometry,highlightSymbol);
        map.graphics.add(highlightGraphic);


    });*/

//-------------------POPUP CREATION------------------------------------

  //Create new popup template
  var popupTemplate = new esri.dijit.PopupTemplate();
  layer.setInfoTemplate(popupTemplate);
  var popupTemplate2 = new esri.dijit.PopupTemplate();
  layer2.setInfoTemplate(popupTemplate2);

  //populate the popup template on click
  layer.on("click", function(evt) {
    //alert("click");
    var feature = evt.graphic;
    //set the popup content to contain a div that will contain the slides, as well as the slideshow buttons
    popupTemplate.setTitle("Title");
    var popupContent = "<div style = 'display: inline-block; width:100%'>";
    popupContent += "<div style = 'font-size:16px; width:auto; display: inline-block'><b>${Name}</b></div>";
    if  (feature.attributes["Narrator"] && feature.attributes["Narrator"].length > 1) {
      popupContent += "<div style = 'float:right; width:auto; display: inline-block'><img width = '20' src = 'http://www.clker.com/cliparts/6/g/n/Z/Y/V/head-outline-hi.png'></div></div>";
      popupContent += "<div style = 'float:right; width:auto; margin: 4px'><a href = '#'> Oral History: " + feature.attributes["Narrator"] + "</a></div>";
    }

    var totalNumberImages = feature.attributes["NumImages"];
    //if there's only one image, just add it to the popup
    if (totalNumberImages == 1) {
      var firstImage = imageFields[0];
      var firstImageField = layer.fields[firstImage].name;
      var firstDate = imageFields[0] + 1;
      var firstDateField = layer.fields[firstDate].name;
      var photoDate;
      if (feature.attributes[firstDateField] < 2999) {
        photoDate = feature.attributes[firstDateField];
      }
      if (feature.attributes[firstDateField] > 2999) {
        photoDate = "";
      }
      popupContent += "<div><a href='" + feature.attributes[firstImageField] +"'><img width='450' src='" + feature.attributes[firstImageField] + "' style='position:relative'></a><span style = 'position:relative; left:50%; font-size:16px'><b>" + photoDate + "</b></span></div>";

    }

    //if there's more than one image, put them in the format used by the Bootstrap Slideshow plugin
    if (totalNumberImages > 1) {
      popupContent += "<div class='container' id='carouselContainer' style = 'width: 450px; margin:8px'><br>";
      popupContent += "<div id='myCarousel' class='carousel slide' data-ride='carousel' style = 'width: 450px; right:4%'>";
      popupContent += "<div class='carousel-inner' role='listbox'>";
      var firstImage = imageFields[0];
      var firstImageField = layer.fields[firstImage].name;
      var firstDate = imageFields[0] + 1;
      var firstDateField = layer.fields[firstDate].name;
      var photoDate;
      if (feature.attributes[firstDateField] < 2999) {
        photoDate = feature.attributes[firstDateField];
      }
      if (feature.attributes[firstDateField] > 2999) {
        photoDate = "";
      }
      popupContent += "<div class='item active'><a href='" + feature.attributes[firstImageField] + "'><img width='450' src='" + feature.attributes[firstImageField] + "'></a><span style = 'position:relative; left:50%; font-size:16px'><b>" + photoDate + "</b></span></div>";
      for (var j = 1; j < totalNumberImages; j++){
        var fieldindex = imageFields[j];
        var fieldname = layer.fields[fieldindex].name;
        var dateFieldIndex = fieldindex + 1;
        var dateField = layer.fields[dateFieldIndex].name;
        var photoDate;
        if (feature.attributes[dateField] < 2999) {
          photoDate = feature.attributes[dateField];
        }
        if (feature.attributes[dateField] > 2999) {
          photoDate = "";
        }
        popupContent += "<div class='item'><a href='" + feature.attributes[fieldname] + "'><img width='450' src='" + feature.attributes[fieldname] + "'></a><span style = 'position:relative; left:50%; font-size:16px'><b>" + photoDate + "</b></span></div>";
      }
      popupContent += "</div>";
      popupContent += "<a class='left carousel-control' href='#myCarousel' role='button' data-slide='prev'>" +
      "<span class='glyphicon glyphicon-chevron-left' aria-hidden='true'></span>" +
      "<span class='sr-only'>Previous</span>" +
      "</a>" +
      "<a class='right carousel-control' href='#myCarousel' role='button' data-slide='next'>" +
      "<span class='glyphicon glyphicon-chevron-right' aria-hidden='true'></span>" +
      "<span class='sr-only'>Next</span>" +
      "</a>" +
      "</div>";
      popupContent += "</div>";
    }
    if (feature.attributes["Hist__Cert"] != " " || feature.attributes["Re_Use_Ful"].length > 1 || feature.attributes["Re_Use_Typ"].length > 1){
      popupContent += "<br/>";
      popupContent += "<div style = 'border-bottom: 1px solid white; font-size: 16px'> ADDITIONAL DATA </div>";
    }
    if (feature.attributes["Hist__Cert"] && feature.attributes["Hist__Cert"] == "Y") {
      popupContent += "<br/>";
      popupContent += "<b>Historic Certificate:</b> Yes";
    }
    if (feature.attributes["Hist__Cert"] && feature.attributes["Hist__Cert"] == "N") {
      popupContent += "<br/>";
      popupContent += "<b>Historic Certificate:</b> No";
    }
    if (feature.attributes["Re_Use_Ful"].length > 1) {
      popupContent += "<br/>";
      popupContent += "<b>Reuse:</b> " + feature.attributes["Re_Use_Ful"];
    }
    if (feature.attributes["Re_Use_Typ"].length > 1) {
      popupContent += "<br/>";
      popupContent += "<b>Reuse Type:</b> " + feature.attributes["Re_Use_Typ"];
    }
    popupTemplate.setContent(popupContent);

    //get the x and y ranges of the current extent
    var xRange = map.extent.xmax - map.extent.xmin;
    var yRange = map.extent.ymax - map.extent.ymin;
    var xPercentRight = xRange * 0.85;
    var yPercentRight= yRange * 0.95;
    var xPercentLeft = xRange * 0.15;
    var yPercentLeft = yRange * 0.05;

    //wait until the popup is fully loaded to zoom to it
    setTimeout(function(){
      var extent = new Extent({
        xmin: evt.mapPoint.x - xPercentLeft,
        ymin: evt.mapPoint.y - yPercentLeft,
        xmax: evt.mapPoint.x + xPercentRight,
        ymax: evt.mapPoint.y + yPercentRight,
        spatialReference: {
          wkid: 102100
        }
      });
      map.setExtent(extent);
    }, 500);
  }); //end onclick


  layer2.on("click", function(evt) {
    alert("click");
    var feature = evt.graphic;
    //set the popup content to contain a div that will contain the slides, as well as the slideshow buttons
    popupTemplate2.setTitle("Title");
    var popupContent = "<div style = 'display: inline-block; width:100%'>";
    popupContent += "<div style = 'font-size:16px; width:auto; display: inline-block'><b>${Name}</b></div>";
    if  (feature.attributes["Narrator"] && feature.attributes["Narrator"].length > 1) {
      popupContent += "<div style = 'float:right; width:auto; display: inline-block'><img width = '20' src = 'http://www.clker.com/cliparts/6/g/n/Z/Y/V/head-outline-hi.png'></div></div>";
      popupContent += "<div style = 'float:right; width:auto; margin: 4px'><a href = '#'> Oral History: " + feature.attributes["Narrator"] + "</a></div>";
    }

    var totalNumberImages = feature.attributes["NumImages"];
    //if there's only one image, just add it to the popup
    if (totalNumberImages == 1) {
      var firstImage = imageFields2[0];
      var firstImageField = layer2.fields[firstImage].name;
      popupContent += firstImageField;
      var firstDate = imageFields2[0] + 1;
      var firstDateField = layer2.fields[firstDate].name;
      var photoDate;
      if (feature.attributes[firstDateField] < 2999) {
        photoDate = feature.attributes[firstDateField];
      }
      if (feature.attributes[firstDateField] > 2999) {
        photoDate = "";
      }
      popupContent += "<div><a href='" + feature.attributes[firstImageField] +"'><img width='450' src='" + feature.attributes[firstImageField] + "' style='position:relative'></a><span style = 'position:relative; left:50%; font-size:16px'><b>" + photoDate + "</b></span></div>";

    }

    //if there's more than one image, put them in the format used by the Bootstrap Slideshow plugin
    if (totalNumberImages > 1) {
      popupContent += "<div class='container' id='carouselContainer' style = 'width: 450px; margin:8px'><br>";
      popupContent += "<div id='myCarousel' class='carousel slide' data-ride='carousel' style = 'width: 450px; right:4%'>";
      popupContent += "<div class='carousel-inner' role='listbox'>";
      var firstImage = imageFields2[0];
      var firstImageField = layer2.fields[firstImage].name;
      var firstDate = imageFields2[0] + 1;
      var firstDateField = layer2.fields[firstDate].name;
      var photoDate;
      if (feature.attributes[firstDateField] < 2999) {
        photoDate = feature.attributes[firstDateField];
      }
      if (feature.attributes[firstDateField] > 2999) {
        photoDate = "";
      }
      popupContent += "<div class='item active'><a href='" + feature.attributes[firstImageField] + "'><img width='450' src='" + feature.attributes[firstImageField] + "'></a><span style = 'position:relative; left:50%; font-size:16px'><b>" + photoDate + "</b></span></div>";
      for (var j = 1; j < totalNumberImages; j++){
        var fieldindex = imageFields2[j];
        var fieldname = layer2.fields[fieldindex].name;
        var dateFieldIndex = fieldindex + 1;
        var dateField = layer2.fields[dateFieldIndex].name;
        var photoDate;
        if (feature.attributes[dateField] < 2999) {
          photoDate = feature.attributes[dateField];
        }
        if (feature.attributes[dateField] > 2999) {
          photoDate = "";
        }
        popupContent += "<div class='item'><a href='" + feature.attributes[fieldname] + "'><img width='450' src='" + feature.attributes[fieldname] + "'></a><span style = 'position:relative; left:50%; font-size:16px'><b>" + photoDate + "</b></span></div>";
      }
      popupContent += "</div>";
      popupContent += "<a class='left carousel-control' href='#myCarousel' role='button' data-slide='prev'>" +
      "<span class='glyphicon glyphicon-chevron-left' aria-hidden='true'></span>" +
      "<span class='sr-only'>Previous</span>" +
      "</a>" +
      "<a class='right carousel-control' href='#myCarousel' role='button' data-slide='next'>" +
      "<span class='glyphicon glyphicon-chevron-right' aria-hidden='true'></span>" +
      "<span class='sr-only'>Next</span>" +
      "</a>" +
      "</div>";
      popupContent += "</div>";
    }
    if (feature.attributes["Hist__Cert"] != " " || feature.attributes["Re_Use_Ful"].length > 1 || feature.attributes["Re_Use_Typ"].length > 1){
      popupContent += "<br/>";
      popupContent += "<div style = 'border-bottom: 1px solid white; font-size: 16px'> ADDITIONAL DATA </div>";
    }
    if (feature.attributes["Hist__Cert"] && feature.attributes["Hist__Cert"] == "Y") {
      popupContent += "<br/>";
      popupContent += "<b>Historic Certificate:</b> Yes";
    }
    if (feature.attributes["Hist__Cert"] && feature.attributes["Hist__Cert"] == "N") {
      popupContent += "<br/>";
      popupContent += "<b>Historic Certificate:</b> No";
    }
    if (feature.attributes["Re_Use_Ful"].length > 1) {
      popupContent += "<br/>";
      popupContent += "<b>Reuse:</b> " + feature.attributes["Re_Use_Ful"];
    }
    if (feature.attributes["Re_Use_Typ"].length > 1) {
      popupContent += "<br/>";
      popupContent += "<b>Reuse Type:</b> " + feature.attributes["Re_Use_Typ"];
    }
    popupTemplate2.setContent(popupContent);
    var xRange = map.extent.xmax - map.extent.xmin;
    var yRange = map.extent.ymax - map.extent.ymin;
    var xPercentRight = xRange * 0.85;
    var yPercentRight= yRange * 0.95;
    var xPercentLeft = xRange * 0.15;
    var yPercentLeft = yRange * 0.05;

    //wait until the popup is fully loaded to zoom to it
    setTimeout(function(){
      var extent = new Extent({
        xmin: evt.mapPoint.x - xPercentLeft,
        ymin: evt.mapPoint.y - yPercentLeft,
        xmax: evt.mapPoint.x + xPercentRight,
        ymax: evt.mapPoint.y + yPercentRight,
        spatialReference: {
          wkid: 102100
        }
      });
      map.setExtent(extent);
    }, 500);
  });
}// end if

//---------------------------------------ORAL HISTORIES MAP----------------------
if (result.id == WEBMAP_ID2) {
  //if the map loaded is the oral histories map
  var map = app.maps[WEBMAP_ID2].response.map;
  // alert (map.graphicsLayerIds);
  var oralHistoryID = "Archive 21_1531_0";
  var oralHistory = map.getLayer(oralHistoryID);
  for (var i = 0; i < oralHistory.fields.length; i++){
    //uncomment to get the names and indexes of all fields in the layer
    //  console.log("field index " + i + " is " + oralHistory.fields[i].name);
  }

  var popupTemplateOH = new esri.dijit.PopupTemplate({});
  oralHistory.setInfoTemplate(popupTemplateOH);

  oralHistory.on("click", function(evt) {
    var feature = evt.graphic;
    var linkField = oralHistory.fields[2].name;
    var imgField = oralHistory.fields[3].name;
    var img = feature.attributes[imgField];
    var link = feature.attributes[linkField];

    //set the popup content
    popupTemplateOH.setTitle("Title");
    var popupContent = "<span style = 'font-size:20px'><b>${Name}</b></span>";
    popupContent += "<a href = '" + link + "'>     View the complete transcript</a>";
    popupContent += "<span> Some information about the property and the people telling the oral history.  This can be an ArcGIS" +
    "field or be included in some other way. </span>";
    popupContent += "<img src = '" + img + "'>";
    popupTemplateOH.setContent(popupContent);

  }); //end onclick
}

mapAlreadyLoaded = true;

}); //end map and popup creation

});
