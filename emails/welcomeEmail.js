module.exports = (data)=>{
    return `
        <div id="welcomeEmail">
            <header style="width:100%;height:75px;background:rgb(0,27,45);">
                <img src="https://i.postimg.cc/dQky3vPX/logo.png" alt="Subline Logo" style="height:50px;padding:12px 12px;float:left;">

                <h3 style="color:rgb(255,99,107);font-size:30px;margin:15px 0 0 0;float:left;">THE SUBLINE</h3>
            </header>

            <h1 style="text-align:center;">Welcome to The Subline ${data.name}!</h1>

            <p>We are glad to have you aboard and look forward to helping your business improve efficiency and cut costs.</p>

            <p>Please follow the link below to verify your email address:</p>

            <p>${data.link}</p>
        </div>
    `;
}