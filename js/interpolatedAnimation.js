
/*
 * PrioVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData 
 */

class InterpolatedAnimation {
    
    constructor (_parentElement, _data,){
        console.log(_parentElement);
        this.parentElement = _parentElement;
        this.data = _data;
        this.filteredData = this.data;
        this.xAttr = 'population_07';
        this.yAttr = 'co2pp_07';
        this.bars = true;
        this.anim_duration = 1250;
        this.dot_size = 8;
        this.bars = false;
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
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        vis.g = vis.svg.append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
        


        // Scales and axes
        vis.x = d3.scaleLinear()
            .range([0,vis.width]);

        vis.countryScale = d3.scaleBand()
            .rangeRound([0, vis.width])
            .paddingInner(0.2);


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
            .text(vis.yAttr);

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
        vis.data.map(d=>{
            d[vis.xAttr] = +d[vis.xAttr]
            d[vis.yAttr] = +d[vis.yAttr]})
        vis.displayData = vis.data;

        console.log('displayData', vis.data)

        // Update the visualization
        vis.updateVis();
        // setTimeout(function(){ vis.toBarChart(); }, 1000);

        // setTimeout(function(){ vis.toScatterPlot(); }, 4000);

        
    }



    /*
    * The drawing function
    */

    updateVis(){
        let vis = this;

        let xDomain = d3.extent(vis.displayData,d=>d[vis.xAttr]); // calculates min and max values of an array
        let range = xDomain[1] - xDomain[0];
        // Update domains
        vis.y.domain([0, d3.extent(vis.displayData,d=>d[vis.yAttr])[1]]);
        vis.x.domain([xDomain[0]-range*0.07, xDomain[1]]);

        var bars = vis.g.selectAll(".bar")
            .data(vis.displayData);

        bars.enter().append("rect")
            .attr("class", "bar")

            .merge(bars)
            .attr("width",vis.dot_size)
            .attr("height",vis.dot_size)
            .attr('rx',vis.dot_size)
            .attr('ry',vis.dot_size)
            .attr("x",d=>vis.x(d[vis.xAttr]))
            .attr("y",d=>vis.y(d[vis.yAttr]));


        bars.exit().remove();

        // Call axis function with the new domain
        vis.g.select(".y-axis").call(vis.yAxis);

        vis.g.select(".x-axis").call(vis.xAxis);

        // vis.svg.on('click',()=>vis.bars?  vis.toScatterPlot() : vis.toBarChart());
        $('#' + vis.parentElement + 'StartBtn').on("click",()=>vis.bars?  vis.toScatterPlot() : vis.toBarChart())
    }

    toScatterPlot(){
        let vis = this;

        vis.bars = false;
        vis.xAxis.scale(vis.x);
        vis.countryScale.domain(d3.range(0,vis.displayData.length));


        vis.g.selectAll(".bar")
            .transition()
            .duration(vis.anim_duration)
            .ease(d3.easeLinear)
            .attr("width",vis.dot_size)
            .attr("height",vis.dot_size)
            .attr('rx',vis.dot_size)
            .attr('ry',vis.dot_size)
            .attr("x",d=>vis.x(d[vis.xAttr]))
            .attr("y",d=>vis.y(d[vis.yAttr]));

        vis.g.select(".x-axis")
            .transition()
            .delay(vis.anim_duration)
            .duration(0)
            .call(vis.xAxis);

            
        vis.g.select('.xlabel').text(vis.xAttr)
            .transition()
            .delay(vis.anim_duration)
            .duration(0)
            .attr('y',vis.height + 40);
    
        // vis.g.select(".x-axis")
            // .call(vis.xAxis);
            // .selectAll("text")
            // .style("text-anchor", "end")
            // .attr("dx", "-.8em")
            // .attr("dy", ".15em")
            // .attr("transform", function(d) {
            //     return "rotate(-45)"
            // })
            // .text(d=>{return vis.displayData[d]['country']});


    }
    toBarChart(){

        let vis = this;
        vis.bars = true;
        vis.displayData = vis.displayData.sort((a,b)=>a['country']<b['country'] ? -1 :1);


        vis.countryScale.domain(d3.range(0,vis.displayData.length));
        
        vis.xAxis.scale(vis.countryScale);
        vis.g.select('.xlabel').text('Country')
            .attr('y',vis.height + 100);


        vis.g.selectAll(".bar")
            .transition()
            .duration(vis.anim_duration)
            .ease(d3.easeLinear)
            .attr("x", function(d, index){
                return vis.countryScale(index);
            })
            .attr("y", function(d){
                return vis.y(d[vis.yAttr]);
            })
            .attr("width", vis.countryScale.bandwidth())
            .attr("height", function(d){
                return vis.height - vis.y(d[vis.yAttr]);
            })
            .attr('rx',0)
            .attr('ry',0);


        vis.g.select(".x-axis")
            
            .call(vis.xAxis)
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
}
