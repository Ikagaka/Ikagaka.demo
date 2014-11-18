### (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 ###

# Creates a "PartTime" instance that represents a single moment in time with placeholder that is useful for compareing repeating moment. Currently, PartTime objects does not support timezones.
class PartTime
	# make a parttime
	# @example Construct
	#   new PartTime()
	#   new PartTime('*-10-12')
	#   new PartTime('1970-1-1')
	#   new PartTime('1970-1-1T00:*')
	#   new PartTime('*:00:00.000')
	#   new PartTime('*:*:30')
	#   new PartTime('1970-1-1T00:00:00.000')
	# @param timeString [String] String value representing a parttime. The string should be in a format recognized by the PartTime.parse() method (yyyy-mm-ddT00:00:00.000).
	constructor: (timeString) ->
		if timeString?
			time = PartTime.parse timeString
			for name, value of time
				@[name] = value
	# @property [Integer] such as 2014
	year: null
	# @property [Integer] 1-12 (not 0-11)
	month: null
	# @property [Integer] 1-31
	date: null
	# @property [Integer] 0-24
	hour: null
	# @property [Integer] 0-59
	minute: null
	# @property [Integer] 0-59
	second: null
	# @property [Integer] 0-999
	millisecond: null
	# @nodoc
	@_levels = ['millisecond', 'second', 'minute', 'hour', 'date', 'month', 'year']
	# get parttime data from parttime string
	# @param timeString [String] String value representing a parttime. The string should be in a format yyyy-mm-ddT00:00:00.000.
	# @return [Hash] Hash data representing parttime.
	# @note This is not instance method but static method.
	@parse = (timeString) ->
		date = null
		time = null
		# separate date and time
		result = null
		if result = timeString.match /^([\d\-*]+)T([\d:*.]+)$/
			date = result[1]
			time = result[2]
		else if result = timeString.match /^([\d\-*]+)$/
			date = result[1]
		else if result = timeString.match /^T?([\d:*.]+)$/
			time = result[1]
		else
			throw 'Invalid Time'
		# parse date and time
		parttime = {}
		if date?
			result = null
			if result = date.match /^(?:([\d]+|\*)-)?([\d]+|\*)-([\d]+|\*)$/
				if result[1]? and result[1] != '*' then parttime.year = Math.floor result[1]
				if result[2] != '*' then parttime.month = Math.floor result[2]
				if result[3] != '*' then parttime.date = Math.floor result[3]
			else
				throw 'Invalid Time'
		if time?
			result = null
			if result = time.match /^([\d]+|\*):([\d]+|\*)(?::([\d]+|\*)(?:\.([\d]+|\*))?)?$/
				if result[1] != '*' then parttime.hour = Math.floor result[1]
				if result[2] != '*' then parttime.minute = Math.floor result[2]
				if result[3]? and result[3] != '*' then parttime.second = Math.floor result[3]
				if result[4]? and result[4] != '*' then parttime.millisecond = Math.floor result[4]
			else
				throw 'Invalid Time'
		# validate if it is one part
		# set defined range
		part_state = 0
		for name, index in @_levels
			if (part_state % 2) == 0
				if parttime[name]?
					part_state++
			else
				unless parttime[name]?
					part_state++
		if part_state > 2
			throw 'Invalid PartTime : two part (such as 2014-*-12) is not allowed.'
		# return
		parttime
	# @return [Integer] the year
	getFullYear: -> @year
	# @return [Integer] the month (0-11)
	getMonth: -> if @month? then @month - 1
	# @return [Integer] the date
	getDate: -> @date
	# @return [Integer] the hour
	getHours: -> @hour
	# @return [Integer] the minutes
	getMinutes: -> @minute
	# @return [Integer] the seconds
	getSeconds: -> @second
	# @return [Integer] the milliseconds
	getMilliseconds: -> @millisecond
	# compare with DateLike
	# @param date_c [DateLike] Date or DateLike (has getFullYear, getMonth, ... getMilliseconds)
	# @return [Integer] if this < date then negative else if this > date then positive else 0
	compare: (date_c) ->
		year = @getFullYear()
		year_cmp = date_c.getFullYear()
		if year? and year_cmp?
			diff = year - year_cmp
			if diff then return diff
		month = @getMonth()
		month_cmp = date_c.getMonth()
		if month? and month_cmp?
			diff = month - month_cmp
			if diff then return diff
		date = @getDate()
		date_cmp = date_c.getDate()
		if date? and date_cmp?
			diff = date - date_cmp
			if diff then return diff
		hour = @getHours()
		hour_cmp = date_c.getHours()
		if hour? and hour_cmp?
			diff = hour - hour_cmp
			if diff then return diff
		minute = @getMinutes()
		minute_cmp = date_c.getMinutes()
		if minute? and minute_cmp?
			diff = minute - minute_cmp
			if diff then return diff
		second = @getSeconds()
		second_cmp = date_c.getSeconds()
		if second? and second_cmp?
			diff = second - second_cmp
			if diff then return diff
		millisecond = @getMilliseconds()
		millisecond_cmp = date_c.getMilliseconds()
		if millisecond? and millisecond_cmp?
			diff = millisecond - millisecond_cmp
			if diff then return diff
		return 0
	# @nodoc
	elementToString: (element, padding=0) -> if element? then (Array(padding + 1).join('0') + element).slice -padding else '*'
	# @return [String] yyyy-mm-ddT00:00:00.000.
	toString: ->
		"#{@elementToString @year}-#{@elementToString @month, 2}-#{@elementToString @date, 2}T#{@elementToString @hour, 2}:#{@elementToString @minute, 2}:#{@elementToString @second, 2}.#{@elementToString @millisecond, 3}"

if module? and module.exports?
	module.exports = PartTime
