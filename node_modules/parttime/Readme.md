PartTime - time with placeholder
================================

SYNOPSYS
--------------------------------

    var PartTime = require('parttime');
    var pt = new PartTime('*-01-01');
    var now = new Date();
    if(pt.compare(now) == 0) console.log('Happy New Year!');

DESCRIPTION
--------------------------------

PartTime represents a single moment in time with placeholder that is useful for compareing repeating moment.

Currently, PartTime does not support timezones.

INSTALL & USAGE
--------------------------------

### node.js

    npm install -g parttime

and

    var PartTime = require('parttime');

### browsers

Get parttime.js by downloading dist zip or some and

    <script src="parttime.js"></script>

SUMMARY
--------------------------------

### class PartTime

#### constructor(timeString)

##### example Construct

    new PartTime()
    new PartTime('*-10-12')
    new PartTime('1970-1-1')
    new PartTime('1970-1-1T00:*')
    new PartTime('*:00:00.000')
    new PartTime('*:*:30')
    new PartTime('1970-1-1T00:00:00.000')

##### param

- **timeString** [String] String value representing a parttime. The string should be in a format recognized by the PartTime.parse() method (yyyy-mm-ddT00:00:00.000).

#### properties

- year
- month (1-12. not 0-11.)
- date
- hour
- minute
- second
- millisecond

#### parse(timeString) {static method}

get parttime data from parttime string

##### param

- **timeString** [String] String value representing a parttime. The string should be in a format yyyy-mm-ddT00:00:00.000.

##### return

[Hash] Hash data representing parttime.

#### compare(date_c)

compare with DateLike

##### param

- **date_c** [DateLike] Date or DateLike (has getFullYear, getMonth, ... getMilliseconds)

##### return

[Integer] if this < date then negative else if this > date then positive else 0

#### toString()

##### return

[String] yyyy-mm-ddT00:00:00.000.

MORE DOCUMENTATION
--------------------------------

See doc/ or parttime.coffee comments.

LICENSE
--------------------------------

(C) 2014 Narazaka : Licensed under [The MIT License](http://narazaka.net/license/MIT?2014)
