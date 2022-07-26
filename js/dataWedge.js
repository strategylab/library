
/*
 * PrioVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData 
 */

class dataWedge {

    constructor(_parentElement, surveyQuestions) {
        this.parentElement = _parentElement;
        this.surveyQuestions = surveyQuestions.map(q => { q.id = q.Axis.replace(/\s/g, ''); return q });
        // this.filteredData = this.data;
        this.margin = { top: 20, right: 20, bottom: 200, left: 50 };
        this.width = d3.select("#" + this.parentElement).node().clientWidth + 200 - this.margin.left - this.margin.right;
        this.height = 1000 - this.margin.top - this.margin.bottom;
        this.numLayers = 5;

        this.ratingScale = [1,5]

        this.wrangleData();

        console.log('survey data is ', surveyData)


        // setTimeout(() => { this.initVis();   // Update the visualization
        //    }, 0);

    }


    /*
    * Initialize visualization (static content, e.g. SVG area or axes)
    */
    segmentPath(pathData) {
        var pathSegmentPattern = /[A-Z][^A-Z]*/g  ///[A-Z][^a-z]*/g;

        return pathData.match(pathSegmentPattern)
    }

    wrangleData() {

        //create array of JSON objects from csv. 
        // let wedgeHeader = 'Wedge';
        // let axisHeader = 'Axis'
        // let setHeader = 'Set Name'

        
        console.log('survey questions', this.surveyQuestions)
        this.surveyQuestions = this.surveyQuestions.filter(d => d[axisHeader] && d[setHeader]); //filter out questions without an assigned axis or set
        // let surveyResponses =this.surveyResponses;

        let surveyQuestions = this.surveyQuestions
        // surveyQuestions.map((d,i)=>d[qualtricsHeader]= i);

        console.log('survey questions are ', this.surveyQuestions)
        let wedges = new Set(surveyQuestions.map(d => d[wedgeHeader]));
        //  return;
        
        this.wedgeStructure = Array.from(wedges).map(wedge => {
            let wedgeObj = { label: wedge, id: wedge.replace(/\s/g, ''), axis: {} }

            let wedgeQuestions = surveyQuestions.filter(d => d[wedgeHeader] == wedge);
            let axisNames = new Set(wedgeQuestions.map(d => d[axisHeader]))

            Array.from(axisNames).map(axis => {
                wedgeObj.axis[axis] = { questions: [], label: axis, id: axis.replace(/\s/g, '') };
            })

            wedgeQuestions.map(q => {
                //compute average value for question based on quantile filter. 

                // let values = surveyData.filter(s=>s.selected).map(s => s[q[qualtricsHeader]]).sort()
                // console.log('sData', surveyData)
                let values = surveyData.filter(s => s.selected).map(s => s[q[qualtricsHeader]]).sort()
                q.value = d3.quantile(values, quantiles[q[setHeader]] / 100)
            })

            return wedgeObj
        })

        console.log('surveyQuestions ', surveyQuestions)
        // console.log('surveyData',surveyData)
        this.initVis()

    }

    initVis() {

        let wedgeStructure = this.wedgeStructure


        let vis = this;

        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .style("visibility", "hidden")

        this.tooltip.append('div').attr('class', 'header')
        let tooltipSVG = this.tooltip.append('div').attr('class', 'histDiv')
            .append('svg').attr('class', 'histogram');

        tooltipSVG.append('g').attr('class', 'x-axis')
        tooltipSVG.append('g').attr('class', 'chart')


        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).select('svg')//d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom);


        d3.select('#projectTitle').append('p').text(projectName)
        // vis.g = vis.svg.append("g")
        //     .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
        //     .attr('class', 'title')
        //     .append('text')
        //     .attr('x',200)
        //     .attr('y', 200)
        //     .text('Test Title')

        var svg = d3.select("svg")
            .append("g")
            .attr("transform", "translate(" + this.width / 2.5 + "," + this.height / 1.8 + ")");

        let wedgeShapes = this.createWedges(wedgeStructure)

        console.log('wedgeShapes', wedgeShapes)

        let centerArc = d3.arc()
            .innerRadius(0)
            .outerRadius(this.width / 15) //+i*10
            .startAngle(0)
            .endAngle(2 * Math.PI)

        let colorScale = d3.scaleOrdinal().range(['#c5c5c9', '#cdcdcf', '#d4d4d5', '#d9d9db', '#e7e7e8']).domain([4, 3, 2, 1, 0])

        console.log('wedgeShapes', wedgeShapes)
        let rotateGroups = svg.selectAll('.wedgeGroup').data(wedgeShapes)
            .enter().append('g')
            // .attr('class', 'rotate')
            .attr('id', d => d.id + 'Group')

        let groups = rotateGroups
            .append('g')
            .attr('class', 'wedgeGroup')
            // .on('click',(event,d)=>console.log(d))
            .style('filter', d => 'drop-shadow( ' + d.xshadow + 'px ' + d.yshadow + 'px 3px rgba(0, 0, 0, .2))');


        let wedges = groups.selectAll('.wedge')
            .data(d => d.wedges)
            .enter()
            .append("path")
            .attr("class", "wedge arc")
            .attr("d", d => d.arc)
            // .style('opacity',d=>opacityScale(d.layer))
            .style('fill', d => { return colorScale(d.layer) })
            .attr('id', d => {
                if (d.layer == 4) {
                    return d.parentLabel
                }
            });

        // console.log(data)
        rotateGroups.selectAll('.labelLine')
            .data(d => d.lines)
            .enter()
            .append("path")
            .attr("class", "labelLine arc")
            .attr("d", d => {

                let pathSegments = this.segmentPath(d.labelLine).filter(s => s[0] != 'A' && s[0] != 'Z');;
                let newPath = pathSegments.join('')

                return newPath


            })
            .each(function (d, i) {

                // console.log('data', d)
                let parentGroup = d3.select('#' + d.parentLabel + 'Group');
                let path = d3.select(this).node();
                let endPoint = path.getPointAtLength(0)

                parentGroup.append('text')
                    .attr('class', 'question label')
                    // .attr('transform', 'translate('+ endPoint.x + ','+ endPoint.y + ') rotate(7)')
                    .attr('x', endPoint.x)
                    .attr('y', endPoint.y)
                    .text(d.label)
                    .attr('text-anchor', d.quadrant == 'right' ? 'start' : 'end')
            })

        rotateGroups.selectAll('.qAxis')
            .data(d => d.lines)
            .enter()
            .append("path")
            .attr("class", "qAxis arc")
            .attr("id", d => d.id)
            .attr("d", d => {
                let pathSegments = this.segmentPath(d.qAxis).filter(s => s[0] != 'A' && s[0] != 'Z');;
                let newPath = pathSegments.join('')

                return newPath


            })
            //for each line, create a linear scale to position the dots;
            .each(function (p) {
                let pathLength = d3.select(this).node().getTotalLength()

                p.scale = d3.scaleLinear()
                    .domain([5, 1])
                    .range([pathLength * 0.1, pathLength * 0.9])
            })
        // .on('click', (event,d)=>console.log('data for this line is ', d));

        wedges
            .each(function (d, i) {

                //only for the top layer
                if (d.layer == vis.numLayers - 1) {

                    //append the text to the parentGroup
                    let groupData = d3.select(this.parentNode).data()[0]


                    var firstArcSection = /(^.+?)L/;

                    //Grab everything up to the first Line statement
                    var newArc = firstArcSection.exec(d3.select(this).attr("d"))[1];
                    //Replace all the commas so that IE can handle it
                    newArc = newArc.replace(/,/g, " ");

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
                        var newStart = endLoc.exec(newArc)[1];
                        var newEnd = startLoc.exec(newArc)[1];
                        var middleSec = middleLoc.exec(newArc)[1];

                        //Build up the new arc notation, set the sweep-flag to 0
                        newArc = "M" + newStart + "A" + middleSec + "0 0 0 " + newEnd;
                    }//if

                    //Create a new invisible arc that the text can flow along
                    let textPath = d3.select('#' + d.parentLabel + 'Group').append("path")
                        .attr("class", "textPath")
                        .attr("id", "textPath" + d.parentLabel)
                        .attr("d", newArc)
                        .style("fill", "none")
                    // .style('stroke','red')



                    d3.select('#' + d.parentLabel + 'Group')
                        .append('text')
                        .attr('class', 'label')
                        .attr("dy", (d, i) => groupData.quadrant == 'lower' ? 20 : -10)
                        // .attr('transform', 'scale(1,-1)')
                        .append('textPath')
                        .attr("startOffset", groupData.quadrant == 'lower' ? '95%' : '5%')
                        .style("text-anchor", groupData.quadrant == 'lower' ? 'end' : 'start')
                        .attr('xlink:href', d => '#textPath' + groupData.id)
                        // .attr('x',d=>d.position.x)
                        // .attr('y',d=>d.position.y)
                        .text(d => groupData.label)

                    // //add question markers
                    // let textPathNode = textPath.node()
                    // let totalPathLength = textPathNode.getTotalLength() 
                    // let parentData = d3.select('#' + d.parentLabel+'Group').data();
                    // let numQuestions = parentData[0].questions.length;
                    // let interval = totalPathLength/(numQuestions+1);
                }
            });


        svg.append('g')
            .attr("class", "polygon")

        svg.append('path')
            .attr("class", "centerArc")
            .attr("d", centerArc)

        svg.append('g')
            .attr("class", "dots")


        this.updateVis();
    }

    recomputeQuantiles() {

        // console.log('set', set, 'quantile', quantile)
        this.surveyQuestions.map(q => {
            // if (q.Set == set){
            let values = surveyData.filter(s => s.selected).map(s => s[q[qualtricsHeader]]).sort()

            let newValue = d3.quantile(values, quantiles[q.Set] / 100);

            q.value = newValue;
            // }
        })

        this.updateVis()
    }


    createHist(d, svg, width = 200, height = 200) {

        svg.attr('width', width + 20).attr('height', height + 50)

        let padding = width*0.2

        let percentileLabel = quantiles[d.Set];
        let values = surveyData.filter(s => s.selected).map(s => s[d[qualtricsHeader]]).sort()
        let quantile = d3.quantile(values, quantiles[d.Set] / 100)

        console.log( 'quantile',quantile)

        // X axis: scale and draw:
        // var x = d3.scaleLinear()
        // .domain([0, 5])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
        // .range([0, width]);

        let x = d3.scaleBand()
            .rangeRound([padding, width-padding]).paddingInner(0.4)
            .domain([1,2,3,4,5])

        let qScale = d3.scaleLinear()
        .range([padding,width-padding])
        .domain([.5,5.5]);



        // Y axis: initialization
        var y = d3.scaleLinear()
            .range([height, 40]);


        // set the parameters for the histogram
        var histogram = d3.histogram()
            .value(function (d) { return d; })   // I need to give the vector of value
            .domain([1, 6])  // then the domain of the graphic
            .thresholds(5); // then the numbers of bins

        // And apply this function to data to get the bins
        var bins = histogram(values);

        // console.log('bins', bins)

        y.domain([0, d3.max(bins, function (d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously


            svg.select(".x-axis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));


            
                let axisLabels = svg.select(".chart").selectAll(".axisLabel")
                .data([{label:'Disagree','position':'start'},{label:'Agree','position':'end'}])

        
                axisLabels
                .enter()
                .append("text") // Add a new rect for each new elements
                .attr('class', 'axisLabel')
                .merge(axisLabels) // get the already existing elements as well
                .attr("x", d=>d.position == 'start'? qScale.range()[0]: qScale.range()[1])
                .attr('text-anchor','middle')
                .attr('y',y.range()[0]+35)
                .text( d=> d.label)

                let quantileMarker = svg.select(".chart").selectAll(".qMarker")
                .data([quantile])
        
                quantileMarker
                .enter()
                .append("line") // Add a new rect for each new elements
                .attr('class', 'qMarker')
                .merge(quantileMarker) // get the already existing elements as well
                .attr("x1", d=>qScale(d))
                .attr("x2", d=>qScale(d))
                .attr('y1',y.range()[0])
                .attr('y2',0)

                // .attr('y1',y.range()[0] - 5)
                // .attr('y2',y.range()[0] +5)

              
            
                let quantileLabel = svg.select(".chart").selectAll(".qLabel")
                .data([quantile])
        
                quantileLabel
                .enter()
                .append("text") // Add a new rect for each new elements
                .attr('class', 'qLabel')
                .merge(quantileLabel) // get the already existing elements as well
                .attr("x", d=>qScale(d)+4)
                .attr('y',12)
                .text( d=> Math.round(percentileLabel) + '%')
        
                

        let bars = svg.select(".chart").selectAll(".histBar")
            .data(bins)

        bars
            .enter()
            .append("rect") // Add a new rect for each new elements
            .attr('class', 'histBar')
            .attr("x", 1)
            .merge(bars) // get the already existing elements as well
        
            .attr("transform", function (d, i) {  return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
            .attr("width", x.bandwidth())
            .attr("height", function (d) { return height - y(d.length); })
            // .style('fill',d=>{console.log(d.x0, quantile, d.x0 == quantile); return d.x0 == quantile? 'rgb(96, 230, 198)':''})


    let labels = svg.select(".chart").selectAll(".histLabel")
        .data(bins)

        labels
        .enter()
        .append("text") // Add a new rect for each new elements
        .attr('class', 'histLabel')
        .merge(labels) // get the already existing elements as well
        .text(d=>d.length> 0 ? d.length : '')
        .attr("x", 1)
        .attr("transform", function (d, i) { return "translate(" + (x(d.x0)+x.bandwidth()/2) + "," + (y(d.length)-5) + ")"; })
       
       
        // quantileMarker
        // .enter()
        // .append("circle") // Add a new rect for each new elements
        // .attr('class', 'qMarker')
        // .merge(quantileMarker) // get the already existing elements as well
        // .attr("cx", d=>qScale(d))
        // .attr('cy',y.range()[0])
        // .attr('r',8)



    }
    updateVis() {

        let vis = this;

        //compute location for each dot; 
        this.surveyQuestions.map(q => {
            

            let line = d3.select('#' + q.id);
            // console.log('#' + q.id, line.size())
            let data = line.data()[0];
            // console.log('data', line.data(), data.scale)
            let scale = data.scale;
            let distanceAlongPath = scale(q.value);
            // console.log(distanceAlongPath)
            let position;

            if (distanceAlongPath) { //There are at least some points in the dataset
                position = line.node().getPointAtLength(distanceAlongPath);
            } else { //all points have been filtered out
                position = { x: 0, y: 0 }
            }



            q.position = position;
            // console.log('position for ', q.Axis , ' is ', position)
        })

        let dotSelection = d3.select('.dots').selectAll('.questionValues')
            .data(this.surveyQuestions);

        // console.log(this.surveyQuestions)

        let enter = dotSelection.enter()
            .append('circle')
            .attr('class', d => d.Set)
            .classed('questionValues', true)

        dotSelection = dotSelection.merge(enter);

        dotSelection
            .attr('r', 5)
            .transition()
            .duration(1000)
            .attr('cx', d => d.position.x)
            .attr('cy', d => d.position.y)


        dotSelection
            .on('mouseover', function(event, d) {

                d3.select(this).classed('hovered', true)
                let t = vis.tooltip
                    // .style("opacity", 1)
                    .style("visibility", "visible")

                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .select('.header')             
                    .html(`
                         <h2>${d[setHeader] == 'Relevance' ? 'What matters most' : 'Current experience' }</h2>
                        <h3>${d.Question}</h3>
                      `);


                vis.createHist(d, vis.tooltip.select('svg'), 260, 60)
                // vis.tooltip.select('svg').


            })
            .on('mouseout', function() {

                d3.select(this).classed('hovered', false)

                vis.tooltip
                .style("visibility", "hidden")

            })



        let polygon = d3.select('.polygon')

    
       

        let relevance = polygon.selectAll(".Relevance")
            // .data([lowerData.concat(upperData)]);
            .data([this.surveyQuestions.filter(q => q[setHeader] == 'Relevance')]);


        let relevanceEnter = relevance.enter().append("polygon");

        relevance.exit().remove();

        relevance = relevanceEnter.merge(relevance);

        relevance
            .attr('class', ' poly Relevance');

            let experience = polygon.selectAll(".Experience")
            // .data([lowerData.concat(upperData)]);
            .data([this.surveyQuestions.filter(q => q[setHeader] == 'Experience')]);


        let experienceEnter = experience.enter().append("polygon");

        experience.exit().remove();

        experience = experienceEnter.merge(experience);

        experience
            .attr('class', 'poly Experience');


        d3.selectAll('.poly')
            .attr("stroke-width", 2)
            .attr('stroke-dasharray', 3)
            .transition()
            .duration(1000)
            .attr("points", function (d) {
                return d.map(function (d) {
                    return [d.position.x, d.position.y].join(",");
                }).join(" ");
            })


        // })

        // d3.select('.labelLine').data()
    }

    createWedges(data) {

        let numLayers = this.numLayers

        let numWedges = data.length
        let interval = 2 * Math.PI / numWedges;
        let step = 15; //difference in pixels from left to right side of wedge;
        let arrowPadding = 45; //buffer from edge of wedge to label arrow

        // let shadowScale = d3.scaleSequential().range([-30,30,-30]).domain([0,Math.PI,2*Math.P]);

        let innerRadius = this.width / 15
        let outerRadius = this.width / 4.5;
        let radiusInterval = (outerRadius - innerRadius) / numLayers;


        // let step = radiusInterval/2;
        let radiusInterval2 = (outerRadius + step - innerRadius) / numLayers;


        let wedgeArray = [];
        data.map((d, i) => {
            let questionArray = Object.values(d.axis);
            let numLines = questionArray.length;
            let lineInterval = interval / (numLines + 1);


            let id = d.label.replace(/\s/g, '')
            let startAngle = i * interval - Math.PI / 2 //start the wedges on the left
            let endAngle = (i + 1) * interval - Math.PI / 2;
            let quadrant = startAngle > 80 * Math.PI / 180 ? 'lower' : 'upper'
            let wedgeGroup =
            {
                label: d.label,
                id,
                questions: questionArray,
                startAngle,
                endAngle,
                quadrant,
                wedges: [],
                lines: [],
                xshadow: quadrant == 'upper' ? '-4' : '4',
                yshadow: quadrant == 'upper' ? '4' : '-4'
            };

            // console.log(startAngle, shadowScale(startAngle));


            [...Array(numLayers)].map((n, ii) => {

                let startRadius = innerRadius + ii * radiusInterval
                let endRadius = innerRadius + ((ii + 1) * radiusInterval)

                // let start = 0
                // let end = interval
                let arc = d3.arc()
                    .innerRadius(startRadius)
                    .outerRadius(endRadius) //+i*10
                    .startAngle(startAngle)
                    .endAngle(endAngle)
                // .padAngle(Math.PI/40)
                // .cornerRadius(5)

                let path1 = this.segmentPath(arc());
                let splitA1 = path1[3].split(',')

                startRadius = innerRadius + ii * radiusInterval2
                endRadius = innerRadius + ((ii + 1) * radiusInterval2)

                arc = d3.arc()
                    .innerRadius(startRadius)
                    .outerRadius(endRadius) //+i*10
                    .startAngle(startAngle)
                    .endAngle(endAngle)

                let path2 = this.segmentPath(arc());
                let splitA2 = path2[3].split(',')

                let A = splitA2.slice(0, 5) + splitA1.slice(-2); //Make return path use the angle of path2 but the endpoint of path1
                let arcPath = path1[0] + path2[1] + path2[2] + A + path1[4]


                wedgeGroup.wedges.push({ arc: arcPath, layer: ii, parentLabel: id, endAngle })


            });


            //scale for arrowPlacement
            let arrowScale = d3.scaleLinear()
                .range([outerRadius + arrowPadding, outerRadius + arrowPadding + step])
                .domain([startAngle, endAngle])

            let qAaxisScale = d3.scaleLinear()
                .range([outerRadius, outerRadius + step])
                .domain([startAngle, endAngle])

            questionArray.map((q, ii) => {

                let startLine = startAngle + (ii + 1) * lineInterval
                let endLine = startLine

                let quadrant = startLine > 0 && startLine < Math.PI ? 'right' : 'left'


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
                        id: q.id,
                        label: q.label,
                        qAxis: questionAxis(),
                        labelLine: labelPlacementLine(),
                        // data:q, 
                        parentLabel: id,
                        // question:q, 
                        quadrant
                    })
            })


            wedgeArray.push(wedgeGroup)

        })


        return wedgeArray
    }

    updateLines(surveyData) {





    }
    // updateVis() {
    //     let vis = this;

    //     let xDomain = d3.extent(vis.displayData, d => d[vis.xAttr])
    //     let range = xDomain[1] - xDomain[0]
    //     // Update domains
    //     vis.y.domain([0, d3.extent(vis.displayData, d => d[vis.yAttr])[1]]);
    //     vis.x.domain([xDomain[0] - range * 0.07, xDomain[1]])

    //     console.log(vis.y.domain())
    //     console.log(vis.displayData)

    //     var bars = vis.g.selectAll(".bar")
    //         .data(vis.displayData)

    //     bars.enter().append("circle")
    //         .attr("class", "bar")

    //         .merge(bars)
    //         .transition()

    //         .attr("r", vis.dot_size)
    //         .attr("cx", d => vis.x(d[vis.xAttr]))
    //         .attr("cy", d => vis.y(d[vis.yAttr]));


    //     bars.exit().remove();

    //     // Call axis function with the new domain
    //     vis.g.select(".y-axis").call(vis.yAxis);

    //     vis.g.select(".x-axis").call(vis.xAxis)
    //     // .selectAll("text")
    //     // .style("text-anchor", "end")
    //     // .attr("dx", "-.8em")
    //     // .attr("dy", ".15em")
    //     // .attr("transform", function(d) {
    //     //     return "rotate(-45)"
    //     // })
    //     // .text(d=>{return vis.displayData[d]['country']});
    // }

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
