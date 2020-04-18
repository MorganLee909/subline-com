window.purchaseObj = {
    isPopulated: false,
    graph: {},

    display: function(ingredient){
        clearScreen();
        document.querySelector("#purchaseStrand").style.display = "flex";
        document.querySelector("strand-selector").setAttribute("strand", "purchase");

        if(!this.isPopulated){
            let date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            document.querySelector("#purchaseFrom").valueAsDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
            document.querySelector("#purchaseTo").valueAsDate = new Date();

            let purchasesDiv = document.querySelector("#purchaseOptions");

            for(let item of data.merchant.inventory){
                let checkDiv = document.createElement("div");
                checkDiv.classList = "checkboxDiv";
                purchasesDiv.appendChild(checkDiv);

                let checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.id = `${item.ingredient.name}PurchaseCheckbox`;
                checkbox._id = item.ingredient._id;
                checkbox.name = item.ingredient.name;
                checkbox.onchange = ()=>{
                    if(checkbox.checked){
                        let from, to;
                        [from, to] = getInputDates("purchase");

                        this.graph.addData(this.formatData(item.ingredient._id, from, to), [from, to], item.ingredient.name);
                    }else{
                        this.graph.removeData(item.ingredient.name);
                    }
                };
                checkDiv.appendChild(checkbox);

                let label = document.createElement("label");
                label.innerText = item.ingredient.name;
                label.setAttribute("for", `${item.ingredient.name}PurchaseCheckbox`);
                checkDiv.appendChild(label);
            }

            this.graph = new LineGraph(
                document.querySelector("#purchaseStrand canvas"),
                "Quantity",
                "Date"
            );

            this.isPopulated = true;
        }

        if(ingredient){
            this.graph.clearData();

            let from, to;
            [from, to] = getInputDates("purchase");

            this.graph.addData(this.formatData(ingredient.id, from, to), [from, to], ingredient.name);

            for(let label of document.querySelector("#purchaseOptions").children){
                if(label.innerText === ingredient.name){
                    label.children[0].checked = true;
                }else{
                    label.children[0].checked = false;
                }
            }
        }
    },

    //TODO This can be made to be faster, no need to search full data list
    formatData: function(id, from, to){
        let dateRange = Math.floor((Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) - Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) / (1000 * 60 * 60 * 24)) + 1;
        let dataList = new Array(Math.abs(dateRange)).fill(0);
        
        for(let purchase of data.purchases){
            let diff = Math.floor((Date.UTC(purchase.date.getFullYear(), purchase.date.getMonth(), purchase.date.getDate()) - Date.UTC(to.getFullYear(), to.getMonth(), to.getDate())) / (1000 * 60 * 60 * 24));

            for(let ingredient of purchase.ingredients){
                if(purchase.date > from && diff <=0 && id === ingredient.ingredient){
                    dataList[dateRange - Math.abs(diff) - 1] += ingredient.quantity;
                }
            }
        }

        return dataList;
    },

    newDates: function(){
        let from, to;
        [from, to] = getInputDates("purchase");

        if(validator.transaction.date(from, to)){
            fetchData(from, to, ()=>{
                this.graph.clearData();

                let purchaseDiv = document.querySelector("#purchaseOptions");
                for(let div of purchaseDiv.children){
                    let checkbox = div.children[0];
                    if(checkbox.checked){
                        this.graph.addData(this.formatData(checkbox._id, from, to), [from, to], checkbox.name);
                    }
                }
            });
        }
    }
}