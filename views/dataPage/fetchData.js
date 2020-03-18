window.fetchData = function(from, to, callback){
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
                            if(mergedDates.length > 0 && oldDateOne.getTime() === mergedDates[mergedDates.length-1].getTime()){
                                mergedDates[mergedDates.length-1] = oldDateTwo;
                            }else{
                                mergedDates.push(oldDateOne);
                                mergedDates.push(oldDateTwo);
                            }
                            oldIndex += 2;
                        }else{
                            if(mergedDates.length > 0 && retrieveDates[newIndex].getTime() === mergedDates[mergedDates.length-1].getTime()){
                                mergedDates[mergedDates.length-1] = retrieveDates[newIndex+1];
                            }else{
                                mergedDates.push(retrieveDates[newIndex]);
                                mergedDates.push(retrieveDates[newIndex+1]);
                            }
                            newIndex += 2;
                        }
                    }

                    data.dates = mergedDates;

                    for(let set of response.data){
                        for(let transaction of set.transactions){
                            transaction.date = new Date(transaction.date);
                            transaction.date.setMinutes(transaction.date.getMinutes() + transaction.date.getTimezoneOffset());
                        }

                        if(set.transactions[0].date < data.transactions[0].date){
                            data.transactions = set.transactions.concat(data.transactions);
                        }else if(set.transactions[set.transactions.length-1].date > data.transactions[data.transactions.length-1].date){
                            data.transactions = data.transactions.concat(set.transactions);
                        }else{
                            for(let i = 0; i < data.transactions.length; i++){
                                if(set.transactions[0].date > data.transactions[i].date){
                                    data.transactions = data.transactions.slice(0, i).concat(set.transactions).concat(data.transactions.slice(i, data.transactions.length - 1));
                                    break;
                                }
                            }
                        }

                        for(let purchase of set.purchases){
                            purchase.date = new Date();
                            purchase.date.setMinutes(purchase.date.getMinutes() + purchase.date.getTimezoneOffset());
                        }

                        if(set.purchases.length > 0){
                            if(data.purchases.length === 0){
                                data.purchases = set.purchases;
                            }else if(set.purchases[0].date < data.purchases[0].date){
                                data.purchases = set.purchases.concat(data.purchases);
                            }else if(set.purchases[set.purchases.length-1].date > data.purchases[data.purchases.length-1].date){
                                data.purchases = data.purchases.concat(set.purchases);
                            }else{
                                for(let i = 0; i < data.purchases.length; i++){
                                    if(set.purchases[0].date > data.purchases[i].date){
                                        data.purchases = data.purchases.slice(0, i).concat(set.purchases).concat(data.purchases.slice(i, data.purchases.length - 1));
                                        break;
                                    }
                                }
                            }
                        }
                    }

                    callback();
                }
            })
            .catch((err)=>{});
    }else{

        callback();
    }
}

window.getInputDates = function(name){
    let from = document.querySelector(`#${name}From`).valueAsDate;
    let to = document.querySelector(`#${name}To`).valueAsDate;

    from.setMinutes(from.getMinutes() + from.getTimezoneOffset());
    to.setMinutes(to.getMinutes() + to.getTimezoneOffset());
    to.setDate(to.getDate() + 1);

    return [from, to];
}