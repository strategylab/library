How to add new survey results to the wellness gap visualization tool


The code for the tool lives at: https://github.com/cnobre/gensler
If you need access to the repo (to add new survey data), please email carolinanobre@gmail.com 


The survey results live in the /data folder. 


* Each survey needs to live in a folder named by its gensler project number (format xxx.xxxx.xxx) See current survey folders here. 


* Inside the survey folder, there should be 3 csv files:
   * 000.0000.000_responses.csv  [see example in google sheets here] 
   * 000.0000.000_demographic_questions.csv  [see example in google sheets here] 
   * 000.0000.000_survey_questions.csv  [see example in google sheets here] 




A note on .csv files vs google sheets (.gsheet) 
If you'd like to edit/create your files in google sheets, this will create/convert them to .gsheet files. The visualization tool will import the .csv file,so don't forget to export any google sheets to a .csv file for the updates to be reflected in the tool. 


Notes on file contents:
* It is important that the headers in the survey_questions.csv and demographic_questions.csv files match the ones in the sample files exactly! 
* The Include column in both _questions.csv files is meant to easily toggle inclusion/exclusion of different questions without having to delete/re-enter them in the file. If you want to exclude a question permanently, you can simply delete it from the appropriate _questions.csv file. 
* The options column in the demographic_questions is meant to list out all the possible values the respondent could give for that question. Each option needs to be separated by a newline/return. Do not separate them with commas since commas are sometimes a part of an option string. 
* For the survey_questions file, wedge, axis, and set name refer to the following elements in the visualization (see figure below). 
* Wedges can have any number of questions/axis in them (doesn’t have to be even/the same across wedges)
* There should be two set names in your dataset. 
* Each axis needs to have two (and only two) questions, one in each “set name”. 
* The order of the wedges is defined by the order they appear in the _survey_questions.csv file (first wedge is placed at the 9 o’clock position in the vis ).