Profile = {}

class Profile.Shell
	constructor: (@profile={}) ->
	valueOf: ->
		profile: @profile

class Profile.Ghost
	constructor: (@profile={}, @shells={}) ->
	shell: (dirpath) ->
		if @shells[dirpath]?
			@shells[dirpath]
		else
			@shells[dirpath] = new Profile.Shell()
	valueOf: ->
		profile: @profile, shells: @shells

class Profile.Baseware
	constructor: (@profile={}, @ghosts={}) ->
	ghost: (dirpath) ->
		if @ghosts[dirpath]?
			@ghosts[dirpath]
		else
			@ghosts[dirpath] = new Profile.Ghost()
	valueOf: ->
		profile: @profile, ghosts: @ghosts

if module?.exports?
	module.exports = Profile
else if @Ikagaka?
	@Ikagaka.Profile = Profile
else
	@Profile = Profile
