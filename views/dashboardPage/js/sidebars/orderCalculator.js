let orderCalculator = {
    display: function(){
        let to = new Date();
        to.setDate(to.getDate() + 7);
        to.setHours(0, 0, 0, 0);
        from = new Date();
        from.setDate(from.getDate() + 1);
        from.setHours(0, 0, 0, 0);

        document.getElementById("predictDateFrom").valueAsDate = from;
        document.getElementById("predictDateTo").valueAsDate = to;
        document.getElementById("predictButton").addEventListener("click", ()=>{this.predict()});

        let selector = document.getElementById("predictSelector");
        for(let i = 0; i < merchant.ingredients.length; i++){
            let option = document.createElement("option");
            option.innerText = merchant.ingredients[i].ingredient.name;
            option.value = merchant.ingredients[i].ingredient.id;
            selector.appendChild(option);
        }
    },

    predict: function(){
        let from = document.getElementById("predictDateFrom").valueAsDate;
        let to = document.getElementById("predictDateTo").valueAsDate;
        let ingredient = merchant.getIngredient(document.getElementById("predictSelector").value);

        let data = {
            to: new Date(),
            recipes: []
        }

        data.from = new Date(data.to.getFullYear() - 1, data.to.getMonth(), data.to.getDate());

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

                    this.createData(nn, response, ingredient.ingredient);
                    nn.normalizeData();
                    nn.train(()=>{
                        let predictors = [];
                        while(from <= to){
                            predictors.push(nn.predict({
                                month: from.getMonth(),
                                day: from.getDay()
                            }))

                            from.setDate(from.getDate() + 1);
                        }

                        Promise.all(predictors)
                            .then((predictions)=>{
                                let total = 0
                                for(let i = 0; i < predictions.length; i++){
                                    total += predictions[i][0].value;
                                }

                                if(isNaN(total)) total = 0;
                                document.getElementById("prediction").innerText = `${total.toFixed(2)} ${ingredient.ingredient.unit.toUpperCase()}`;
                            })
                            .catch((err)=>{
                                controller.createBanner("ERROR: UNABLE TO MAKE PREDICTION", "error");
                            });
                    });
                }
            })
            .catch((err)=>{
                controller.createBanner("ERROR: UNABLE TO MAKE PREDICTION", "error");
            });
    },

    createData: function(nn, transactions, ingredient){
        let today = new Date(transactions[transactions.length-1].date);
        today.setHours(0, 0, 0, 0);
        let tomorrow = new Date(transactions[transactions.length-1].date);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        let dailySum = 0;

        for(let i = transactions.length - 1; i >= 0; i--){
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
                            if(merchant.recipes[k].ingredients[l].ingredient === ingredient){
                                dailySum += merchant.recipes[k].ingredients[l].quantity * transactions[i].recipes[j].quantity;
                            }

                            break;
                        }

                        break;
                    }
                }
            }
        }
    }
}

module.exports = orderCalculator;