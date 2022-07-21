

let surveyData;
let qualtricsHeader = 'Qualtrics Question ID';



let quantiles = { 'Experience': 50, 'Relevance': 50 }
let setLabels = { 'Importance': 'Relevance', 'Agreement': 'Experience' }

let dataWedgeObj, filterPanelObj;
// (1) Load data with promises

function updateDisplay() {
    // console.log('updated data is ', surveyData)
}


console.log(window.location.href)
let params = window.location.href.split('?/');

let tool, project;
console.log('params', params)

if (params.length>1){
    [tool,project] = params[1].split('/')
} else {
    project = '123.4567.890'
}


console.log(tool,project)
// project = '123.4567.890'; //string to be parsed from 

console.log('project is ', project)
// d3.json("data/survey.json").then(d=>console.log(d))
let promises = [
    //survey questions sheet
    // d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vQsJiLDVYvs6ANKNHpNFqbsJmvJOiBx4ptFawL998_cP0r1IcsIQXodK8W1YzHa__t6ZRkcqc3OSNqm/pub?gid=0&single=true&output=csv"),
    d3.csv("data/" +project + "/" + project + "_survey_questions.csv"),

    //survey userQuestions sheet
    // d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vS4TlQT4j9tS6slrWZobAdBX886SVvCo0tdNyOznVrCgs-DmqUhwInIHOgCp5kp6GyWTAvRcTBtt9l3/pub?gid=538591639&single=true&output=csv"),
    d3.csv("data/" +project + "/" + project + "_demographic_questions.csv"),

    //survey responses sheet
    // d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vTainYDF5QResqhPR1QNHBtMPeqrKaf8FOHOlFm00HchbI9ZY5oA_JKdGmLH0weiEhuzwiA-okJQP1L/pub?gid=1321206642&single=true&output=csv")
    d3.csv("data/" +project + "/" + project + "_responses.csv"),

];

Promise.all(promises)
    .then(function (data) { createVis(data) })
    .catch(function (err) { console.log(err) });

function quantileChanged(set, quantile) {
    quantiles[set] = quantile;
    dataWedgeObj.recomputeQuantiles()
}

function dataFiltered() {
    console.log('data filtered')
    dataWedgeObj.recomputeQuantiles()
}

function createVis(data) {


    let qualtricsHeader = 'Qualtrics Question ID'
console.log(data)
    console.log('preFilter questions', data[0])
    let surveyQuestions = data[0].filter(d=>d.Include.toLowerCase() == 'true');

    console.log('survey Questions', surveyQuestions)
    

    // console.log('surveyResponsesRaw', surveyResponsesRaw[0])
    surveyQuestions.map(q => {
        q.Set = setLabels[q.Set]
        //for each surveyQuestion, change the value in data to numeric:
        data[2].map(d => d[q[qualtricsHeader]] = parseInt(d[q[qualtricsHeader]]))
    }
    )

    let surveyResponses = data[2];
    let surveyUserQuestions = data[1].filter(q => q.Include == 'TRUE');


    // console.log('allData', data)


    surveyUserQuestions.map(q => {
        q['Options'] = q['Options'].trim().split('\n')
        q['answerLookup'] = {};
        q['Options'] = q['Options'].map(o => {
            let [value, key] = o.trim().split('_')
            key = key || value; //if there is nothing to split on, key = value 
            q['answerLookup'][key] = value;
            return value
        })
    })

    let lookUpKey = {};
    surveyUserQuestions.map(q => {
        lookUpKey[q[qualtricsHeader]] = q;
    })



    //convert numeric responses to strings;
    // surveyResponsesRaw.map(r=>{
    //     surveyUserQuestions.map(q=>{
    //         let newValue = q.answerLookup[r[q[qualtricsHeader]]] 
    //         r[q[qualtricsHeader]] = newValue
    //     })
    // })

    // console.log('surveyResponses', surveyResponses.map(r=>r.Q3))
    // console.log('surveyResponses', surveyResponses.map(r=>r.Q5))


    surveyResponses.map(d => {
        d.selected = true
        //update labels for the sets; 
    })

    surveyData = surveyResponses;
    // console.log('surveyData is ', surveyData)

    surveyData.splice(0, 2);

    //  surveyData = surveyResponses;

    console.log('surveyData is ', surveyData)

    dataWedgeObj = new dataWedge('dataWedge', surveyQuestions)
    filterPanelObj = new filterPanel('filterPanel', surveyUserQuestions)
}
