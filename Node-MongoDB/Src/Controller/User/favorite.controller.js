const FavoriteServieces = require("../../Service/favorite.service");
const response = require("../../Helpers/response");
const favoriteService = new FavoriteServieces();

const handleError = (res) => {
    return response.reply(res, 500, true, 'Internal Server Error...');
};

// ADD NEW FAVORITE
exports.addNewFavorite = async (req, res) => {
  try {
    let favorite = await favoriteService.getFavorite({
      product: req.body.product,
      user: req.user._id,
      isDelete: false,
    });
    if (favorite) {
      return response.reply(res , 400 , true , 'Favorite Already Exist...');
    }
    favorite = await favoriteService.addNewFavorite({ ...req.body, user: req.user._id });
    return response.reply(res , 201 , false , 'Favorite Added SuccessFully...' , favorite);
  } catch (error) {
    return handleError(res, error);
  }
};

// GET ALL FAVORITE
exports.getAllFavorite = async (req, res) => {
  try {
    let favorite = await favoriteService.getAllFavorite(req.query);
    return response.reply(res , 200 , false , 'Favorite Retrieved SuccessFully...' , favorite);
  } catch (error) {
    return handleError(res, error);
  }
};

// DELETE FAVORITE
exports.deleteFavorite = async (req, res) => {
  try {
    let favorite = await favoriteService.getFavoriteById(req.query.favoriteId);
    if (!favorite) {
      return response.reply(res , 404 , true , 'Favorite Not Found...');
    }
    favorite = await favoriteService.updateFavorite(favorite._id, {
      isDelete: true,
    });
    return response.reply(res , 200 , false , 'Favorite Deleted SuccessFully...' , favorite);
  } catch (error) {
    return handleError(res, error);
  }
};