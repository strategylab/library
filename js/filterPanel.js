
/*
 * PrioVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData 
 */

class filterPanel {

    constructor(_parentElement, filterQuestions) {
        this.parentElement = _parentElement;
        this.filterQuestions = filterQuestions.filter(d=>d.Include == 'TRUE'); //filter out questions that are flagged as not include;
        this.margin = { top: 40, right: 40, bottom: 200, left: 40 };
        this.width = d3.select("#" + this.parentElement).node().clientWidth - this.margin.left - this.margin.right;
        this.pageHeight = d3.select("#" + this.parentElement).node().clientHeight;

        this.height = 180 //2000 - this.margin.top - this.margin.bottom;

        this.wrangleData();

        console.log(this.margin,this.width)

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

        // console.log( option, include)
        //setting the flag for that option as filtered;
        let vis = this;
        vis.filterQuestions.map(q=>{
            if (q[qualtricsHeader] == questionId){
                q.Options.map(o=>{
                    if (o.option == option){
                        o.clicked = include;
                    }
                })
            }
            

        })

        surveyData.map(d=>{
            let selected = true;
            vis.filterQuestions.map(q=>{
                let questionId = q[qualtricsHeader];
                let answer = d[questionId];
                let clicked = q.Options.filter(o=>o.option == answer)[0].clicked;
                if (!clicked){
                    selected = false;
                }
            })
           
                d.selected = selected;
        
        })

        vis.updateCounts();
        dataFiltered() //main function to recompute values for wedges
    }

    clearFilters(){

        let vis = this;
        vis.filterQuestions.map(q=>{
                q.Options.map(o=>{
                    o.clicked = true;
                })
        })

        surveyData.map(d=>{           
                d.selected = true;
        })

        vis.updateCounts();
        dataFiltered() //main function to recompute values for wedges
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

        vis.selectedRespondents = surveyData.filter(d=>d.selected).length;

        d3.select('#numParticipants')
        .text('' + vis.selectedRespondents + ' / ' + vis.allRespondents + ' participants')

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
            .attr("transform", "translate(" + (vis.margin.left) + "," + vis.margin.top + ")")

        parentGroup.append('g')
            .attr("transform", "translate(73,20)")
            .attr('class', 'panelTitle')
            .attr('id', 'wellBeing')
            .append('text')
            .text('MAYO')
            .style('font-weight',600)
            // .text('WELL-BEING')

        let pathGroup = parentGroup.append('g')
            .attr("transform", "translate(-25,35)")
            .attr('id', 'pathGroup');

        pathGroup
            .append('path')
            .attr('class', 'titlePath')
            .attr('d', 'M11.11,14.07c0,0,72.32-2.95,97.36,0s50.05-0.02,75.66-1.31c29.06-1.47,77.51,4.38,96.98,3.4')

        pathGroup.append('g')
            .attr("transform", "translate(90,25)")
            .attr('class', 'panelTitle')
            // .attr('id', 'gapAnalysis')
            .append('text')
            // .text('GAP ANALYSIS')
            .text('CLINIC')
            .style('font-weight',600)

            .style('letter-spacing',2)
            .style('font-size',29)
            // .text('AT ASPECT HEALTH')
            // .style('letter-spacing',1)
            // .style('font-size',26)
    }

    createResponseFilter() {

        let vis = this;

        let topOffset = 150 // d3.select("#titleGroup").node().clientWidth
        console.log('topOffset is ', topOffset)

        let parentGroup = vis.svg.append("g")
            .attr("transform", "translate(" + vis.margin.left/2 + "," + topOffset + ")")

        let responseFilter = parentGroup.append('g')
            .attr("transform", "translate(0,20)")
            .attr('class', 'filter');

            responseFilter
            .append('text')
            .text('Response Filter')
            .attr('class','filterTitle')

            responseFilter
            .append('rect')
            .attr('class','resetButton')
            .attr('x',0)
            .attr('y',5)
            .attr('width', vis.width)
            .attr('height', 1)


            let currentExperience = responseFilter.append('g')
            .attr('id','experience')
            // .attr("transform", "translate(0,10)")

            let mattersMost = responseFilter.append('g')
            .attr('id','relevance')
            .attr("transform", "translate(0,80)")

            
            let userFilter = parentGroup.append('g')
            .attr("transform", "translate(0,240)")
            .attr('class', 'filter');

            userFilter
            .append('text')
            .text('User Filter')
            .attr('class','filterTitle')

            let reset = userFilter
            .append('g')
            // .attr("transform", "translate(0,5)")


            reset
            .append('rect')
            .attr('class','resetButton')
            .attr('x',0)
            .attr('y',5)
            .attr('width', vis.width)
            .attr('height', 1)
            // .attr("transform", "translate(0,20)")

            reset
            .append('text')
            .attr('x',vis.width)
            .text('Clear Filter')
            .attr('class','resetLabel')
            .on('click',d=>vis.clearFilters())



            userFilter
            .append('text')
            .attr('class', 'participantCount')
            .text('' + vis.selectedRespondents + ' / ' + vis.allRespondents + ' participants')
            .attr('id', 'numParticipants')
            .attr("x", 0)
            .attr("y", 22)

            let filterDivs = d3.select('#filterPanel')
            .append('div')
            .attr('class', 'filterDivs')
            // .style('height',(this.pageHeight - 420))
            
            vis.filterQuestions.map((f,i)=>{

                let numOptions  = f.Options.length;
                let svgHeight = numOptions * 25 + 30;

                let roleFilter = filterDivs.append('div').attr('class', 'column is-full optionPanel')
                .append('svg').attr('height',svgHeight)
                .append('g')
                // let roleFilter = userFilter.append('g')
                // .attr("transform", "translate(0," + yTranslate+ ")")

                // console.log('f', f[qualtricsHeader].replace(/\./g,''))
                let optionGroup = roleFilter.append('g')
                .attr("transform", "translate(" + 90 + ",20)")
                .attr('id',f[qualtricsHeader].replace(/\./g,''))
        
                let header = optionGroup.append("text")
                .attr('class','filterLabel selectAll')
                .text(f.Label)  


        //set the click behavior of the header of this group. 
             header
            .on('click',function(){
                let toggle = d3.select(this).classed('selectAll');
                d3.select(this).classed('selectAll',!toggle)

                console.log('setting selectAll to ', !toggle)
                f.Options.map(d=>{
                    vis.filterData(f[qualtricsHeader],d.option,!toggle);
                })
            
            })

                vis.createUserFilter(optionGroup,f)

               
             
            })
          



        vis.createFilterAxis(currentExperience,'Current Experience','Experience',quantiles['Experience'])
        vis.createFilterAxis(mattersMost,'What matters most','Relevance',quantiles['Relevance'])


    }

    createFilterAxis(parentElement,label,set,quantile){

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
       
        .style('stroke', 'white')
        .style('stroke-width',2)

        //create linear scale for line and add circle; 
        let filterScale = d3.scaleLinear().range([0,vis.width]).domain([0,100]);

        let circleLabel = parentElement.append('text')
        .attr('class','handleText')
        .attr('x',filterScale(quantile))
        .attr('y',axisHeight+30)
        .text(quantile + 'th percentile')

        parentElement.append('circle')
        .attr('class','filterHandle')
        .attr('cx',filterScale(quantile))
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
    
        })
        .on('end',function(event){
            let range = filterScale.range();

            let x = event.x > range[1] ? range[1] : (event.x < range[0] ? range[0] : event.x)
            let percentile = filterScale.invert(x)
            quantileChanged(set,percentile)
        }
        ))
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
        let barScale = d3.scaleLinear().range([0,xOffset]).domain([0,54])
        

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
            vis.filterData(d.id,d.label,!d.clicked);
        })
            

   

        let optionsLabels = options.selectAll('.checkboxLabel')
          .data(d=>[d])


        enterSelection = optionsLabels.enter().append("text")
        .attr('class','checkboxLabel')
        .style('dominant-baseline','middle')
        .attr('x', 5);

        optionsLabels.merge(enterSelection)
        .text(d=>d.label) 
        .classed('exclude',d=>!d.clicked)
  


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
        .transition()
        .duration(1000)
        .attr('x',d=>-barScale(d.selected))
        .attr('y',(d,i)=>-checkBoxSize/2)


        .attr('width',d=> barScale(d.selected))



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
