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
var WEBMAP_ID = "37a7dbbfab9d40f59141c18e05adcb33";
var WEBMAP_ID2 = "fdf287df06f24b20a016e712ffdcbb5c";
var LAYER_ID = "Archive 22_5738_0";
var LAYER_ID_2 = "Archive 18_9462_0";  //for demonstration purposes this is the historic layer
var LAYER_ID_3 = "Archive 12_5626_0";  //for demonstration purposes this is the modern layer

var mapAlreadyLoaded = false; //this ensures that events happen only the first time the map loads

topic.subscribe("story-loaded-map", function(result){
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

  if ( result.id == WEBMAP_ID){
    //If the map loaded is the home page map
    //initialize the map and layer
    var map = app.maps[WEBMAP_ID].response.map;
    var layer = map.getLayer(LAYER_ID);
    var layer2 = map.getLayer(LAYER_ID_2);
    var layer3 = map.getLayer(LAYER_ID_3);

    //hide the modern layer initially
    layer3.setVisibility(false);

    //set the map to automatically resize when the window is changed
    map.autoResize = true;

    //Use the below alert to get the names of the layers on the webmap
     //alert (map.graphicsLayerIds);

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
          narrativeVisible = false;
          return;
        }

        if (narrativeVisible == false) {
          sidePanel.style.width = "40%";
          socialMedia.style.display = "block";
          document.getElementById("collapse").textContent = "Hide";
          narrativeVisible = true;
          return;
        }
      }); //end click
    } //end if

    //toggle layer visibility
    if (mapAlreadyLoaded == false){
        document.getElementById("toggleLayers").addEventListener('click', function(){
        layer3.setVisibility(!layer3.visible);
        layer2.setVisibility(!layer2.visible);
      });
    }

    //get variables for the filter and slider
    var selector = document.getElementById("time_select");
    var slider = document.getElementById("dateRange");
    valueDiv = document.getElementById("sliderValue");
    valueDiv.innerHTML = "Date: " + slider.value;
    var numImages = layer.fields[3].name;

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
       var number = records[i].attributes[numImages];
       if (isInArray(number, selectorList) == false){
         selectorList.push(number);
       }
     }
    sortedList = selectorList.sort();
    //add the values to the dropdown
    for (var i = 0; i < sortedList.length; i++) {
        var optionElement = document.createElement("option");
        optionElement.innerHTML = sortedList[i];
        selector.appendChild(optionElement);
    }

    function isInArray(value, array) {
       return array.indexOf(value) > -1;
   }


    //call filter function when the selector is changed
    if (mapAlreadyLoaded == false) {
      selector.addEventListener('change', filterEquals);
      slider.addEventListener('change', filterGreaterThan);
    }


    function filterEquals() {
      //clear all layers
      for (var i = records.length - 1; i>-1; i--) {
        layer.remove(records[i]);
      }
      var numberOfImages = selector.value;
      //add all features to the map that match the filter's value
      for (var i = 0; i < recordsList.length; i++) {
        if (recordsList[i].attributes[numImages] == numberOfImages) {
          layer.add(recordsList[i]);
          }
        }
      } //end filter


      function filterGreaterThan(){
        valueDiv.innerHTML = "Date: " + slider.value;
        //clear all layers
        for (var i = records.length - 1; i>-1; i--) {
          layer.remove(records[i]);
        }
        var numberOfImages = slider.value;
        //add all features to the map that match the filter's value
        for (var i = 0; i < recordsList.length; i++) {
          if (recordsList[i].attributes[numImages] > numberOfImages) {
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
    //  console.log("field index " + i + " is " + layer.fields[i].name);
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

    //populate the popup template on click
  layer.on("click", function(evt) {
      var feature = evt.graphic;
      var fid = layer.fields[0].name;
      var totalImages = layer.fields[6].name;

      //set the popup content to contain a div that will contain the slides, as well as the slideshow buttons
      popupTemplate.setTitle("Title");
      var popupContent = "<span style = 'font-size:16px'><b>${Name}</b></span></br>";
      //if there's only one image, just add it to the popup
      var totalNumberImages = feature.attributes[totalImages];
      if (totalNumberImages == 1) {
        var firstImage = imageFields[0];
        var firstImageField = layer.fields[firstImage].name;
        popupContent += "<div><a href='" + feature.attributes[firstImageField] +"'><img width='250' src='" + feature.attributes[firstImageField] + "' style='position:relative'></a></div>";
      }

      //if there's more than one image, put them in the format used by the Bootstrap Slideshow plugin
      if (totalNumberImages > 1) {
        popupContent += "<div class='container' id='carouselContainer' style = 'width: 250px; margin:0px'><br>";
        popupContent += "<div id='myCarousel' class='carousel slide' data-ride='carousel' style = 'width: 250px'>";
        /*popupContent += "<ol class='carousel-indicators'>";
        for (var i = 0; i < totalNumberImages; i++) {
          popupContent += "<li data-target='#myCarousel' data-slide-to='" + i +"' class='active'></li>";
        }
        popupContent += "</ol>";*/
        popupContent += "<div class='carousel-inner' role='listbox'>";
        var firstImage = imageFields[0];
        var firstImageField = layer.fields[firstImage].name;
        popupContent += "<div class='item active'><a href='" + feature.attributes[firstImageField] + "'><img width='450' src='" + feature.attributes[firstImageField] + "'></a></div>";
        for (var j = 1; j < totalNumberImages; j++){
          var fieldindex = imageFields[j];
          var fieldname = layer.fields[fieldindex].name;
          popupContent += "<div class='item'><a href='" + feature.attributes[fieldname] + "'><img width='450' src='" + feature.attributes[fieldname] + "'></a></div>";
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


/*  layer.on("click", function(evt) {
     var executed = false;
     //once the point has been clicked, continuously check for the existence of the slideshow div until it is created
     setInterval(function(){
        if (!executed && document.getElementById("carouselContainer")) {
        //ensure that function runs only once
          executed = true;
          document.getElementById("testDiv").appendChild(document.getElementById("carouselContainer"));
        }
      }, 30);
    }); *///end onclick
  }// end if

mapAlreadyLoaded = true;

}); //end map and popup creation

});
