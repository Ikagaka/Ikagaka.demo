# surfaces_txt2yaml

*surfaces.txt -> surfaces.yaml*

## Installation

this requires [js-yaml](https://github.com/nodeca/js-yaml)

    npm install -g surfaces_txt2yaml

## Usage

    surfaces_txt2yaml surfaces.txt surfaces.yaml

or use this on your program ...

    var fs = require('fs');
    var SurfacesTxt2Yaml = require('surfaces_txt2yaml');
    var txt_str = fs.readFileSync('surfaces.txt', 'utf8');
    var yaml = SurfacesTxt2Yaml.txt_to_yaml(txt_str);
    fs.writeFileSync('surfaces.yaml', yaml, 'utf8');

or use this on the browsers ...

    <script src="js-yaml.min.js"></script>
    <script src="surfaces_txt2yaml.js"></script>
    ...
    var yaml = SurfacesTxt2Yaml.txt_to_yaml(txt_str);

surfaces\_txt2yaml command currently supports only utf-8 input/output. If you want to input Shift_JIS text, use [encoding.js](https://github.com/polygonplanet/encoding.js) or some other text encoding libraries.

## Demo

http://narazaka.github.io/surfaces_txt2yaml/

## APIs

### yaml = SurfacesTxt2Yaml.txt_to_yaml(txt_str)

convert surfaces.txt format string to surfaces.yaml format string

### obj = SurfacesTxt2Yaml.txt_to_data(txt_str)

convert surfaces.txt format string to surfaces.yaml like object

## surfaces.yaml

see [surfaces\_yaml](https://github.com/Narazaka/surfaces_yaml)
