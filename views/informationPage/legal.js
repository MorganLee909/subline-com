window.legalObj = {
    display: function(){
        document.querySelector("#legalStrand").style.display = "flex";
        document.querySelector("#helpStrand").style.display = "none";

        document.getElementById("joinButton").style.display = "none";
        let button = document.getElementById("logInButton");
        button.innerText="HELP";
        button.onclick = ()=>{helpObj.display()};
    }
}

legalObj.display();