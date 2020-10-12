module.exports = (data)=>{
    return `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <meta content="width=device-width, initial-scale=1" name="viewport"/>
                <title>Welcome to The Subline</title>
                <link href="https://fonts.googleapis.com/css?family=Saira&display=swap" rel="stylesheet">
                <style>
                    *{margin:0;padding:0;font-family:"Saira",sans-serif;}
        
                    .header{
                        display: flex;
                        justify-content: flex-start;
                        align-items: center;
                        height: 75px;
                        width: 100%;
                        background: rgb(0, 27, 45);
                        color: rgb(255, 99, 107);
                    }
        
                    .header img{
                        max-height: 80%;
                    }
        
                    .message{
                        width: 90%;
                        margin: auto;
                        text-align: center;
                        padding: 100px 0;
                        font-size: 30px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <img src="localhost:8080/logo" alt="The Subline">
                    
                    <h1>THE SUBLINE</h1>
                </div>
        
                <p class="message">Thank you for signing up for The Subline ${data.name}.  We look forward to helping your business to reduce waste.  To get started, visit our <a href="thesubline.com/help">help page</a> for more information.</p>
            </body>
        </html>
    `;
}