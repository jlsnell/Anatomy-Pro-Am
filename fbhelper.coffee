config = require './config'
fbgraph = require 'facebook-graph@0.0.6'
fbutil = require './facebookutil.js'

storeUser = (userData, userCode) ->
	##Will store user to DB.  
	###
	EXAMPLE OUTPUT OF USERDATA
	{ id: '1240446434',
	  name: 'Greg Vaughan',
	  first_name: 'Greg',
	  last_name: 'Vaughan',
	  link: 'http://www.facebook.com/vaughan.greg',
	  username: 'vaughan.greg',
	  birthday: '06/21/1981',
	  hometown: 
	   { id: '108738535818080',
	     name: 'Rhinelander, Wisconsin' },
	  location: { id: '107572595931951', name: 'Madison, Wisconsin' },
	  gender: 'male',
	  email: 'unspecified.rock@gmail.com',
	  timezone: -5,
	  locale: 'en_US',
	  verified: true,
	  updated_time: '2011-04-04T21:28:43+0000' }
	
	EXAMPLE OUTPUT OF USERCODE
	195426547154882|2aca7ffbd1917de4b5db3ac9-1240446434|Cb5iU82pqvGhfhm6RBt5a9fL7m0
	###
	console.log userData
	console.log userCode

userDeauthed = (reqInfo) ->
	#do something with deauthed user info
	console.log("-------=== USER REMOVED APP! ===-------")

userDeclinedAccess = (reqInfo) ->
	#so something when a user declines using the app from the access window
	console.log "-------=== USER DENIED TERMS ===-------"
	console.log(req.query.error_reason)
	console.log(req.query.error)
	console.log(req.query.error_description)

authUser = (req, res) ->
	if req.query.code
		console.log "-------=== USER ACCEPTED TERMS, SENDING ACCESS TOKEN ===-------"
		##compile access token requirements
		path = '/oauth/access_token'
		args = {
			client_id: config.fbconfig.appId
			redirect_uri: config.fbconfig.redirect_uri
			client_secret: config.fbconfig.appSecret
			code: req.query.code			
		}
		print = (error, code) ->
			if code 
				#if we get the code back, get all user data
				graph = new fbgraph.GraphAPI code
				print = (error, userdata) ->
					if userdata
						storeUser(userdata, code)
				graph.getObject 'me', print
		fbutil.auth path, 'GET', args, print
		res.redirect config.fbconfig.url

	if req.query.error_reason	
		userDeclinedAccess(req)
		res.end()

renderIndex =  (req, res) ->
	user = fbgraph.getUserFromCookie(req.cookies, config.fbconfig.appId, config.fbconfig.appSecret)
	console.log(user)
	if user
		console.log '-------=== LOGGED IN USER, SENDING INDEX ===-------'
		res.render 'index', config.fbconfig
	else
		console.log '-------=== NO USER - RENDERING INDEX TO DIRECT USER TO AUTH PAGE ===-------'
		res.render 'index', config.fbconfig

exports.store_user = storeUser
exports.userDeauthed = userDeauthed
exports.userDeclinedAccess = userDeclinedAccess
exports.authUser = authUser
exports.renderIndex = renderIndex