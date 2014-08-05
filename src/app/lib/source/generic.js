(function(App) {
    'use strict';

    var collection = new Backbone.PT.SelectableCollection();
    collection.add ([
        {name: "Movies",   id: "movies"},
        {name: "TV Shows", id: "shows"}
    ]);
    collection.select('movies');

    var self;
    var SourcesChooserView = Backbone.PT.SelectableChooserView.extend({
	template: '#source-chooser-tpl',
        onClickSelect: function (el, id) {
            App.vent.trigger('about:close');
            App.vent.trigger(id + ':list', []);

        }
    });

    var createChooserView = function (el) {
	return new SourcesChooserView ({
	    collection: collection,
	    el: el
	});
    };

    App.Source = {
        ChooserView: createChooserView
    };
})(window.App);
