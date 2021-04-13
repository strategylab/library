
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

            let clickColor = '#64c4ae'

            let circleElements   = d3.selectAll('.cls-40');
            let circleState = [];
            
            circleElements.each(function(c,i){circleState.push({id:i,checked:i == 0 || i == 3})});

            circleElements.data(circleState)
            circleElements
            .style('fill', (d)=> d.checked ? clickColor : '#333132')
            .on('click', function(event,d){
                let checkbox = d3.select(this);
                self.animateTransition();
                d.checked = !d.checked; 
                checkbox.style('fill',d.checked ? clickColor : '#333132')
            })

            let groups = [{id:'Tenure',label:'Tenure'},{id:'Role',label:'Role'},{id:'Dept',label: 'Department'}];

          

            groups.map(g=>{
                let block = d3.select('#'+g.id)
                .attr('transform', 'translate(55,0)')

                let bars = block.selectAll('.st134')
                bars.style('fill', '#9a999c');

                bars.each(function(){
                    let bar = d3.select(this);
                    let width = bar.attr('width')
                    let x = bar.attr('x');
                    bar.attr('x', x - width - 20)
                })

                let allLabels = block.selectAll('text');
                allLabels.each(function(l){
                    // console.log(l)
                    let tspans  = d3.select(this).selectAll('tspan');
                    let text = [];
                    tspans.each(function(){text.push(d3.select(this).html())})
                    tspans.remove();
                    d3.select(this).html(text.join(''))
                    .attr('class','st114 st135 st123')

                })

                let label = block.selectAll('text').filter(function(){ return d3.select(this).html() == g.label}) //assumes the label is the first text in the group; 

                label.data([{checked:false}])
                label.style('cursor', 'pointer')
                .style('font-weight', 'bold')


                let checkBoxElements = block.selectAll('.st117');

                let state = [];
                
                checkBoxElements.each(function(c,i){state.push({id:i,checked:false})});

                let checkBoxes = checkBoxElements.data(state);

                checkBoxes
                .on('click', function(event, d){
                    let checkbox = d3.select(this);
                    self.animateTransition()
                    d.checked = !d.checked; 
                    checkbox.style('fill',d.checked ? clickColor : '#333132')

                    console.log('checkbox y', checkbox.attr('y'))
                    let bar = d3.selectAll('.st134').filter(function(){ 
                        let barY = d3.select(this).attr('y'); 
                        let  checkboxY = checkbox.attr('y') 
                    
                    return barY < checkboxY + 1 && barY > checkboxY -1})
                bar.style('fill',d.checked ? clickColor : '#9a999c')

                
                })

                label.on('click',function (event,d){
                    d.checked = !d.checked; 
                    checkBoxes.each(function(c){c.checked = d.checked})
                    checkBoxes.style('fill', d.checked ? clickColor : '#333132')
                    bars.style('fill', d.checked ? clickColor : '#9a999c')
                    self.animateTransition()
                })


            })

            
               

            d3.selectAll('.cls-27').filter(function(d){return d3.select(this).attr('width')>12})
            .style('fill', d=>{return '#333132'})
            .style('opacity',.2);

            d3.selectAll('.cls-27').filter(function(d){return d3.select(this).attr('x')==45.13})
            .on('click', function(){

                checkBoxes.each(function(c){c.checked = false})
                checkBoxes
                .style('fill', '#333132')
                self.animateTransition()
            })

            d3.selectAll('.cls-27').filter(function(d){return d3.select(this).attr('x')>100})
            .on('click', function(){
                download('Capture','this is the content')
                self.animateTransition()
            })
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
        

        d3.xml("baseLayerLatest.svg")
            .then(data => {
                d3.select("#wedge")
                    .node().append(data.documentElement)

                // d3.csv('data.csv').then(d => {

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

                    let upper = '#36847e';
                    let lower = '#1d8582'
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
                        .style('fill', d => d.type == 'upper' ? upper : lower)



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
                        .style('opacity', .2)




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
                        .style('opacity', .2)

                    

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

                    setTimeout(function () { console.log('done'); clearInterval(set) },transitionDuration);



                // })

            });






        // (Filter, aggregate, modify data)
        // vis.wrangleData();
    }

   

    createRandomPoint(element, randomNumber) {

        // Math.seedrandom(element.id + iteration)
        // console.log(out)

        let value = 0 //element.type == "upper" ? Math.ceil((randomNumber / 2 + 0.5) * 5) : Math.ceil((randomNumber / 2 + 0.1) * 5);
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
