let date = new Date();
let yearAgo = new Date(date.getFullYear() - 1, date.getMonth(), date.getDate());

let onDataLoad = function(){
    let dateSort = document.querySelector("#dateSort");
    dateSort.onclick = ()=>{window.homeObj.newDates()};
    dateSort.classList = "button";
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