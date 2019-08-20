import {
  define
} from 'hybrids';
import styles from '../dist/style.css';

import d3 from "../node_modules/d3/d3";
import rgbcolor from "../node_modules/complexviewer/demo/rgbcolor";
import legend from "../node_modules/complexviewer/demo/legend";
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
      xlv.svgElement.setAttribute("style", "display: -webkit-box;display: -moz-box;display: -ms-flexbox; display: -webkit-flex;display: flex;flex-grow:1;");

      var legend = d3.select("svg").append("g");
      xlv.legendCallbacks.push(function (colourAssignment) {
        legend.selectAll("*").remove();
        var coloursKeyDiv = document.getElementById('colours');
        if (colourAssignment) {
          //html legend
          var dataSetsSelect = document.getElementById('dataSets');
          var example = exampleIndex.find(o => o.name === host.getAttribute("example"));
          var table = "<table background:#EEEEEE;><tr style='height:10px;'></tr><tr><td style='width:100px;margin:10px;"
                      + "background:#70BDBD;opacity:0.3;border:none;'>"
                      + "</td><td >"+example.ac+"</td></tr>";
          var domain = colourAssignment.domain();
          //~ //console.log("Domain:"+domain);
          var range = colourAssignment.range();
          //~ //console.log("Range:"+range);
          table += "<tr style='height:10px;'></tr>";
          for (var i = 0; i < domain.length; i ++)  {
              //make transparent version of colour
              var temp = new RGBColor(range[i%20]);
              var trans = "rgba(" +temp.r+","+temp.g+","+temp.b+ ", 0.6)";
              table += "<tr><td style='width:75px;margin:10px;background:"
                      + trans + ";border:1px solid "
                      + range[i%20] + ";'></td><td>"
                      + domain[i] +"</td></tr>";
              //~ //console.log(i + " "+ domain[i] + " " + range[i]);
          }

          table = table += "</table>";
          coloursKeyDiv.innerHTML = table;
          //~ //d3 svg legend
          //~ verticalLegend = d3.svg.legend().labelFormat("none").cellPadding(5).orientation("vertical").units(xlv.annotationChoice).cellWidth(25).cellHeight(18).inputScale(colourAssignment);
          //~ legend.attr("transform", "translate(20,40)").attr("class", "legend").call(verticalLegend);
        }
      });

      for (var i = 0; i < exampleIndex.length; i++) {
          var example = exampleIndex[i];
          var dataSetsSelect = document.getElementById('dataSets');
          var opt = document.createElement('option');
          opt.value = "../component-dist/data/complex/" + example.ac + ".json";
          opt.innerHTML = example.name;
          dataSetsSelect.appendChild(opt);
      }
      loadData();
      // changeAnnotations();


      function loadData() {
        xlv.clear();
        var dataSetsSelect = document.getElementById('dataSets');

        var example = exampleIndex.find(o => o.name === host.getAttribute("example"));
        // console.log(example);
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
        ~ innerSel.append("p").html("<b>Functions:</b> " + example.functions);
        // if (example.disableStoichExpand) {
        //     d3.select("#chkexpansion").attr("disabled", "disabled");
        //     document.getElementById("chkexpansion").checked = false;
        // } else {
        //     d3.select("#chkexpansion").attr("disabled", null);
        //     //~ document.getElementById("chkexpansion").checked = true;
        // }
        // var matrixExpansion = document.getElementById("chkexpansion").checked;
        for(var l=0;l<exampleIndex.length;l++) {
          if(dataSetsSelect.options[l].innerHTML === host.getAttribute("example")) {
            dataSetsSelect.options[l].selected = true;
          }
        }
        console.log("index is ",dataSetsSelect.selectedIndex);
        var path = dataSetsSelect.options[dataSetsSelect.selectedIndex].value;
        console.log(dataSetsSelect.selectedIndex);
        console.log(path);
        d3.json(path, function(data) {
            xlv.readMIJSON(data, host.getAttribute("expand"));
        });
      }

    if(host.getAttribute("expandAllProteins") === "true") {
      xlv.expandAll();
    } else if(host.getAttribute("expandAllProteins") === "false") {
      xlv.collapseAll();
    }
    //leave this line here. Deleting it will result in your css going AWOL.
    addStylesIfNeeded();
    }
  }
}

export const ComplexViewer = {
  init: initComponent()
};

// this line connects the html element in index.html with the javascript defined above.
define('complex-viewer', ComplexViewer);
