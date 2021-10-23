
/*
 * PrioVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData 
 */

class filterPanel {

    constructor(_parentElement, filterQuestions, filterResponses) {
        this.parentElement = _parentElement;
        this.filterQuestions = filterQuestions;
        this.filterResponses = filterResponses;
        // this.filteredData = this.data;
        this.margin = { top: 40, right: 20, bottom: 200, left: 20 };
        this.width = d3.select("#" + this.parentElement).node().clientWidth - this.margin.left - this.margin.right;
        this.height = 2000 - this.margin.top - this.margin.bottom;

        this.wrangleData();

        // setTimeout(() => { this.initVis();   // Update the visualization
        //    }, 0);

    }


    wrangleData() {
        this.initVis()
    }


    initVis() {

        let vis = this;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append('div').append('svg')//d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom);

        vis.createTitle()

        vis.createResponseFilter();


    }

    createTitle() {

        let vis = this;

        let parentGroup = vis.svg.append("g")
            .attr('id', 'titleGroup')
            .attr("transform", "translate(" + (vis.margin.left+20) + "," + vis.margin.top + ")")

        parentGroup.append('g')
            .attr("transform", "translate(15,20)")
            .attr('class', 'panelTitle')
            .attr('id', 'wellBeing')
            .append('text')
            .text('WELL-BEING')

        let pathGroup = parentGroup.append('g')
            .attr("transform", "translate(-25,35)")
            .attr('id', 'pathGroup');

        pathGroup
            .append('path')
            .attr('class', 'titlePath')
            .attr('d', 'M11.11,14.07c0,0,72.32-2.95,97.36,0s50.05-0.02,75.66-1.31c29.06-1.47,77.51,4.38,96.98,3.4')

        pathGroup.append('g')
            .attr("transform", "translate(22,25)")
            .attr('class', 'panelTitle')
            .attr('id', 'gapAnalysis')
            .append('text')
            .text('GAP ANALYSIS')
    }

    createResponseFilter() {

        let vis = this;

        let topOffset = 150 // d3.select("#titleGroup").node().clientWidth
        console.log('topOffset is ', topOffset)

        let parentGroup = vis.svg.append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + topOffset + ")")

        let filterGroup = parentGroup.append('g')
            .attr("transform", "translate(0,20)")
            .attr('class', 'panelHeader');

            filterGroup
            .append('text')
            .text('Response Filter')

            let currentExperience = filterGroup.append('g')
            // .attr("transform", "translate(0,10)")

            let mattersMost = filterGroup.append('g')
            .attr("transform", "translate(0,80)")

            filterGroup
            .append('text')
            .text('User Filter')
            .attr("transform", "translate(0,220)")



        vis.createFilterAxis(currentExperience,'Current Experience','experience')
        vis.createFilterAxis(mattersMost,'What matters most','relevance')

    }

    createFilterAxis(parentElement,label,id){

        let vis = this;

        let axisHeight = 60;
        
        parentElement.append("text")
        .attr("transform", "translate(0,40)")
        .attr('class','axisLabel')
        .text(label)

        parentElement.append("line")
        .attr('x1',0)
        .attr('x2', vis.width)
        .attr('y1',axisHeight)
        .attr('y2',axisHeight)
        .attr('id',id)
        .style('stroke', 'white')
        .style('stroke-width',2)

        //create linear scale for line and add circle; 
        let filterScale = d3.scaleLinear().range([0,vis.width]).domain([0,100]);

        let circleLabel = parentElement.append('text')
        .attr('class','handleText')
        .attr('x',filterScale(25))
        .attr('y',axisHeight+30)
        .text('25th percentile')

        parentElement.append('circle')
        .attr('class','filterHandle')
        .attr('cx',filterScale(25))
        .attr('cy',axisHeight)
        .attr('r',10)
        // .on('click', function(event,d){
        //     // console.log(event);
        //     // console.log(lineScale(85))
        //     // console.log(d.line.lineElement.node().getPointAtLength(lineScale(85)));

        //     // d.label.style('fill','red')

        //     // d.line.lineElement.style('stroke','red')
        //     d.checked ? (d.id == 1 || d.id == 3 ? upper : lower) : '#333132'
        //     if (!d.checked){
        //         d.checked = true; 
        //         //unselect the other circle; 
        //         let otherCircle = d.id >1 ? d.id -2 : d.id + 2;
        //         circleElements.each(function(c){c.id == otherCircle ? c.checked = false : ''})
        //         circleElements.style('fill', d=> d.checked ? (d.id == 1 || d.id == 3 ? upper : lower) : '#333132')

        //         self.animateTransition();
        //     }
        // })
        .call(d3.drag().on("drag",function (event,d){
            let range = filterScale.range();
            let x = event.x > range[1] ? range[1] : (event.x < range[0] ? range[0] : event.x)
            d3.select(this).attr('cx',x)

            let percentile = filterScale.invert(x)
            circleLabel.text(Math.round(percentile) + 'th percentile')
          
            if (percentile > 18 && percentile <88){
                circleLabel.attr('x',x)
            } 
           


            

        }))
        // .on("end",function(event,d){self.animateTransition()
        //     let otherCircle = d.id >1 ? d.id -2 : d.id + 2;

        //     let oC  = circleElements.filter(function(c){return c.id == otherCircle});
        //     oC.attr('r',4.77)

        //     d.checked = true; 
        //     //unselect the other circle; 
        //     // let otherCircle = d.id >1 ? d.id -2 : d.id + 2;
        //     circleElements.each(function(c){c.id == otherCircle ? c.checked = false : ''})
        //     circleElements.style('fill', d=> d.checked ? (d.id == 1 || d.id == 3 ? upper : lower) : '#333132')


        // d3.select(this).attr('r',8)
        
        // }))

    
        




    }

    createUserFilter(parentElement,label,userData){


    }
}
