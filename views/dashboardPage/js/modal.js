let modal = {
    feedback: function(){
        let form = document.getElementById("modalFeedback");
        form.style.display = "flex";

        let merchantInput = document.createElement("input");
        merchantInput.type = "hidden";
        merchantInput.name = "merchant";
        merchantInput.value = merchant.id;
        form.appendChild(merchantInput);

        let now = new Date();
        let dateInput = document.createElement("input");
        dateInput.type = "hidden";
        dateInput.name = "date";
        dateInput.value = now.getTime();
        form.appendChild(dateInput);
    }
};

module.exports = modal;