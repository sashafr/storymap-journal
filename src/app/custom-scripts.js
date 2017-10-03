define(["dojo/topic"], function(topic) {
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
  //var LAYER_ID = "Archive 25_9232_0";    //the points layer
  //var LAYER_ID_2 = "Archive 18_9462_0";  //for demonstration purposes this is the historic layer
  //var LAYER_ID_3 = "Archive 12_5626_0";  //for demonstration purposes this is the modern layer

  var mapAlreadyLoaded = false; //this ensures that events happen only the first time the map loads

  //-----------------------------MAIN MAP---------------------------------------

  topic.subscribe("story-loaded-map", function(result){
    if ( result.id == WEBMAP_ID){
      //alert("true");
      //If the map loaded is the home page map
      //initialize the map and layer

      var map = app.maps[WEBMAP_ID].response.map;

      //Use this line to get the names of the layers on the webmap
      //console.log(map.graphicsLayerIds);
      var layer = map.getLayer("PhotoPts5_shapefile_6207_0");

      //group the historic and modern parcel layer fragments
      var historic1 = map.getLayer("Parc0_998_shapefile_7011_0");
      var historic2 = map.getLayer("Parc999_1996_shapefile_8718_0");
      var historic3 = map.getLayer("Parc1997_2046_shapefile_9941_0");
      var modern1 = map.getLayer("Parc0_998_shapefile_895_0");
      var modern2 = map.getLayer("Parc999_1996_shapefile_1695_0");
      var modern3 = map.getLayer("Parc1997_2046_shapefile_7423_0");


      var historicLayers = [historic1, historic2, historic3];
      var modernLayers = [modern1, modern2, modern3];

      //hide the modern layer initially

      for (var i = 0; i < modernLayers.length; i++) {
        modernLayers[i].setVisibility(false);
      }

      //set the map to automatically resize when the window is changed
      map.autoResize = true;

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
          for (var i = 0; i < modernLayers.length; i++) {
            modernLayers[i].setVisibility(!modernLayers[i].visible);
          }
          for (var i = 0; i < historicLayers.length; i++) {
            historicLayers[i].setVisibility(!historicLayers[i].visible);
          }
        });
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
        var number = records[i].attributes["NumImages"];
        if (isInArray(number, selectorList) == false){
          selectorList.push(number);
        }
      }

      //use this if the values in the selector are strings
      //sortedList = selectorList.sort();

      //use this if the values in the selector are integers
      var sortedList = selectorList.sort(function(a, b){
        if(parseFloat(a) > parseFloat(b)){
          return 1;
        }
        else if (parseFloat(a) < parseFloat(b)){
          return -1;
        }
        else {
          return 0;
        }
      });
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

      //put all the image field indexes in an array
      var imageFields = [];
      for (var i = 0; i < layer.fields.length; i++){
        var fieldName = layer.fields[i].name;
        var substring = "ImgSrc";
        if (fieldName.indexOf(substring) !== -1) {
          imageFields.push(i);
        }
      }

      function isInArray(value, array) {
        return array.indexOf(value) > -1;
      }

      function mediaFilter() {
        //alert("change");
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
            if (recordsList[i].attributes["OralHist"].length > 1) {
              layer.add(recordsList[i]);
            }
          }
        }

        if (mediaType == "oralhist") {
          for (var i = records.length - 1; i>-1; i--) {
            layer.remove(records[i]);
          }
          for (var i = 0; i < recordsList.length; i++) {
            if (recordsList[i].attributes["OralHist"].length > 1) {
              layer.add(recordsList[i]);
            }
          }
        }


        if (mediaType == "both") {
          for (var i = records.length - 1; i>-1; i--) {
            layer.remove(records[i]);
          }
          for (var i = 0; i < recordsList.length; i++) {
            if (recordsList[i].attributes[firstImageName].length > 1 && recordsList[i].attributes["OralHist"].length > 1) {
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
        var numberOfImages = selector.value;
        //add all features to the map that match the filter's value
        for (var i = 0; i < recordsList.length; i++) {
          if (recordsList[i].attributes["NumImages"] == numberOfImages) {
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

      //show all features in the layer when the Show All button is clicked
      var showAll = document.getElementById("showAll");
      if (mapAlreadyLoaded == false) {
        showAll.addEventListener('click', function() {
          //reset the selector's value
          selector.selectedIndex = 0;
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
      //Create new popup template
      var popupTemplate = new esri.dijit.PopupTemplate();
      layer.setInfoTemplate(popupTemplate);

      for (var i = 0; i < layer.fields.length; i++){
        //uncomment to get the names and indexes of all fields in the layer
        //console.log("field index " + i + " is " + layer.fields[i].name);
      }



      //populate the popup template on click
      layer.on("click", function(evt) {
  var feature = evt.graphic;


  //set the popup content to contain a div that will contain the slides, as well as the slideshow buttons
  popupTemplate.setTitle("Title");
  var popupContent = "<div style = 'display: inline-block; width:100%'>";
  popupContent += "<div style = 'font-size:16px; width:auto; display: inline-block'><b>${Name}</b></div>";

  if (feature.attributes["OralHist"].length > 1) {
    var oralHistLink = feature.attributes["OralHist"];
    popupContent += "<div style = 'float:right; width:auto; display: inline-block'><img width = '20' src = 'http://www.clker.com/cliparts/6/g/n/Z/Y/V/head-outline-hi.png'></div></div>"
    popupContent += "<div style = 'float:right; width:auto; margin: 4px'><a href = '" + oralHistLink + "'> Oral History: " + feature.attributes["Narrator"] + "</a></div>";
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
  popupTemplate.setContent(popupContent);
}); //end onclick
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
