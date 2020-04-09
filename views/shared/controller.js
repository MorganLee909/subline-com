let changeStrand = (name)=>{
    for(let strand of document.querySelectorAll(".strand")){
        strand.style.display = "none";
    }

    document.querySelector(`#${name}`).style.display = "flex";
    window[`${name}Obj`].display();
}