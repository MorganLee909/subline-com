let controller = {
    publicStrand: document.getElementById("publicStrand"),
    loginStrand: document.getElementById("loginStrand"),
    registerStrand: document.getElementById("registerStrand"),

    onStart: function(){
        if(error){
            let bannerContainer = document.getElementById("bannerContainer");
            let banner = document.getElementById("banner").content.children[0].cloneNode(true);
            banner.children[0].style.backgroundColor = "rgb(200, 0, 0)";
            banner.children[0].children[0].style.display = "block";
            banner.children[1].innerText = error;
            bannerContainer.appendChild(banner);

            let timer = setTimeout(()=>{
                bannerContainer.removeChild(banner);
            }, 10000);

            banner.children[2].addEventListener("click", ()=>{
                bannerContainer.removeChild(banner);
                clearTimeout(timer);
            });
        }

        publicObj.display();
    },

    clearScreen: function(){
        this.publicStrand.style.display = "none";
        this.loginStrand.style.display = "none";
        this.registerStrand.style.display = "none";
    }
}

controller.onStart();