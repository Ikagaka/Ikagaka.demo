Promise = @Promise
SakuraScriptPlayer = @SakuraScriptPlayer
if require?
	Promise ?= require('bluebird')

class Nanika
	constructor: (@nanikamanager, @namedmanager, @nar) ->
		@charset = 'UTF-8'
		@sender = 'Ikagaka'
		@options = {}
	error: (err) ->
		console.error(err.stack)
	throw: (err) ->
		alert?(err)
		throw err
	load: ->
		Promise.all [
			(=>
				console.log "initializing ghost"
				@ghost = new Ghost(@nar.getDirectory(/ghost\/master\//))
				@ghost.path += @options.append_path
				@ghost.logging = @options.logging
				@ghost.load()
				.then ->
					console.log "ghost loaded"
			)()
			(=>
				console.log "initializing shell"
				shell = new Shell(@nar.getDirectory(/shell\/master\//))
				shell.load()
				.then =>
					console.log "shell loaded"
					@shells = {master: shell}
			)()
		]
		.then =>
			@resource = {}
			balloon = @nanikamanager.get_balloon() # draft
			@materialize(@shells['master'], balloon)
			console.log "materialized"
		.then =>
			@transaction = new Promise (resolve) -> resolve()
			@set_named_handler()
			@set_ssp_handler()
			@run_version()
			@run_boot()
			@run_timer()
		.catch @throw
	halt: ->
		@transaction = null
		try
			@vanish()
		catch e
		@ghost.unload()
		.then =>
			@onhalt?()
	materialize: (shell, balloon) ->
		@namedid = @namedmanager.materialize(shell, balloon)
		@named = @namedmanager.named(@namedid)
		@ssp = new SakuraScriptPlayer(@named)
	vanish: () ->
		@ssp.off()
		@namedmanager.vanish(@namedid)
	run_version: ->
		@transaction = @transaction
		.then =>
			@send_request ['GET', 'Version'], '2.6', {}
		.then (response) =>
			# support 2.6 or 3.0 not 1.x
			if response.status_line.code == 200 && response.status_line.version != '3.0'
				@protocol_version = '2.6'
				@resource.version = response.headers.header.Version
				@resource.name = response.headers.header.ID
				@resource.craftman = response.headers.header.Craftman
				@resource.craftmanw = response.headers.header.Craftman
			else
				@protocol_version = '3.0'
				@send_request ['GET'], @protocol_version,
					ID: 'version'
				.then (response) => @resource.version = response.headers.header.Value
				.then =>
					@send_request ['GET'], @protocol_version,
						ID: 'name'
				.then (response) => @resource.name = response.headers.header.Value
				.then =>
					@send_request ['GET'], @protocol_version,
						ID: 'craftman'
				.then (response) => @resource.craftman = response.headers.header.Value
				.then =>
					@send_request ['GET'], @protocol_version,
						ID: 'craftmanw'
				.then (response) => @resource.craftmanw = response.headers.header.Value
	run_boot: ->
		@transaction = @transaction
		.then =>
			if @protocol_version == '3.0'
				@send_request ['NOTIFY'], @protocol_version,
					ID: "ownerghostname"
					Reference0: @ghost.descript['name']
				.then =>
					@send_request ['NOTIFY'], @protocol_version,
						ID: "basewareversion"
						Reference0: '0.0.0'
						Reference1: 'Ikagaka'
				# OnNotifyOSInfo
				# OnNotifyFontInfo : https://github.com/Pomax/Font.js or http://www.lalit.org/lab/javascript-css-font-detect/
				.then =>
					@send_request ['NOTIFY'], @protocol_version,
						ID: "OnNotifySelfInfo"
						Reference0: @ghost.descript['name']
						Reference1: @ghost.descript['sakura.name']
						Reference2: @ghost.descript['kero.name']
						Reference3: @named.shell.descript['name']
						#Reference4: '/path/to/shell'
						Reference5: @named.balloon.descript['name']
						#Reference6: '/path/to/balloon'
				.then =>
					@send_request ['NOTIFY'], @protocol_version,
						ID: "OnNotifyBalloonInfo"
						Reference0: @named.balloon.descript['name']
						#Reference1: '/path/to/balloon'
						#Reference2: サーフェス番号リスト [キャラID＋コロン＋カンマ区切り＋スペース] 例：0:0,1,2,3 1:0,1
				.then =>
					@send_request ['NOTIFY'], @protocol_version,
						ID: "OnNotifyShellInfo"
						Reference0: @named.shell.descript['name']
						#Reference1: '/path/to/shell'
						#Reference2: サーフェス番号リスト [カンマ区切り] 例：0,1,2,3,4,5,6,7,8,10,11
				# OnNotifyUserInfo
				# OnNotifyDressupInfo
				# ghostpathlist
				# balloonpathlist
			else
				@send_request ['NOTIFY', 'OwnerGhostName'], @protocol_version,
					Ghost: @ghost.descript['name']
		.then =>
			@send_request ['GET', 'String'], @protocol_version,
				ID: "username"
		.then (response) => @resource.username = response.headers.header[@string_header(@protocol_version)]
		.then =>
			@send_request ['NOTIFY', null], @protocol_version,
				ID: "otherghostname"
		.then =>
			@send_request ['NOTIFY', null], @protocol_version,
				ID: "installedghostname"
				Reference0: @ghost.descript['name']
		.then =>
			@send_request ['NOTIFY', null], @protocol_version,
				ID: "installedballoonname"
				Reference0: @named.balloon.descript['name']
		.then =>
			@send_request ['NOTIFY', null], @protocol_version,
				ID: "installedshellname"
				Reference0: @named.shell.descript['name']
		# uniqueid
		.then =>
			@send_request ['GET', 'String'], @protocol_version,
				ID: "sakura.recommendsites"
		.then (response) => @resource["sakura.recommendsites"] = response.headers.get_separated2(@string_header(@protocol_version))
		.then =>
			@send_request ['GET', 'String'], @protocol_version,
				ID: "sakura.portalsites"
		.then (response) => @resource["sakura.portalsites"] = response.headers.get_separated2(@string_header(@protocol_version))
		.then =>
			@send_request ['GET', 'String'], @protocol_version,
				ID: "kero.recommendsites"
		.then (response) => @resource["kero.recommendsites"] = response.headers.get_separated2(@string_header(@protocol_version))
		# OnBatteryNotify
		# rateofusegraph
		.then =>
			@send_request ['GET'], @protocol_version,
				ID: "OnBoot"
				Reference0: "0"
				Reference6: ""
				Reference7: ""
		.then (response) => @recv_response(response)
	run_timer: ->
		id_OnSecondChange = setInterval =>
			unless @transaction then return clearInterval id_OnSecondChange
			@transaction = @transaction
			.then =>
				@send_request ['GET'], @protocol_version,
					ID: "OnSecondChange",
					Reference0: "0",
					Reference1: "0",
					Reference2: "0",
					Reference3: "1"
			.then (response) => @recv_response(response)
		, 1000
		id_OnMinuteChange = setInterval =>
			unless @transaction then return clearInterval id_OnMinuteChange
			@transaction = @transaction
			.then =>
				@send_request ['GET'], @protocol_version,
					ID: "OnMinuteChange",
					Reference0: "0",
					Reference1: "0",
					Reference2: "0",
					Reference3: "1"
			.then (response) => @recv_response(response)
		, 60000
	set_named_handler: () ->
		mouseevents = [
			{type: 'mousedown', id: 'OnMouseDown'}
			{type: 'mousemove', id: 'OnMouseMove'}
			{type: 'mouseup', id: 'OnMouseUp'}
			{type: 'mouseclick', id: 'OnMouseClick'}
			{type: 'mousedblclick', id: 'OnMouseDoubleClick'}
		]
		for event in mouseevents
			@named.on event.type, ((id) =>
				(event) =>
					@transaction = @transaction.then =>
						@send_request ['GET', 'Sentence'], @protocol_version,
							ID: id
							Reference0: event.offsetX
							Reference1: event.offsetY
							Reference2: event.wheel
							Reference3: event.scope
							Reference4: event.region
							Reference5: event.button
						.then (response) => @recv_response(response)
			)(event.id)
		@named.on 'choiceselect', (event) =>
			if /^On/.test event.id # On
				@transaction = @transaction.then =>
					headers =
						ID: event.id
					for value, index in event.args
						headers["Reference#{index}"] = value
					@send_request ['GET', 'Sentence'], @protocol_version, headers
					.then (response) => @recv_response(response)
			else if event.args.length # Ex
				@transaction = @transaction.then =>
					headers =
						ID: 'OnChoiceSelectEx'
						Reference0: event.text
						Reference1: event.id
					for value, index in event.args
						headers["Reference#{index + 2}"] = value
					@send_request ['GET', 'Sentence'], @protocol_version, headers
					.then (response) => @recv_response(response)
			else # normal
				@transaction = @transaction.then =>
					@send_request ['GET', 'Sentence'], @protocol_version,
						ID: 'OnChoiceSelect'
						Reference0: event.id
					.then (response) => @recv_response(response)
		@named.on 'anchorselect', (event) =>
			if /^On/.test event.id # On
				@transaction = @transaction.then =>
					headers =
						ID: event.id
					for value, index in event.args
						headers["Reference#{index}"] = value
					@send_request ['GET', 'Sentence'], @protocol_version, headers
					.then (response) => @recv_response(response)
			else if event.args.length # Ex
				@transaction = @transaction.then =>
					headers =
						ID: 'OnAnchorSelectEx'
						Reference0: event.text
						Reference1: event.id
					for value, index in event.args
						headers["Reference#{index + 2}"] = value
					@send_request ['GET', 'Sentence'], @protocol_version, headers
					.then (response) => @recv_response(response)
			else # normal
				@transaction = @transaction.then =>
					@send_request ['GET', 'Sentence'], @protocol_version,
						ID: 'OnAnchorSelect'
						Reference0: event.id
					.then (response) => @recv_response(response)
		@named.on 'userinput', (event) =>
			if event.content?
				@transaction = @transaction.then =>
					@send_request ['GET', 'Sentence'], @protocol_version,
						ID: 'OnUserInput'
						Reference0: event.id
						Reference1: event.content
					.then (response) => @recv_response(response)
			else
				@transaction = @transaction.then =>
					@send_request ['GET', 'Sentence'], @protocol_version,
						ID: 'OnUserInputCancel'
						Reference0: event.id
						Reference1: 'close'
					.then (response) => @recv_response(response)
		@named.on 'communicateinput', (event) =>
			if event.content?
				@transaction = @transaction.then =>
					@send_request ['GET', 'Sentence'], @protocol_version,
						ID: 'OnCommunicate'
						Reference0: event.sender
						Reference1: event.content
					.then (response) => @recv_response(response)
			else
				@transaction = @transaction.then =>
					@send_request ['GET', 'Sentence'], @protocol_version,
						ID: 'OnCommunicateInputCancel'
						Reference1: 'cancel'
					.then (response) => @recv_response(response)
		@named.load()
	set_ssp_handler: () ->
		@ssp.on 'script:raise', ([id, references...]) =>
			@transaction = @transaction
			.then =>
				headers = ID: id
				for reference, index in references
					headers["Reference" + index] = reference
				@send_request ['GET'], @protocol_version, headers
			.then (response) => @recv_response(response)
		@ssp.on 'script:halt', =>
			@halt()
	send_close: ->
		@transaction = @transaction
		.then =>
			@send_request ['GET'], @protocol_version,
				ID: "OnClose"
		.then (response) => @recv_response(response)
	send_request: (method, version, headers) ->
		new Promise (resolve, reject) =>
			request = new ShioriJK.Message.Request()
			request.request_line.protocol = "SHIORI"
			request.request_line.version = version
			request.headers.header["Sender"] = @sender
			request.headers.header["Charset"] = @charset
			if version == '3.0'
				request.request_line.method = method[0]
			else
				if method[1] == null
					resolve() # through no SHIORI/2.x event
				method[1] ?= 'Sentence' # default SHIORI/2.2
				request.request_line.method = method[0] + ' ' + method[1]
				if method[1] == 'Sentence' and headers["ID"]?
					if headers["ID"] == "OnCommunicate" # SHIORI/2.3b
						request.headers.header["Sender"] = headers["Reference0"]
						request.headers.header["Sentence"] = headers["Reference1"]
						request.headers.header["Age"] = "0"
						headers = {}
					else # SHIORI/2.2
						headers["Event"] = headers["ID"]
						delete headers["ID"]
			for key, value of headers
				request.headers.header[key] = ''+value
			@ghost.request ""+request
			.then (response) ->
				resolve(response)
			.catch (err) ->
				reject(err)
		.catch @throw
		.then (response_str) =>
			unless response_str? then return
			response_str = response_str.replace /\r\n(?:\r\n)?$/, '\r\n\r\n'
			parser = new ShioriJK.Shiori.Response.Parser()
			response = parser.parse(response_str)
			if response.headers.header.Charset? then @charset = response.headers.header.Charset
			response
	recv_response: (response) ->
		new Promise (resolve, reject) =>
			if response.status_line.code == 200
				ss = null
				if response.status_line.version == '3.0'
					ss = response.headers.header.Value
				else
					ss = response.headers.header.Sentence
				if ss? and (typeof ss == "string" or ss instanceof String)
					@ssp.play(ss)
			resolve(response)
		.catch @error
	string_header: (version) ->
		if version == '3.0' then 'Value'
		else 'String' # SHIORI/2.5

if module?.exports?
  module.exports = Nanika
else if @Ikagaka?
  @Ikagaka.Nanika = Nanika
else
  @Nanika = Nanika
