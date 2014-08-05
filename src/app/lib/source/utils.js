(function(App) {
    'use strict';

    Backbone.PT = {};
    Backbone.PT.SelectableCollection = Backbone.Collection.extend ({
        selected: 'movies',
        select: function (id) {
            this.selected = this.findWhere({id: id});
        }
    });

    var self;
    Backbone.PT.SelectableChooserView = Backbone.Marionette.ItemView.extend({
	events: {
            'click li.selectable': '_select'
        },
        initialize: function () {
            self = this;
        },
	onRender: function () {
            var id =  this.collection.selected.get('id');
            var el = $('li.selectable#' + id);
            this.selectSource(el);
	},
	_select: function (e) {
            e.preventDefault();

            var el =$(e.currentTarget);
            var id = el.attr('id');

            self.select(el);
            if (self.onClickSelect) {
                self.onClickSelect(el, id);
            }
        },
        select: function (el) {
            var id = el.attr('id');

            el.addClass('active');
            this.collection.select(el.attr('id'));
            if (this.onSelect) {
                self.onSelect(el, id);
            }
	}
    });
})(window.App);
