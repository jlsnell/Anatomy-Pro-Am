config = require '../config'

## dependencies
DNode = require 'dnode@0.6.3'
Hash = require 'hashish@0.0.2'
_ = require('underscore@1.1.5')._
Backbone = require 'backbone@0.3.3'
resources  = require '../models/resources'

# memory store class for storing it in the memory (update: replace with redis)
class MemoryStore
	constructor: () ->
		@data = {}
	create: (@model) ->
		if not model.id
			model.id = model.attributes.id = Date.now()
			@data[model.id] = model
			return model
	set: (@model) ->
		@data[model.id] = model
		return model
	get: (@model) ->
		if model and model.id
			return @data[model.id]
		else
			return _.values(@data)
	destroy: (@model) ->
		delete @data[model.id]
		return model

store = new MemoryStore

# overwrite Backbone's sync, to store it in the memory
Backbone.sync = (method, model, success, error) ->
	switch method
		when "read" then resp = store.get model
		when "create" then resp = store.create model
		when "update" then resp = store.set model
		when "delete" then resp = store.destroy model
	if resp
		success(resp)
	else
		console.log(error)

collection = new resources.collections.Drawing

## pub/sub
subs = {}
publish = () ->
	args = arguments
	cl = args[1]
	if not _.isUndefined args[2] then args = _.without args, cl
	Hash(subs).forEach (emit, sub) ->
		if sub isnt cl
			emit.apply emit, args
		
## DNode RPC API
exports.createServer = (app) ->
	client = DNode (client, conn) ->
		@subscribe = (emit) ->
			subs[conn.id] = emit
			conn.on 'end', ->
				publish 'leave', conn.id
				delete subs[conn.id]
		@create = () ->
			collection.create()
		# dnode/coffeescript fix:
		@version = config.version
	.listen(app)
