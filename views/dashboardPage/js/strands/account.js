let account = {
    display: function(){
        document.getElementById("accountStrandTitle").innerText = merchant.name;
        document.getElementById("accountShowPassword").onclick = ()=>{this.togglePassword()};
    },

    togglePassword: function(){
        let passBox = document.getElementById("changePasswordBox");
        let button = document.getElementById("accountShowPassword");

        if(passBox.style.display === "none"){
            passBox.style.display = "flex";
            button.innerText = "HIDE PASSWORD";
        }else{
            passBox.style.display = "none";
            button.innerText = "CHANGE PASSWORD";
            document.getElementById("accountCurrentPassword").value = "";
            document.getElementById("accountNewPassword").value = "";
            document.getElementById("accountConfirmPassword").value = "";
        }
    }
}

module.exports = account;