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

    if(window.screen.availWidth <= 1000){
        closeMenu();
    }
}

//Close any open sidebar
let closeSidebar = ()=>{
    let sidebar = document.querySelector("#sidebarDiv");
    for(let i = 0; i < sidebar.children.length; i++){
        sidebar.children[i].style.display = "none";
    }
    sidebar.classList = "sidebarHide";

    if(window.screen.availWidth <= 1000){
        document.querySelector(".contentBlock").style.display = "flex";
        document.getElementById("mobileMenuSelector").style.display = "block";
        document.getElementById("sidebarCloser").style.display = "none";
    }
    
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

    if(window.screen.availWidth <= 1000){
        document.querySelector(".contentBlock").style.display = "none";
        document.getElementById("mobileMenuSelector").style.display = "none";
        document.getElementById("sidebarCloser").style.display = "block";
    }
}

let changeMenu = ()=>{
    let menu = document.querySelector(".menu");
    let buttons = document.querySelectorAll(".menu > button");
    if(!menu.classList.contains("menuMinimized")){
        menu.classList = "menu menuMinimized";

        for(let button of buttons){
            button.children[1].style.display = "none";
        }

        document.querySelector(".logout p").style.display = "none"

        document.querySelector("#max").style.display = "none";
        document.querySelector("#min").style.display = "flex";

        
    }else if(menu.classList.contains("menuMinimized")){
        menu.classList = "menu";

        for(let button of buttons){
            button.children[1].style.display = "block";
        }

        document.querySelector(".logout p").style.display = "flex"

        setTimeout(()=>{
            document.querySelector("#max").style.display = "flex";
            document.querySelector("#min").style.display = "none";
        }, 150);
    }
}

let openMenu = ()=>{
    document.getElementById("menu").style.display = "flex";
    document.querySelector(".contentBlock").style.display = "none";
    document.getElementById("mobileMenuSelector").onclick = ()=>{closeMenu()};
}

let closeMenu = ()=>{
    document.getElementById("menu").style.display = "none";
    document.querySelector(".contentBlock").style.display = "flex";
    document.getElementById("mobileMenuSelector").onclick = ()=>{openMenu()};
}

if(window.screen.availWidth > 1000 && window.screen.availWidth <= 1400){
    changeMenu();
    document.getElementById("menuShifter2").style.display = "none";
}
homeStrandObj.display();