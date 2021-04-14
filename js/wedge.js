
/*
 * PrioVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData 
 */

class Wedge {

    constructor(_parentElement, _data,) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.filteredData = this.data;
        this.xAttr = 'population_07';
        this.yAttr = 'co2pp_07';
        this.dot_size = 8 / 2;
        this.margin = { top: 20, right: 20, bottom: 200, left: 50 };
        this.width = $("#" + this.parentElement).width() - this.margin.left - this.margin.right;
        this.height = 500 - this.margin.top - this.margin.bottom;
        setTimeout(() => { this.initVis(); }, 0);

    }


    /*
    * Initialize visualization (static content, e.g. SVG area or axes)
    */

    initVis() {


        let vis = this;
        // SVG drawing area
        // vis.svg = d3.select("#" + vis.parentElement).append("svg")
        //     .attr("width", vis.width + vis.margin.left + vis.margin.right)
        //     .attr("height", vis.height + vis.margin.top + vis.margin.bottom);
        // vis.g = vis.svg.append("g")
        //     .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        console.log('vis.g', vis.g)


        // d3.xml("userFilter_v5.svg")
        // .then(data => {
        //     d3.select('#panel')
        //         .node().append(data.documentElement) //.attr('class','panel');

        //     d3.select('#panel').select('svg').style('width', '500px')
        //     d3.select('#panel').select('svg').style('height', '700px')

       


            

        // })

        let self = this;
        function activatePanel(){

            let allText = d3.selectAll('text');

            allText.each(function(){
                let tspans  = d3.select(this).selectAll('tspan');

                if (tspans.size()>0){
                    let text = [];
                    let classes;
                    tspans.each(function(){classes = d3.select(this).attr('class'); text.push(d3.select(this).html())})
                    if (text.join('') == 'WELL-BEING'){
                        tspans.remove();

                    d3.select(this).html(text.join(''))
                    .attr('class',classes)
                    }
                    

                }
               

            })



            let clickColor = '#64c4ae'

            let upper = '#307980';
            let lower = '#C5D2DA' //'#f6f3ff';

            //remove grey circles
            d3.selectAll('.st135').remove();
            d3.select('#SVGID_151_').remove();
            
            let lineNode = d3.select('#Response_Filter_Text').select('line').node()

            let totalLength = lineNode.getTotalLength()
          
            let xRange = [lineNode.getPointAtLength(0).x, lineNode.getPointAtLength(totalLength).x]
           
            let range = [];
            for (var i = 0; i <= 20; i++) {
                range.push(i*5);
              }
            let lineScale = d3.scaleQuantize()
            .domain(xRange)
            .range(range)

            let lineAxis = [];
            let lineLabels = [];
            
            d3.select('#Response_Filter_Text').selectAll('line').each(function(d,i){
                lineAxis.push({id:i,lineElement:d3.select(this)})
            })

            d3.select('#Response_Filter_Text').selectAll('text').filter(function(){return d3.select(this).text().includes('percentile')})
            .each(function(d,i){
                lineLabels.push(d3.select(this))
                d3.select(this).attr('y',function(){ return Number(d3.select(this).attr('y'))+ 5})

            })




        
            let circleElements   = d3.selectAll('.st136');
            let circleState = [];
            
            circleElements.each(function(c,i){
                circleState.push(
                    {id:i,
                    label:lineLabels[i], 
                    line:i<2? lineAxis[0] : lineAxis[1], checked:i == 0 || i == 3
                })});

            circleElements.data(circleState)
            circleElements
            .style('fill', (d)=> d.checked ? (d.id == 1 || d.id == 3 ? upper : lower) : '#333132')
            .attr('r', (d)=> d.checked ? 8:4.77)


            .on('click', function(event,d){
                // console.log(event);
                // console.log(lineScale(85))
                // console.log(d.line.lineElement.node().getPointAtLength(lineScale(85)));

                // d.label.style('fill','red')

                // d.line.lineElement.style('stroke','red')
                d.checked ? (d.id == 1 || d.id == 3 ? upper : lower) : '#333132'
                if (!d.checked){
                    d.checked = true; 
                    //unselect the other circle; 
                    let otherCircle = d.id >1 ? d.id -2 : d.id + 2;
                    circleElements.each(function(c){c.id == otherCircle ? c.checked = false : ''})
                    circleElements.style('fill', d=> d.checked ? (d.id == 1 || d.id == 3 ? upper : lower) : '#333132')

                    self.animateTransition();
                }
            })
            .call(d3.drag().on("drag",function (event,d){
                // console.log(event,d)
                

                let y = Number(d3.select(this).attr('cy'))+ 19
                let range = lineScale.domain();
                let x = event.x > range[1] ? range[1] : (event.x < range[0] ? range[0] : event.x)
                d3.select(this).attr('cx',x)

                d.label.attr('x',x)
                d.label.attr('y',y)
                d.label.attr('transform', '')
                d.label.text(Math.round(lineScale(x)) + 'th percentile')
                d.label.style('text-anchor', 'middle')
                

            })
            .on("end",function(event,d){self.animateTransition()
                let otherCircle = d.id >1 ? d.id -2 : d.id + 2;

                let oC  = circleElements.filter(function(c){return c.id == otherCircle});
                oC.attr('r',4.77)

                d.checked = true; 
                //unselect the other circle; 
                // let otherCircle = d.id >1 ? d.id -2 : d.id + 2;
                circleElements.each(function(c){c.id == otherCircle ? c.checked = false : ''})
                circleElements.style('fill', d=> d.checked ? (d.id == 1 || d.id == 3 ? upper : lower) : '#333132')


            d3.select(this).attr('r',8)
            
            }))

            let groups1 = [{id:'Tenure',label:'Tenure'},{id:'Role',label:'Role'},{id:'Dept',label: 'Department'}].map(g=>{g.group = '1'; return g})
            let groups2 =  [{id:'User_Filter',label: 'User Filter'}, {id:'Response_Filter_Text',label: 'Response Filter'}].map(g=>{g.group = '2'; return g});

            let allGroups= groups1.concat(groups2)


            allGroups.map(g=>{
                let block = d3.select('#'+g.id)

                let bars = block.selectAll('.st134')
        

                let allLabels = block.selectAll('text');
                allLabels.each(function(l){
                    // console.log(l)
                    let tspans  = d3.select(this).selectAll('tspan');
                    let text = [];
                    tspans.each(function(){text.push(d3.select(this).html())})
                    tspans.remove();
                    d3.select(this).html(text.join(''))
                    // .attr('class', g.group == '1' ? 'st114 st135 st123' : 'st114 st129 st130')
                                        .attr('class','st113 st122 st123')

                   

                })

                let label = block.selectAll('text').filter(function(){ return d3.select(this).html() == g.label}) //assumes the label is the first text in the group; 

                label.data([{checked:true}])
                label.style('cursor', g.group == 1 ? 'pointer' : 'default')
                .style('font-weight', 'bold')
                .classed('st129 st130', g.group == 2  )

                if (g.group == 1){
                    label.style('font-size','14px')

                }


                let checkBoxElements = block.selectAll('.st116');

                let state = [];
                
                checkBoxElements.each(function(c,i){state.push({id:i,checked:true})});

                let checkBoxes = checkBoxElements.data(state);

                checkBoxes
                .style('fill', (d=>d.checked ? clickColor : '#333132'))

                .on('click', function(event, d){
                    let checkbox = d3.select(this);
                    self.animateTransition()
                    d.checked = !d.checked; 
                    checkbox.style('fill',d.checked ? clickColor : '#333132')

                
                })

                label.on('click',function (event,d){
                    d.checked = !d.checked; 
                    checkBoxes.each(function(c){c.checked = d.checked})
                    checkBoxes.style('fill', d.checked ? clickColor : '#333132')
                    // bars.style('fill', d.checked ? clickColor : '#9a999c')
                    self.animateTransition()
                })


            })

            //configure capture button; 


            // st114 st129 st130
            let captureLabel = d3.selectAll('text').filter(function(){ return d3.select(this).html() == 'Capture'}) //assumes the label is the first text in the group; 

            captureLabel.style('cursor', 'pointer')
            .style('font-weight', 'bold')
            .classed('st129 st130', true  )
            .on('click', ()=>download('Capture','this is the content'))

        }

        function download(filename, text) {
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            element.setAttribute('download', filename);
          
            element.style.display = 'none';
            document.body.appendChild(element);
          
            element.click();
          
            document.body.removeChild(element);
          }
        
        //   var image = SVG();
        //   console.log(image)

        d3.xml("Wellness_SVG_final.svg")
            .then(data => {
                d3.select("#wedge")
                    .node().append(data.documentElement)

                    let svg = d3.select('#wedge').select('svg')
                    console.log(d3.select(svg.style)) 

                    activatePanel()
                    let pathNode = d3.select('#Diagram_Lines').select('line').node()
                    let totalLength = pathNode.getTotalLength()
                    console.log(totalLength)

                    this.scales = d3.scaleLinear()
                        .domain([5, 1])
                        .range([totalLength, 0])

                    let upperData = this.createData('upper');
                    let lowerData = this.createData('lower');

                    let transitionDuration = 1000;

                    let upper = '#307980';
                    let lower = '#f6f3ff';

                    let upperOpacity = .35;
                    let lowerOpacity = .45;

                    let legendCircle = '#C5D2DA'

                    d3.select('.st112')
                    .style('stroke','#60e6c6')
                    // console.log('afterSort', q1.map(a=>a.point.x))
                    let circles = d3.select('#DOTS').selectAll('circle')
                        // .data(q1.concat(q2));
                        .data(upperData.concat(lowerData))

                    let circlesEnter = circles.enter().append('circle')
                        .attr('cx', d => d.startingPoint.x)
                        .attr('cy', d => d.startingPoint.y)

                    circles.exit().remove();

                    circles = circlesEnter.merge(circles)

                    circles
                        .attr('r', 4)
                        .style('fill', d => d.type == 'upper' ? upper : upper)
                        // .style('opacity', d => d.type == 'upper' ? upperOpacity : lowerOpacity)




                    let outer = d3.select('#Diagram_Lines').selectAll(".upperPoly")
                        // .data([lowerData.concat(upperData)]);
                        .data([upperData]);


                    let outerEnter = outer.enter().append("polygon");

                    outer.exit().remove();

                    outer = outerEnter.merge(outer);

                    outer
                        .attr('class', 'upperPoly')
                        .attr("points", function (d) {
                            return d.map(function (d) {
                                return [d.startingPoint.x, d.startingPoint.y].join(",");
                            }).join(" ");
                        })
                        .attr("fill", upper)
                        .attr("stroke", upper)
                        .attr("stroke-width", 2)
                        .attr('stroke-dasharray', 3)
                        .style('opacity', upperOpacity)




                    let inner = d3.select('#Diagram_Lines').selectAll(".lowerPoly")
                        .data([lowerData]);

                    let innerEnter = inner.enter().append("polygon")

                    inner.exit().remove();

                    inner = innerEnter.merge(inner);


                    inner.attr('class', 'lowerPoly')
                        .attr("points", function (d) {
                            return d.map(function (d) {
                                return [d.startingPoint.x, d.startingPoint.y].join(",");
                            }).join(" ");
                        })
                        .attr("fill", lower)
                        .attr("stroke", lower)
                        .attr("stroke-width", 1.5)
                        .attr('stroke-dasharray', 3)
                        .style('opacity', lowerOpacity)

                    

                    this.animateTransition = ()=>{

                        //create dictionary of random values, one for each id. 
                        let randomDict = {}
                        upperData.concat(lowerData).map(d => randomDict[d.id] = Math.random())
                        circles
                            .transition()
                            .duration(transitionDuration)
                            .ease(d3.easeLinear)

                            // .delay(function (d, i) { return i * 10; })

                            .attr('cx', d => {
                                let point = this.createRandomPoint(d, randomDict[d.id]);
                                return point.x
                            })
                            .attr('cy', d => {
                                let point = this.createRandomPoint(d, randomDict[d.id]);
                                return point.y
                            })

                        outer
                            .transition()
                            .duration(transitionDuration)
                            .ease(d3.easeLinear)

                            // .delay(function (d, i) { return i * 10; })


                            .attr("points", d => {
                                return d.map(d => {
                                    let point = this.createRandomPoint(d, randomDict[d.id]);
                                    return [point.x, point.y].join(",");
                                }).join(" ");
                            })

                        inner.transition()
                            .duration(transitionDuration)
                            .ease(d3.easeLinear)

                            // .delay(function (d, i) { return i * 10; })

                            // .attr("points", function (d) {
                            //     return d.map(function (d) {
                            //         return [d.point.x, d.point.y].join(",");
                            //     }).join(" ");
                            // })

                            .attr("points", d => {
                                return d.map(d => {
                                    let point = this.createRandomPoint(d, randomDict[d.id]);
                                    return [point.x, point.y].join(",");
                                }).join(" ");
                            })


                    }

                    let set = setInterval(this.animateTransition, transitionDuration);

                    setTimeout(function () { clearInterval(set) },transitionDuration);



                // })

            });






        // (Filter, aggregate, modify data)
        // vis.wrangleData();
    }

   

    createRandomPoint(element, randomNumber) {

        // Math.seedrandom(element.id + iteration)
        // console.log(out)

        let value = element.type == "upper" ? Math.ceil((randomNumber / 2 + 0.5) * 5) : Math.ceil((randomNumber / 2 + 0.1) * 5);
        let pathNode = element.lineSVGElement.node()

        return pathNode.getPointAtLength(this.scales(value));
    }

    createData(type) {
        let allData = [];
        let allLines = d3.select('#Diagram_Lines').selectAll('line');

        let scales = this.scales
        allLines.each(function (d, i) {

            let lineElement = d3.select(this)
            let dataElement = { 'type': type, 'label': 'Q1.1_1', 'id': Math.random() * Date.now() };//q1[i];
            // .style('stroke','red')
            // console.log(lineElement)
            dataElement.lineSVGElement = lineElement;
            dataElement.value = 0 //type == "upper" ? Math.ceil((Math.random() / 2 + 0.55) * 5) : Math.ceil((Math.random() / 2 + 0.1) * 5);


            // console.log ('value is ', dataElement.value)

            let pathNode = dataElement.lineSVGElement.node()
            dataElement.point = pathNode.getPointAtLength(scales(dataElement.value))
            dataElement.startingPoint = pathNode.getPointAtLength(scales(2.5))

            allData.push(dataElement)

        })

        //sort clockwise: 

        allData.sort((a, b) => a.point.y - b.point.y);

        // Get center y
        const cy = (allData[0].point.y + allData[allData.length - 1].point.y) / 2;

        // Sort from right to left
        allData.sort((a, b) => b.point.x - a.point.x);

        // Get center x
        const cx = (allData[0].point.x + allData[allData.length - 1].point.x) / 2;

        // Center point
        const center = { x: cx, y: cy };

        // Pre calculate the angles as it will be slow in the sort
        // As the points are sorted from right to left the first point
        // is the rightmost

        // Starting angle used to reference other angles
        var startAng;
        allData.forEach(p => {
            let point = p.point;
            let ang = Math.atan2(point.y - center.y, point.x - center.x);
            if (!startAng) { startAng = ang }
            else {
                if (ang < startAng) {  // ensure that all points are clockwise of the start point
                    ang += Math.PI * 2;
                }
            }
            p.angle = ang; // add the angle to the point
        });


        // Sort clockwise;
        if (type == 'upper'){
            allData.sort((a, b) => a.angle - b.angle);
        } else{
            allData.sort((a, b) => b.angle - a.angle);

        }

        allData.push(allData[0])

        return allData

    }



    /*
    * Data wrangling
    */

    wrangleData() {
        var vis = this;
        vis.data.map(d => {
            d[vis.xAttr] = +d[vis.xAttr]
            d[vis.yAttr] = +d[vis.yAttr]
        })
        vis.displayData = vis.data;

        console.log('displayData', vis.data)

        // Update the visualization
        vis.updateVis();
    }



    /*
    * The drawing function
    */

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
