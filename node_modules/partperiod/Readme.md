PartPeriod - period with placeholder
================================

SYNOPSYS
--------------------------------

    var PartPeriod = require('partperiod');
    var pp = new PartPeriod('*-01-01/*-01-03');
    var now = new Date();
    if(pp.includes(now)) console.log('Sanganichi');

DESCRIPTION
--------------------------------

Period of moments with placeholders. That is useful for compareing repeating period.

Currently, PartPeriod does not support timezones.

INSTALL & USAGE
--------------------------------

### node.js

    npm install -g partperiod

and

    var PartPeriod = require('partperiod');

### browsers

Get partperiod.js by downloading dist zip or some and

    <script src="partperiod.js"></script>

SUMMARY
--------------------------------

### class PartPeriod

#### constructor(periodString)

##### example Construct

    new PartPeriod()
    new PartPeriod('*-10-12/*-*-*')
    new PartPeriod('1970-1-1/1990-1-1')

##### param

- **periodString** [String] String value representing a partperiod. The string should be in a format recognized by the PartPeriod.parse() method ("begin/end").

#### properties

- begin [PartTime]
- end [PartTime]

#### parse(periodString) {static method}

get partperiod data from partperiod string

##### param

- **periodString** [String] String value representing a partperiod. The string should be in a format "begin/end" (begin and end should be in a format recognized by the PartTime.parse() method (yyyy-mm-ddT00:00:00.000)).

##### return

[Hash] Hash data representing partperiod.

#### includes(date)

is date in the period?

##### param

- **date** [DateLike] Date or DateLike (has getFullYear, getMonth, ... getMilliseconds)

##### return

[Boolean] returns true if date is in the period else false

#### toString()

##### return

[String] yyyy-mm-ddT00:00:00.000/yyyy-mm-ddT00:00:00.000.

MORE DOCUMENTATION
--------------------------------

See doc/ or parttime.coffee comments.

LICENSE
--------------------------------

(C) 2014 Narazaka : Licensed under [The MIT License](http://narazaka.net/license/MIT?2014)
