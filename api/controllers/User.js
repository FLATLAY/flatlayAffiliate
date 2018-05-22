'use strict';

var url = require('url');
const routes = require('express').Router();
var User = require('./UserService');
var express = require('express');
var app = express();
app.use(function(req, res, next) {
 res.header('Access-Control-Allow-Origin', '*');
 res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
 res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
 next();

});

module.exports.createMerchant = function createMerchant (req, res, next) {
  User.createMerchant(req.swagger.params, res, next);
};

module.exports.updateMerchant = function updateMerchant (req, res, next) {
  User.updateMerchant(req.swagger.params, res, next);
};

module.exports.connectAccount = function connectAccount (req, res, next) {
  User.connectAccount(req.swagger.params, res, next);
};

module.exports.disconnectAccount = function disconnectAccount (req, res, next) {
  User.disconnectAccount(req.swagger.params, res, next);
};

module.exports.getCategories = function getCategories (req, res, next) {
  User.getCategories(req.swagger.params, res, next);
};

module.exports.getProducts = function getProducts (req, res, next) {
  User.getProducts(req.swagger.params, res, next);
};

module.exports.getPriceSegment = function getPriceSegment (req, res, next) {
  User.getPriceSegment(req.swagger.params, res, next);
};

module.exports.getPlans = function getPlans (req, res, next) {
  User.getPlans(req.swagger.params, res, next);
};

module.exports.getCountry = function getCountry (req, res, next) {
  User.getCountry(req.swagger.params, res, next);
};

module.exports.getStateByCountry = function getStateByCountry (req, res, next) {
  User.getStateByCountry(req.swagger.params, res, next);
};

module.exports.generateAccessToken = function generateAccessToken (req, res, next) {
  User.generateAccessToken(req.swagger.params, res, next);
};

module.exports.getAccessToken = function getAccessToken (req, res, next) {
  User.getAccessToken(req.swagger.params, res, next);
};

module.exports.getShopDataByShopName = function getShopDataByShopName (req, res, next) {
  User.getShopDataByShopName(req.swagger.params, res, next);
};

module.exports.productListCount = function productListCount (req, res, next) {
  User.productListCount(req.swagger.params, res, next);
};

module.exports.productUnpubListCount = function productUnpubListCount (req, res, next) {
  User.productUnpubListCount(req.swagger.params, res, next);
};


module.exports = routes;
