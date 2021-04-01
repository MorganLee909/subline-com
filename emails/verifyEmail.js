module.exports = (data)=>{
    return `
        <div id="verifyEmail">
            <p>This email is to verify the account for ${data.name} on The Subline.</p>
            
            <p>Please use the following link to verify your email:</p>
            <a href="${data.link}">${data.link}</a>

            <p>Thank you for using The Subline</p>
            <p>-Lee Morgan</p>
        </div>
    `;
}