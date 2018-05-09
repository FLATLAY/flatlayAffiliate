'use strict';

var moment = require('moment');
var http     = require('http'),
    express  = require('express'),
    mysql    = require('mysql'),
    parser   = require('body-parser'),
    session = require('express-session'),
    nodemailer = require('nodemailer'),
    https   = require('https'),
    request = require('request');

const config = require('../../config.js');
var async = require('async');
var app = express();

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

   var response = [];
   if(
     typeof args.body.email !== 'undefined'
   ){
     var companyName = args.body.companyName,
         firstName = args.body.firstName,
         lastName = args.body.lastName,
         email = args.body.email,
         password = args.body.currentPassword,
         category = args.body.category,
         productsID = args.body.productsID,
         priceSegmentID = args.body.priceSegmentID,
         targetAudience = args.body.targetAudience,
         webUrl = args.body.webUrl,
         streetAddress = args.body.streetAddress,
         city = args.body.city,
         zipcode = args.body.zipcode,
         countryID = args.body.countryID,
         stateID = args.body.stateID,
         phoneNumber = args.body.phoneNumber,
         planID = args.body.planID,
         createDate = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
         
      let insertMerchantID;
      connection.query('INSERT INTO tbl_merchant (CompanyName, FirstName, LastName, Password, Email, WebUrl, ProductsID, PriceSegmentID, TargetAudience, StreetAddress, City, Zipcode, CountryID, StateID, PhoneNumber, PlanID, CreateDate )\
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
           [companyName, firstName, lastName, password, email, webUrl, productsID, priceSegmentID, targetAudience, streetAddress, city, zipcode, countryID, stateID, phoneNumber, planID, createDate],
          function(err,result){
            if(!err){
              if(result.affectedRows != 0){
                insertMerchantID = result.insertId;
                for(var i = 0; i < category.length;i++){
                  connection.query('INSERT INTO tbl_merchant_categories (MerchantID, CategoryID )\
                     VALUES (?,?)',
                     [insertMerchantID,category[i]],
                    function(err,result){
                      if(!err){
                        
                      }else{
                        
                      }
                  });
                }
                
              }else{
                response.push({'msg' : 'No Result Found'});
              }
              response.push({'result' : 'success','data':{ 'msg': 'New merchant created' } });
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
     response.push({'result' : 'error', 'msg' : 'Please fill required details'});
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
   var response = [];
   connection.query('SELECT * from tbl_category', function(err,result,fields){
     if(!err){

       console.log("What is result.length??")
       console.log(result.length);

       if(result.length !=0){
         response.push({'result' : 'success', 'data' : result});
         console.log(response);
         res.setHeader('Content-Type', 'application/json');
         res.status(200).send(JSON.stringify(response));
       }
       else{
         response.push({'result' : 'error', 'msg' : 'No results found'});
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
   var response = [];
   connection.query('SELECT * from tbl_products', function(err,result,fields){
     if(!err){

       console.log("What is result.length??")
       console.log(result.length);

       if(result.length !=0){
         response.push({'result' : 'success', 'data' : result});
         console.log(response);
         res.setHeader('Content-Type', 'application/json');
         res.status(200).send(JSON.stringify(response));
       }
       else{
         response.push({'result' : 'error', 'msg' : 'No results found'});
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
   * Get the list of all products 
   * 
   * returns Products
   **/
   var response = [];
   connection.query('SELECT * from  tbl_pricesegment', function(err,result,fields){
     if(!err){

       console.log("What is result.length??")
       console.log(result.length);

       if(result.length !=0){
         response.push({'result' : 'success', 'data' : result});
         console.log(response);
         res.setHeader('Content-Type', 'application/json');
         res.status(200).send(JSON.stringify(response));
       }
       else{
         response.push({'result' : 'error', 'msg' : 'No results found'});
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
   var response = [];
   connection.query('SELECT * from  tbl_plans', function(err,result,fields){
     if(!err){

       console.log("What is result.length??")
       console.log(result.length);

       if(result.length !=0){
         response.push({'result' : 'success', 'data' : result});
         console.log(response);
         res.setHeader('Content-Type', 'application/json');
         res.status(200).send(JSON.stringify(response));
       }
       else{
         response.push({'result' : 'error', 'msg' : 'No results found'});
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
   * Get the list of all products 
   * 
   * returns Products
   **/
   var response = [];
   connection.query('SELECT * from  tbl_country', function(err,result,fields){
     if(!err){

       console.log("What is result.length??")
       console.log(result.length);

       if(result.length !=0){
         response.push({'result' : 'success', 'data' : result});
         console.log(response);
         res.setHeader('Content-Type', 'application/json');
         res.status(200).send(JSON.stringify(response));
       }
       else{
         response.push({'result' : 'error', 'msg' : 'No results found'});
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
   var response = [];
   connection.query('SELECT * from  tbl_state where countryCode = ?', countryCode, function(err,result,fields){
     if(!err){

       console.log("What is result.length??")
       console.log(result.length);

       if(result.length !=0){
         response.push({'result' : 'success', 'data' : result});
         console.log(response);
         res.setHeader('Content-Type', 'application/json');
         res.status(200).send(JSON.stringify(response));
       }
       else{
         response.push({'result' : 'error', 'msg' : 'No results found'});
         res.setHeader('Content-Type', 'application/json');
         res.status(200).send(JSON.stringify(response));
       }
     } else{
         res.status(400).send(err);
     }
  });

}
