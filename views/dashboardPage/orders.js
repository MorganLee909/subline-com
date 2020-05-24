window.ordersStrandObj = {
    isPopulated: false,

    display: function(){
        if(!this.isPopulated){
            fetch("/orders", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
            })
                .then((response) => response.json())
                .then((response)=>{
                    if(typeof(response) === "string"){
                        banner.createError(response);
                    }else{
                        
                    }
                })
                .catch((err)=>{
                    banner.createError("Unable to retrieve your orders at the moment");
                });
        }
    }
}