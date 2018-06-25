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

module.exports.validateCompanyName = function validateCompanyName (req, res, next) {
  User.validateCompanyName(req.swagger.params, res, next);
};

module.exports.loginUser = function loginUser (req, res, next) {
  User.loginUser(req.swagger.params, res, next);
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

module.exports.getMerchantData = function getMerchantData (req, res, next) {
  User.getMerchantData(req.swagger.params, res, next);
};

module.exports.addProduct = function addProduct (req, res, next) {
  User.addProduct(req.swagger.params, res, next);
};

module.exports.productList = function productList (req, res, next) {
  User.productList(req.swagger.params, res, next);
};

module.exports.productInfo = function productInfo (req, res, next) {
  User.productInfo(req.swagger.params, res, next);
};

module.exports.productListCount = function productListCount (req, res, next) {
  User.productListCount(req.swagger.params, res, next);
};

module.exports.productUnpubListCount = function productUnpubListCount (req, res, next) {
  User.productUnpubListCount(req.swagger.params, res, next);
};

module.exports.selectedPlan = function selectedPlan (req, res, next) {
  User.selectedPlan(req.swagger.params, res, next);
};

module.exports.changePlan = function changePlan (req, res, next) {
  User.changePlan(req.swagger.params, res, next);
};

module.exports.createCheckout = function createCheckout (req, res, next) {
  User.createCheckout(req.swagger.params, res, next);
};

module.exports.updateCheckout = function updateCheckout (req, res, next) {
  User.updateCheckout(req.swagger.params, res, next);
};

module.exports.getShippingRatesCheckout = function getShippingRatesCheckout (req, res, next) {
  User.getShippingRatesCheckout(req.swagger.params, res, next);
};

module.exports.putShippingRatesCheckout = function putShippingRatesCheckout (req, res, next) {
  User.putShippingRatesCheckout(req.swagger.params, res, next);
};

module.exports.createpayment = function createpayment (req, res, next) {
  User.createpayment(req.swagger.params, res, next);
};

module.exports.getpayment = function getpayment (req, res, next) {
  User.getpayment(req.swagger.params, res, next);
};

module.exports.addstripecard = function addstripecard (req, res, next) {
  User.addstripecard(req.swagger.params, res, next);
};

module.exports.saveBillingInfo = function saveBillingInfo (req, res, next) {
  User.saveBillingInfo(req.swagger.params, res, next);
};

module.exports.updateUserSocialChannels = function updateUserSocialChannels (req, res, next) {
  User.updateUserSocialChannels(req.swagger.params, res, next);
};

module.exports.createCampaign = function createCampaign (req, res, next) {
  User.createCampaign(req.swagger.params, res, next);
};

module.exports.viewCampaigns = function viewCampaigns (req, res, next) {
  User.viewCampaigns(req.swagger.params, res, next);
};

module.exports.viewClients = function viewClients (req, res, next) {
  User.viewClients(req.swagger.params, res, next);
};

module.exports = routes;
