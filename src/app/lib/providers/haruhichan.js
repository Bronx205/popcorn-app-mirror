(function(App) {
    'use strict';
    var querystring = require('querystring');
    var request = require('request');
    var Q = require('q');

    var show_cache = {};

    var URL = 'http://haruhichan.com/feed/feed.php?';
    var Haruhichan = function() {};

    Haruhichan.prototype.constructor = Haruhichan;

    function xmlMediaGet (xml, key) {
        var ret = xml.getElementsByTagNameNS("http://search.yahoo.com/mrss/", key);
        return ret[0];
    };

    function xmlGetNodeData (xml, key) {
        return xml.getElementsByTagName(key)[0].innerHTML;
    };

    var queryTorrents = function(filters) {
        var params = {
            mode: 'rss'
        };
        /* XXX(xaiki): we still don't support any filter here.
         params.sort = 'seeds';
        params.limit = '50';

        if (filters.keywords) {
            params.keywords = filters.keywords.replace(/\s/g, '% ');
        }

        if (filters.genre) {
            params.genre = filters.genre;
        }

        if (filters.order) {
            params.order = filters.order;
        }

        if (filters.sorter && filters.sorter !== 'popularity') {
            params.sort = filters.sorter;
        }
         */

        return queryHaruhi(params);
    };

    function queryDetail(string) {
        var xml = (new DOMParser()).parseFromString(string, "text/xml");
        var items = xml.getElementsByTagName('item');

        console.log ('items', _.pluck(items, 'innerHTML'));
        var deferred = Q.defer();
        var promises =  _.map(items, function (item) {
            var link = xmlGetNodeData(item, 'description');
            var id   = link.match(/anime\/([0-9]+)/)[1];

            return queryHaruhi({
                mode: 'anime_rss',
                id: id
            });
        });

        Q.all(promises).done(function (details) {
            deferred.resolve (details);
        });

        return deferred.promise;
    }

    function formatForPopcorn (details) {
        var shows = _.map (details, function (item) {
            var xml = (new DOMParser()).parseFromString(item, "text/xml");
            var id = xml.getElementsByTagName('link')[0]
                    .getAttribute('href')
                    .split('id=')[1];
            var images = xml.getElementsByTagName('image')[0];

            if (!images)
                return null;

            show_cache[id] = xml.getElementsByTagName('item');

            return {
                id:      id,
                imdb_id: id,
                title:   xmlGetNodeData(xml, 'title').replace(' Torrent RSS Feed', ''),
                year:    'UNKNOWN',

                ShowRating: 4,

                synopsis: xmlGetNodeData(xml, 'description'),

                image:    xmlGetNodeData(images, 'url'),
                images: {
                    poster:     xmlGetNodeData(images, 'url'),
                    fanart:     xmlGetNodeData(images, 'url')
                }
            };

        });
        return {results: shows, hasMore: true};
    };


    var queryHaruhi = function(params) {
        var deferred = Q.defer();

        var url = URL + querystring.stringify(params).replace(/%25%20/g,'%20');
        win.info('Request to HARUHICHAN API');
        win.debug(url);
        request({url: url}, function(error, response, data) {
            if(error) {
                deferred.reject(error);
            } else if(!data || (data.error && data.error !== 'No movies found')) {
                var err = data? data.error: 'No data returned';
                win.error('API error:', err);
                deferred.reject(err);
            } else {
                deferred.resolve(data);
            }
        });

        return deferred.promise;
    };

    // Single element query
    var queryTorrent = function(torrent_id) {
        var deferred = Q.defer();

        var url = URL + querystring.stringify(params).replace(/%25%20/g,'%20');

        win.info('Request to HARUHICHAN API');
        win.debug(url);
        request({url: url}, function(error, response, data) {
            if(error) {

                callback(error, false);

            } else if(!data || (data.error && data.error !== 'No data returned')) {
                var err = data? data.error: 'No data returned';
                win.error('API error:', err);
                deffe(err, false);
            } else {
                // we cache our new element
                callback(false, data);
            }
        });
    };

    Haruhichan.prototype.extractIds = function(items) {
        return _.pluck(items.results, 'imdb_id');
    };

    Haruhichan.prototype.fetch = function(filters) {
        return queryTorrents(filters)
            .then(queryDetail)
            .then(formatForPopcorn);
    };

    Haruhichan.prototype.detail = function(torrent_id, callback) {
        return queryTorrent(torrent_id, callback);
    };

    App.Providers.Haruhichan = Haruhichan;

})(window.App);
