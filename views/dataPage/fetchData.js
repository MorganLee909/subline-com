window.fetchData = function(from, to){
    retrieveDates = [];

    //Compares dates to dates already stored and makes a list of those needed
    let fromCopy = new Date(from);
    for(let i = 0; i < data.dates.length; i+=2){
        if(to <= new Date(data.dates[0]) || fromCopy >= new Date(data.dates[data.dates.length - 1])){
            retrieveDates.push(fromCopy);
            retrieveDates.push(to);
            break;
        }

        let date0 = new Date(data.dates[i]);
        let date1 = new Date(data.dates[i+1]);

        if(fromCopy < date0){
            retrieveDates.push(fromCopy);
            retrieveDates.push(date0);
            fromCopy = date1;
        }else if(fromCopy > date0 && fromCopy < date1){
            fromCopy = date1;
        }
    }

    if(retrieveDates.length > 0){
        axios.post("/getData", {dates: retrieveDates})
            .then((response)=>{
                if(typeof(response.data) === "string"){
                    banner.createError(response.data);
                }else{
                    let mergedDates = [];
                    let oldIndex = 0;
                    let newIndex = 0;

                    while(oldIndex + newIndex < retrieveDates.length + data.dates.length){
                        let oldDateOne = new Date(data.dates[oldIndex]);
                        let oldDateTwo = new Date(data.dates[oldIndex+1]);
                        if(oldDateOne < retrieveDates[newIndex] || newIndex >= retrieveDates.length){
                            console.log("thing doing one");
                            if(mergedDates.length > 0 && oldDateOne.getTime() === mergedDates[mergedDates.length-1].getTime()){
                                mergedDates[mergedDates.length-1] = oldDateTwo;
                                console.log("one");
                                console.log(mergedDates);
                                console.log();
                            }else{
                                mergedDates.push(oldDateOne);
                                mergedDates.push(oldDateTwo);
                                console.log("two");
                                console.log(mergedDates);
                                console.log();
                            }
                            oldIndex += 2;
                        }else{
                            if(mergedDates.length > 0 && retrieveDates[newIndex].getTime() === mergedDates[mergedDates.length-1].getTime()){
                                mergedDates[mergedDates.length-1] = retrieveDates[newIndex+1];
                                console.log("three");
                                console.log(mergedDates);
                                console.log();
                            }else{
                                mergedDates.push(retrieveDates[newIndex]);
                                mergedDates.push(retrieveDates[newIndex+1]);
                                console.log("four");
                                console.log(mergedDates);
                                console.log();
                            }
                            newIndex += 2;
                        }

                        if(newIndex > 100 || oldIndex > 100){
                            break;
                        }
                    }

                    console.log(mergedDates);

                    //change to/from in date list
                }
            })
            .catch((err)=>{});
    }
}