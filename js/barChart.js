
/*
 * PrioVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData 
 */

class BarChart {
    
    constructor (_parentElement, _data,){
        this.parentElement = _parentElement;
        this.data = _data;
        this.filteredData = this.data;
        this.dataAttr = 'co2pp_07';
        this.margin = { top: 20, right: 20, bottom: 200, left: 50 };
        this.width = $("#" + this.parentElement).width() - this.margin.left - this.margin.right;
        this.height = 500 - this.margin.top - this.margin.bottom;


        this.initVis();
    }


    /*
    * Initialize visualization (static content, e.g. SVG area or axes)
    */

    initVis(){
        var vis = this;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom);
        vis.g = vis.svg.append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


        // Scales and axes
        vis.x = d3.scaleBand()
            .rangeRound([0, vis.width])
            .paddingInner(0.2)

        vis.y = d3.scaleLinear()
            .range([vis.height,0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.g.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.g.append("g")
            .attr("class", "y-axis axis");

        // Axis title
        vis.g.append("text")
            .attr("x", -50)
            .attr("y", -8)
            .text("co2pp_07");

        // Axis title
        vis.g.append("text")
            .attr('class', 'xlabel')
            .attr("x", vis.width/2)
            .attr("y", vis.height + 40)
            .style('text-anchor','middle')
            .text(vis.xAttr);


        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }



    /*
    * Data wrangling
    */

    wrangleData(){
        var vis = this;
        vis.data.map(d=>
            d[vis.dataAttr] = +d[vis.dataAttr])
        vis.displayData = vis.data;

        console.log('displayData', vis.data)

        // Update the visualization
        vis.updateVis();
    }



    /*
    * The drawing function
    */

    updateVis(){
        let vis = this;

        // Update domains
        vis.y.domain([0, d3.max(vis.displayData,d=>d[vis.dataAttr])]);
        console.log(vis.y.domain())

        vis.x.domain(d3.range(0,vis.displayData.length));

        vis.g.select('.xlabel').text('Country')
            .attr('y',vis.height + 100);

        var bars = vis.g.selectAll(".bar")
            .data(vis.displayData)

        bars.enter().append("rect")
            .attr("class", "bar")

            .merge(bars)
            .transition()
            .attr("width", vis.x.bandwidth())
            .attr("height", function(d){
                return vis.height - vis.y(d[vis.dataAttr]);
            })
            .attr("x", function(d, index){
                return vis.x(index);
            })
            .attr("y", function(d){
                return vis.y(d[vis.dataAttr]);
            })

        bars.exit().remove();

        // Call axis function with the new domain
        vis.g.select(".y-axis").call(vis.yAxis);

        vis.g.select(".x-axis").call(vis.xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-45)"
            })
            .text(d=>{return vis.displayData[d]['country']});
    }

    onSelectionChange(selectionStart, selectionEnd){
        var vis = this;

        vis.filteredData = vis.data.filter(function(d){
            return d.time >= selectionStart && d.time <= selectionEnd;
        });

        vis.wrangleData();
    }

    highlight(data){
        var circles = this.svg.selectAll("rect")
            .classed('highlight', false);

        circles.data(data, function(d) { return d.country })
            .classed('highlight', true);
    }
}
