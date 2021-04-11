
/*
 * PrioVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData 
 */

class Animate {
    
    constructor (_parentElement, _data,){
        this.parentElement = _parentElement;
        this.data = _data;
        this.filteredData = this.data;
        this.xAttr = 'population_07';
        this.yAttr = 'co2pp_07';
        this.bars = true;
        this.initVis();
    }


    /*
    * Initialize visualization (static content, e.g. SVG area or axes)
    */

    initVis(){
        var vis = this;

        vis.margin = { top: 20, right: 20, bottom: 200, left: 50 };

        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
            vis.height = 500 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
        


        // Scales and axes
        vis.x = d3.scaleLinear()
        .range([0,vis.width]);

        vis.countryScale = d3.scaleBand()
        .rangeRound([0, vis.width])
        .paddingInner(0.2)


        vis.y = d3.scaleLinear()
            .range([vis.height,0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.svg.append("g")
            .attr("class", "y-axis axis");

        // Axis title
        vis.svg.append("text")
            .attr("x", -50)
            .attr("y", -8)
            .text(vis.yAttr);

                // Axis title
        vis.svg.append("text")
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

        let xDomain = d3.extent(vis.displayData,d=>d[vis.xAttr])
        let range = xDomain[1] - xDomain[0]
        // Update domains
        vis.y.domain(d3.extent(vis.displayData,d=>d[vis.yAttr]));
        vis.x.domain([xDomain[0]-range*0.1, xDomain[1]])

        var bars = vis.svg.selectAll(".bar")
            .data(vis.displayData)

        bars.enter().append("rect")
            .attr("class", "bar")

            .merge(bars)
            .attr("width",10)
            .attr("height",10)
            .attr('rx',10)
            .attr('ry',10)
            .attr("x",d=>vis.x(d[vis.xAttr]))
            .attr("y",d=>vis.y(d[vis.yAttr]))


        bars.exit().remove();

        // Call axis function with the new domain
        vis.svg.select(".y-axis").call(vis.yAxis);

        vis.svg.select(".x-axis").call(vis.xAxis)

        vis.svg.on('click',()=>vis.bars?  vis.toScatterPlot() : vis.toBarChart())
    }

    toScatterPlot(){
        let vis = this;

        vis.bars = false;
        vis.xAxis.scale(vis.x);
        vis.countryScale.domain(d3.range(0,vis.displayData.length));

    
//     let vis = this;
//     vis.bars = true;
//     vis.displayData = vis.displayData.sort((a,b)=>a[vis.xAttr]>b[vis.xAttr] ? 1 :-1)
//     console.log('sorted', vis.displayData)

//     vis.countryScale.domain(d3.range(0,vis.displayData.length));
//     vis.xAxis.scale(vis.countryScale);


//     d3.select('.xlabel').text('Country')
//     .attr('y',vis.height + 100)

//     vis.svg.selectAll(".bar")
//         .transition()
//         .duration(3000)
//         .ease(d3.easeLinear)
//         .attr("width", vis.countryScale.bandwidth())
//         .attr("height", function(d){
//             return vis.height - vis.y(d[vis.yAttr]);
//         })
//         .attr('rx',0)
//         .attr('ry',0)

//         .transition()
//         .duration(3000)
//         .ease(d3.easeLinear)
//         .attr("x", function(d, index){
//             return vis.countryScale(index);
//         })
//         .attr("y", function(d){
//             return vis.y(d[vis.yAttr]);
//         })

   
//     vis.svg.select(".x-axis").call(vis.xAxis)
//         .selectAll("text")
//         .style("text-anchor", "end")
//         .attr("dx", "-.8em")
//         .attr("dy", ".15em")
//         .attr("transform", function(d) {
//             return "rotate(-45)"
//         })
//         .text(d=>{return vis.displayData[d]['country']});
// }
            d3.select('.xlabel').text(vis.xAttr)
            .attr('y',vis.height + 40)

        vis.svg.selectAll(".bar")
            .transition()
            .duration(2000)
            .ease(d3.easeLinear)
            .attr("width",10)
            .attr("height",10)
            .attr('rx',10)
            .attr('ry',10)
            .transition()
            .duration(2000)
            .ease(d3.easeLinear)
            .attr("x",d=>vis.x(d[vis.xAttr]))
            .attr("y",d=>vis.y(d[vis.yAttr]))

    
        vis.svg.select(".x-axis").call(vis.xAxis)
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
        vis.displayData = vis.displayData.sort((a,b)=>a[vis.xAttr]>b[vis.xAttr] ? -1 :1)


        vis.xAxis.scale(vis.countryScale);
        vis.countryScale.domain(d3.range(0,vis.displayData.length));

        d3.select('.xlabel').text('Country')
        .attr('y',vis.height + 100)

        vis.svg.selectAll(".bar")
            .transition()
            .duration(3000)
            .ease(d3.easeLinear)
            .attr("width", vis.countryScale.bandwidth())
            .attr("height", function(d){
                return vis.height - vis.y(d[vis.yAttr]);
            })
            .attr('rx',0)
            .attr('ry',0)

            .transition()
            .duration(3000)
            .ease(d3.easeLinear)
            .attr("x", function(d, index){
                return vis.countryScale(index);
            })
            .attr("y", function(d){
                return vis.y(d[vis.yAttr]);
            })

    
        vis.svg.select(".x-axis").call(vis.xAxis)
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
