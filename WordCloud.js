define(["./d3.min", "./d3.layout.cloud", "css!./WordCloud.css"],
  function() {

    return {
      initialProperties: {
        qHyperCubeDef: {
          qDimensions: [],
          qMeasure: [],
          qInitialDataFetch: [{
            qWidth: 2,
            qHeight: 50
          }]
        }
      },
      definition: {
        type: "items",
        component: "accordion",
        items: {
          dimensions: {
            uses: "dimensions",
            min: 1,
            max: 1
          },
          measures: {
            uses: "measures",
            min: 1,
            max: 1
          },
          sorting: {
						uses: "sorting"
					},
          settings: {
            uses: "settings"
          }
        }
      },
      support: {
        export: true
      },
      snapshot: {
        canTakeSnapshot: true
      },
      paint: function($element, layout) {
        //Taille de l'objet
        var width = $element.width();
        var height = $element.height();

        var id = "container_" + layout.qInfo.qId;

        //construction de la div
        if (document.getElementById(id)) {
          $("#" + id).empty();
        } else {
          $element.append($('<div />').attr("id", id).attr("class", "viz").width(width).height(height));
        }

        var div = document.getElementById(id);

        var fill = d3.scale.category10();

        var w = width,
          h = height;

        var max,
          fontSize;
        
        
        //données
        
        var tags = layout.qHyperCube.qDataPages[0].qMatrix.map(function (row) {
						// Map() method creates a new array with the results of calling a function on every element in this array
							return {
								key : row[0].qText,
								value : row[1].qNum
							};
						});
        
        //fin données
 //                 console.log(layout.qHyperCube.qDataPages[0].qMatrix);
        
        var from = 0;
        var to = 0;
        
        var rotateScale = d3.scale.linear().domain([0, 2]).range([from, to]);
        
        var layout = d3.layout.cloud()
          .timeInterval(Infinity)
          .size([w, h])
          .fontSize(function(d) {
            return fontSize(+d.value);
          })
          .text(function(d) {
            return d.key;
          })
          .rotate(function() {
            return rotateScale(~~(Math.random() * 2));
          })
          .on("end", draw);

        var svg = d3.select(div).append("svg")
          .attr("width", w)
          .attr("height", h);

        var vis = svg.append("g").attr("transform", "translate(" + [w >> 1, h >> 1] + ")");

        update();


        function draw(data, bounds) {
          var w = $element.width(),
            h = $element.height();

          svg.attr("width", w).attr("height", h);

          scale = bounds ? Math.min(
            w / Math.abs(bounds[1].x - w / 2),
            w / Math.abs(bounds[0].x - w / 2),
            h / Math.abs(bounds[1].y - h / 2),
            h / Math.abs(bounds[0].y - h / 2)) / 2 : 1;
          
          var text = vis.selectAll("text")
            .data(data, function(d) {
              if(d.text != undefined){
                return d.text.toLowerCase()
              };
            });

          text.transition()
            .duration(1000)
            .attr("transform", function(d) {
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .style("font-size", function(d) {
              return d.size + "px";
            });
          text.enter().append("text")
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .style("font-size", function(d) {
              return d.size + "px";
            })
            .style("opacity", 1e-6)
            .transition()
            .duration(1000)
            .style("opacity", 1);
          text.style("font-family", function(d) {
              return d.font;
            })
            .style("fill", function(d) {
                if(d.text !== undefined){
                  return fill(d.text.toLowerCase());
                };
              
            })
            .text(function(d) {
              return d.text;
            });

          vis.transition().attr("transform", "translate(" + [w >> 1, h >> 1] + ")scale(" + scale + ")");
        }

        function update() {
          layout.font('Arial').spiral('archimedean');
          fontSize = d3.scale['sqrt']().range([10, 100]);
          if (tags.length) {
            fontSize.domain([+tags[tags.length - 1].value || 1, +tags[0].value]);
          }
          layout.stop().words(tags).start();
        }

      }
    }
  });