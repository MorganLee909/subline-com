window.dataLoaded = false;

let date = new Date();
let yearAgo = new Date(new Date().setFullYear(date.getFullYear() - 1));

let onDataLoad = function(){
    let dateSort = document.querySelector("#dateSort");
    dateSort.onclick = ()=>{window.homeObj.newDates()};
    dateSort.classList = "button";

    let ingredientsBody = document.querySelector("#ingredientsData tbody");
    for(let row of ingredientsBody.children){
        row.classList = "clickableRow";
        row.onclick = ()=>{window.ingredientObj.display("ingredient", row.ingredient)};
    }

    window.dataLoaded = true;
}

axios.post("/transactions", {from: yearAgo, to: date})
    .then((response)=>{
        if(typeof(response.data) === "string"){
            banner.createError(response.data);
        }else{
            data.transactions = response.data;
            onDataLoad();
        }
    })
    .catch((err)=>{
        console.log(err);
    });