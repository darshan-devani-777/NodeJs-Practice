const Favorite = require('../Model/favorite.model');

module.exports = class FavoriteServieces {

    // ADD NEW FAVORITE
    addNewFavorite = async(body) => {
        return await Favorite.create(body);
    }

    // GET ALL FAVORITE
    async getAllFavorite(query) {
        try {
            let find = [
                { $match: { isDelete: false}}
            ];
            let result = await Favorite.aggregate(find);
            return result;
        } catch (error) {
            return error.message;
        }
    };

    // UPDATE FAVORITE
    updateFavorite = async(id , body) => {
        return await Favorite.findByIdAndUpdate(id , {$set:body} , {new:true});
    };

    // GET SPECIFIC FAVORITE
    getFavorite = async(body) => {
        return await Favorite.findOne(body);
    };

    // GET FAVORITE BY ID
    getFavoriteById = async(id) => {
        return await Favorite.findById(id);
    };
}