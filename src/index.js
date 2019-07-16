import {
  define
} from 'hybrids';
import styles from '../dist/style.css';
/* Add any additional library imports you may need here. */

import complexViewer from "../node_modules/complexviewer/build/complexviewer";
import d3 from "../node_modules/d3/d3";
import rgbcolor from "../node_modules/complexviewer/demo/rgbcolor";
import legend from "../node_modules/complexviewer/demo/legend";
import data from "../node_modules/complexviewer/demo/data/complex/index";

/**
 * === Don't remove this method or styles will break.
 * We directly insert a style element into the document head
 * in order to embed styles.
 **/
function styleTemplate() {
  var myStyle = document.createElement("style");
  myStyle.setAttribute("id", "ComplexViewerStyle");
  myStyle.setAttribute("type", "text/css");
  myStyle.innerHTML = styles.toString();
  return myStyle;
}

/**
 * === Don't remove this method or styles will break.
 * Check if there is already a style element for this component and add if not.
 * Useful in cases where this component might be initialised more than once.
 **/
function addStylesIfNeeded() {
  if (!document.getElementById("ComplexViewerStyle")) {
    document.head.appendChild(styleTemplate());
  }
}

/**
 * initialises an existing library, called inside the web component wrapper.
 **/
function initComponent(options) {
  return {
    get: (host, v) => v, // required to be recognized as property descriptor,
    set: () => {}, //required to stop TypeError: setting getter-only property "x"
    connect: (host, key) => {
      var targetDiv = document.getElementById('complexViewer');
      var xlv = new xiNET(targetDiv);
      xlv.svgElement.setAttribute("style", "width: 100vw; height:100vh;display: -webkit-box;display: -moz-box;display: -ms-flexbox; display: -webkit-flex;display: flex;flex-grow:1;");


      var legend = d3.select("svg").append("g");
      xlv.legendCallbacks.push(function (colourAssignment) {
          legend.selectAll("*").remove();
          var coloursKeyDiv = document.getElementById('colours');
          if (colourAssignment){
            var example = exampleIndex[0];
            var table = "<table background:#EEEEEE;><tr style='height:10px;'></tr><tr><td style='width:100px;margin:10px;"
                        + "background:#70BDBD;opacity:0.3;border:none;'>"
                        + "</td><td >"+example.ac+"</td></tr>";
            var domain = colourAssignment.domain();
            var range = colourAssignment.range();
            table += "<tr style='height:10px;'></tr>";
            for (var i = 0; i < domain.length; i ++){
                //make transparent version of colour
                var temp = new RGBColor(range[i%20]);
                var trans = "rgba(" +temp.r+","+temp.g+","+temp.b+ ", 0.6)";
                table += "<tr><td style='width:75px;margin:10px;background:"
                        + trans + ";border:1px solid "
                        + range[i%20] + ";'></td><td>"
                        + domain[i] +"</td></tr>";
            }

            table = table += "</table>";
            coloursKeyDiv.innerHTML = table;
        }

    });

    loadData();
    changeAnnotations();

    function loadData(){
        xlv.clear();
      //   var dataSetsSelect = document.getElementById('dataSets');

        var example = exampleIndex[0];

        var complexDetailsSel = d3.select('#complexDetails');

        complexDetailsSel.selectAll("*").remove("*");

        complexDetailsSel.append("a")
            .attr("href","http://www.ebi.ac.uk/complexportal/complex/"+example.ac)
            .attr("target", "_blank")
            .html("<b>" + example.ac + "</b> - View on ComplexPortal");
        if (example.complexAssemblies[0]) {
            complexDetailsSel.append("p").html("<b>Type:</b> " + example.complexAssemblies[0]);
        }


        var innerSel = complexDetailsSel.append("div").classed("detailsInner", true);

        var detailsHtml = "<b>Properties:</b> " + example.properties;
        if (example.viewerNotes) {
            detailsHtml += "<br><b>Viewer Notes:</b> " + example.viewerNotes;
        }
        innerSel.append("p").html(detailsHtml);

        d3.json('../node_modules/complexviewer/demo/data/complex/EBI-9691559.json', function(data) {
            xlv.readMIJSON(data, false);
        });
    }

    function changeAnnotations(){
        var annotationSelect = document.getElementById('annotationsSelect');
        xlv.setAnnotations('MI features');
    }

    //leave this line here. Deleting it will result in your css going AWOL.
    addStylesIfNeeded();
    }
  }
}

/**
 * This is where we place the bulk of the code, wrapping an existing BioJS component
 * or where we might initialise a component written from scratch. Needs to be
 * paired with a `define` method call - see end of the page.
 **/
export const ComplexViewer = {
  init: initComponent()
};

// this line connects the html element in index.html with the javascript defined above.
define('complex-viewer', ComplexViewer);
