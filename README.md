Story Map Journal
=================

INSTRUCTIONS FOR STUDENTS WORKING ON THE MAP
There's not a good way to collaborate with ArcGIS that I know of.  The most sensible thing to me would seem to be the following:
--Divide the map into blocks by creating polygons around sections of property.  Each of these blocks will be given a name or number.  I can do this easily, or someone else can do it--just create a new feature, trace the blocks, then add a text field with the name and give it a sensible name (like the addresses it contains)
--There will be a google sheet that keeps track of each block and whether it has been traced.  When students are working on a block, they can go to the google sheet and change that block's status to "checked out" so that other students know not to work on that one.  Alternately, they can each be assigned specific ones ahead of time.
--Students will then create their own shapefile just for that block, with that block's name.  I think it's best to keep each block completely separate and then they can all be merged later.  Students can trace all the parcels in that block, label them, and then upload that block to a Dropbox or something (all ArcGIS files should be uploaded as zip files).  They can then change the block's status to "completed".  This does require them to pay attention to the google sheet but there's not really any other way to do it, if two people tried to edit a shapefile at the same time they would overwrite each other's changes.  
--There is an option to do the editing online by publishing the layers as a hosted feature layer or ArcGIS Service, which would involve all the complications we've already run up against with the base map.  There is also apparently an offline synchronization option where you can download the map to an offline device, edit it, and then upload it again.  However, I think in both these cases, if two people were editing at the same time, their changes would still overwrite each other.




THINGS LEFT TO DO ON THE MAPPING SOCIETY HILL PROJECT

--We may need to do some testing to see why the site is displaying weirdly on some computers (namely mine)
--Manually move the geocoded points into parcels.  movePoints is a short video I made for how to do this.  Once we do this, we can get the attribute data from the points, such as when a building was demolished, into the parcels and symbolize the parcels in that way.  Also once we do this, we can then get the data on construction and demolition into the layer of photo points (by spatially joining both to the parcels layer), so that the photo points on the map can be filtered by things like date demolished or type of new construction.  
--Set the selectors and toggle to reflect real data once we have it.  Currently the dropdown selector filters by number of images for testing purposes, but ideally it would filter by some data from the geocoded points.  The slider filters by a field "Date_Dem" which contains random demolition dates that I entered into the points shapefile, but ideally it would filter by the actual date demolished or changed (which would come from the geocoded points).  The toggle toggles between the same parcels layer that's just symbolized different but ideally would toggle between modern and historic layers.
--Manually trace the parcels in the georeferenced old maps provided on OSF.  digitizing features is a short video that show how to do this.  Alternately, we could try to track down an already existing map of old parcels if Azavea or someone else has them.  If we're able to get historic parcels for all of Society Hill, we can then use a slider on the parcels the same way I used a slider on the points, with the modern parcel layer underneath to show them disappearing or changing over time.  This could also be the layer that is toggled on and off.  
--Get the oral histories into Omeka.  There needs to be some way to tie these oral histories to the points. Probably the best way to do this would be to create a new field in the shapefile, manually add the Omeka record number, and then it could create a field in the shapefile that was http://omeka.com/thisproject/record + number.  A commented out framework for this is in getImg. The Oral History storymap is already designed to create an href in the popup from a link in the attribute table.
--Get the oral history pictures tied to the points.  She had initially said that the oral history pictures could be included on the oral history's web page instead of in the popups.  However, that was before we had a separate map for just the oral histories, and she seemed interested in putting them in the popups on that map.  Again the popups already create images from links in the attribute table that would ideally point to the photos.  If we have a systematic way of generating the addresses of the pictures based on the points, we could get those addresses into the shapefile's attribute table in the same way.  If there's more than one picture for a location, perhaps they could be together in a collection in Omeka.  In the attribute table, you would then have a value for each record indicating its collection number, and how many records are in that collection, and you could loop through and add links to each.  A commented out framework for this is in getImg.  I'm reluctant to go much farther until we know exactly what format the oral histories and images will be stored in, but once I know it I can accommodate it.  Right now the oral histories are being added to the shapefile with all the points, but if you wanted a separate layer of just oral histories you could select only those with oral histories and create a new shapefile of them  
--Get the rest of the photo data from Azavea.  Once you have this data as a KML, here are the steps to get it into a layer usable by storymap:
  --Run Sasha's script to extract the date and html data from the photo data into a new KML
  --Import the KML to ArcMap using Conversion -> From KML -> KML to layer (in the toolbox)
  --Export just the shapefile as a new shapefile
  --Run the Find Identical tool on the exported shapefile (Data management -> General).  Select shape as the input field. This will create a table where all features that have the same shape field (same location) have the same value.  The value itself is arbitrary.
  --Use a tabular join to join the output table to the shapefile of photo points.  Use IN_FID as the join field for the table and FID as the field for the shapefile.
  --Export the join to a new shapefile.
  --In the new shapefile, create two new fields, MergeStr (string) and MergeNo (integer).  Copy FEAT_SEQ into both, then delete FEAT_SEQ.
  --Import the original KML from Azavea into ArcMap and use a tabular join to join it to the modified one, on the FID field for both files.  This is necessary because the original KML contains all the image links but not the dates, whereas Sasha's script got all the dates but missed some of the image links.  There's no need to fix Sasha's script, my scripts are designed for the joined shapefile
  --Instructions for running a custom script in ArcMap:
    In  ArcMap > Catalog > Toolboxes > My Toolboxes, either select an existing toolbox
    or right-click on My Toolboxes and use New > Toolbox to create (then rename) a new one.
    Drag (or use ArcToolbox > Add Toolbox to add) this toolbox to ArcToolbox.
    Right-click on the toolbox in ArcToolbox, and use Add > Script to open a dialog box.
    In this Add Script dialog box, use Label to name the tool being created, and press Next.
    In a new dialog box, browse to the .py file to be invoked by this tool, and press Next.
    In the next dialog box put in the parameters, using dropdown menus wherever possible.  For getImg and deleteFields, there is one parameter:
        Display Name              Data Type       Direction                                
        Input Shapefile          Shapefile       Input
     For getImg, the parameters are:
          Display Name              Data Type       Direction                                
          Input Shapefile          Shapefile       Input
          Output Shapefile         Shapefile       Output
    If the direction is output, make sure to change it in the bottom half of the dialogue box (the default is input)
  --Run the script getImg to create new fields that contain date and link to the photo (this will modify the existing shapefile).  Right now photos with no date will be given a date of 3000 so that they'll appear at the end of the slideshow.
  --Run the script combineIdentical to spatially join all records at the same location into a single point with all of
  their attribute data (this will create a new shapefile)
  --Run the script deleteFields to delete the many extraneous fields.  This is not necessary, as only a couple fields are selected for display in Storymap, but if you want to look at the file in ArcMap this can be helpful.  Exactly how many fields need to be deleted and what their names are will depend on the dataset so this script may require some tweaking to the exact names of the fields.  If you don't get all the extra fields it won't hurt anything, it will just make the file harder to look at (this will be modifying the shapefile you just created)
  --The output should be a collection of points where each image for that point has its own date and image link field in the table
  --Go into Windows Explorer and find all of the files for your output shapefile.  There should be 8, make sure you have them all.  Do not include a file with a .lock extension if there is one.  Compress them into a zip file.
  --Go into ArcGIS online and open the map.  Go to add layer, from file, and load the zip file.  Save the map.
  --In custom-scripts, turn on the alert map.graphicsLayerIds, and load the page.  This will print the names of all layers on the webmap.  The layer ID that corresponds to the file you just uploaded will be the name of that file and some numbers.  Put that layer ID into var LAYER_ID =  This will make the layer you just created the layer that the StoryMap uses as its points layer.


  This app uses a customized version of the StoryMap code.  Most of the modifications are found in custom-scripts.js.  However, several modifications were made to the base code.

  NEW ELEMENTS AND CONFIGURATION
  New elements for the filter, toggle, hide and show all buttons were added to the div mainStagePanel starting at line 155 of index.html.  Styling for those elements starts at line 176 of index.html.

  The StoryMap ID, which links the code to an individual storymap, is set in the appid on line 41 of index.html.  You can find the map ID at the end of the address of your map on ArcGIS online.  The map and all the layers in it must be made public or you'll have to log in every time you load the storymap.


GEOCODER:
The geocoder search bounds were set in lines 618-631 of CommonHelper.js (storymaps/common/utils), in the setGeocoderSources function.  Additionally, the info window was turned off and labels added in the SearchOptions at lines 472-478 of CommonHelper.js.
Finally, the button mode was enabled to keep the geocoder expanded at line 45 of Geocoder.js (storymaps/common/mapcontrols/geocoder).

SIDE PANEL NAVIGATION
When navigating away from the home page, the filter and toggle buttons are hidden in the function navigateStoryToIndex in MainView.js (storymaps/tpl/core/MainView.js).  

STYLING
Various changes were made to the color of the popups, the side panel, etc., in storymaps/tpl/ui/MainStage.css and in storymaps/tpl/ui/desktop/SidePanel.css

LIBRARIES
This app uses the the Bootstrap slideshow library, which is included in the head of index.html.

The Story Map Journal is ideal when you want to combine narrative text with maps and other embedded content. A Map Journal contains entries, or sections, that users simply scroll through. Each section in a Map Journal has an associated map, image, video or web page. Actions can also be defined in journal sections so that, for example, clicking a word automatically zooms the section’s map to a particular location.

![App](map-journal-storytelling-template-js.png)

[View it live](http://links.esri.com/storymaps/map_journal_example_side_panel) |
[Map Journal page on Esri Story Maps website](http://storymaps.arcgis.com/en/app-list/map-journal/) |
[Download](http://links.esri.com/storymaps/map_journal_template_zip)

**Latest release is version 1.11.0**; if you want to be informed of new releases, we recommend you to watch this repository ([see GitHub help](https://help.github.com/articles/watching-repositories)). See the [release page](https://github.com/Esri/map-journal-storytelling-template-js/releases) for release notes.

For more infomation about using and customizing Esri's Storytelling Apps follow the [Story Maps Developers' Corner](https://developerscorner.storymaps.arcgis.com).

## Help content

 * [Introduction](#introduction)
 * [Instructions](#instructions)
 * [Feedback / support](#feedback--support)
 * [FAQ](#faq)
 * [Configuration](#configuration)
 * [Customize the look and feel](#customize-the-look-and-feel)
 * [Developer guide](#developer-guide)
 * [Issues](#issues)
 * [Contributing](#contributing)
 * [Licensing](#licensing)

## Introduction
A Map Journal application can be created from [ArcGIS Online](http://arcgis.com), from the [Esri Story Maps website](http://storymaps.arcgis.com/) or from an [ArcGIS Enterprise portal](http://www.esri.com/en/arcgis/products/arcgis-enterprise/overview). The Journal's data are stored in a Web Application Item.
This repository provides the application source code for developers who want to customize Map Journal.

For more information about Map Journal, including a gallery of examples and a step-by-step tutorial, please see the [Map Journal](http://storymaps.arcgis.com/en/app-list/map-journal/) page on the [Esri Story Maps website](http://storymaps.arcgis.com/).

## Instructions
First create your Map Journal in ArcGIS using the [step-by-step tutorial](http://storymaps.arcgis.com/en/app-list/map-journal/tutorial/).
Once your story is ready, you have to find its ID in ArcGIS. The ID is a 32 character string that you will find in your web browser's address bar when you are viewing your journal.

![App ID](map-journal-help-application-id.png)

1. [Download the application](http://links.esri.com/storymaps/map_journal_template_zip)
2. Deploy the application on your webserver. See [FAQ](#how-to-deploy-the-application-on-a-web-server) for details
3. Edit index.html, find the configuration section on line 38 and paste in your application ID
4. Navigate to index.html (e.g., `http://127.0.0.1/MapJournal/index.html`)

You can continue to use the builder in ArcGIS to modify your story.

See [customize the look and feel section](#customize-the-look-and-feel) or [developer guide](#developer-guide) if you want to modify the app.

*If you are using ArcGIS Enterprise, please follow the instructions at the end of `app/config.js` to configure the application. Optionally you can also [configure the application](#can-the-template-be-used-offline) to use the ArcGIS API for JavaScript included in your Enterprise portal.*

## Feedback / support
We would love to hear from you!
* [StoryMaps Website](http://storymaps.arcgis.com/)
* [Let us know about your application](http://storymaps.arcgis.com/en/gallery/submission-form/)
* [Story Maps forum on GeoNet](http://links.esri.com/storymaps/story_maps_geonet)
* [@EsriStoryMaps](http://twitter.com/EsriStoryMaps)
* [ArcGIS Blog](http://blogs.esri.com/esri/arcgis/)

When you contact us, don't hesitate to include a link to your application to make it easier for us to understand what you are working on.

## FAQ

### What should I check before publishing a Journal?
We recommend that you perform the following checks before sharing your Journal with your audience:
 - Check that all your Journal's content is shared with your audience (web maps, medias, ...). Typically you can use another computer than the one you have used to build your story to make sure everything is loading properly. Alternatively [this article](http://browsers.about.com/od/faq/tp/Incognito-Browsing.htm) will show you how to configure your browser for an incognito session or you can just sign-out from ArcGIS and any service that you have used to host your Journal's resources.
 - Try the application on different browsers, screen resolutions and mobile devices. You can [emulate mobile  devices](http://mobiletest.me/) inside your desktop browser.

### What are the supported browsers?
Map Journal is supported on Internet Explorer 11 and above, Chrome, Firefox, Safari, and the most recent tablet and smartphone devices.
Map Journal authoring is supported on the same desktop browsers listed above and on the most recent tablet but not smartphone devices.

We actively test the application in all major browsers but if you experience difficulties especially with the builder, we recommend that you use [Chrome](https://www.google.com/intl/en_us/chrome/browser/).

### Tips for your content

#### Link between sections
One [popular](https://github.com/Esri/map-journal-storytelling-template-js/issues/5) [request](https://github.com/Esri/map-journal-storytelling-template-js/issues/7) is to add the ability to navigate between a Journal's sections using links in the panel or through map features popup. As of September 2016, this ability is now available in the builder.

To add a link to another section in the narrative panel, highlight the text for which you want to create the link and use the `Naviage to a section` action in the toolbar. See [this blog](https://blogs.esri.com/esri/arcgis/2016/09/14/whats-new-story-maps-september-2016/) for more information.

You can also add this capability to map feature popups. This can, for example, allow the home section map to be the spatial index to your story. To do that you need to download the application and include a piece of code in `app/custom-scripts.js`. Modify that file as shown below. Follow the instructions to configure the web map and the layer that will receive the click event.


```
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

  /*
   * Set up a click handler on the feature of the map to navigate the story
   */

  //
  // *************************************
  // Configure the web map id and layer id
  // *************************************
  //
  // First find the web map id through the URL when you open the map in Map Viewer
  // To get the layer id, paste the web map id below and open the application,
  //   then open the developer console, all the layers ids will be listed,
  //   find the correct one and paste it below
  // After this setup, clicking the 3rd feature of your layer, will navigate to the third entry
  //
  var WEBMAP_ID = "0bb11c0469f042b3afaf8b0d76572822",
    LAYER_ID = "csv_7673_0";

  var clickHandlerIsSetup = false;

  topic.subscribe("story-loaded-map", function(result){
    if ( result.id == WEBMAP_ID && ! clickHandlerIsSetup ) {
      var map = app.maps[result.id].response.map,
        layer = map.getLayer(LAYER_ID);

      console.log(map.graphicsLayerIds);

      if ( layer ) {
        layer.on("mouse-over", function(e){
          map.setMapCursor("pointer");
          map.infoWindow.setContent("<b>"+e.graphic.attributes.name.split(",")[0]+"</b><br/><i>Click to zoom</i>");
          map.infoWindow.show(e.graphic.geometry);
        });

        layer.on("mouse-out", function(e){
          map.setMapCursor("default");
          map.infoWindow.hide();
        });

        layer.on("click", function(e){
          var index = e.graphic.attributes["__OBJECTID"];
          topic.publish("story-navigate-section", index);
        });
      }

      clickHandlerIsSetup = true;
    }
  });
});
```

### Security

#### Can I keep my Journal private?
Yes, the regular ArcGIS security model applies.
By default your Journal is private, you can share it through Map Journal builder or ArcGIS.
When you share your Journal, it is your responsibility to make sure that all the resources of your Journal (web maps, images, videos) are accessible to your audience.

#### Who can edit my Journal?
A Journal can be edited by its owner (the named account that initially created the Journal), a member in the Administrator role (does not apply for public account), or a member with the administrative Content > Update privilege. You can also use a group with update capabilities to collaborate on a story map. See [this FAQ](https://storymaps.arcgis.com/en/faq/#question16) for more information.

#### Can I use private web maps or layers?
Yes.

When the Journal is hosted in ArcGIS Online or ArcGIS Enterprise, users who don't have access to the Journal or a web map used in the Journal will be redirected to the ArcGIS sign-in page. It is not possible to display an authentication dialog in the Map Journal when the Journal is hosted in ArcGIS.

When the Journal is hosted on your web server, an authentication dialog will appear inside the application.

Note that for that authentication to work on some older browser (Internet Explorer 9) you need to install a proxy server on your web server to make sure the login credentials can be passed securely to ArcGIS Online. For more information, see the [Using the proxy](https://developers.arcgis.com/javascript/jshelp/ags_proxy.html) in the ArcGIS API for JavaScript documentation.

Because of that limitation, we recommend that you configure the application to use OAuth. OAuth 2.0 based authentication is available for ArcGIS Online users with developer or organizational accounts and ArcGIS Enterprise users. Follow the procedure to [add an application](http://doc.arcgis.com/en/arcgis-online/share-maps/add-items.htm#ESRI_SECTION1_55703F1EE9C845C3B07BBD85221FB074) and [register an application](http://doc.arcgis.com/en/arcgis-online/share-maps/add-items.htm#ESRI_SECTION2_20AF85308FD548B5ADBAE28836F66D3F) to get an OAuth application ID. Once you have that application, open `index.html`, locate the `configOptions` section and fill the `oAuthAppId` property.

If you are using secured services but don't want users to have to authenticate, you can use a proxy to store the username/password to be used. See [Working with Proxy Services](https://developers.arcgis.com/authentication/working-with-proxies/#selfhosted-proxy-service), and add proxy rules to specify what services need to use the proxy by editing `PROXY_RULES` in `app/config.js`.

### Deployment
Deploying a Map Journal requires use of ArcGIS Online or ArcGIS Enterprise. The Journal content must be created using the Map Journal builder and will live in a Web Application Item.

#### Can I use the template without ArcGIS Online or ArcGIS Enterprise?
This is not a supported use case at this time. Please let us know if you are interested in such a scenario.

#### Where is the data stored?
The Journal's data are stored in a Web Application Item in ArcGIS Online or an ArcGIS Enterprise portal. This includes the narrative content, reference to any media used (web maps, pictures, videos, web pages), and app-wide settings.

The images and videos that you include in your Journal using the builder are not copied into ArcGIS unless you upload them through the "Upload" option. You have to make sure that any external media and web maps you are using are, and will remain, accessible to your audience.

#### Can I deploy Map Journal using ArcGIS Enterprise?
Yes, Map Journal is included with Portal for ArcGIS 10.3 up to the current version of ArcGIS Enterprise.

If you are using Portal for ArcGIS 10.3 or later and want to update Map Journal, [download the latest version](http://links.esri.com/storymaps/map_journal_template_zip). If you are using Portal 10.2.1 or 10.2.2, you can't deploy the latest version of Map Journal and have to deploy the following version [Map Journal V1.0.2 - portal](https://github.com/Esri/map-journal-storytelling-template-js/releases/download/V1.0.2/Storytelling-MapJournal-1.0.2-portal.zip).

Then:
 - Find your Portal `apps/MapJournal` folder (depending on your installation and version of Portal, this is either `C:\Program Files\ArcGIS\Portal\apps\MapSeries` or `C:\Program Files\ArcGIS\Portal\webapps\arcgis#home\webmap\templates\MapJournal`).
 - Remove the content of that folder
 - Extract the archive so that `index.html` is located at `MapJournal\index.html`

If Map Journal was already included in your portal, you are done (Portal for ArcGIS 10.3+).

If Map Journal was not available in your portal:
 - Log into Portal for ArcGIS and open My Content > Add Item > Application > Web Mapping Application > Configurable. Configure the URL to `https://portal.domain.com/arcgis/apps/MapJournal`. More details in the following documentation [publishing a new web application item](http://resources.arcgis.com/en/help/main/10.2/index.html#/Adding_applications/019300000031000000/).
 - Create a new group that will reference the template available in your Portal
 - Share the newly created item with that group
 - Open My Organization > Edit Settings > Map and set the `Web App Templates` to the newly created group. More details in the following documentation [configuring the web application gallery](http://resources.arcgis.com/en/help/main/10.2/index.html#/Configure_map_viewer/017s00000024000000/)
 - Now when you share a web map, the template should be an option

_Note that the archive you downloaded is using the ArcGIS API for JavaScript hosted in ArcGIS Online. This can create some incompatibility with your ArcGIS Enterprise installation. If you run into issue, please see the next section to update it._

Also note that the web application gallery preview feature redirects to the StoryMaps website. The target page can be modified in `app/config.js > HELP_URL_PORTAL`.

#### Can the template be used offline?
Yes, by using ArcGIS Enterprise and configuring the template to use the ArcGIS API for Javascript included with the Enterprise portal.

To edit the ArcGIS API for JavaScript, edit `index.html` and locate `pathJSAPI` around line 69. The URL is `//webadaptor.domain.com/arcgis/jsapi/jsapi` where arcgis is the name of your Web Adaptor.

When deployed on an ArcGIS Enterprise portal, the application doesn't require any external services to function. But, by default, the template will still include the header social buttons (Twitter, Facebook), and Journal authors are able to import pictures and videos from online hosting services. These options can be disabled individually through the configuration file `app/config.js`.

#### Can I use the builder if I host the app on my own web server?
Yes, when the template is configured with an application ID, adding the URL parameter 'edit' will open the builder. You will be prompted for user authentication through the Identity Manager.

#### How do I deploy the application on a web server?
If you are not familiar with web servers, here are two solutions:
 * Use the web server that comes with your server Operating System. On Windows this is Internet Information Services (IIS); if you have a `C:\inetpub\wwwroot` folder on your computer, you should be able to access it's content using `http://localhost`
 * On Windows or Mac OS, use a simple web server like [Mongoose](https://code.google.com/p/mongoose/) (not recommended for production)

If you are experiencing some rendering issues like improper symbol appearing instead of icons, you will have extra configuration to perform. Some servers require the configuration of a new mime type to be able to serve Map Journal fonts correctly. See the following links for more information:

 * [IIS Mime types](http://codingstill.com/2013/01/set-mime-types-for-web-fonts-in-iis/)
 * [Properly serve webfonts](http://blog.symbolset.com/properly-serve-webfonts)

#### Can I use a single deployment of Map Journal for multiple stories?
Yes.
If you have customized the application and deployed it on your server, you don't need to copy it multiple times, edit index.html and paste a different application ID for each story you want to publish.

Instead edit `index.html`, locate the `configOptions` section and fill the `authorizedOwners` property with the ArcGIS Online or ArcGIS Enterprise portal login of the owner(s) of the Journals you want to use. This makes it possible for the application to display any of the Journals created by the specified user(s) through an URL parameter.

Example of the same application displaying two stories:
 * http://myserver.com/MapJournal/index.html?appid=c7ad1a55de0247a68454a76f251225a4
 * http://myserver.com/MapJournal/index.html?appid=c7ad1a55de0247a68454a76f251225a5

## Configuration
In addition to the configuration offered by the builder, the file `app/config.js` provides various additional settings. This is for example the place where you can override some settings like the list of Geocoder services to be used (changes override ArcGIS Online or your Organization default settings). See the documentation provided in that file for more details.

## Customize the look and feel

### Custom color theme
As Map Journal doesn't yet offer the ability to create a custom theme through the builder, customizing the various colors of the application requires changing the data of your app. See [our blog post](https://developerscorner.storymaps.arcgis.com/customizing-theme-colors-in-map-journal-and-map-series-6e45b84c277e) about customizing theme colors.

You could also download and configure colors through `app/config.js`. For example if you are using a Side Panel layout and have kept the default theme, open `app/config.js`, locate the `LAYOUT` property and edit the following line with the desired colors.

```
themes: [
  {name: "side-default-1", dotNav: "#777777", panel: "#FFFFFF", media: "#EEEEEE", text: "#000000", textLink: "#555", esriLogo: "black"},
  ...
  ]
```

### Other customization
Most of the look and feel customization can be done using the [regular Application Download](http://links.esri.com/storymaps/map_journal_template_zip) and including the css/html overrides directly into `index.html`.

As the application Javascript and CSS are minified, **we don't recommend that you directely edit those files** (e.g. `app-viewer-min.css`, `app-viewer-min.js`, ...). In addition to being hard to edit, this will make application updates complex for you.

If you want to change the behavior of one functionality or want to add a new one, follow the [developer guide](#developer-guide) below.

The easiest way to find the ID or path of a DOM element that you want to customize is to use your browser's developer tools -- read the documentation for [Chrome](https://developers.google.com/web/tools/chrome-devtools/), [Safari](https://developer.apple.com/library/safari/documentation/AppleApplications/Conceptual/Safari_Developer_Guide/Introduction/Introduction.html), [Firefox](https://developer.mozilla.org/en-US/docs/Tools).

Here is a customization example that can achieved through the `style` tag already present for you in `index.html` (search for `/* CUSTOM CSS RULES */`):

#### Use an image as the background of the Side or Floating panel header

```
...
<body class="claro">
  <style>
    /* CUSTOM CSS RULES */
    .sectionPanel .header {
      background: url('http://www.esri.com/~/media/banner-map1.jpg');
    }

    .sectionPanel .appTitle {
      background: url('http://www.esri.com/~/media/banner-map1.jpg');
      background-position: 0 -50px;
    }
  </style>
...
```

## Developer guide
This developer guide is intended for developers who want to modify the behavior or add new functionalities to the Map Journal application.
It requires knowledge of HTML, Javascript and CSS languages.
If you only need to customize the look and feel of your Journal, you should be able to do so using the [customize section above](#customize-the-look-and-feel).

### Application life cycle
Map Journal fires events that allow customization with loose integration. This means that you don't need to understand the application internals to implement simple extensions.

To try those events, look in the file `src/app/custom-scripts.js`.

```
define(["dojo/topic"], function(topic) {
  /*
   * Custom Javascript to be executed while the application is initializing goes here
   */

  console.log("Map Journal is initializing");

  // The application is ready
  topic.subscribe("tpl-ready", function(){
    /*
     * Custom Javascript to be executed when the application is ready goes here
     */

    console.log("Map Journal is ready");
  });

  // When a section is being loaded (don't wait for the Main Stage media to be loaded)
  topic.subscribe("story-load-section", function(index){
    console.log("The section", index, "is being loaded");
  });

  // After a map is loaded (when the map starts to render)
  topic.subscribe("story-loaded-map", function(result){
    if ( result.index !== null )
      console.log("The map", result.id, "has been loaded from the section", result.index);
    else
      console.log("The map", result.id, "has been loaded from a Main Stage Action");
  });

  // When a main stage action that loads a new media or reconfigures the current media is performed
  // Note that this event is not fired for the "Locate an address or a place action"
  topic.subscribe("story-perform-action-media", function(media){
    console.log("A Main Stage action is performed:", media);
  });
});
...
```

### Developer helpers
In addition to the events described above, the story data, configuration and useful helper functions can be accessed through the global variable `app`.

```
console.log("Section", app.data.getCurrentSectionIndex(), "/", app.data.getStoryLength());
console.log("Current map", app.map);
console.log("IDs of all the web maps used in the story", app.data.getWebmaps());
console.log("Current section's data", app.data.getCurrentSection());
console.log("All sections data", app.data.getStorySections());
console.log("Story layout configuration", app.data.getWebAppData().get().values.settings.layoutOptions);
console.log("Static ayout configuration values", app.data.getCurrentLayoutStaticConfig());
```

Some events are also available for you to navigate the Journal programmatically:

```
require(["dojo/topic"], function(topic) {
  // Navigate to a section
  topic.publish("story-navigate-section", 2);

  // Reload the content panel
  topic.publish("story-update-sections");

  // Update a specific section content panel
  topic.publish("story-update-section", 2);
});
```

### Environment setup

Clone the repository or download a [copy of the repository as a zip file](https://github.com/Esri/map-journal-storytelling-template-js/archive/master.zip).

To build a production version of the application from the source code, you first need to install [Node.js](http://nodejs.org/).

Then initialize the environment by running the following commands **in the MapJournal folder**:
 * `npm install`
 * `npm install –g grunt-cli`

This will create a new `node-modules` folder in your project root with all the tools required to build the application. If you have trouble running the second command, [see this documentation on how to install grunt-cli locally](https://github.com/gruntjs/grunt-cli#installing-grunt-cli-locally).

### How to use the application from the source code
 * Make accessible the MapJournal folder on a web server. Use your favorite server or run one with `grunt server`; this will start a server on port `8080`
 * If using an ArcGIS Enterprise portal, configure the `DEFAULT_SHARING_URL` property in `app/config.js` (close to the bottom of the file)
 * Use the URL parameter `appid` to specify the web item to be loaded, e.g.: http://localhost:8080/?appid=ABCD (configuring index.html > configOptions.appid is not supported in development mode)

### How to build the application from the source code
  * Open a terminal and navigate to the MapJournal folder
  * Run the following command: `grunt`

The deploy folder now contains the built application that you can [deploy to your web server](#instructions).

### Issues building the application

The build script performs code validation through [JSHint](http://www.jshint.com/). You can disable those validations by editing `Gruntfile.js` -- look for the following comments `/* Comment out to disable code linting */`.

### Design
Map Journal relies on AMD and Dojo loader [AMD](http://help.arcgis.com/en/webapi/javascript/arcgis/jshelp/#inside_dojo_amd) for application structure.

The application is structured as follows:

| Path                                    | Contains                                            |
| --------------------------------------------- |  -------------------------------------------------------------------------------------------- |
| Gruntfile.js                  | Build configuration                                     |
| src/                      | Main source code folder with index.html and the Eclipse project configuration             |
| src/app/                    | Javascript and CSS source code                                |
| src/app/config.js                     | App configuration file (loaded at execution time)                       |
| **src/app/storymaps/common/**           | Modules common across storymaps templates (main module is Core.js)              |
| src/app/storymaps/common/builder/       | Builder modules (main module is Builder.js)                         |
| src/app/storymaps/common/mapcontrols/     | Map UI components (Overview, Legend)                              |
| src/app/storymaps/common/ui/          | UI components                                         |
| src/app/storymaps/common/utils/       | Utils, connector,...                                      |
| src/app/storymaps/common/_resources     | Static resources                                        |
| **src/app/storymaps/tpl/**            | Map Journal modules (build configuration files in the root)                 |
| src/app/storymaps/tpl/builder/        | Builder modules (main module is BuilderView.js)                       |
| src/app/storymaps/tpl/core/         | Core modules (main module is MainView.js)                           |
| src/app/storymaps/tpl/ui/           | UI components of the viewer grouped by target device                      |
| src/lib-app/                  | Dependencies (included in the final app)                            |
| src/lib-build/                | Dependencies used by the build (not included in final app)                  |
| src/resources/                | Static resources                                        |


The main dependencies are:
 * [jQuery](http://jquery.com/)
 * [Bootstrap](http://twitter.github.com/bootstrap/)
 * [CKEditor](http://ckeditor.com/)
 * [iDangero.us Swiper](http://www.idangero.us/sliders/swiper/)

The application Javascript and CSS are minified into four files:

| File      |                   |
| --------------------- | ----------------------------------------------------------------------------- |
| app/viewer-min.css  | Compressed CSS loaded when accessing the Map Journal as a viewer    |
| app/viewer-min.js | Compressed Javascript loaded when accessing the Map Journal as a viewer |
| app/builder-min.css | Compressed CSS loaded when accessing the Map Journal as an author   |
| app/builder-min.js  | Compressed Javascript loaded when accessing the Map Journal as an author  |

Depending on the URL parameters, index.html will load the corresponding files.

## Issues
Find a bug or want to request a new feature?  Please let us know by submitting an issue.

## Contributing
Esri welcomes contributions from anyone and everyone. Please see our [guidelines for contributing](https://github.com/esri/contributing).

## Licensing
Copyright 2017 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

A copy of the license is available in the repository's [LICENSE.txt](LICENSE.txt) file.

Some open-source components of this project are licensed under other License terms. See the `src/lib-app/` folder for respective licence files.

| Library               | License   |
| --------------------- | --------- |
| Bootstrap       | MIT     |
| CKEditor        | LGPL    |
| jQuery        | MIT     |
| jQuery Colorbox     | MIT     |
| iDangero.us swiper  | MIT     |
| History.js      | BSD     |
| jQuery UI       | MIT     |
| FastClick       | MIT     |
| Hammer.JS       | MIT     |
| jQuery mousewheel   | MIT     |
| jQuery UI Touch Punch | MIT     |
| Clipboard.js          | MIT       |
