Promise = @Promise
Named = @Named
SakuraScriptPlayer = @SakuraScriptPlayer
if require?
	Promise ?= require('bluebird')

class Single
	constructor: () ->
	error: (err) ->
		console.error(err.stack)
	throw: (err) ->
		alert?(err)
		throw err
	load_nar: (ghost_nar, balloon_nar, options) ->
		Promise.all [
			(new Promise (resolve, reject) ->
				ghost = new Ghost(ghost_nar.getDirectory(/ghost\/master\//))
				ghost.path = options.path
				ghost.logging = options.logging
				ghost.load (err) ->
					if err? then reject(err) else resolve(ghost)
			),
			(new Promise (resolve, reject) ->
				shell = new Shell(ghost_nar.getDirectory(/shell\/master\//))
				shell.load (err) ->
					if err? then reject(err) else resolve(shell)
			),
			(new Promise (resolve, reject) ->
				balloon = new Balloon(balloon_nar.directory)
				balloon.load (err) ->
					if err? then reject(err) else resolve(balloon)
			)
		]
		.then ([ghost, shell, balloon]) => @load ghost, shell, balloon
		.catch @throw
	load: (@ghost, @shell, @balloon) ->
		@named = new Named(@shell, @balloon)
		@ssp = new SakuraScriptPlayer(@named)
		@resource = {}
		@charset = 'UTF-8'
		@sender = 'Ikagaka'
	run: (dom) ->
		@transaction = new Promise (resolve) -> resolve()
		$(@named.element)
		.on "IkagakaSurfaceEvent", (ev) =>
			@transaction = @transaction.then =>
				@send_request ['GET', 'Sentence'], @protocol_version, ev.detail
				.then (response) => @recv_response(response)
		.appendTo(dom)
		@run_version()
		@run_boot()
		@run_timer()
	stop: ->
		$(@named.element).remove()
		@transaction = null
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
						Reference3: @shell.descript['name']
						#Reference4: '/path/to/shell'
						Reference5: @balloon.descript['name']
						#Reference6: '/path/to/balloon'
				.then =>
					@send_request ['NOTIFY'], @protocol_version,
						ID: "OnNotifyBalloonInfo"
						Reference0: @balloon.descript['name']
						#Reference1: '/path/to/balloon'
						#Reference2: サーフェス番号リスト [キャラID＋コロン＋カンマ区切り＋スペース] 例：0:0,1,2,3 1:0,1
				.then =>
					@send_request ['NOTIFY'], @protocol_version,
						ID: "OnNotifyShellInfo"
						Reference0: @shell.descript['name']
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
				Reference0: @balloon.descript['name']
		.then =>
			@send_request ['NOTIFY', null], @protocol_version,
				ID: "installedshellname"
				Reference0: @shell.descript['name']
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
				method[1] ?= 'Sentence'
				request.request_line.method = method[0] + ' ' + method[1] # default SHIORI/2.2
				if method[1] == 'Sentence' and headers["ID"]? # SHIORI/2.2
					headers["Event"] = headers["ID"]
					delete headers["ID"]
			for key, value of headers
				request.headers.header[key] = ''+value
			@ghost.request ""+request, (err, response) ->
				if err? then reject(err)
				else resolve(response)
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
  module.exports = Single
else if @Ikagaka?
  @Ikagaka.Single = Single
else
  @Single = Single
