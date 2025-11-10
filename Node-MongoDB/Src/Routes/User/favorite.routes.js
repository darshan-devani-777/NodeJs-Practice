const express = require('express');
const FavoriteRoutes = express.Router();
const {userVerifyToken} = require('../../Helpers/user.VerifyToken');

const { addNewFavorite,  deleteFavorite, getAllFavorite } = require('../../Controller/User/favorite.controller');

// ADD NEW FAVORITE
FavoriteRoutes.post('/add-New-Favorite' , userVerifyToken ,  addNewFavorite);

// GET ALL FAVORITE
FavoriteRoutes.get('/get-All-Favorite', userVerifyToken, getAllFavorite);

// DELETE FAVORITE
FavoriteRoutes.delete('/delete-Favorite' , userVerifyToken , deleteFavorite);

module.exports = FavoriteRoutes;