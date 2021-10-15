
/*
 * PrioVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData 
 */

class dataWedge {

    constructor(_parentElement, _data,) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.filteredData = this.data;
        this.margin = { top: 20, right: 20, bottom: 200, left: 50 };
        this.width = $("#" + this.parentElement).width()+100 - this.margin.left - this.margin.right;
        this.height = 500 - this.margin.top - this.margin.bottom;
        setTimeout(() => { this.initVis(); }, 0);

    }


    /*
    * Initialize visualization (static content, e.g. SVG area or axes)
    */

    initVis() {

        let numLayers = 5
        let vis = this;
        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom);
        vis.g = vis.svg.append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

            var svg = d3.select("svg")
            .append("g")
            .attr("transform", "translate(220,250)");
  
        // Function is used
        
        let questionData = [
            { label: 'Emotional', 
            questions: [
                { id: 'Q1', label: 'Safe to Speak Up' }, 
                { id: 'Q2', label: 'Sense of Being' }, 
                { id: 'Q3', label: 'Community' }] 
            },
            { label: 'Physical', 
            questions: [
                { id: 'Q1', label: 'Safe to Speak Up' }, 
                { id: 'Q2', label: 'Sense of Being' }, 
                { id: 'Q3', label: 'Community' }] 
            },
            { label: 'Environmental', 
            questions: [
                { id: 'Q1', label: 'Safe to Speak Up' }, 
                { id: 'Q2', label: 'Sense of Being' }, 
                { id: 'Q3', label: 'Community' }] 
            },
            { label: 'Purpose', 
            questions: [
                { id: 'Q1', label: 'Safe to Speak Up' }, 
                { id: 'Q2', label: 'Sense of Being' }, 
                { id: 'Q3', label: 'Community' }] 
            },
            { label: 'Org Culture', 
            questions: [
                { id: 'Q1', label: 'Safe to Speak Up' }, 
                { id: 'Q2', label: 'Sense of Being' }, 
                { id: 'Q3', label: 'Community' }] 
            },
            { label: 'Professional', 
            questions: [
                { id: 'Q1', label: 'Safe to Speak Up' }, 
                { id: 'Q2', label: 'Sense of Being' }, 
                { id: 'Q3', label: 'Community' }] 
            }
        
        ]


            let data = this.createWedges(questionData,numLayers)

        let centerArc = d3.arc()
        .innerRadius(0)
        .outerRadius(50) //+i*10
        .startAngle(0)
        .endAngle(2*Math.PI)

        let opacityScale = d3.scaleLinear().range([.1,.7]).domain([0,numLayers])
  
        let colorScale = d3.scaleOrdinal().range(['#c5c5c9','#cdcdcf','#d4d4d5','#d9d9db','#e7e7e8']).domain([4,3,2,1,0])
        console.log(data)

        let groups = svg.selectAll('.wedgeGroup').data(data)
        .enter().append('g')
        .attr('class', 'wedgeGroup rotate')
        .attr('id',d=>d.id+'Group')
        .on('click',(event,d)=>console.log(d));

        groups.selectAll('.wedge')
        .data(d=>d.wedges)
        .enter()
        .append("path")
        .attr("class", "wedge arc")
        .attr("d", d=>d.arc())
        // .style('opacity',d=>opacityScale(d.layer))
        .style('fill',d=>{return colorScale(d.layer)})
        .attr('id',d=>{
            if (d.layer == 4){
                return d.parentLabel
            } })
        .each(function(d,i) {
            if (d.layer == 4){
        
            //append the text to the parentGroup
            let groupData = d3.select(this.parentNode).data()[0]    


            var firstArcSection = /(^.+?)L/;

            //Grab everything up to the first Line statement
            var newArc = firstArcSection.exec( d3.select(this).attr("d") )[1];
            //Replace all the commas so that IE can handle it
            newArc = newArc.replace(/,/g , " ");
        
            //If the end angle lies beyond a quarter of a circle (90 degrees or pi/2)
            //flip the end and start position
            if (groupData.quadrant == 'lower') {
                //Everything between the capital M and first capital A
                var startLoc = /M(.*?)A/;
                //Everything between the capital A and 0 0 1
                var middleLoc = /A(.*?)0 0 1/;
                //Everything between the 0 0 1 and the end of the string (denoted by $)
                var endLoc = /0 0 1 (.*?)$/;
                //Flip the direction of the arc by switching the start and end point
                //and using a 0 (instead of 1) sweep flag
                var newStart = endLoc.exec( newArc )[1];
                var newEnd = startLoc.exec( newArc )[1];
                var middleSec = middleLoc.exec( newArc )[1];
        
                //Build up the new arc notation, set the sweep-flag to 0
                newArc = "M" + newStart + "A" + middleSec + "0 0 0 " + newEnd;
            }//if
    
            //Create a new invisible arc that the text can flow along
            d3.select('#' + d.parentLabel+'Group').append("path")
                .attr("class", "textPath")
                .attr("id", "textPath"+d.parentLabel)
                .attr("d", newArc)
                .style("fill", "none")
                // .style('stroke','red')
            

            d3.select('#' + d.parentLabel+'Group')
                .append('text')
                .attr('class','label')
                .attr("dy", (d,i)=>groupData.quadrant == 'lower' ?  20 : -10)
                // .attr('transform', 'scale(1,-1)')
                .append('textPath')
                .attr("startOffset",groupData.quadrant == 'lower' ? '95%': '5%')
                .style("text-anchor",groupData.quadrant == 'lower' ? 'end': 'start')
                .attr('xlink:href',d=>'#textPath' + groupData.id)
                // .attr('x',d=>d.position.x)
                // .attr('y',d=>d.position.y)
                .text(d=>groupData.label)
            // 
        }
        });
           
     
    //     //get points for labels:
    //     let labelData = [];
    //    d3.selectAll('.wedge').each(function(s){
    //     //    console.log(s, d3.select(this.parentNode).data())
    //        if (s.layer == 4){
    //         labelData.push({data:d3.select(this.parentNode).data()[0], position:d3.select(this).node().getPointAtLength(0)})
    //        }
           
    //     })
    //     console.log('labels', labelData)

        // svg.selectAll('.labels')
        // .data(labelData)
        // .enter()
        // .append('text')
        // .attr('class','labels')
        // .attr("dy", (d,i)=>d.data.quadrant == 'lower' ?  10 : -11)
        // // .attr('transform', 'scale(1,-1)')
        // .append('textPath')
        // .attr("startOffset",(d,i)=>d.data.quadrant == 'lower' ? '100%': '0%')
        // .style("text-anchor",(d,i)=>d.data.quadrant == 'lower' ? 'end': 'start')
        // .attr('xlink:href',d=>'#textPath' + d.data.id)
        // // .attr('x',d=>d.position.x)
        // // .attr('y',d=>d.position.y)
        // .text(d=>d.data.label)


        groups.selectAll('.line')
            .data(d=>d.lines)
            .enter()
            .append("path")
                .attr("class", "line arc")
                .attr("d", d=>d.arc())
                // .style('opacity',d=>opacityScale(d.layer))
                // .style('fill',d=>{console.log(d.layer,colorScale(d.layer)); return colorScale(d.layer)})
         
      
        // .style('fill',d=>{console.log(d.layer,colorScale(d.layer)); return colorScale(d.layer)})
        
             
        svg.append('path')
        .attr("class", "centerArc")
        .attr("d", centerArc)



        let self = this;
  
    }

    createWedges(data,numLayers){
        let numWedges = data.length
        let interval = 2*Math.PI/numWedges;
       

        let numLines = 3;
         let lineInterval = interval/(numLines+1);
        
        let innerRadius = 40
        let outerRadius = 200
        let radiusInterval = (outerRadius - innerRadius) / numLayers;

        let wedgeArray = [];
        data.map((d,i)=>{
            let id = d.label.replace(/\s/g, '')
            let startAngle = i*interval - Math.PI/2 //start the wedges on the left
            let endAngle = (i+1)*interval - Math.PI/2;
            let quadrant = endAngle > 90 * Math.PI/180  ? 'lower':'upper'
            let wedgeGroup = {label:d.label,id, questions:d.questions,startAngle,endAngle,quadrant, wedges:[],lines:[]};
          
            

            [...Array(numLayers)].map((n,ii)=>{
            
            
                let startRadius = innerRadius+ii*radiusInterval
                let endRadius = innerRadius+((ii+1)*radiusInterval)

                // let start = 0
                // let end = interval
                var arc = d3.arc()
                    .innerRadius(startRadius)
                    .outerRadius(endRadius) //+i*10
                    .startAngle(startAngle)
                    .endAngle(endAngle)
                    // .padAngle(Math.PI/40)
                    // .cornerRadius(5)
                   
                
                    wedgeGroup.wedges.push({arc, layer:ii, parentLabel:id, endAngle})
                
    
            });

            d.questions.map((q,ii)=>{

                let startLine = startAngle+(ii+1)*lineInterval
                let endLine = startLine +0.01

                var arc = d3.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius) //+i*10
                    .startAngle(startLine)
                    .endAngle(endLine)
                    // .padAngle(Math.PI/40)
                    // .cornerRadius(5)
                   
                  
    
                    wedgeGroup.lines.push({arc,data:q})
            })


            wedgeArray.push(wedgeGroup)

        })
        
        
        return wedgeArray
    }

    updateVis() {
        let vis = this;

        let xDomain = d3.extent(vis.displayData, d => d[vis.xAttr])
        let range = xDomain[1] - xDomain[0]
        // Update domains
        vis.y.domain([0, d3.extent(vis.displayData, d => d[vis.yAttr])[1]]);
        vis.x.domain([xDomain[0] - range * 0.07, xDomain[1]])

        console.log(vis.y.domain())
        console.log(vis.displayData)

        var bars = vis.g.selectAll(".bar")
            .data(vis.displayData)

        bars.enter().append("circle")
            .attr("class", "bar")

            .merge(bars)
            .transition()

            .attr("r", vis.dot_size)
            .attr("cx", d => vis.x(d[vis.xAttr]))
            .attr("cy", d => vis.y(d[vis.yAttr]));


        bars.exit().remove();

        // Call axis function with the new domain
        vis.g.select(".y-axis").call(vis.yAxis);

        vis.g.select(".x-axis").call(vis.xAxis)
        // .selectAll("text")
        // .style("text-anchor", "end")
        // .attr("dx", "-.8em")
        // .attr("dy", ".15em")
        // .attr("transform", function(d) {
        //     return "rotate(-45)"
        // })
        // .text(d=>{return vis.displayData[d]['country']});
    }

    onSelectionChange(selectionStart, selectionEnd) {
        var vis = this;

        vis.filteredData = vis.data.filter(function (d) {
            return d.time >= selectionStart && d.time <= selectionEnd;
        });

        vis.wrangleData();
    }

    highlight(data) {
        var circles = this.svg.selectAll("circle")
            .classed('highlight', false);

        circles.data(data, function (d) { return d.country })
            .classed('highlight', true);
    }
}