window.fetchData = function(from, to){
    retrieveDates = [];

    //Compares dates to dates already stored and makes a list of those needed
    for(let i = 0; i < data.dates.length; i+=2){
        if(to <= new Date(data.dates[0]) || from >= new Date(data.dates[data.dates.length - 1])){
            retrieveDates.push(from);
            retrieveDates.push(to);
            break;
        }

        let date0 = new Date(data.dates[i]);
        let date1 = new Date(data.dates[i+1]);

        if(from < date0){
            retrieveDates.push(from);
            retrieveDates.push(date0);
            from = date1;
        }else if(from > date0 && from < date1){
            from = date1;
        }
    }

    axios.post("/getData", {dates: retrieveDates})
        .then((response)=>{
            if(typeof(response.data) === "string"){
                banner.createError(response.data);
            }else{
                console.log(response.data);
                //Append data

                //change to/from in date list
            }
        })
        .catch((err)=>{});
}