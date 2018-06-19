'use strict';

var moment = require('moment');

var express  = require('express'),
    mysql    = require('mysql'),
    parser   = require('body-parser'),
    session = require('express-session'),
    nodemailer = require('nodemailer'),
    https   = require('https'),
    request = require('request-promise');
const config = require('../../config.js');
var app = express();

const dotenv = require('dotenv').config();
const crypto = require('crypto');
const cookie = require('cookie');
const nonce = require('nonce')();
const querystring = require('querystring');
var HOSTNAME = process.env.HOSTNAME;
if(HOSTNAME.indexOf('https') != -1){
  var http = require('https');
}else{
  var http = require('http');
}

app.use(function(req, res, next) {
 res.header('Access-Control-Allow-Origin', '*');
 res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
 res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
 next();

});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

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
           response.result = 'error';
           response.msg = 'Merchant with this shop is already exist.';
           res.setHeader('Content-Type', 'application/json');
           return res.status(200).send(JSON.stringify(response));
          //updateExistingMerchant(args.body,res);
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
         commissionType = data.commissionType,
         commissionValue = data.commissionValue,
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
  
  query = 'INSERT INTO tbl_merchant (CompanyName, ShopName, FirstName, LastName, Password,CommissionType,CommissionValue,Email, WebUrl, ProductID, PriceSegmentID, TargetAudience, StreetAddress, City, zipCode, CountryID, StateID, PhoneNumber, PlanID, CreateDate )\
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';

  connection.query(query,
             [companyName, shopName, firstName, lastName, password,commissionType,commissionValue, email, webUrl, productID, priceSegmentID, targetAudience, streetAddress, city, zipCode, countryID, stateID, phoneNumber, planID, createDate],
            function(err,result){
              if(!err){
                  insertMerchantID = result.insertId;
                  if(category){
                    for(var i = 0; i < category.length;i++){
                      connection.query('INSERT INTO tbl_merchant_category (MerchantID, CategoryID, CreateDate )\
                         VALUES (?,?,?)',
                         [insertMerchantID,category[i],moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')],
                        function(err,result){
                          if(!err){
                            console.log(this.sql);
                          }else{
                            console.log(err);
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
                        insertMerchantID = result[0].MerchantID;
                        if(category){
                          connection.query("DELETE FROM tbl_merchant_category WHERE MerchantID = "+insertMerchantID, function (err, result) {
                            if (err) throw err;
                          });
                          for(var i = 0; i < category.length;i++){
                            connection.query('INSERT INTO tbl_merchant_category (MerchantID, CategoryID, CreateDate )\
                               VALUES (?,?,?)',
                               [insertMerchantID,category[i],moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')],
                              function(err,result){
                                if(!err){
                                    response.result = 'success';
                                    response.msg = 'New merchant created';
                                    response.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    return res.status(response.statusCode).send(JSON.stringify(response));
                                }else{
                                    response.result = 'error';
                                    response.error = err;
                                    response.statusCode = 400;
                                    res.setHeader('Content-Type', 'application/json');
                                    return res.status(response.statusCode).send(JSON.stringify(response));
                                }
                            });
                          }
                        }
                     }else{
                        response.statusCode = 200;
                        response.result = 'success';
                        response.msg = 'New merchant created';
                        res.setHeader('Content-Type', 'application/json');
                        return res.status(response.statusCode).send(JSON.stringify(response));
                     }
                  });
                  
                  
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
         lastName = args.body.lastName,
         email = args.body.email,
         currentPassword = args.body.currentPassword,
         updateDate = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
      var updateFields = 'UpdateDate = ?';
      var updateValues = [updateDate];
      if(typeof args.body.email !== 'undefined'){
        updateFields += ',Email = ?';
        updateValues.push(args.body.email);
      }
      if(typeof args.body.companyName !== 'undefined'){
        updateFields += ',CompanyName = ?';
        updateValues.push(args.body.companyName);
      }
      if(typeof args.body.firstName !== 'undefined'){
        updateFields += ',FirstName = ?';
        updateValues.push(args.body.firstName);
      }
      if(typeof args.body.lastName !== 'undefined'){
        updateFields += ',LastName = ?';
        updateValues.push(args.body.lastName);
      }
      if(typeof args.body.currentPassword !== 'undefined'){
        updateFields += ',Password = ?';
        updateValues.push(args.body.currentPassword);
      }
      if(typeof args.body.interests !== "undefined"){
        updateFields += ',Interests = ?';
        updateValues.push(args.body.interests);
      }
      if(typeof args.body.webUrl !== 'undefined'){
        updateFields += ',WebUrl = ?';
        updateValues.push(args.body.webUrl);
      }
      if(typeof args.body.streetAddress !== 'undefined'){
        updateFields += ',StreetAddress = ?';
        updateValues.push(args.body.streetAddress);
      }
      if(typeof args.body.city !== 'undefined'){
        updateFields += ',City = ?';
        updateValues.push(args.body.city);
      }
      if(typeof args.body.zipCode !== 'undefined'){
        updateFields += ',ZipCode = ?';
        updateValues.push(args.body.zipCode);
      }
      if(typeof args.body.countryID !== 'undefined'){
        updateFields += ',CountryID = ?';
        updateValues.push(args.body.countryID);
      }
      if(typeof args.body.stateID !== 'undefined'){
        updateFields += ',StateID = ?';
        updateValues.push(args.body.stateID);
      }
      if(typeof args.body.phoneNumber !== 'undefined'){
        console.log('phoneNumber'+args.body.phoneNumber);
        updateFields += ',PhoneNumber = ?';
        updateValues.push(args.body.phoneNumber);
      }
      if(typeof args.body.planID !== 'undefined'){
        updateFields += ',PlanID = ?';
        updateValues.push(args.body.planID);
      }
      
      let updateMerchantID;
      connection.query('UPDATE tbl_merchant SET '+ updateFields +' WHERE ShopName = "'+shopName+'"',
        updateValues,
          function(err,result){
            console.log(this.sql);
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
                response.msg = 'Account connected sucessfully';
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

exports.validateCompanyName = function(args, res, next) {
  /*
   * validate given company name for signup
   * If company name is available Or alerady exist
   *
   * returns result with sucess / error with message
   */
   var response = {};
   var companyName = /[^/]*$/.exec(args.url)[0];
   companyName = decodeURIComponent(companyName);
   connection.query('SELECT * from tbl_merchant where CompanyName = ?',[companyName], function(err,result,fields){
     if(!err){
       console.log("What is result.length??")
       console.log(result.length);
       if(result.length != 0){
         response = {'result' : 'error', 'msg' : 'The Company name is already exist.'};
         console.log(response);
         res.setHeader('Content-Type', 'application/json');
         res.status(200).send(JSON.stringify(response));
       }else{
         response = {'result' : 'success', 'msg' : 'The Comapny name is valid.'};
         res.setHeader('Content-Type', 'application/json');
         res.status(200).send(JSON.stringify(response));
       }
     } else{
         res.status(400).send(err);
     }
  });
}

exports.loginUser = function(args, res, next) {
  /**
   * login user into the system
   *
   *
   * email
   * password

   **/

  var email = args.swagger.params.email.value;
  var password = args.swagger.params.password.value;
  var response = {};

    if (email !== 'undefined' && password !== 'undefined') {

        connection.query('SELECT MerchantID, Email,ShopName FROM tbl_merchant WHERE email=? AND password=?', [email, password], function (err, result) {
            if (!err) {
                if (result.length <= 0) {
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200).send(JSON.stringify({'result': 'error', 'msg': 'wrong email or password'}));

                } else {
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200).send(JSON.stringify({'result': 'success', 'msg': 'logged in Successfully','data':result[0]}));
                    console.log(session.user);
                }

            } else {
                res.json({'error': true, 'message': 'Error logging in'});
            }

        });
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify({'result': 'error', 'msg': 'Please fill in the email and the password'}));

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

exports.getPriceSegment = function(args, res, next) {
  /**
   * Get the list of all price segment
   * 
   * returns price segment
   **/
   var response = {};
   connection.query('SELECT * from  tbl_pricesegment', function(err,result,fields){
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

exports.getPlans = function(args, res, next) {
  /**
   * Get the list of all Billing Plans
   * 
   * returns Plans
   **/
   var response = {};
   connection.query('SELECT * from  tbl_plan', function(err,result,fields){
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

exports.getCountry = function(args, res, next) {
  /**
   * Get the list of all country 
   * 
   * returns Country
   **/
   var response = {};
   connection.query('SELECT * from  tbl_country', function(err,result,fields){
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
/** END Front end APIs **/

/** Shopify API starts from here **/
exports.generateAccessToken = function(args, res, next) {
 
  var response = {};
  // Generate access token from this url
  var shop = /[^/]*$/.exec(args.url)[0];
  
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
 var storedProductIDs = [];


/* List All products from for specific shop from shopify */
exports.productList = function(args, res, next){

  var response = {};
  // GET to token page then make call to v1.flat-lay.com/externaltoken
  //put token into request to shopify and return object 
  var shop = /[^/]*$/.exec(args.url)[0];
  var response = {};
  var shopName = shop;
  var productIDs = [];
  /* check exsiting products */
  connection.query('SELECT ProductID from tbl_shop_products WHERE ShopName = ?',shopName,
     function(err,result){

      if(!err && result.length > 0){
      //console.log(result);
        storedProductIDs =  result;
         //console.log(storedProductIDs);
        http.get(HOSTNAME+'/getAccessToken/'+ shop, function(res2) {

          shop = shop+'.myshopify.com';
          res2.on('data', function (chunk) {
            var chunkObj = JSON.parse(chunk);
            if(chunkObj.result == 'success'){
              const productRequestUrl = 'https://' + shop + '/admin/products.json?published_status=published';
              const productRequestHeaders = {
                'X-Shopify-Access-Token': chunkObj.accessToken,
              };
              request.get(productRequestUrl, { headers: productRequestHeaders })
              .then((productResponse) => {
                var productList = productResponse;
                var productResponse = JSON.parse(productResponse);

                var robotsInDisguise = storedProductIDs.map(function(storedProductIDs){
                    productIDs.push(storedProductIDs.ProductID);
                }); 
                for (var i=0; i < productResponse.products.length; i++) {
                  if(productIDs.indexOf(productResponse.products[i].id) == -1){
                    console.log(productIDs.indexOf(productResponse.products[i].id));
                    storeProductData(shopName,productResponse.products[i]);
                    storeProductVariants(productResponse.products[i].id,productResponse.products[i].variants);
                    storeProductOptions(productResponse.products[i].id,productResponse.products[i].options);
                    storeProductImages(productResponse.products[i].id,productResponse.products[i].images);
                  }
                }
                
                res.setHeader('Content-Type', 'application/json');
                res.status(200).end(productList);
              })
              .catch((productRequestError) => {
                res.setHeader('Content-Type', 'application/json');
                res.status(400).send(productRequestError);
              });
            }else{
              res.status(400).send(chunkObj.msg);
            }
          });
        }).on('error', function(e) {
            console.error(e);
        });

        
      }else{
        http.get(HOSTNAME+'/getAccessToken/'+ shop, function(res2) {
          shop = shop+'.myshopify.com';
          res2.on('data', function (chunk) {
            var chunkObj = JSON.parse(chunk);
            if(chunkObj.result == 'success'){
              const productRequestUrl = 'https://' + shop + '/admin/products.json?published_status=published';
              const productRequestHeaders = {
                'X-Shopify-Access-Token': chunkObj.accessToken,
              };
              request.get(productRequestUrl, { headers: productRequestHeaders })
              .then((productResponse) => {
                var productList = productResponse;
                var productResponse = JSON.parse(productResponse);

                for (var i=0; i < productResponse.products.length; i++) {
                    storeProductData(shopName,productResponse.products[i]);
                    storeProductVariants(productResponse.products[i].id,productResponse.products[i].variants);
                    storeProductOptions(productResponse.products[i].id,productResponse.products[i].options);
                    storeProductImages(productResponse.products[i].id,productResponse.products[i].images);
                }
                
                res.setHeader('Content-Type', 'application/json');
                res.status(200).end(productList);
              })
              .catch((productRequestError) => {
                res.setHeader('Content-Type', 'application/json');
                res.status(400).send(productRequestError);
              });
            }else{
              res.status(400).send(chunkObj.msg);
            }
          });
        }).on('error', function(e) {
            console.error(e);
        });
      }
    });
  /* check exsiting products */
  
 
  
}



function storeProductData(shopName,productResponse){
  
  var productvalues = [productResponse.id,shopName,productResponse.title,productResponse.body_html,productResponse.vendor,productResponse.product_type,productResponse.template_suffix,productResponse.handle,productResponse.tags,productResponse.created_at,productResponse.updated_at,productResponse.published_at];
  
  connection.query('INSERT INTO tbl_shop_products (ProductID,ShopName,ProductTitle,ProductBodyHtml,ProductVendor,ProductType,ProductTemplate,ProductHandle,ProductTag,ProductScope,CreatedAt,UpdateAt,PublishedAt)\
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [productResponse.id,shopName,productResponse.title,productResponse.body_html,productResponse.vendor,productResponse.product_type,productResponse.template_suffix,productResponse.handle,productResponse.tags,productResponse.published_scope,productResponse.created_at,productResponse.updated_at,productResponse.published_at],
     function(err,result){
       if(!err){
          console.log('storeProductData successfully');
       }else{
        if(err.errno==1062){
          console.log('Its duplicate entry productID -> '+productResponse.id);
        }
       }
  });

  
}

function storeProductVariants(productID,productVariants){
  for (var i=0; i < productVariants.length; i++) {
    
    connection.query('INSERT INTO tbl_shop_products_variants (ProductID,VariantID,VariantTitle,VariantPrice,VariantSKU,VariantPosition,VariantPolicy,VariantComparePrice,VariantFulfilmentService,VariantInventoryManagement,VariantOption1,VariantOption2,VariantOption3,VariantTaxable,VariantBarcode,VariantGrams,VariantImageID,VariantQuantity,VariantWeight,VariantWeightUnit,VariantInventoryItemID,VariantOldInventoryQty,VariantRequireShipping,CreatedAt,UpdatedAt )\
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [productID,
        productVariants[i].id,
        productVariants[i].title,
        productVariants[i].price,
        productVariants[i].sku,
        productVariants[i].position,
        productVariants[i].inventory_policy,
        productVariants[i].compare_at_price,
        productVariants[i].fulfillment_service,
        productVariants[i].inventory_management,
        productVariants[i].option1,
        productVariants[i].option2,
        productVariants[i].option3,
        productVariants[i].taxable,
        productVariants[i].barcode,
        productVariants[i].grams,
        productVariants[i].image_id,
        productVariants[i].inventory_quantity,
        productVariants[i].weight,
        productVariants[i].weight_unit,
        productVariants[i].inventory_item_id,
        productVariants[i].old_inventory_quantity,
        productVariants[i].requires_shipping,
        productVariants[i].created_at,
        productVariants[i].updated_at,
        ],
       function(err,result){
         if(!err){
          console.log('storeProductVariants successfully');
         }else{
          console.log(err);
         }
     });
  }
  
}

function storeProductOptions(productID,productOptions){
  for (var i=0; i < productOptions.length; i++) {
    connection.query('INSERT INTO tbl_shop_products_options (ProductID,OptionID,OptionName,OptionPosition,OptionValues)\
          VALUES (?,?,?,?,?)',
          [productID,
          productOptions[i].id,
          productOptions[i].name,
          productOptions[i].position,
          JSON.stringify(productOptions[i].values),
          ],
         function(err,result){
           if(!err){
              console.log('storeProductOptions successfully');
           }else{
              console.log(err);
           }
    });
  }
}

function storeProductImages(productID,productImages){
  console.log(productImages);
  for (var i=0; i < productImages.length; i++) {
    connection.query('INSERT INTO tbl_shop_products_images (ImageID,ProductID,ImagePosition,ImageAlt,ImageWidth,ImageHeight,ImageSrc,ImageVariantIDs,CreatedAt,UpdatedAt)\
        VALUES (?,?,?,?,?,?,?,?,?,?)',
        [productImages[i].id,
        productID,
        productImages[i].position,
        productImages[i].alt,
        productImages[i].width,
        productImages[i].height,
        productImages[i].src,
        JSON.stringify(productImages[i].variant_ids),
        productImages[i].created_at,
        productImages[i].updated_at,
        ],
       function(err,result){
         if(!err){
            console.log('storeProductImages successfully');
         }else{
            console.log(err);
         }
    });
  }
}

exports.productInfo = function(args, res1, next){
  var SHOP = args.body.shopName,
      productID = args.body.productID;
  var response = {};
  http.get(HOSTNAME+'/getAccessToken/'+ SHOP, function(res2) {
    res2.on('data', function (chunk) {
      var chunkObj = JSON.parse(chunk);
        if(chunkObj.result == 'success'){
          var options = {
            url: 'https://'+ SHOP + '.myshopify.com/admin/products/'+ productID +'.json',
            headers: {
              'X-Shopify-Access-Token': chunkObj.accessToken
            }
          };

          function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
              var info = JSON.parse(body);
              res1.setHeader('Content-Type', 'application/json');
              res1.status(response.statusCode).send(body);
            } else {
              res1.status(400).send(errors);
            }
          }
          request(options, callback);
        }else{
          res1.status(400).send(chunkObj.msg);
        }
    });
  }).on('error', function(e) {
    console.error(e);
  });
}

exports.addProduct = function(args, res, next){
  var response = {};
  console.log(args.body);
}

exports.productListCount = function(args, res1, next){
  var response = {};
  // GET to token page then make call to http://127.0.0.1:10010/getAccessToken/
  //put token into request to shopify and return object 
  var shop = /[^/]*$/.exec(args.url)[0];
  var response = {};

  http.get(HOSTNAME+'/getAccessToken/'+ shop, function(res2) {
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

  http.get(HOSTNAME+'/getAccessToken/'+ shop, function(res2) {
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

/* Checkout APIs */
/* Create a checkout
* Sample testing body request
{ 
  "shopName": "ipsteststore",
  "checkout": {
      "line_items": [
        {
          "variant_id": 7546388676666,
          "quantity": 1
        }
      ]
  }
}
*/
exports.createCheckout = function(args, res1, next){
  var shop = args.body.shopName,
      checkout = args.body.checkout;
  http.get(HOSTNAME+'/getAccessToken/'+ shop, function(res2) {
    res2.on('data', function (chunk) {
      var chunkObj = JSON.parse(chunk);
      var token = chunkObj.accessToken;
      var options = {
        method: 'POST',
        url: 'https://' + shop +'.myshopify.com/admin/checkouts.json',
        headers: 
         {
           'x-shopify-access-token': token,
           'content-type': 'application/json' },
        body: { 
          checkout
        },
        json: true 
      };

      request(options, function (error, response, body) {
        if (error) throw new Error(error);
        res1.status(200).send(body);
      });
    });

  }).on('error', function(e) {
    res1.status(400).send(error);
  });

}


/**
* Update checkout 
* Sample body request for testing
{
  "shop": "ipsteststore",
  "variant": 0,
  "email": "ks@test.com",
  "quantity": 0,
  "checkoutTOKEN": "f72f03d43b95294a99e037d34459cd35",
  "firstname": "K",
  "lastname": "S",
  "address1": "123 Main street",
  "address2": "string",
  "city": "string",
  "provincecode": "GJ",
  "countrycode": "IN",
  "phone": "1234567891",
  "zip": "380015"
}
**/
exports.updateCheckout = function(args, res1, next){
  var shop = args.body.shop,
      variant_id =  args.body.variant,
      email = args.body.email,
      quanity = args.body.quantity,
      checkoutTOKEN = args.body.checkoutTOKEN,
      firstname = args.body.firstname,
      lastname = args.body.lastname,
      address1 = args.body.address1,
      address2 = args.body.address2,
      city = args.body.city,
      provincecode = args.body.provincecode,
      countrycode = args.body.countrycode,
      phone = args.body.phone,
      zip = args.body.zip;
  http.get(HOSTNAME+'/getAccessToken/'+ shop, function(res2) {
    res2.on('data', function (chunk) {
      var chunkObj = JSON.parse(chunk);
      console.log(chunkObj.accessToken);
      var options = { 
        method: 'PUT',
        url: 'https://' + shop +'.myshopify.com/admin/checkouts/'+ checkoutTOKEN +'.json',
        headers: 
         {
           'x-shopify-access-token': chunkObj.accessToken,
           'content-type': 'application/json' },
        body: { 
          checkout: { 
            token: checkoutTOKEN,
            email: email,
            phone: phone,
            shipping_address: {
              first_name: firstname,
              last_name: lastname,
              address1: address1,
              address2: address2,
              city: city,
              province_code: provincecode,
              country_code: countrycode,
              phone: phone,
              zip: zip
            },
            billing_address: {
              first_name: firstname,
              last_name: lastname,
              address1: address1,
              address2: address2,
              city: city,
              province_code: provincecode,
              country_code: countrycode,
              phone: phone,
              zip: zip
            }
          } 
        },
        json: true 
      };

      request(options, function (error, response, body) {
        if (error) throw new Error(error);
        console.log(body);
        res1.status(200).send(body);
      });
    });

  }).on('error', function(e) {
    console.log(error);
    res1.status(400).send(error);
  });

}

/*
* Sample data for testing
{
  headers: 
   {
     'content-type': 'application/x-www-form-urlencoded',
     'Authorization': 'Bearer sk_test_sZRGFprzGCI5rHZ8Q1H0uFOe',
     'client_id': 'sk_test_sZRGFprzGCI5rHZ8Q1H0uFOe'
   },
  form: {
    'card[number]': '4242424242424242',
    'card[exp_month]': '12',
    'card[exp_year]': '2019',
    'card[cvc]': '123'
  }
}

*/
exports.addstripecard = function(args, res1, next){

    var client_id = args.body.client_id,
      cardNumber = args.body.cardNumber,
      exp_month = args.body.exp_month,
      exp_year = args.body.exp_year,
      cvv = args.body.cvv;
    var options = {
      method: 'POST',
      url: 'https://api.stripe.com/v1/tokens',
      headers: 
       {
         'Authorization': 'Bearer '+client_id,
       },
      form: {
        'card[number]': cardNumber,
        'card[exp_month]': parseInt(exp_month.trim()),
        'card[exp_year]': exp_year,
        'card[cvc]': cvv
      }
    };
    console.log(options);
    // res1.status(200).send(options);
    request(options, function (error, response, body) {
      if (error) {
        res1.status(400).send(error);
      }else{
        var response = {};
        var bodyParse = JSON.parse(body);
        if(bodyParse.error){
          response.result = 'error';
          response.msg = bodyParse.error.message;
          res1.status(200).send(response);
        }else{
          response.result = 'success';
          response.data = {'token':bodyParse.id,'card_id':bodyParse.card.id};
          res1.status(200).send(response);
        }
      }
    });
}

/* payment api*/
exports.getShippingRatesCheckout = function (args, res1, next) {
    var SHOP = args.body.shop,
            checkoutTOKEN = args.body.token;

    http.get(HOSTNAME+'/getAccessToken/' + SHOP, function (res2) {
        res2.on('data', function (chunk) {
            var chunkObj = JSON.parse(chunk);
            var options = {
                method: 'GET',
                url: 'https://' + SHOP + '.myshopify.com/admin/checkouts/' + checkoutTOKEN + '/shipping_rates.json',
                headers:
                        {
                            'x-shopify-access-token': chunkObj.accessToken,
                            'content-type': 'application/json'
                        },
                json: true
            };

            request(options, function (error, response, body) {
                if (error)
                    throw new Error(error);
                console.log(body);
                res1.status(200).send(body);
            });
        });

    }).on('error', function (e) {
        console.error(e);
        res1.status(400).send("error", error);
    });

}

exports.putShippingRatesCheckout = function (args, res1, next) {
    var SHOP = args.body.shop,
            checkoutTOKEN = args.body.token,
            handle = args.body.handle;
    http.get(HOSTNAME+'/getAccessToken/' + SHOP, function (res2) {
        res2.on('data', function (chunk) {
            var chunkObj = JSON.parse(chunk);
            var options = {
                method: 'PUT',
                url: 'https://' + SHOP + '.myshopify.com/admin/checkouts/' + checkoutTOKEN + '.json',
                headers:
                        {
                            'x-shopify-access-token': chunkObj.accessToken,
                            'content-type': 'application/json'
                        },
                body: {
                    checkout: {
                        shipping_line: {
                            handle: handle
                        }
                    }
                },
                json: true
            };

            request(options, function (error, response, body) {
                if (error)
                    throw new Error(error);
                res1.status(200).send(body);
            });
        });

    }).on('error', function (e) {
        console.error(e);
        res1.status(400).send("error", e);
    });
}

exports.createpayment = function (args, res1, next) {
    var SHOP = args.body.shop,
            checkoutTOKEN = args.body.checkouttoken,
            paymentToken = args.body.paymenttoken,
            amount = args.body.amount;

    http.get(HOSTNAME+'/getAccessToken/' + SHOP, function (res2) {
        res2.on('data', function (chunk) {
            var chunkObj = JSON.parse(chunk);
            var options = {
                method: 'POST',
                url: 'https://' + SHOP + '.myshopify.com/admin/checkouts/' + checkoutTOKEN + '/payments.json',
                headers: {
                    'X-Shopify-Access-Token': chunkObj.accessToken,
                    'content-type': 'application/json',
                    'X-Shopify-Checkout-Version': '2016-08-28'
                },
                body: {
                    payment: {
                        amount: amount,
                        unique_token: "AD542A2BM-C1124",
                        payment_token: {
                            payment_data: paymentToken,
                            type: "stripe_vault_token"
                        },
                        request_details: {
                            ip_address: "123.1.1.1",
                            accept_language: "en",
                            user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.98 Safari/537.36"
                        }
                    }
                },
                json: true
            };

            request(options, function (error, response, body) {
                if (error)
                    res1.status(400).send(response);
                console.log(body);
                res1.status(200).send(response);
            });
        });

    }).on('error', function (e) {
        console.error(e);
        res1.status(400).send("error", error);
    });
}

exports.getpayment = function (args, res1, next) {
    var SHOP = args.body.shop,
            checkoutTOKEN = args.body.checkouttoken,
            paymentID = args.body.paymentid;

    http.get(HOSTNAME+'/getAccessToken/' + SHOP, function (res2) {
        res2.on('data', function (chunk) {
            var chunkObj = JSON.parse(chunk);
            var options = {
                method: 'GET',
                url: 'https://' + SHOP + '.myshopify.com/admin/checkouts/' + checkoutTOKEN + '/payments/' + paymentID + '.json',
                headers:
                        {
                            'X-Shopify-Access-Token': chunkObj.accessToken,
                            'content-type': 'application/json'
                        },
                json: true
            };

            request(options, function (error, response, body) {
                if (error)
                  res1.status(200).send(response);
            });
        });

    }).on('error', function (e) {
        console.error(e);
        res1.status(400).send("error", error);
    });
}

// Dashboard APIs
exports.saveBillingInfo = function(args, res, next) {
  /**
   * User billing inforamtion
   * Billing information for the user
   *
   * body Billing Created user object
   * no response value expected for this operation
   **/
   var response = {};
   if(
     typeof args.body.merchantID !== 'undefined' &&
     typeof args.body.cardholderName !== 'undefined' &&
     typeof args.body.cardholderNumber !== 'undefined' &&
     typeof args.body.expireMonth !== 'undefined' &&
     typeof args.body.expireYear !== 'undefined' &&
     typeof args.body.cvv !== 'undefined'


   ){
     var merchantID = args.body.merchantID,
         cardholderName = args.body.cardholderName,
         cardholderNumber = args.body.cardholderNumber,
         expireMonth = args.body.expireMonth,
         expireYear = args.body.expireYear,
         cvv = args.body.cvv,
         billingName = args.body.billingName,
         streetAddress = args.body.streetAddress,
         city = args.body.city,
         zip = args.body.zip,
         countryID = args.body.countryID,
         stateID = args.body.stateID,
         saveCardInfo = args.body.saveCardInfo,
         saveBillingInfo = args.body.saveBillingInfo,
         createDate = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

      // args.getConnection(function (err, connection) {   
      connection.query('INSERT INTO tbl_merchant_billing (MerchantID, CardholderName, CardholderNumber, ExpireMonth, ExpireYear, CVV, BillingName, SaveCardInfo, \
        StreetAddress, City, Zip, CountryID, StateID, SaveBillingInfo, CreateDate)\
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [merchantID, cardholderName, cardholderNumber, expireMonth, expireYear, cvv, billingName, saveCardInfo, streetAddress, city, zip, countryID, stateID, saveBillingInfo, createDate],
      function(err,result){
        if(!err){
          if(result.insertId != 0){
            response.result = 'success';
          }
          else{
            response.result = 'error';
            response.msg = 'No data inserted';
          }
          console.log(response);
          res.setHeader('Content-Type', 'application/json');
          res.status(200).send(JSON.stringify(response));
        }
        else{
          console.log(err);
          res.status(400).send(err);
        }
        //next();
      });
      // });
   }
   else{
     response.push({'result' : 'error', 'msg' : 'Please fill required details'});
     res.setHeader('Content-Type', 'application/json');
     res.status(200).send(JSON.stringify(response));
   }
    console.log('Hola User');
  //res.end();
}


exports.createCampaign = function(args, res, next) {
  /**
   * post users' different actions on website content(posts/ collections/ products)
   *
   * body analytics Created user object
   * no response value expected for this operation
   **/
  var date;
  date = new Date();
  date = date.getUTCFullYear() + '-' +
      ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
      ('00' + date.getUTCDate()).slice(-2) + ' ' + 
      ('00' + date.getUTCHours()).slice(-2) + ':' + 
      ('00' + date.getUTCMinutes()).slice(-2) + ':' + 
      ('00' + date.getUTCSeconds()).slice(-2);

   var response = [];
   if(
     typeof args.body.username !== 'undefined' &&
     typeof args.body.title !== 'undefined' &&
     typeof args.body.briefdescription !== 'undefined' &&
     typeof args.body.fullbrief !== 'undefined' &&
     typeof args.body.client !== 'undefined' &&
     typeof args.body.budget !== 'undefined' &&
     typeof args.body.startdate !== 'undefined' &&
     typeof args.body.enddate !== 'undefined'
   ){
     var username = args.body.username,
         title = args.body.title,
         briefdescription = args.body.briefdescription,
         fullbrief = args.body.fullbrief,
         client = args.body.client,
         budget  = args.body.budget,
         startdate = args.body.startdate,
         enddate = args.body.enddate, 
         facebook = args.body.facebook, 
         instagram = args.body.instagram, 
         twitter = args.body.twitter,
         tumblr = args.body.tumblr;

      // args.getConnection(function (err, connection) {
      connection.query('INSERT INTO tbl_campaigns (username, title, timestamp, briefdescription, fullbrief, client, budget, startdate, enddate, facebook, instagram, twitter, tumblr)\
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [username, title, date, briefdescription, fullbrief, client, budget, startdate, enddate],
      function(err,result){
        if(!err){
          if(result.affectedRows != 0){
            response.push({'result' : 'success', 'data' : result});
          }
          else{
            response.push({'msg' : 'No result found'});
          }
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.status(200).send(JSON.stringify(response));
        }
        else{
          res.status(400).send(err);
        }

      });
      // });
  }
  //res.end();
}

exports.viewCampaigns = function(args, res, next){
  var response = [];
  console.log(args.url);
  var username = /[^/]*$/.exec(args.url)[0];
  // var webUrl = args.url;
  console.log("userID: ", userID);
  // args.getConnection(function (err, connection) {
  connection.query('SELECT * FROM tbl_campaigns where username=?',
  [username],
  function(err,result){
    if(!err){
      if(result.affectedRows != 0){
        response.push({'result' : result});
        console.log("noerr", result);
      }
      else{
        response.push({'msg' : 'No result found'});
      }
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify(response));
    }
    else{
      console.log("elseerr", err);
      res.status(400).send(err);
    }

  });
}

exports.viewClients = function(args, res, next){
  //view clients associated with merchant account
  var response = [];
  console.log(args.url);
  var username = /[^/]*$/.exec(args.url)[0];
  // var webUrl = args.url;
  console.log("userID: ", userID);
  // args.getConnection(function (err, connection) {
  connection.query('SELECT client FROM tbl_campaigns where username=?',
  [username],
  function(err,result){
    if(!err){
      if(result.affectedRows != 0){
        response.push({'result' : result});
        console.log("noerr", result);
      }
      else{
        response.push({'msg' : 'No result found'});
      }
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify(response));
    }
    else{
      console.log("elseerr", err);
      res.status(400).send(err);
    }

  });

}