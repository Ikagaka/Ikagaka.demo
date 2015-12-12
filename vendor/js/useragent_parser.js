/*
Copyright 2009 Google Inc.
Node.js port by Michael Shapiro, 2010

Licensed under the Apache License, Version 2.0 (the "License")
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

(function(_this){

var exports;
if((typeof module != 'undefined') && (module.exports != null)){
  exports = module.exports;
}else{
  _this.useragent_parser = exports = {};
}

var browser_slash_v123_names = [
  'ANTGalio',
  'Camino',
  'Chrome',
  'Demeter',
  'Dillo',
  'Epiphany',
  'Fennec',
  'Flock',
  'Fluid',
  'Fresco',
  'Galeon',
  'GranParadiso',
  'IceWeasel',
  'Iceape',
  'Iceweasel',
  'Iris',
  'Iron',
  'Jasmine',
  'K-Meleon',
  'Kazehakase',
  'Konqueror',
  'Lobo',
  'Lunascape',
  'Lynx',
  'Maxthon',
  'Midori',
  'NetFront',
  'NetNewsWire',
  'Netscape',
  'OmniWeb',
  'Opera Mini',
  'SeaMonkey',
  'Shiira',
  'Sleipnir',
  'Sunrise',
  'Vienna',
  'Vodafone',
  'WebPilot',
  'iCab'
],
browser_slash_v123_names_pattern = '(' + browser_slash_v123_names.join('|') + ')'

var browser_slash_v12_names = [
  'Arora',
  'BOLT',
  'Bolt',
  'Camino',
  'Chrome',
  'Dillo',
  'Dolfin',
  'Epiphany',
  'Fennec',
  'Flock',
  'Galeon',
  'GranParadiso',
  'IBrowse',
  'IceWeasel',
  'Iceape',
  'Iceweasel',
  'Iron',
  'Jasmine',
  'K-Meleon',
  'Kazehakase',
  'Konqueror',
  'Lunascape',
  'Lynx',
  'Maxthon',
  'Midori',
  'NetFront',
  'NetNewsWire',
  'Netscape',
  'Opera Mini',
  'Opera',
  'Orca',
  'Phoenix',
  'SeaMonkey',
  'Shiira',
  'Sleipnir',
  'Space Bison',
  'Stainless',
  'Vienna',
  'Vodafone',
  'WebPilot',
  'iCab',
],
browser_slash_v12_names_pattern = '(' + browser_slash_v12_names.join('|') + ')'

var replace = function(type, replacement) {
  return function(components) {
    var component_matches = replacement.match(/\$([a-z\d]+)/g)
    if (component_matches)
      component_matches.forEach(function(match) {
        var component = match.substring(1)
        components[type] = replacement.replace(match, components[component])
      })
    else
      components[type] = replacement
  }
}



//
// Given a User-Agent HTTP header string, parse it to extract the browser "family", 
// (eg, "Safari", "Firefox", "IE"), and the major, minor, and tertiary version numbers.
//
// Note: Some browsers have a quaternary number, but this code stops at tertiary version numbers.
//
exports.parse = function(useragent) {

  var p = function() {
    var args = Array.prototype.slice.call(arguments, 0),
        regexp = args.shift(),
        callbacks = args,
        match = useragent.match(regexp)

    if (match) {
      var components = {
        family: match[1],
        v1: match[2],
        v2: match[3],
        v3: match[4]
      }
      callbacks.forEach(function(cb) {
        cb(components)
      })

      return components
    }
    else
      return false
  }


  return (
    // Special Cases ---------------------------------------------------------------------

    // must go before Opera
    p(/^(Opera)\/(\d+)\.(\d+) \(Nintendo Wii/, replace('family', 'Wii')) ||
    //  // must go before Browser/v1.v2 - eg: Minefield/3.1a1pre
    p(/(Namoroka|Shiretoko|Minefield)\/(\d+)\.(\d+)\.(\d+(?:pre)?)/, replace('family', 'Firefox ($family)')) ||
    p(/(Namoroka|Shiretoko|Minefield)\/(\d+)\.(\d+)([ab]\d+[a-z]*)?/, replace('family', 'Firefox ($family)')) ||
    p(/(MozillaDeveloperPreview)\/(\d+)\.(\d+)([ab]\d+[a-z]*)?/) ||
    p(/(SeaMonkey|Fennec|Camino)\/(\d+)\.(\d+)([ab]?\d+[a-z]*)/) ||
    // e.g.: Flock/2.0b2
    p(/(Flock)\/(\d+)\.(\d+)(b\d+?)/) ||

    // e.g.: Fennec/0.9pre
    p(/(Fennec)\/(\d+)\.(\d+)(pre)/) ||
    p(/(Navigator)\/(\d+)\.(\d+)\.(\d+)/,   replace('family', 'Netscape')) ||
    p(/(Navigator)\/(\d+)\.(\d+)([ab]\d+)/, replace('family', 'Netscape')) ||
    p(/(Netscape6)\/(\d+)\.(\d+)\.(\d+)/,   replace('family', 'Netscape')) ||
    p(/(MyIBrow)\/(\d+)\.(\d+)/,            replace('family', 'My Internet Browser')) ||
    p(/(Firefox).*Tablet browser (\d+)\.(\d+)\.(\d+)/, replace('family', 'MicroB')) ||
    // Opera will stop at 9.80 and hide the real version in the Version string.
    // see: http://dev.opera.com/articles/view/opera-ua-string-changes/
    p(/(Opera)\/.+Opera Mobi.+Version\/(\d+)\.(\d+)/, replace('family', 'Opera Mobile')) ||
    p(/(Opera)\/9.80.*Version\/(\d+)\.(\d+)(?:\.(\d+))?/) ||

    // Palm WebOS looks a lot like Safari.
    p(/(webOS)\/(\d+)\.(\d+)/, replace('family', 'Palm webOS')) ||
    p(/(hpwOS)\/(\d+)\.(\d+)\.(\d+)/, replace('family', 'Palm webOS')) ||

    p(/(Firefox)\/(\d+)\.(\d+)\.(\d+(?:pre)?) \(Swiftfox\)/,  replace('family', 'Swiftfox')) ||
    p(/(Firefox)\/(\d+)\.(\d+)([ab]\d+[a-z]*)? \(Swiftfox\)/, replace('family', 'Swiftfox')) ||

    // catches lower case konqueror
    p(/(konqueror)\/(\d+)\.(\d+)\.(\d+)/, replace('family', 'Konqueror')) ||

    // End Special Cases -----------------------------------------------------------------


  
    // Main Cases - this catches > 50% of all browsers------------------------------------
    // Browser/v1.v2.v3
    p(browser_slash_v123_names_pattern + '/(\\d+)\.(\\d+)\.(\\d+)') ||
    // Browser/v1.v2
    p(browser_slash_v12_names_pattern + '/(\\d+)\.(\\d+)') ||
    // Browser v1.v2.v3 (space instead of slash)
    p(/(iRider|Crazy Browser|SkipStone|iCab|Lunascape|Sleipnir|Maemo Browser) (\d+)\.(\d+)\.(\d+)/) ||
    // Browser v1.v2 (space instead of slash)
    p(/(iCab|Lunascape|Opera|Android) (\d+)\.(\d+)/) ||
    p(/(IEMobile) (\d+)\.(\d+)/, replace('family', 'IE Mobile')) ||
    // DO THIS AFTER THE EDGE CASES ABOVE!
    p(/(Firefox)\/(\d+)\.(\d+)\.(\d+)/) ||
    p(/(Firefox)\/(\d+)\.(\d+)(pre|[ab]\d+[a-z]*)?/) ||
    // End Main Cases --------------------------------------------------------------------
  
    // Special Cases ---------------------------------------------------------------------
    p(/(Obigo|OBIGO)[^\d]*(\d+)(?:.(\d+))?/, replace('family', 'Obigo')) ||
    p(/(MAXTHON|Maxthon) (\d+)\.(\d+)/, replace('family', 'Maxthon')) ||
    p(/(Maxthon|MyIE2|Uzbl|Shiira)/, replace('v1', '0')) ||
    p(/(PLAYSTATION) (\d+)/, replace('family', 'PlayStation')) ||
    p(/(PlayStation Portable)[^\d]+(\d+).(\d+)/) ||
    p(/(BrowseX) \((\d+)\.(\d+)\.(\d+)/) ||
    p(/(POLARIS)\/(\d+)\.(\d+)/, replace('family', 'Polaris')) ||
    p(/(BonEcho)\/(\d+)\.(\d+)\.(\d+)/, replace('family', 'Bon Echo')) ||
    p(/(iPhone) OS (\d+)_(\d+)(?:_(\d+))?/) ||
    p(/(iPad).+ OS (\d+)_(\d+)(?:_(\d+))?/) ||
    p(/(Avant)/, replace('v1', '1')) ||
    p(/(Nokia)[EN]?(\d+)/) ||
    p(/(Black[bB]erry).+Version\/(\d+)\.(\d+)\.(\d+)/, replace('family', 'Blackberry')) ||
    p(/(Black[bB]erry)\s?(\d+)/, replace('family', 'Blackberry')) ||
    p(/(OmniWeb)\/v(\d+)\.(\d+)/) ||
    p(/(Blazer)\/(\d+)\.(\d+)/, replace('family', 'Palm Blazer')) ||
    p(/(Pre)\/(\d+)\.(\d+)/, replace('family', 'Palm Pre')) ||
    p(/(Links) \((\d+)\.(\d+)/) ||
    p(/(QtWeb) Internet Browser\/(\d+)\.(\d+)/) ||
    p(/\(iPad;.+(Version)\/(\d+)\.(\d+)(?:\.(\d+))?.*Safari\//, replace('family', 'iPad')) ||
    p(/(Version)\/(\d+)\.(\d+)(?:\.(\d+))?.*Safari\//, replace('family', 'Safari')) ||
    p(/(OLPC)\/Update(\d+)\.(\d+)/) ||
    p(/(OLPC)\/Update()\.(\d+)/, replace('v1', '0')) ||
    p(/(SamsungSGHi560)/, replace('family', 'Samsung SGHi560')) ||
    p(/^(SonyEricssonK800i)/, replace('family', 'Sony Ericsson K800i')) ||
    p(/(Teleca Q7)/) ||
    p(/(MSIE) (\d+)\.(\d+)/, replace('family', 'IE')) ||
    // End Special Cases -----------------------------------------------------------------
    {family: 'Other'}
  
  )
}

//
// Simply returns a nicely formatted user agent.
//
exports.prettyParse = function(useragent) {
  var components = exports.parse(useragent),
      family = components.family,
      v1 = components.v1,
      v2 = components.v2,
      v3 = components.v3,
      prettyString = family

  if (v1) {
    prettyString += ' ' + v1
    if (v2) {
      prettyString += '.' + v2
      if (v3) {
        var match = v3.match(/^[0-9]/)
        prettyString += (match ? '.' : ' ') + v3
      }
    }
  }

  return prettyString
}

})(this);
