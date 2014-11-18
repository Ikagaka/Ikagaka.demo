### (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 ###

if require?
	PartTime = require 'parttime'

# Period of moments with placeholders. That is useful for compareing repeating period. Currently, PartPeriod objects are not support timezones.
class PartPeriod
	# make a partperiod
	# @example Construct
	#   new PartPeriod()
	#   new PartPeriod('*-10-12/*-*-*')
	#   new PartPeriod('1970-1-1/1990-1-1')
	# @param periodString [String] String value representing a partperiod. The string should be in a format recognized by the PartPeriod.parse() method ("begin/end").
	constructor: (periodString) ->
		if periodString?
			period = PartPeriod.parse periodString
			for name, value of period
				@[name] = value
	# @property [PartTime]
	begin: null
	# @property [PartTime]
	end: null
	# get partperiod data from partperiod string
	# @param periodString [String] String value representing a partperiod. The string should be in a format "begin/end" (begin and end should be in a format recognized by the PartTime.parse() method (yyyy-mm-ddT00:00:00.000)).
	# @return [Hash] Hash data representing partperiod.
	# @note This is not instance method but static method.
	@parse = (periodString) ->
		result = null
		if result = periodString.match /^([\d\-:.T*]+)\s*\/\s*([\d\-:.T*]+)$/
			begin = new PartTime(result[1])
			end = new PartTime(result[2])
			if begin.compare(end) > 0
				throw 'Invalid Period : beginning is later than ending'
			return {begin: begin, end: end}
		else
			throw 'Invalid Period'
	# is date in the period?
	# @param date [DateLike] Date or DateLike (has getFullYear, getMonth, ... getMilliseconds)
	# @return [Boolean] returns true if date is in the period else false
	includes: (date) -> (@begin.compare(date) <= 0) and (@end.compare(date) >= 0)
	# @return [String] yyyy-mm-ddT00:00:00.000/yyyy-mm-ddT00:00:00.000.
	toString: -> "#{@begin}/#{@end}"

if module? and module.exports?
	module.exports = PartPeriod
