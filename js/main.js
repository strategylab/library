

let surveyData;
let qualtricsHeader = 'Qualtrics Question ID';

let quantiles = {'Experience':40,'Relevance':80}

let dataWedgeObj, filterPanelObj;
// (1) Load data with promises

function updateDisplay(){
    // console.log('updated data is ', surveyData)
}

// d3.json("data/survey.json").then(d=>console.log(d))
let promises = [
    //survey questions sheet
    //mayo questions
    d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vQZ1SnrmhfpyEFR_mqEfENUwJiGw9WzAZbqvlWup2NtSMTwN5mzW9YnTkZ91cr14fwZTZbYO3ywR8bd/pub?output=csv"),

    // d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vRm3RRGXN2mFoFXIfZY5CsLgtmC8vawChFS7cWJEbIROojynou107krBVv_6CmtRqXaP53qpzLUbczh/pub?gid=0&single=true&output=csv"),
    // d3.csv('https://docs.google.com/spreadsheets/d/e/2PACX-1vRT4jqNsORiB22OK08jd-cwxkQ1Nda7E0h-YO1Wprki8fytj0v8lHtAoc6zP4G6xW_VdkXOSRNifE2U/pub?gid=0&single=true&output=csv'),
   //survey responses sheet
   // mayo responses
   d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vSjXofpSf-E7rQOY1dMeZ55RxL-rCw31fAVcpzQFpOh9nvfyY_WAx0X1siwRNn6RZkCP2hjPa0aVQEe/pub?output=csv"),
    // d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vTP_RG-pJHJWjk3QaT16f4Io7IlHUbsYF3eB5h8NorScEEN5xKF_AWv9RCQfCO_S-NrlRlwf3qe4XJa/pub?gid=1274511277&single=true&output=csv"),
    // d3.csv('https://docs.google.com/spreadsheets/d/e/2PACX-1vTf156ERY9s_Zc-mPw0el_GJg8xxkOauMVhNI2nQZK_atnS7axIFirm0fsOG-3MO0_G386ZnCdXMUxU/pub?gid=1289359036&single=true&output=csv'),
    //survey userQuestions sheet
    //mayo placeholders
    d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vSAdmG4zQ939F1h_pLwhtJo1Z0iQzcaTIrCG4TpFdtpWrfDYevsYgMRlFv7iLo_1UWMJwT757NL-Iis/pub?output=csv"),
    // d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vSugTmsTRgVq3LDdIv1-suHzbU_0UPk--9c2UPQZoo2TQuXETAjO8C6XGmVesiCYSrC8wBNySXTGWl0/pub?gid=0&single=true&output=csv"),
    // d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vT6eL0p9cqUXRtlRoxJB-8bM1ahIOqu_f0_KLtcVDCPgkvrXTT4hairRHJxA-cjxMf38Fnc7jQjfWE4/pub?gid=0&single=true&output=csv")
    // d3.csv("data/Aspect+Health+-+Care+Team+Member+Experience_DRAFT_September+23,+2021_09.07.csv")
];

Promise.all(promises)
    .then( function(data){createVis(data)} )
    .catch( function (err){console.log(err)} );

function quantileChanged(set,quantile){
    quantiles[set]=quantile;
    dataWedgeObj.recomputeQuantiles()
}

function dataFiltered(){
    console.log('data filtered')
    dataWedgeObj.recomputeQuantiles()
}

function createVis(data){


    let qualtricsHeader = 'Qualtrics Question ID'

   
    let surveyQuestions = data[0];
    let surveyResponses = data[1];
    let surveyUserQuestions = data[2].filter(q=>q.Include == 'TRUE');
    
    // surveyResponsesRaw
    console.log('allData', data)

    // console.log('surveyResponsesRaw', surveyResponsesRaw[0])


    surveyUserQuestions.map(q=>{
        q['Options'] = q['Options'].trim().split('\n')
        q['answerLookup'] = {};
        q['Options'] = q['Options'].map(o=>{   
            let [value,key] = o.trim().split('_')
            key = key || value; //if there is nothing to split on, key = value 
            q['answerLookup'][key]=value;
            return value
        })
    })

    let lookUpKey ={};
    surveyUserQuestions.map(q=>{
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


    surveyResponses.map(d=>d.selected = true)

    surveyData = surveyResponses;
    // console.log('surveyData is ', surveyData)

    surveyData.splice(0,2);

    //  surveyData = surveyResponses;

     console.log('surveyData is ', surveyData)

     dataWedgeObj = new dataWedge('dataWedge',surveyQuestions)
    filterPanelObj = new filterPanel('filterPanel',surveyUserQuestions)
}
