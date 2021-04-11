
/*
 * PrioVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData 
 */

class LinkedHighlighting {
    
    constructor (_parentElement, _data,){
        console.log(_parentElement);
        this.parentElement = _parentElement;
        this.data = _data;
        this.fade_time = 100;
        this.initVis();
    }


    /*
    * Initialize visualization (static content, e.g. SVG area or axes)
    */

    initVis(){
        var vis = this;


        vis.scatterPlot = new ScatterPlot(vis.parentElement + "_scatter", vis.data);
        console.log(vis.scatterPlot);
        vis.scatterPlot.svg.selectAll("circle")
            .on("mouseover", function(d, i){
                vis.scatterPlot.svg.selectAll("circle").classed('highlight', false);
                d3.select(this).classed('highlight', true);
                vis.barChart.highlight([i]);
            })
            .on("mouseout", function(){
                // d3.select(this).classed('highlight', false);
                // vis.barChart.highlight([]);
            });

        vis.barChart = new BarChart(vis.parentElement + "_bar", vis.data);
        vis.barChart.svg.selectAll("rect")
            .on("mouseover", function(d, i){
                vis.barChart.svg.selectAll("rect").classed('highlight', false);
                d3.select(this).classed('highlight', true);
                vis.scatterPlot.highlight([i]);
            })
            .on("mouseout", function(){
                // d3.select(this).classed('highlight', false);
                // vis.scatterPlot.highlight([]);
                    
            });
    }


}
