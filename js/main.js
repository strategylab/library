

// Function to convert date objects to strings or reverse
var dateFormatter = d3.timeFormat("%Y-%m-%d");
var dateParser = d3.timeParse("%Y-%m-%d");


// (1) Load data with promises

let promises = [
    d3.csv("data/Aspect+Health+-+Care+Team+Member+Experience_DRAFT_September+23,+2021_09.07.csv")
];

Promise.all(promises)
    .then( function(data){createVis(data)} )
    .catch( function (err){console.log(err)} );

function createVis(data){


    //questions of interest
    let questions = ['Q34_1', 'Q34_2', 'Q34_3', 'Q34_4', 'Q34_5', 'Q34_6', 'Q34_7', 'Q35_1', 'Q35_2', 'Q35_3', 'Q35_4', 'Q35_5', 'Q35_6', 'Q35_7'];

    let dataDict = {};
    
    questions.map(a=> dataDict[a] = {data:[]});

    let d = data[0]; 
        let newData = d.map(dd=>Object.fromEntries(Object.entries(dd).filter(([key]) => questions.includes(key))))
    newData.map(d=>{
        Object.keys(d).map(k=>{
            dataDict[k].data.push(+d[k])
        })
    })

    Object.keys(dataDict).map(k=>{
        //sort data
        dataDict[k].data.sort();
        // console.log(k, dataDict[k].data);
        dataDict[k].min = d3.min(dataDict[k].data)
        dataDict[k].max = d3.max(dataDict[k].data)
        dataDict[k].upper = d3.quantile(dataDict[k].data, 0.85); 
        dataDict[k].lower = d3.quantile(dataDict[k].data, 0.15); 

    })
    console.log(dataDict)

    //default quantiles are 85% and 15%
    // d3.quantile(Array, 0.25); 

   
    // console.log(d)
    // let filteredData = Object.fromEntries(Object.entries(data[0]).filter(([key]) => { return questions.includes(key)}));

    // console.log('filtered', filteredData)
    // let linkedHighlighting = new Wedge("linkedHighlighting", data[0]);
    
    let wedge = new dataWedge('dataWedge',data[0])
    // (5) Bind event handler
    // $(MyEventHandler).bind("selectionChanged", function(event, rangeStart, rangeEnd){
    //     ageVis.onSelectionChange(rangeStart, rangeEnd);
    //     prioVis.onSelectionChange(rangeStart, rangeEnd);
    //     countVis.onSelectionChange(rangeStart, rangeEnd);
    // });
}