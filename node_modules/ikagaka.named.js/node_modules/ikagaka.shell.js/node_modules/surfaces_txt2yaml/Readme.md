# surfaces_txt2yaml

*surfaces.txt -> surfaces.yaml*

## Installation

this requires [js-yaml](https://github.com/nodeca/js-yaml)

    npm install -g surfaces_txt2yaml

## Usage

    surfaces_txt2yaml surfaces.txt -o surfaces.yaml

or use this on your program ...

    var fs = require('fs');
    var SurfacesTxt2Yaml = require('surfaces_txt2yaml');
    var txt_str = fs.readFileSync('surfaces.txt', 'utf8');
    var yaml = SurfacesTxt2Yaml.txt_to_yaml(txt_str, {compatible: 'ssp-lazy'});
    fs.writeFileSync('surfaces.yaml', yaml, 'utf8');

or use this on the browsers ...

    <script src="js-yaml.min.js"></script>
    <script src="surfaces_txt2yaml.js"></script>
    ...
    var yaml = SurfacesTxt2Yaml.txt_to_yaml(txt_str, {compatible: 'ssp-lazy'});

surfaces\_txt2yaml command currently supports only utf-8 input/output. If you want to input Shift_JIS text, use [encoding.js](https://github.com/polygonplanet/encoding.js) or some other text encoding libraries.

## Demo

http://narazaka.github.io/surfaces_txt2yaml/

## APIs

### yaml = SurfacesTxt2Yaml.txt_to_yaml(txt_str, options)

convert surfaces.txt format string to surfaces.yaml format string

### obj = SurfacesTxt2Yaml.txt_to_data(txt_str, options)

convert surfaces.txt format string to surfaces.yaml like object

## options

    --output, -o
            output (default: stdout)

options below is same name as API options

    --lint, -v
            validation only
    
    --compatible, -c
            set all options to parse surfaces.txt as [materia/ssp(default)/ssp-lazy] compatible
    
    --charset, -C
            enable charset setting parse
    
    --check_seriko, -a
            check seriko version [warn/throw]
    
    --allow_all_seriko, -A
            accept any seriko version with ignoring "version" property
    
    --surface_definition, -S
            parse surface definition as [materia/ssp/ssp-lazy] compatible
    
    --check_surface_scope_duplication, -d
            check surface scope duplication [warn/throw]
    
    --check_nonstandard_comment, -n
            check nonstandard comment [warn/throw]
    
    --comment_prefix, -p
            comment prefix (default: "//")
            -p "//,#,;"

## surfaces.yaml

see [surfaces\_yaml](https://github.com/Narazaka/surfaces_yaml)
