'use strict';

var moment = require('moment');
var http     = require('http'),
    express  = require('express'),
    mysql    = require('mysql'),
    parser   = require('body-parser'),
    session = require('express-session'),
    nodemailer = require('nodemailer'),
    https   = require('https'),
    request = require('request-promise');

const config = require('../../config.js');
var async = require('async');
var app = express();

const dotenv = require('dotenv').config();
const crypto = require('crypto');
const cookie = require('cookie');
const nonce = require('nonce')();
const querystring = require('querystring');


app.use(function(req, res, next) {
 res.header('Access-Control-Allow-Origin', '*');
 res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
 res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
 next();

});

exports.createMerchant = function(args, res, next) {
  /**
   * Merchant sign up
   * Sign up page for Merchant account
   *
   * body Merchant Created merchant object
   * no response value expected for this operation
   **/

   var response = {};
   if(
     typeof args.body.email !== 'undefined' || args.body.shopName !== 'undefined'
   ){
     var companyName = args.body.companyName,
         shopName = args.body.shopName,
         firstName = args.body.firstName,
         lastName = args.body.lastName,
         email = args.body.email,
         password = args.body.currentPassword,
         category = args.body.category,
         productID = args.body.productID,
         priceSegmentID = args.body.priceSegmentID,
         targetAudience = args.body.targetAudience,
         webUrl = args.body.webUrl,
         streetAddress = args.body.streetAddress,
         city = args.body.city,
         zipCode = args.body.zipCode,
         countryID = args.body.countryID,
         stateID = args.body.stateID,
         phoneNumber = args.body.phoneNumber,
         planID = args.body.planID,
         createDate = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
         
      let insertMerchantID;
      connection.query('INSERT INTO tbl_merchant (CompanyName, ShopName, FirstName, LastName, Password, Email, WebUrl, ProductID, PriceSegmentID, TargetAudience, StreetAddress, City, zipCode, CountryID, StateID, PhoneNumber, PlanID, CreateDate )\
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
           [companyName, shopName, firstName, lastName, password, email, webUrl, productID, priceSegmentID, targetAudience, streetAddress, city, zipCode, countryID, stateID, phoneNumber, planID, createDate],
          function(err,result){
            if(!err){
              if(result.affectedRows != 0){
                insertMerchantID = result.insertId;
                if(category){
                  for(var i = 0; i < category.length;i++){
                    connection.query('INSERT INTO tbl_merchant_category (MerchantID, CategoryID, CreateDate )\
                       VALUES (?,?)',
                       [insertMerchantID,category[i],moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')],
                      function(err,result){
                        if(!err){
                            
                        }else{
                          
                        }
                    });
                  }
                }
                response.result = 'success';
                response.msg = 'New merchant created';
              }else{
                response.result = 'error';
                response.msg = 'Something is wrong. Please try again later';
              }
              res.setHeader('Content-Type', 'application/json');
              res.status(200).send(JSON.stringify(response));
            }else{
              console.log("err", err);
              console.log("errresult", result);
              res.status(400).send(err);
            }
        });
      
   }
   else{
     response.result = 'error';
     response.msg = 'Please fill required details';
     res.setHeader('Content-Type', 'application/json');
     res.status(200).send(JSON.stringify(response));
   }
  
}

exports.getCategories = function(args, res, next) {
  /**
   * Get the list of all categories 
   * 
   * returns Categories
   **/
   var response = {};
   connection.query('SELECT * from tbl_category', function(err,result,fields){
     if(!err){

       console.log("What is result.length??")
       console.log(result.length);

       if(result.length !=0){
         response = {'result' : 'success', 'data' : result};
         console.log(response);
         res.setHeader('Content-Type', 'application/json');
         res.status(200).send(JSON.stringify(response));
       }
       else{
         response = {'result' : 'error', 'msg' : 'No results found'};
         res.setHeader('Content-Type', 'application/json');
         res.status(200).send(JSON.stringify(response));
       }
     } else{
         res.status(400).send(err);
     }
  });

}

exports.getProducts = function(args, res, next) {
  /**
   * Get the list of all products 
   * 
   * returns Products
   **/
   var response = {};
   connection.query('SELECT * from tbl_product', function(err,result,fields){
     if(!err){

       console.log("What is result.length??")
       console.log(result.length);

       if(result.length !=0){
         response = {'result' : 'success', 'data' : result};
         console.log(response);
         res.setHeader('Content-Type', 'application/json');
         res.status(200).send(JSON.stringify(response));
       }
       else{
         response = {'result' : 'error', 'msg' : 'No results found'};
         res.setHeader('Content-Type', 'application/json');
         res.status(200).send(JSON.stringify(response));
       }
     } else{
         res.status(400).send(err);
     }
  });

}

exports.getPriceSegment = function(args, res, next) {
  /**
   * Get the list of all price segment
   * 
   * returns price segment
   **/
   var response = {};
   connection.query('SELECT * from  tbl_pricesegment', function(err,result,fields){
     if(!err){

       console.log("What is result.length??")
       console.log(result.length);

       if(result.length !=0){
         response = {'result' : 'success', 'data' : result};
         console.log(response);
         res.setHeader('Content-Type', 'application/json');
         res.status(200).send(JSON.stringify(response));
       }
       else{
         response = {'result' : 'error', 'msg' : 'No results found'};
         res.setHeader('Content-Type', 'application/json');
         res.status(200).send(JSON.stringify(response));
       }
     } else{
         res.status(400).send(err);
     }
  });

}

exports.getPlans = function(args, res, next) {
  /**
   * Get the list of all Billing Plans
   * 
   * returns Plans
   **/
   var response = {};
   connection.query('SELECT * from  tbl_plan', function(err,result,fields){
     if(!err){

       console.log("What is result.length??")
       console.log(result.length);

       if(result.length !=0){
         response = {'result' : 'success', 'data' : result};
         console.log(response);
         res.setHeader('Content-Type', 'application/json');
         res.status(200).send(JSON.stringify(response));
       }
       else{
         response = {'result' : 'error', 'msg' : 'No results found'};
         res.setHeader('Content-Type', 'application/json');
         res.status(200).send(JSON.stringify(response));
       }
     } else{
         res.status(400).send(err);
     }
  });

}

exports.getCountry = function(args, res, next) {
  /**
   * Get the list of all country 
   * 
   * returns Country
   **/
   var response = {};
   connection.query('SELECT * from  tbl_country', function(err,result,fields){
     if(!err){

       console.log("What is result.length??")
       console.log(result.length);

       if(result.length !=0){
         response = {'result' : 'success', 'data' : result};
         console.log(response);
         res.setHeader('Content-Type', 'application/json');
         res.status(200).send(JSON.stringify(response));
       }
       else{
         response = {'result' : 'error', 'msg' : 'No results found'};
         res.setHeader('Content-Type', 'application/json');
         res.status(200).send(JSON.stringify(response));
       }
     } else{
         res.status(400).send(err);
     }
  });

}

exports.getStateByCountry = function(args, res, next) {
  /**
   * Get the list of all states by country code
   * 
   * returns Products
   **/
   var countryCode = /[^/]*$/.exec(args.url)[0];
   var response = {};
   connection.query('SELECT tbl_state.*,tbl_country.CountryCode from  tbl_country JOIN tbl_state ON tbl_state.CountryID = tbl_country.CountryID where tbl_country.countryCode = ?', countryCode, function(err,result,fields){
     if(!err){
       if(result.length !=0){
         response = {'result' : 'success', 'data' : result};
         res.setHeader('Content-Type', 'application/json');
         res.status(200).send(JSON.stringify(response));
       }
       else{
         response = {'result' : 'error', 'msg' : 'No results found'};
         res.setHeader('Content-Type', 'application/json');
         res.status(200).send(JSON.stringify(response));
       }
     } else{
         res.status(400).send(err);
     }
  });

}

exports.generateAccessToken = function(args, res, next) {
 
  var response = {};
  // Generate access token from this url
  var shop = /[^/]*$/.exec(args.url)[0]+'.myshopify.com';
  
  var url = HOSTNAME+"/shopify?shop="+shop+""; // Replace this with your HTTPS Forwarding address
  response.result = 'success';
  response.msg = 'Access this url in browser to generate access token -> '+url+'';
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify(response));
  
}

exports.getAccessToken = function(args, res, next) {
  
  var response = {};
  // Get access token from database by shop name and display
  var shop = /[^/]*$/.exec(args.url)[0];
  connection.query('SELECT * from tbl_merchant where ShopName = ?', shop, function(err,result,fields){
    if(!err && result.length > 0){
        if(result[0].AccessToken != ''){
          response.result = 'success';
          response.accessToken = result[0].AccessToken;
        }else{
          response.result = 'error';
          response.accessToken = 'AccessToken not generated yet or Invalid shop name';
        }
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).send(JSON.stringify(response));
    }else{
      response.result = 'error';
      response.msg = 'Shop not found or Invalid shop name';
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(400).send(JSON.stringify(response));
    }
  });

}
