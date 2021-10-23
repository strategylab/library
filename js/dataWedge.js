
/*
 * PrioVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData 
 */

class dataWedge {

    constructor(_parentElement, surveyQuestions,surveyResponses) {
        this.parentElement = _parentElement;
        this.surveyQuestions = surveyQuestions;
        this.surveyResponses = surveyResponses;
        // this.filteredData = this.data;
        this.margin = { top: 20, right: 20, bottom: 200, left: 50 };
        this.width = d3.select("#" + this.parentElement).node().clientWidth+100 - this.margin.left - this.margin.right;
        this.height = 1000 - this.margin.top - this.margin.bottom;
        this.numLayers = 5;

        this.wrangleData();

        // setTimeout(() => { this.initVis();   // Update the visualization
        //    }, 0);

    }


    /*
    * Initialize visualization (static content, e.g. SVG area or axes)
    */
    segmentPath (pathData){
        var pathSegmentPattern =  /[A-Z][^A-Z]*/g  ///[A-Z][^a-z]*/g;
       
        return pathData.match(pathSegmentPattern)
    }

    wrangleData(){

    //create array of JSON objects from csv. 
    let wedgeHeader = 'Wedge';
    let axisHeader = 'Topic'
    let qualtricsHeader = 'Qualtrics Question ID'
    let setHeader = 'Set'

    let surveyQuestions = this.surveyQuestions.filter(d=>d[axisHeader] && d[setHeader]); //filter out questions without an assigned axis or set
    // let surveyResponses =this.surveyResponses;
 
    // surveyQuestions.map((d,i)=>d[qualtricsHeader]= i);

    let wedges = new Set(surveyQuestions.map(d=>d[wedgeHeader]));

    this.wedgeStructure = Array.from (wedges).map(wedge=>{
        let wedgeObj = {label:wedge, id: wedge.replace(/\s/g, ''),axis:{}}

        let wedgeQuestions = surveyQuestions.filter(d=>d[wedgeHeader] == wedge);
        let axisNames = new Set(wedgeQuestions.map(d=>d[axisHeader]))

        Array.from(axisNames).map(axis=>{
            wedgeObj.axis[axis]={questions:[],label:axis, id:axis.replace(/\s/g, '')};
        })

        wedgeQuestions.map(q=>{
            wedgeObj.axis[q[axisHeader]].questions.push(q) 
        })

        return wedgeObj
    })

    this.initVis()

    }

    initVis() {

        let wedgeStructure = this.wedgeStructure

      
        let vis = this;
        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).select('svg')//d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom);

 
        vis.g = vis.svg.append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

            var svg = d3.select("svg")
            .append("g")
            .attr("transform", "translate(" + this.width/2 + "," + this.height/2 + ")");
  
        let wedgeShapes = this.createWedges(wedgeStructure)

        console.log('wedgeShapes', wedgeShapes)

        let centerArc = d3.arc()
            .innerRadius(0)
            .outerRadius(50) //+i*10
            .startAngle(0)
            .endAngle(2*Math.PI)

        let colorScale = d3.scaleOrdinal().range(['#c5c5c9','#cdcdcf','#d4d4d5','#d9d9db','#e7e7e8']).domain([4,3,2,1,0])

        let rotateGroups = svg.selectAll('.wedgeGroup').data(wedgeShapes)
        .enter().append('g')
        // .attr('class', 'rotate')
        .attr('id',d=>d.id+'Group')
        
        let groups = rotateGroups
        .append('g')
        .attr('class', 'wedgeGroup')
        // .on('click',(event,d)=>console.log(d))
        .style('filter', d=>'drop-shadow( '+d.xshadow + 'px ' + d.yshadow + 'px 3px rgba(0, 0, 0, .2))');


        let wedges = groups.selectAll('.wedge')
        .data(d=>d.wedges)
        .enter()
        .append("path")
        .attr("class", "wedge arc")
        .attr("d", d=>d.arc)
        // .style('opacity',d=>opacityScale(d.layer))
        .style('fill',d=>{return colorScale(d.layer)})
        .attr('id',d=>{
            if (d.layer == 4){
                return d.parentLabel
            } });

            // console.log(data)
        rotateGroups.selectAll('.labelLine')
        .data(d=>d.lines)
        .enter()
        .append("path")
        .attr("class", "labelLine arc")
        .attr("d", d=>{
             
            let pathSegments = this.segmentPath(d.labelLine).filter(s=>s[0] != 'A' && s[0] != 'Z');;
            let newPath =  pathSegments.join('')

            return newPath

            
        })
        .each(function(d,i){

            // console.log('data', d)
            let parentGroup = d3.select('#' + d.parentLabel+'Group');
            let path = d3.select(this).node();
            let endPoint = path.getPointAtLength(0)
            
            parentGroup.append('text')
            .attr('class', 'question label')
            // .attr('transform', 'translate('+ endPoint.x + ','+ endPoint.y + ') rotate(7)')
            .attr('x', endPoint.x)
            .attr('y', endPoint.y)
            .text(d.label)
            .attr('text-anchor',d.quadrant == 'right' ? 'start': 'end')
        })

        rotateGroups.selectAll('.qAxis')
        .data(d=>d.lines)
        .enter()
        .append("path")
        .attr("class", "qAxis arc")
        .attr("id", d=>d.id)
        .attr("d", d=>{
            let pathSegments = this.segmentPath(d.qAxis).filter(s=>s[0] != 'A' && s[0] != 'Z');;
            let newPath =  pathSegments.join('')

            return newPath

            
        })
        //for each line, create a linear scale to position the dots;
        .each(function(p){
            let pathLength = d3.select(this).node().getTotalLength()
    
            p.scale = d3.scaleLinear()
            .domain([5,1])
            .range([pathLength*0.1,pathLength*0.9])
            
            // p.test = 'carolna';
        })
        // .on('click', (event,d)=>console.log('data for this line is ', d));

        wedges
        .each(function(d,i) {

            //only for the top layer
            if (d.layer == vis.numLayers-1){
        
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
            let textPath = d3.select('#' + d.parentLabel+'Group').append("path")
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

            // //add question markers
            // let textPathNode = textPath.node()
            // let totalPathLength = textPathNode.getTotalLength() 
            // let parentData = d3.select('#' + d.parentLabel+'Group').data();
            // let numQuestions = parentData[0].questions.length;
            // let interval = totalPathLength/(numQuestions+1);
        }
        });
           
             
        svg.append('path')
        .attr("class", "centerArc")
        .attr("d", centerArc)


        svg.append('g')
        .attr("class", "dots")



        let self = this;
  
    }

    createWedges(data){

        let numLayers = this.numLayers

        let numWedges = data.length
        let interval = 2*Math.PI/numWedges;
        let step = 15; //difference in pixels from left to right side of wedge;
        let arrowPadding = 45; //buffer from edge of wedge to label arrow
       
        // let shadowScale = d3.scaleSequential().range([-30,30,-30]).domain([0,Math.PI,2*Math.P]);
        
        let innerRadius = 40
        let outerRadius = 200
        let radiusInterval = (outerRadius - innerRadius) / numLayers;
       
     
        // let step = radiusInterval/2;
        let radiusInterval2 = (outerRadius+step - innerRadius) / numLayers;


        let wedgeArray = [];
        data.map((d,i)=>{
            let questionArray = Object.values(d.axis);
            let numLines = questionArray.length;
            let lineInterval = interval/(numLines+1);
        

            let id = d.label.replace(/\s/g, '')
            let startAngle = i*interval - Math.PI/2 //start the wedges on the left
            let endAngle = (i+1)*interval - Math.PI/2;
            let quadrant = startAngle > 80 * Math.PI/180  ? 'lower':'upper'
            let wedgeGroup = 
            {label:d.label,
                id, 
                questions:questionArray,
                startAngle,
                endAngle,
                quadrant, 
                wedges:[],
                lines:[],
                xshadow:quadrant == 'upper' ? '-4' : '4', 
                yshadow:quadrant == 'upper' ? '4' : '-4' 
            };
          
            // console.log(startAngle, shadowScale(startAngle));


            [...Array(numLayers)].map((n,ii)=>{
            
                let startRadius = innerRadius+ii*radiusInterval
                let endRadius = innerRadius+((ii+1)*radiusInterval)

                // let start = 0
                // let end = interval
                let arc = d3.arc()
                    .innerRadius(startRadius)
                    .outerRadius(endRadius) //+i*10
                    .startAngle(startAngle)
                    .endAngle(endAngle)
                    // .padAngle(Math.PI/40)
                    // .cornerRadius(5)

                let path1= this.segmentPath(arc());
                let splitA1 = path1[3].split(',')

                startRadius = innerRadius+ii*radiusInterval2
                endRadius = innerRadius+((ii+1)*radiusInterval2)

                arc = d3.arc()
                .innerRadius(startRadius)
                .outerRadius(endRadius) //+i*10
                .startAngle(startAngle)
                .endAngle(endAngle)

                let path2= this.segmentPath(arc());
                let splitA2 = path2[3].split(',')

                let A = splitA2.slice(0,5) + splitA1.slice(-2); //Make return path use the angle of path2 but the endpoint of path1
                let arcPath = path1[0]+path2[1]+path2[2]+A+path1[4]
                           
                
                    wedgeGroup.wedges.push({arc:arcPath, layer:ii, parentLabel:id, endAngle})
                
    
            });

            
               //scale for arrowPlacement
            let arrowScale = d3.scaleLinear()
            .range([outerRadius+arrowPadding,outerRadius+arrowPadding+step])
            .domain([startAngle,endAngle])

            let qAaxisScale = d3.scaleLinear()
            .range([outerRadius,outerRadius+step])
            .domain([startAngle,endAngle])

            questionArray.map((q,ii)=>{

                let startLine = startAngle+(ii+1)*lineInterval
                let endLine = startLine

                let quadrant = startLine >0 && startLine  <  Math.PI  ? 'right' : 'left'


                // line that extends beyond arc for arrow and label placement
                var labelPlacementLine = d3.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(arrowScale(startLine)) //+i*10
                    .startAngle(startLine)
                    .endAngle(endLine)

                // line to be used as axis for dots 
                var questionAxis = d3.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(qAaxisScale(startLine)) //+i*10
                    .startAngle(startLine)
                    .endAngle(endLine)
                   
                  
    
                    wedgeGroup.lines.push(
                    {
                        id:q.id,
                        label:q.label,
                        qAxis:questionAxis(),
                        labelLine:labelPlacementLine(),
                        // data:q, 
                        parentLabel:id, 
                        // question:q, 
                        quadrant
                    })
            })


            wedgeArray.push(wedgeGroup)

        })
        
        
        return wedgeArray
    }

    updateLines(surveyData){





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
