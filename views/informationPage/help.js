window.helpObj = {
    display: function(){
        document.querySelector("#legalStrand").style.display = "none";
        document.querySelector("#helpStrand").style.display = "flex";

        let button = document.getElementById("logInButton");
        button.innerText="LEGAL";
        button.onclick = ()=>{legalObj.display()};
    }
}