class StrandSelector extends HTMLElement{
    constructor(){
        super();
    }

    connectedCallback(){
        setTimeout(()=>{
            let firstStrand = document.querySelector(".strand");
            this.setAttribute("strand", firstStrand.id.slice(0, firstStrand.id.indexOf("Strand")));
            window[`${firstStrand.id.slice(0, firstStrand.id.indexOf("Strand"))}Obj`].display();

            let strands = document.querySelectorAll(".strand");
            for(let strand of strands){
                let selector = document.createElement("button");
                selector.strandName = strand.id;
                selector.innerText = strand.id.slice(0, strand.id.indexOf("Strand")).toUpperCase();
                this.appendChild(selector);
            }

            strands[0].style.display = "flex";
        })
    }

    static get observedAttributes(){
        return ["strand"];
    }

    attributeChangedCallback(){
        setTimeout(()=>{
            let buttons = this.querySelectorAll("button");

            for(let button of buttons){
                if(button.innerText.toLowerCase() === this.getAttribute("strand").toLowerCase()){
                    button.style.borderBottom = "3px solid black";
                    button.style.cursor = "pointer";
                }else{
                    button.style.borderBottom = "none";
                    button.style.cursor = "pointer";
                    button.onclick = ()=>{
                        this.setAttribute("strand", button.strandName.slice(0, button.strandName.indexOf("Strand")));

                        window[`${button.strandName.slice(0, button.strandName.indexOf("Strand"))}Obj`].display();
                    }
                }
            }
        })
    }
}

customElements.define("strand-selector", StrandSelector);

let actions = document.querySelectorAll(".action");
for(let action of actions){
    action.display = ()=>{window[`${action.id.slice(0, action.id.indexOf("Action"))}Obj`].display();};
}

let strands = document.querySelectorAll(".strand");
for(let strand of strands){
    strand.display = ()=>{window[`${strand.id.slice(0, strand.id.indexOf("Strand"))}Obj`].display();};
}

window.clearScreen = ()=>{
    let subpages = document.querySelectorAll(".strand, .action");
    for(let subpage of subpages){
        subpage.style.display = "none";
    }
}