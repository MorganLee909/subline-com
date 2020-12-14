let orderCalculator = {
    display: function(){
        let calculatorItems = document.getElementById("calculatorItems");
        let template = document.getElementById("calculatorItem").content.children[0];
        let calculations = this.predict();

        for(let i = 0; i < calculations.length; i++){
            let item = template.cloneNode(true);
            item.children[0].innerText = calculations[i].ingredient.name,
            item.children[1].innerText = `${calculations[i].output.toFixed(2)} ${calculations[i].ingredient.unit.toUpperCase()}`;
            calculatorItems.appendChild(item);
        }
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
    }
}

module.exports = orderCalculator;