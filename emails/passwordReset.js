module.exports = (data)=>{
    return `
    <div id="passwordReset">
        <header style="width:100%;height:75px;background:rgb(0,27,45);">
            <img src="https://i.postimg.cc/dQky3vPX/logo.png" alt="Subline Logo" style="height:50px;padding:12px 12px;float:left;">

            <h3 style="color:rgb(255,99,107);font-size:30px;margin:15px 0 0 0;float:left;">THE SUBLINE</h3>
        </header>

        <h1 style="text-align:center;">Password Resest for ${data.name}</h1>

        <p>Follow the link below to go to reset your password.</p>

        <p>${data.link}</p>
    </div>
    `;
}