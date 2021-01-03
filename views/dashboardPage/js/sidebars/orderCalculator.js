let orderCalculator = {
    display: function(){
        let calculatorItems = document.getElementById("calculatorItemsBody");
        let template = document.getElementById("calculatorItem").content.children[0];
        let calculations = this.mlPredict();

        // while(calculatorItems.children.length > 0){
        //     calculatorItems.removeChild(calculatorItems.firstChild);
        // }

        // for(let i = 0; i < calculations.length; i++){
        //     let outputString = `${calculations[i].output.toFixed(2)} ${calculations[i].ingredient.unit.toUpperCase()}`;
        
        //     let item = template.cloneNode(true);
        //     item.children[0].innerText = calculations[i].ingredient.name,
        //     item.children[1].innerText = outputString;
        //     calculatorItems.appendChild(item);
        // }
    },

    predict: function(){
        let now = new Date();
        let yesterday = new Date();
        yesterday.setHours(0, 0, 0, 0);
        let monthAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        let weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    
        let calculations = [];

        let month = merchant.getIngredientsSold(monthAgo, yesterday);
        let week = merchant.getIngredientsSold(weekAgo, yesterday);

        let weights = {
            month: 0.33,
            week: 0.67
        }

        for(let i = 0; i < month.length; i++){
            for(let j = 0; j < week.length; j++){
                if(month[i].ingredient.id === week[j].ingredient.id){
                    let monthAverage = (month[i].quantity / 30) * weights.month;
                    let weekAverage = (week[i].quantity / 7) * weights.week;

                    let calc = {
                        ingredient: month[i].ingredient,
                        output: monthAverage + weekAverage
                    };
                    calculations.push(calc);
                }
            }
        }

        return calculations;
    },

    mlPredict: function(){
        let data = {
            to: new Date(),
            recipes: []
        }

        data.from = new Date(data.to.getFullYear() - 2, data.to.getMonth(), data.to.getDate());

        fetch("/transaction", {
            method: "post",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    controller.createBanner(response, "error");
                }else{
                    const options = {
                        task: "regression",
                        debug: false
                    }

                    const nn = ml5.neuralNetwork(options);

                    this.createData(nn, response);
                    nn.normalizeData();
                    nn.train(()=>{
                        nn.predict({
                            month: 0,
                            day: 0
                        }, (err, results)=>{
                            console.log(results[0].value);
                        });
                    });
                }
            })
            .catch((err)=>{
                controller.createBanner("SOMETHING'S FUCKY...", "error");
            });
    },

    createData: function(nn, transactions){
        let today = new Date(transactions[transactions.length-1].date);
        today.setHours(0, 0, 0, 0);
        let tomorrow = new Date(transactions[transactions.length-1].date);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        let dailySum = 0;

        for(let i = transactions.length - 1; i >= 0; i--){
        // for(let i = 100; i >= 0; i--){
            transactions[i].date = new Date(transactions[i].date);

            if(transactions[i].date >= tomorrow){
                let inputs = {
                    month: today.getMonth(),
                    day: today.getDay()
                };

                let output = {quantity: dailySum};

                nn.addData(inputs, output);
                dailySum = 0;
                today.setDate(today.getDate() + 1);
                tomorrow.setDate(tomorrow.getDate() + 1);
            }

            for(let j = 0; j < transactions[i].recipes.length; j++){
                for(let k = 0; k < merchant.recipes.length; k++){
                    if(merchant.recipes[k].id === transactions[i].recipes[j].recipe){
                        for(let l = 0; l < merchant.recipes[k].ingredients.length; l++){
                            if(merchant.recipes[k].ingredients[l].ingredient === merchant.ingredients[5].ingredient){
                                dailySum += merchant.recipes[k].ingredients[l].quantity * transactions[i].recipes[j].quantity;
                            }
                        }

                        break;
                    }
                }
            }
        }
    }
}

module.exports = orderCalculator;