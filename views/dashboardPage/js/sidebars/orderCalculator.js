let orderCalculator = {
    display: function(){
        let calculations = this.getDailyAverages();

        // console.log(calculations);

    },

    getDailyAverages: function(){
        let now = new Date();
        let yesterday = new Date();
        yesterday.setHours(0, 0, 0, 0);
        let past = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);

        let ingredients = merchant.getIngredientsSold(past, yesterday);
        console.log(ingredients);
    }
}

module.exports = orderCalculator;