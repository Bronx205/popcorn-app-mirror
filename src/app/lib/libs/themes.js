(function() {
    'use strict';

    var stylus = require('stylus'),
        nib = require('nib'),
        fs = require('fs'),
        path = require('path'),
        gui = require('nw.gui'),
        parse = require('url').parse,
        resolve = require('url').resolve;

    var themeSettings = AdvSettings.get('theme'),
        themeElement = document.querySelector('#user-theme'),
        themeCachePath = path.join(gui.App.dataPath, 'themes'),
        currentTheme = themeSettings.path,
        currentThemeFilename = path.basename(currentTheme).replace(path.extname(currentTheme), ''),
        themeCacheCurrent = path.join(themeCachePath, '_cached_' + currentThemeFilename + '.css');

    function init() {
        if(themeSettings.default) {
            return;
        }

        fs.exists(themeCacheCurrent, function(exists) {
            if(exists) {
                // Load the current theme
                themeElement.href = 'file:///' + themeCacheCurrent;
            } else {
                // Generate the CSS
                compile(currentTheme, function() {
                    themeElement.href = 'file:///' + themeCacheCurrent;
                });
            }
        });
    }

    function compile(theme, cb) {
        // Compile the Stylus
        fs.readFile('./src/app/styl/app.styl', function(err, data) {
            if(err) { console.error(err); return; }

            stylus(data.toString())
            .set('filename', 'app.styl')
            .set('paths', ['./src/app/styl'])
            .use(nib())
            .define('url', rewriteUrl)
            .import(theme)
            .render(function(err, css) {
                if(err) {
                    console.error(err);
                    return;
                }
                fs.writeFile(themeCacheCurrent, css, function(err) {
                    if(err) {
                        console.error(err);
                        return;
                    }
                    cb();
                });
            });
        });
    }

    function rewriteUrl(url) {
        // Compile the url
        var compiler = new stylus.Compiler(url);
        compiler.isURL = true;
        url = url.nodes.map(function(node){
            return compiler.visit(node);
        }).join('');

        // Parse literal
        url = parse(url);
        var literal = new stylus.nodes.Literal('url("' + url.href + '")'),
            tail = '',
            res,
            found;

        // Absolute
        if (url.protocol) {
            return literal;
        }

        // Lookup
        found = resolve('app://host/src/app/theme/', url.pathname);

        // Failed to lookup
        if (!found) {
            return literal;
        }

        if (url.search) {
            tail += url.search;
        }
        if (url.hash) {
            tail += url.hash;
        }

        if (this.includeCSS && path.extname(found) === '.css') {
            return new stylus.nodes.Literal(found + tail);
        } else {
            //res = relative(dirname(this.filename), found) + tail;
            res = found + tail;
            if ('\\' === path.sep) {
                res = res.replace(/\\/g, '/');
            }
            return new stylus.nodes.Literal('url("' + res + '")');
        }
    }
    rewriteUrl.raw = true;

    init();

})();