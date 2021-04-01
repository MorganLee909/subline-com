module.exports = (data)=>{
    return `
        <p>Password Resest for ${data.name}</p>

        <p>Please follow the link below to reset your password:</p>

        <a href="${data.link}">${data.link}</a>
    `;
}