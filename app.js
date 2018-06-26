'use strict';

import connection from './config';

var fs = require('fs'),
	path = require('path'),
	http = require('http'),
	https = require('https'),
	express = require('express'),
	mysql = require('mysql'),
	parser = require('body-parser');
var reload = require('reload');
var connect = require('connect')();
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');

var url = require('url');
var cors = require('cors');
var moment = require('moment');
//New Setup express
var app = express();
var logger = require('morgan');
const dotenv = require('dotenv').config();
const crypto = require('crypto');
const cookie = require('cookie');
const nonce = require('nonce')();
const querystring = require('querystring');
const request = require('request-promise');
//File upload
const fileUpload = require('express-fileupload');
const scopes = 'read_product_listings,read_products,write_products,read_orders,write_orders,read_shipping,write_shipping,read_customers,write_customers,read_checkouts,write_checkouts,read_content,write_content';
global.HOSTNAME = process.env.HOSTNAME;
global.APIKEY = process.env.SHOPIFY_API_KEY;
global.APISECRET = process.env.SHOPIFY_API_SECRET;
global.SHOPIFY_APP_URL = "https://client.flat-lay.com/install";
app.use(cors());
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
app.set('port', process.env.PORT || 10010);
// swaggerRouter configuration
var options = {
	swaggerUi: path.join(__dirname, '/swagger.json'),
	controllers: path.join(__dirname, '/api/controllers'),
	useStubs: process.env.NODE_ENV === 'development' ? true : false// Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync(path.join(__dirname, 'api/swagger/swagger.yaml'), 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {

	// Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
	app.use(middleware.swaggerMetadata());

	// Validate Swagger requests
	app.use(middleware.swaggerValidator());

	// Route validated requests to appropriate controller
	app.use(middleware.swaggerRouter(options));

	//app.use(middleware.swaggerRouter({controllers: './controllers'}));

	// Serve the Swagger documents and Swagger UI
	app.use(middleware.swaggerUi());

	app.use(logger(':method :url :status :res[content-length] - :response-time ms')); //replaces your app.use(express.logger());

	// parse application/json
	app.use(parser.json());

	// parse application/x-www-form-urlencoded
	app.use(parser.urlencoded({ extended: true }));

	app.use(fileUpload());

	app.use('/public', express.static(__dirname + '/public'));

	app.use(function (req, res, next) {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Credentials', 'true');
		res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
		res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
		//and remove cacheing so we get the most recent comments
		res.setHeader('Cache-Control', 'no-cache');
		next();
	});

	app.use(express.static(__dirname + '/public'));

	// upload given file in floder
	app.post('/upload/profilepicture', (req, res, next) => {

		let filePath = `public/profile-images`;
		if (!fs.existsSync(filePath)) {
			fs.mkdirSync(filePath);
		}
		var filename = req.body.shopname;
		if (typeof req.body.fileURL !== 'undefined') {
			let URL_TO_REQUEST = req.body.fileURL;
			filename += path.extname(URL_TO_REQUEST);
			var uri = url.parse(URL_TO_REQUEST);

			request(URL_TO_REQUEST).pipe(fs.createWriteStream(path.join(filePath, filename)));
		} else {
			filename += path.extname(req.files.file.name);
			let imageFile = req.files.file;
			imageFile.mv(`${filePath}/${filename}`, function (err) {
				if (err) {
					return res.status(500).send(err);
				}
			});
		}

		var shopname = req.body.shopname,
			profileImage = `/public/profile-images/${filename}`,
			updateDate = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
		connection.query('UPDATE tbl_merchant SET ProfileImage =?,UpdateDate = ? WHERE ShopName = ?',
			[profileImage, updateDate, req.body.shopname],
			function (err, result) {
				if (!err) {
					res.json({ result: 'success' });
				} else {
					res.json({ result: 'error', 'msg': 'Error while updating in database' });
				}
			});
	})

	app.post('/webhook/createProduct', (req, res) => {
		var myshopify_domain = req.headers['x-shopify-shop-domain'];
		var webhook_topic = req.headers['x-shopify-topic'];
		console.log(req.body);
		console.log('Yah we got a webhook for create product');
		//console.log(request.body);
		return res.status(200).send('OK');
	});

	app.post('/webhook/deleteProduct', (req, res) => {
		var myshopify_domain = req.headers['x-shopify-shop-domain'];
		console.log(req.body);
		console.log('Yah we got a webhook for delete product');
		//console.log(request.body);
		return res.status(200).send('OK');
	});

	app.post('/webhook/removeSaleschannel', (req, res) => {
		console.log('Yah we got a webhook for remove Saleschannel');
		console.log(req.body);
		var sql = "DELETE FROM tbl_merchant WHERE ShopID = " + req.body.id;
		connection.query(sql, function (err, result) {
			if (err) throw err;
			console.log("Number of records deleted from tbl_merchant: " + result.affectedRows);
		});
		var sql = "DELETE FROM tbl_merchant_shop WHERE ShopID = " + req.body.id;
		connection.query(sql, function (err, result) {
			if (err) throw err;
			console.log("Number of records deleted from tbl_merchant_shop: " + result.affectedRows);
		});
		var shopify_domain = req.body.myshopify_domain;
		var shopName = shopify_domain.replace('.myshopify.com', '');
		var sql = "DELETE FROM tbl_shop_products WHERE ShopName = " + shopName;
		connection.query(sql, function (err, result) {
			if (err) throw err;
			console.log("Number of records deleted from tbl_shop_products: " + result.affectedRows);
		});
		return res.status(200).send('OK');
	});

	app.post('/webhook/customers/redact', (req, res) => {
		console.log(req.body);
		console.log('Yah we got a webhook for customers/redact');

		return res.status(200).send('OK');
	});

	app.post('/webhook/shop/redact', (req, res) => {
		console.log(req.body);
		console.log('Yah we got a webhook for shop/redact');

		return res.status(200).send('OK');
	});

	app.get('/shopify', (req, res) => {
		// EX. shop will be ipsteststore here
		const shop = req.query.shop;
		if (shop) {
			const state = nonce();
			console.log(state);
			const redirectUri = HOSTNAME + '/shopify/callback';
			const installUrl = 'https://' + shop +
				'/admin/oauth/authorize?client_id=' + APIKEY +
				'&scope=' + scopes +
				'&state=' + state +
				'&redirect_uri=' + redirectUri;
			console.log(installUrl);

			res.cookie('state', state);
			res.redirect(installUrl);

		} else {
			return res.status(400).send('Missing shop parameter. Please add ?shop=your-development-shop.myshopify.com to your request');
		}
	});

	app.get('/shopify/callback', (req, res) => {
		// EX. shop will be ipsteststore.myshopify.com here
		const { shop, hmac, code, state } = req.query;
		// const stateCookie = cookie.parse(req.headers.cookie).state;

		/*if (state !== stateCookie) {
				return res.status(403).send('Request origin cannot be verified');
		}*/

		if (shop && hmac && code) {
			// DONE: Validate request is from Shopify
			const map = Object.assign({}, req.query);
			delete map['signature'];
			delete map['hmac'];
			const message = querystring.stringify(map);
			const providedHmac = Buffer.from(hmac, 'utf-8');
			const generatedHash = Buffer.from(
				crypto
					.createHmac('sha256', APISECRET)
					.update(message)
					.digest('hex'),
				'utf-8'
			);
			let hashEquals = false;

			try {
				hashEquals = crypto.timingSafeEqual(generatedHash, providedHmac)
			} catch (e) {
				hashEquals = false;
			};

			if (!hashEquals) {
				return res.status(400).send('HMAC validation failed');
			}

			// DONE: Exchange temporary code for a permanent access token
			const accessTokenRequestUrl = 'https://' + shop + '/admin/oauth/access_token';
			const accessTokenPayload = {
				client_id: APIKEY,
				client_secret: APISECRET,
				code,
			};

			request.post(accessTokenRequestUrl, { json: accessTokenPayload })
				.then((accessTokenResponse) => {
					var shopData = {};
					const accessToken = accessTokenResponse.access_token;
					//Store shop data in tbl_shop
					// DONE: Use access token to make API call to 'shop' endpoint
					const shopRequestUrl = 'https://' + shop + '/admin/shop.json';
					const shopRequestHeaders = {
						'Content-Type': 'application/json',
						'X-Shopify-Access-Token': accessToken,
					};

					request.get(shopRequestUrl, { headers: shopRequestHeaders })
						.then((shopResponse) => {
							var shopResponse = JSON.parse(shopResponse);
							shopResponse = shopResponse.shop;
							var sql = "DELETE FROM tbl_merchant_shop WHERE ShopID = " + shopResponse.id;
							connection.query(sql, function (err, result) {
								if (err) throw err;
								console.log("Number of records deleted: " + result.affectedRows);
							});
							connection.query('INSERT INTO `tbl_merchant_shop` (`ShopID`, `Name`, `Email`, `Domain`, `Province`, `Country`, `Address1`, `Zip`, `City`, `Source`, `Phone`, `Latitude`, `Longitude`, `PrimaryLocale`, `Address2`, `CreatedAt`, `UpdatedAt`, `CountryCode`, `CountryName`, `Currency`, `CustomerEmail`, `ShopOwner`, `PlanName`, `MyshopifyDomain`)\
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [shopResponse.id, shopResponse.name, shopResponse.email, shopResponse.domain, shopResponse.province, shopResponse.country, shopResponse.address1, shopResponse.zip, shopResponse.city, shopResponse.source, shopResponse.phone, shopResponse.latitude, shopResponse.longitude, shopResponse.primary_locale, shopResponse.address2, shopResponse.created_at, shopResponse.updated_at, shopResponse.country_code, shopResponse.country_name, shopResponse.currency, shopResponse.customer_email, shopResponse.shop_owner, shopResponse.plan_name, shopResponse.myshopify_domain],
								function (err, result) {
									if (!err) {
										var shopName = shop.replace('.myshopify.com', '');
										var shopName = shopName,
											updateDate = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
											createDate = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
										let insertMerchantID;
										connection.query('SELECT * from tbl_merchant where ShopName = ?', shopName, function (err, result, fields) {
											if (!err && result.length > 0) {
												insertMerchantID = result[0].MerchantID;
												connection.query('UPDATE tbl_merchant SET ShopID =?,Code = ?,AccessToken = ?,UpdateDate = ? WHERE ShopName = ?',
													[shopResponse.id, code, accessToken, updateDate, shopName],
													function (err, result) {
														if (!err) {
															console.log("New merchant accesstoken inserted. MerchantID is " + insertMerchantID);
															registerWebhooks(accessToken, shopName, HOSTNAME);
															res.redirect(SHOPIFY_APP_URL + "?shop=" + shop);
														} else {
															console.log("err", err);
															console.log("errresult", result);
															return res.status(400).send(err);
														}
													});
											} else {
												connection.query('INSERT INTO tbl_merchant (ShopID, ShopName, Code, AccessToken, CreateDate )\
                   VALUES (?,?,?,?,?)',
													[shopResponse.id, shopName, code, accessToken, createDate],
													function (err, result) {
														if (!err) {

															if (result.affectedRows != 0) {
																console.log(result);
																insertMerchantID = result.insertId;
																console.log("New merchant accesstoken inserted. MerchantID is " + insertMerchantID);
																registerWebhooks(accessToken, shopName, HOSTNAME);
																res.redirect(SHOPIFY_APP_URL + "?shop=" + shop);
															} else {
																return res.status(200).send('Query is correct but some thing is wrong with network');
															}
														} else {
															console.log("err", err);
															console.log("errresult", result);
															return res.status(400).send(err);
														}
													});
											}
										});
									} else {
										console.log("err", err);
									}
								});
						})
						.catch((error) => {
							console.log(error);
						});
				})
				.catch((error) => {
					res.status(error.statusCode).send(error.error.error_description);
				});

		} else {
			res.status(400).send('Required parameters missing');
		}

		function registerWebhooks(accessToken, shopName) {
			var options = {
				method: 'POST',
				url: 'https://' + shopName + '.myshopify.com/admin/webhooks.json',
				headers:
				{
					'content-type': 'application/json',
					'x-shopify-access-token': accessToken,
					host: 'paxsun.myshopify.com'
				},
				body:
				{
					webhook:
					{
						topic: 'products/create',
						address: 'https://affiliate.flat-lay.com/webhook/createProduct',
						format: 'json'
					}
				},
				json: true
			};
			request(options, function (error, response, body) {
				if (error) throw new Error(error);

				console.log(body);
			});

			var options = {
				method: 'POST',
				url: 'https://' + shopName + '.myshopify.com/admin/webhooks.json',
				headers:
				{
					'content-type': 'application/json',
					'x-shopify-access-token': accessToken,
					host: 'paxsun.myshopify.com'
				},
				body:
				{
					webhook:
					{
						topic: 'products/delete',
						address: 'https://affiliate.flat-lay.com/webhook/deleteProduct',
						format: 'json'
					}
				},
				json: true
			};
			request(options, function (error, response, body) {
				if (error) throw new Error(error);

				console.log(body);
			});

			var options = {
				method: 'POST',
				url: 'https://' + shopName + '.myshopify.com/admin/webhooks.json',
				headers:
				{
					'content-type': 'application/json',
					'x-shopify-access-token': accessToken,
					host: 'paxsun.myshopify.com'
				},
				body:
				{
					webhook:
					{
						topic: 'app/uninstalled',
						address: 'https://affiliate.flat-lay.com/webhook/removeSaleschannel',
						format: 'json'
					}
				},
				json: true
			};
			request(options, function (error, response, body) {
				if (error) throw new Error(error);

				console.log(body);
			});
		}
	});


	reload(app);

	// Create server
	http.createServer(app).listen(app.get('port'), function () {
		console.log('Server listening on port ' + app.get('port'));
	});



});

