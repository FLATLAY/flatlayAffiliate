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
      var shopName = args.body.shopName;
      // check if shop already exist
      connection.query('SELECT * from tbl_merchant where ShopName = ?', shopName, function(err,result,fields){
        if(!err && result.length > 0){
          updateExistingMerchant(args.body,res);
        }else{
          insertNewMerchant(args.body,res);
        }
      });
   }
   else{
     response.result = 'error';
     response.msg = 'Please fill required details';
     res.setHeader('Content-Type', 'application/json');
     return res.status(200).send(JSON.stringify(response));
   }
  
}

function insertNewMerchant(data,res){
  var response = {};
  let query,insertMerchantID;
  var companyName = data.companyName,
         shopName = data.shopName,
         firstName = data.firstName,
         lastName = data.lastName,
         email = data.email,
         password = data.currentPassword,
         category = data.category,
         productID = data.productID,
         priceSegmentID = data.priceSegmentID,
         targetAudience = data.targetAudience,
         webUrl = data.webUrl,
         streetAddress = data.streetAddress,
         city = data.city,
         zipCode = data.zipCode,
         countryID = data.countryID,
         stateID = data.stateID,
         phoneNumber = data.phoneNumber,
         planID = data.planID,
         createDate = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
  
  query = 'INSERT INTO tbl_merchant (CompanyName, ShopName, FirstName, LastName, Password, Email, WebUrl, ProductID, PriceSegmentID, TargetAudience, StreetAddress, City, zipCode, CountryID, StateID, PhoneNumber, PlanID, CreateDate )\
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';

  connection.query(query,
             [companyName, shopName, firstName, lastName, password, email, webUrl, productID, priceSegmentID, targetAudience, streetAddress, city, zipCode, countryID, stateID, phoneNumber, planID, createDate],
            function(err,result){
              if(!err){
                  insertMerchantID = result.MerchantID;
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
                  res.setHeader('Content-Type', 'application/json');
                  return res.status(200).send(JSON.stringify(response));
              }else{
                console.log("err", err);
                console.log("errresult", result);
                return res.status(400).send(err);
              }
          });
}

function updateExistingMerchant(data,res){
  var response = {};
  let query,insertMerchantID;
  var companyName = data.companyName,
         shopName = data.shopName,
         firstName = data.firstName,
         lastName = data.lastName,
         email = data.email,
         password = data.currentPassword,
         category = data.category,
         productID = data.productID,
         priceSegmentID = data.priceSegmentID,
         targetAudience = data.targetAudience,
         webUrl = data.webUrl,
         streetAddress = data.streetAddress,
         city = data.city,
         zipCode = data.zipCode,
         countryID = data.countryID,
         stateID = data.stateID,
         phoneNumber = data.phoneNumber,
         planID = data.planID,
         updateDate = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
  
  query = 'UPDATE tbl_merchant SET CompanyName = ?,FirstName = ?,LastName = ?,Password = ?,Email = ?,WebUrl = ?, ProductID = ?, PriceSegmentID = ?, TargetAudience = ?, StreetAddress = ?,City = ?, zipCode = ?, CountryID = ?,StateID = ?, PhoneNumber = ?, PlanID = ?, UpdateDate = ? WHERE ShopName = "'+shopName+'"';

  connection.query(query,
             [companyName, firstName, lastName, password, email, webUrl, productID, priceSegmentID, targetAudience, streetAddress, city, zipCode, countryID, stateID, phoneNumber, planID, updateDate],
            function(err,result){
              if(!err){
                  connection.query('SELECT * from tbl_merchant where ShopName = ?', [shopName],function(err,result,fields){
                     if(!err && result.length !=0){
                        insertMerchantID = result.MerchantID;
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
                     }else{
                        response.result = 'success';
                        response.msg = 'New merchant created';
                        res.setHeader('Content-Type', 'application/json');
                        return res.status(200).send(JSON.stringify(response));
                     }
                  });
                  response.result = 'success';
                  response.msg = 'New merchant created';
                  res.setHeader('Content-Type', 'application/json');
                  return res.status(200).send(JSON.stringify(response));
              }else{
                console.log("err", err);
                console.log("errresult", result);
                return res.status(400).send(err);
              }
          });
}

exports.updateMerchant = function(args, res, next) {
  /**
   * Merchant sign up
   * Sign up page for Merchant account from shopify admin
   * Update merchant by shop name
   *
   * body Merchant Created merchant object with shop name
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
         updateDate = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
         
      let updateMerchantID;
      connection.query('UPDATE tbl_merchant SET CompanyName = ?,FirstName = ?,LastName = ?,Password = ?,Email = ?,UpdateDate = ? WHERE ShopName = ?', 
        [companyName,firstName,lastName,password,email,updateDate,shopName],
          function(err,result){
            console.log(result);
            if(!err){
              response.result = 'success';
              response.msg = 'Merchant Updated';
              res.setHeader('Content-Type', 'application/json');
              return res.status(200).send(JSON.stringify(response));
            }else{
              console.log("err", err);
              console.log("errresult", result);
              return res.status(400).send(err);
            }
        });
      
   }
   else{
     response.result = 'error';
     response.msg = 'Please fill required details';
     res.setHeader('Content-Type', 'application/json');
     return res.status(200).send(JSON.stringify(response));
   }
  
}

exports.connectAccount = function(args, res, next) {
  /**
   * Merchant connect account from shopify admin
   * Update merchant by shop name
   *
   * body shop name for which change account connection
   * no response value expected for this operation
   **/
   var shop = /[^/]*$/.exec(args.url)[0];
   var response = {};
     var updateDate = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
      connection.query('UPDATE tbl_merchant SET AccountConnection = 1,UpdateDate = ? WHERE ShopName = ?', 
        [updateDate,shop],
          function(err,result){
            console.log(this.sql);
            console.log(result);
            if(!err){
              if(result.affectedRows > 0){
                response.result = 'success';
                response.msg = 'Account disconnected sucessfully';
                res.setHeader('Content-Type', 'application/json');
                return res.status(200).send(JSON.stringify(response));
              }else{
                response.result = 'error';
                response.msg = 'Shop not found';
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).send(JSON.stringify(response));
              }
            }else{
              console.log("err", err);
              console.log("errresult", result);
              return res.status(400).send(err);
            }
        });
}

exports.disconnectAccount = function(args, res, next) {
  /**
   * Merchant disconnect account from shopify admin
   * Update merchant by shop name
   *
   * body shop name for which change account connection
   * no response value expected for this operation
   **/
   var shop = /[^/]*$/.exec(args.url)[0];
   var response = {};
     var updateDate = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
      connection.query('UPDATE tbl_merchant SET AccountConnection = 0,UpdateDate = ? WHERE ShopName = ?', 
        [updateDate,shop],
          function(err,result){
            console.log(this.sql);
            console.log(result);
            if(!err){
              if(result.affectedRows > 0){
                response.result = 'success';
                response.msg = 'Account disconnected sucessfully';
                res.setHeader('Content-Type', 'application/json');
                return res.status(200).send(JSON.stringify(response));
              }else{
                response.result = 'error';
                response.msg = 'Shop not found';
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).send(JSON.stringify(response));
              }
                
            }else{
              console.log("err", err);
              console.log("errresult", result);
              return res.status(400).send(err);
            }
            
        });
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
  connection.query('SELECT * from tbl_merchant where ShopName = ?  order by CreateDate desc limit 1', shop, function(err,result,fields){
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

exports.getShopDataByShopName = function(args, res, next) {
  
  var response = {};
  // Get access token from database by shop name and display
  var shop = /[^/]*$/.exec(args.url)[0];
  connection.query('SELECT * from tbl_merchant where ShopName = ?', shop, function(err,result,fields){
    if(!err && result.length > 0){
        response.result = 'success';
        response.data = result[0];
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).send(JSON.stringify(response));
    }else{
      response.result = 'error';
      response.data = 'Shop not found or Invalid shop name';
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(400).send(JSON.stringify(response));
    }
  });

}

exports.productListCount = function(args, res1, next){
  var response = {};
  // GET to token page then make call to http://127.0.0.1:10010/getAccessToken/
  //put token into request to shopify and return object 
  var shop = /[^/]*$/.exec(args.url)[0];
  var response = {};

  http.get('http://127.0.0.1:10010/getAccessToken/'+ shop, function(res2) {
    shop = shop+'.myshopify.com';
    res2.on('data', function (chunk) {
      var chunkObj = JSON.parse(chunk);
      if(chunkObj.result == 'success'){
        console.log(chunkObj.accessToken);
        const shopRequestUrl = 'https://' + shop + '/admin/products/count.json?published_status=published';
        const shopRequestHeaders = {
          'X-Shopify-Access-Token': chunkObj.accessToken,
        };
        request.get(shopRequestUrl, { headers: shopRequestHeaders })
        .then((shopResponse) => {
          res1.status(200).end(shopResponse);
        })
        .catch((error) => {
          res1.status(error.statusCode).send(error.error.error_description);
        });
      }else{
          res1.status(400).send(chunkObj.msg);
      }
    });

  }).on('error', function(e) {
    console.error(e);
  });
}

exports.productUnpubListCount = function(args, res1, next){
  var response = {};
  // GET to token page then make call to v1.flat-lay.com/externaltoken
  //put token into request to shopify and return object 
  var shop = /[^/]*$/.exec(args.url)[0];
  var response = {};

  http.get('http://127.0.0.1:10010/getAccessToken/'+ shop, function(res2) {
    shop = shop+'.myshopify.com';
    res2.on('data', function (chunk) {
      var chunkObj = JSON.parse(chunk);
      console.log(chunkObj.accessToken);
      const shopRequestUrl = 'https://' + shop + '/admin/products/count.json?published_status=unpublished';
      const shopRequestHeaders = {
        'X-Shopify-Access-Token': chunkObj.accessToken,
      };
      request.get(shopRequestUrl, { headers: shopRequestHeaders })
      .then((shopResponse) => {
        res1.status(200).end(shopResponse);
      })
      .catch((error) => {
        res1.status(error.statusCode).send(error.error.error_description);
      });
    });

  }).on('error', function(e) {
    console.error(e);
  });
}

exports.selectedPlan = function(args, res, next){
  var response = {};
  var shop = /[^/]*$/.exec(args.url)[0];

  connection.query('SELECT * from tbl_merchant where ShopName = ? AND AccountConnection = 1', shop, function(err,result,fields){
    if(!err && result.length > 0){
        response.result = 'success';
        response.data = {'planID':result[0].PlanID};
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).send(JSON.stringify(response));
    }else{
      response.result = 'error';
      response.data = 'Shop not found or Invalid shop name';
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(400).send(JSON.stringify(response));
    }
  });
}

exports.changePlan = function(args, res, next){
  var response = {};
  var shopName = args.body.shopName,
  planID = args.body.planID,
  updateDate = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
  // Get plans from plan table and check if provided plan id exist
  // If exist then update
  // Else display error
  connection.query('SELECT * from tbl_plan where PlanID = ?', planID, function(err,result,fields){
    if(!err && result.length > 0){
      console.log(this.sql);
        connection.query('UPDATE tbl_merchant SET PlanID = ?,UpdateDate = ? WHERE ShopName = ?', 
        [planID,updateDate,shopName],
          function(err,result){
            if(!err && result.affectedRows > 0){
              response.result = 'success';
              response.msg = 'Plan updated successfully';
              res.setHeader('Content-Type', 'application/json');
              return res.status(200).send(JSON.stringify(response));
            }else{
              console.log("err", err);
              console.log("errresult", result);
              response.result = 'error';
              response.msg = 'Shop not found';
              return res.status(400).send(JSON.stringify(response) + err);
            }
        });
    }else{
      response.result = 'error';
      response.data = 'Plan not exist';
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(400).send(JSON.stringify(response));
    }
  });
}
