'use strict';

var fs = require('fs'),
    path = require('path'),
    http     = require('http'),
   	express  = require('express'),
    mysql    = require('mysql'),
    parser   = require('body-parser');
var reload = require('reload');
var connect = require('connect')();
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var config = require('./config.js');
var cors = require('cors');
var moment = require('moment');
//New Setup express
var app = express();
var logger = require('morgan');
var bodyParser = require('body-parser');

const dotenv = require('dotenv').config();
const crypto = require('crypto');
const cookie = require('cookie');
const nonce = require('nonce')();
const querystring = require('querystring');
const request = require('request-promise');
const scopes = 'read_products';
global.HOSTNAME = process.env.HOSTNAME;
global.APIKEY = process.env.SHOPIFY_API_KEY;
global.APISECRET = process.env.SHOPIFY_API_SECRET;

app.use(cors());
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
app.set('port', process.env.PORT || 10010);

// swaggerRouter configuration
var options = {
  swaggerUi: path.join(__dirname, '/swagger.json'),
  controllers: path.join(__dirname, '/api/controllers'),
  useStubs: process.env.NODE_ENV === 'development'? true : false// Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync(path.join(__dirname,'api/swagger/swagger.yaml'), 'utf8');
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
  app.use(bodyParser.json());                        

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(function(req, res, next) {
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Credentials', 'true');
   res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
   res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
  //and remove cacheing so we get the most recent comments
   res.setHeader('Cache-Control', 'no-cache');
   next();
  });

  app.get('/shopify', (req, res) => {
    const shop = req.query.shop;
    if (shop) {
      const state = nonce();
      const redirectUri = HOSTNAME + '/shopify/callback';
      const installUrl = 'https://' + shop +
        '/admin/oauth/authorize?client_id=' + APIKEY +
        '&scope=' + scopes +
        '&state=' + state +
        '&redirect_uri=' + redirectUri;

      res.cookie('state', state);
      res.redirect(installUrl);
    } else {
      return res.status(400).send('Missing shop parameter. Please add ?shop=your-development-shop.myshopify.com to your request');
    }
  });

  app.get('/shopify/callback', (req, res) => {
    const { shop, hmac, code, state } = req.query;
    const stateCookie = cookie.parse(req.headers.cookie).state;

    if (state !== stateCookie) {
      return res.status(403).send('Request origin cannot be verified');
    }
    
    if (shop && hmac && code) {
      console.log(shop);
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
        const accessToken = accessTokenResponse.access_token;
        var shopName = shop.replace(".myshopify.com", "");
        connection.query('UPDATE tbl_merchant SET Code = ?,AccessToken = ?,UpdateDate = ? WHERE ShopName = ?', [code,accessToken,moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),shopName], 
          function(err,result,fields){
            if(!err){
              if(result.affectedRows > 0){
                console.log('AccessToken updated in DB');
              }
            }else{
              console.log('error in update query');
            }
          }
        );
        res.status(200).send('Your access token is '+accessToken);
      })
      .catch((error) => {
        res.status(error.statusCode).send(error.error.error_description);
      });
    } else {
      res.status(400).send('Required parameters missing');
    }
  });
    
  reload(app);

  // Create server
  http.createServer(app).listen(app.get('port'), function(){
  	console.log('Server listening on port ' + app.get('port'));
  });



});


