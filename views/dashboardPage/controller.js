let changeStrand = (name)=>{
    for(let strand of document.querySelectorAll(".strand")){
        strand.style.display = "none";
    }

    for(let button of document.querySelectorAll(".menu > button")){
        button.classList = "";
        button.onclick = ()=>{changeStrand(`${button.id.slice(0, button.id.indexOf("Btn"))}Strand`)};
    }

    let activeButton = document.querySelector(`#${name.slice(0, name.indexOf("Strand"))}Btn`);
    activeButton.classList = "active";
    activeButton.onclick = undefined;

    document.querySelector(`#${name}`).style.display = "flex";
    window[`${name}Obj`].display();
}

let dateIndices = (from, to = new Date())=>{
    let indices = [];

    for(let i = 0; i < transactions.length; i++){
        if(transactions[i].date > from){
            indices[0] = i;
            break;
        }
    }

    for(let i = transactions.length - 1; i >=0; i--){
        if(transactions[i].date < to){
            indices[1] = i;
            break;
        }
    }

    return indices;
}

for(let transaction of transactions){
    transaction.date = new Date(transaction.date);
}

homeStrandObj.display();