module.exports = {
    privacy: function(req, res){
        return res.render("informationPages/privacyPolicy");
    },

    terms: function(req, res){
        return res.render("informationPages/terms");
    }
}