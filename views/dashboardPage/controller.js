/* 
Switches to a different strand
Input:
 name: name of the strand.  Must end with "Strand"
*/
let changeStrand = (name)=>{
    closeSidebar();

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

//Close any open sidebar
let closeSidebar = ()=>{
    let sidebar = document.querySelector("#sidebarDiv");
    for(let i = 0; i < sidebar.children.length; i++){
        sidebar.children[i].style.display = "none";
    }
    sidebar.classList = "sidebarHide";
}

/*
Open a specific sidebar
Input:
 sidebar: the outermost element of the sidebar (must contain class sidebar)
*/
let openSidebar = (sidebar)=>{
    document.querySelector("#sidebarDiv").classList = "sidebar";

    let sideBars = document.querySelector("#sidebarDiv").children;
    for(let i = 0; i < sideBars.length; i++){
        sideBars[i].style.display = "none";
    }

    sidebar.style.display = "flex";
}

homeStrandObj.display();