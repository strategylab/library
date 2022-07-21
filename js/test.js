
    // d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vQsJiLDVYvs6ANKNHpNFqbsJmvJOiBx4ptFawL998_cP0r1IcsIQXodK8W1YzHa__t6ZRkcqc3OSNqm/pub?gid=0&single=true&output=csv")
    d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vQsJiLDVYvs6ANKNHpNFqbsJmvJOiBx4ptFawL998_cP0r1IcsIQXodK8W1YzHa__t6ZRkcqc3OSNqm/pub?gid=0&single=true&output=csv")
    .then(function (data) { console.log(data) })
    .catch(function (err) { console.log(err) });