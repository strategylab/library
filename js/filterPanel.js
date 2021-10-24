
/*
 * PrioVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData 
 */

class filterPanel {

    constructor(_parentElement, filterQuestions) {
        this.parentElement = _parentElement;
        this.filterQuestions = filterQuestions.filter(d=>d.Include == 'TRUE'); //filter out questions that are flagged as not include;
        this.margin = { top: 40, right: 20, bottom: 200, left: 20 };
        this.width = d3.select("#" + this.parentElement).node().clientWidth - this.margin.left - this.margin.right;
        this.height = 2000 - this.margin.top - this.margin.bottom;

        this.wrangleData();

        // setTimeout(() => { this.initVis();   // Update the visualization
        //    }, 0);

    }


    wrangleData() {

        let vis= this;

        vis.filterQuestions.map(q=>{
            q.Options = q.Options.map(o=>{
                // surveyData
                let count = surveyData.filter(d=>d[q[qualtricsHeader]]==o).length;
                let selected = surveyData.filter(d=>d[q[qualtricsHeader]]==o && d.selected).length;
                return {option:o,count, selected, clicked:true}

            })

        })
        
        // count how many people took the survey and answered each of the options; 
        vis.allRespondents = surveyData.length;
        vis.updateCounts()
        vis.initVis()
    }

    filterData(questionId, option,include){

        // console.log('filtering', questionId, option, include)
        let vis = this;
        vis.filterQuestions.map(q=>{
            // console.log('q', q)
            if (q[qualtricsHeader] == questionId){
                q.Options.map(o=>{
                    if (o.option == option){
                        o.clicked = include;
                    }
                })
            }
            

        })

        surveyData.map(d=>{
            if (d[questionId] == option){
                d.selected = include;
            }
        })

        vis.updateCounts();
    }
    
    updateCounts(){
        let vis = this;
        // console.log(vis.filterQuestions)
        vis.filterQuestions.map(q=>{
            q.Options.map(o=>{
                // surveyData
                o.count = surveyData.filter(d=>d[q[qualtricsHeader]]==o.option).length;
                o.selected = surveyData.filter(d=>d[q[qualtricsHeader]]==o.option && d.selected).length;
            })

        })

         vis.filterQuestions.map((f,i)=>{
            //  console.log(f);
                let optionGroup = d3.select('#' + f[qualtricsHeader].replace(/\./g,''))
                vis.createUserFilter(optionGroup,f)
             
            })
        // console.log('filter Questions', vis.filterQuestions)
        // console.log('surveyData',surveyData)

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

        let responseFilter = parentGroup.append('g')
            .attr("transform", "translate(0,20)")
            .attr('class', 'filter');

            responseFilter
            .append('text')
            .text('Response Filter')

            let currentExperience = responseFilter.append('g')
            // .attr("transform", "translate(0,10)")

            let mattersMost = responseFilter.append('g')
            .attr("transform", "translate(0,80)")

            
            let userFilter = parentGroup.append('g')
            .attr("transform", "translate(0,240)")
            .attr('class', 'filter');

            userFilter
            .append('text')
            .text('User Filter')
            // .attr("transform", "translate(0,220)")

            let yTranslate = 40;
            vis.filterQuestions.map((f,i)=>{

                
                let roleFilter = userFilter.append('g')
                .attr("transform", "translate(0," + yTranslate+ ")")

                // console.log('f', f[qualtricsHeader].replace(/\./g,''))
                let optionGroup = roleFilter.append('g')
                .attr("transform", "translate(" + 70 + ",0)")
                .attr('id',f[qualtricsHeader].replace(/\./g,''))
        
                optionGroup.append("text")
                .attr('class','filterLabel')
                .text(f.Label)  

                vis.createUserFilter(optionGroup,f)

                let numOptions  = f.Options.length;
                yTranslate = yTranslate + numOptions * 25 + 40;
             
            })
          



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
          
            if (percentile > 14 && percentile <85){
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

    createUserFilter(optionGroup,userData){

        // console.log('calling createUserFilter')
        let vis = this;

        let checkBoxSize = 15;
        let xOffset = 70
        let numOptions = userData.Options.length;

        let checkBoxScale = d3.scaleLinear().range([25,(numOptions+1)*25]).domain([0,numOptions])
        let barScale = d3.scaleLinear().range([0,xOffset]).domain([0,20])
        

        let optionData = userData.Options.map(o=>{
            return {id: userData[qualtricsHeader], label:o.option, count:o.count, selected:o.selected, clicked:o.clicked}
        })

        // console.log('optionData is ', optionData)

        let options = optionGroup.selectAll('.options')
        .data(optionData);

        let enterSelection = options.enter()
        .append('g')
        .attr('class', 'options');

        options = options.merge(enterSelection)
        .attr("transform",(d,i)=>"translate(0," + checkBoxScale(i) + ")")
        // .classed('clicked',d=>d.clicked)
        .on('click',function(event,d){

            let include = !d.clicked
            // console.log('filtering ', d.label, include)
            vis.filterData(d.id,d.label,include);
        })
            

   

        let optionsLabels = options.selectAll('.checkboxLabel')
          .data(d=>[d])


        enterSelection = optionsLabels.enter().append("text")
        .attr('class','checkboxLabel')
        .style('dominant-baseline','middle')
        .attr('x', 5);

        optionsLabels.merge(enterSelection)
        .text(d=>d.label)  
  


        let bars = options.selectAll('.optionBars')
        .data(d=>[d])

       enterSelection = bars.enter().append("rect")
        .attr('class','optionBars')
        .attr('height',checkBoxSize)  

        enterSelection.merge(bars)
        .attr('x',d=>-barScale(d.count))
        .attr('width',d=>barScale(d.count))
        .attr('y',(d,i)=>-checkBoxSize/2)


        let selectedBars = options.selectAll('.selectedBars')
        .data(d=>[d])

       enterSelection = selectedBars.enter().append("rect")
        .attr('class','selectedBars')
        .attr('height',checkBoxSize)  

        selectedBars.merge(enterSelection)
        .attr('x',d=>-barScale(d.selected))
        .attr('width',d=> barScale(d.selected))
        .attr('y',(d,i)=>-checkBoxSize/2)



        let barLabel = options.selectAll('.barLabel')
        .data(d=>[d])

       enterSelection = barLabel.enter().append("text")
        .attr('class','barLabel')

        barLabel = enterSelection.merge(barLabel)

        .attr('x',d=>-barScale(d.count)-5)
        .text(d=>d.selected)
        .attr('y',5)


    }
}
