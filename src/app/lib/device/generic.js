(function(App) {
	'use strict';

	var self;

	var Device = Backbone.Model.extend ({
		defaults: {
                        id:   'local',
			type: 'local',
			name: 'Popcorn Time'
		},
		play: function (streamModel) {
                        App.vent.trigger('stream:local', streamModel);
		},
		getID: function () {
			return this.id;
		}

	});

	var DeviceCollection = Backbone.PT.SelectableCollection.extend ({
		selected: 'local',
		initialize: function () {
			App.vent.on('device:list', this.list);
			self = this;
		},
		list: function () {
			_.each(self.models, function (device) {
				App.vent.trigger('device:add', device);
			});
		},
		startDevice:  function (streamModel) {
			if (! this.selected) {
				this.selected = this.models[0];
			}
			/* SlashmanX: Just testing for now, 
			** replaces localhost IP with network IP, 
			** will remove when new streamer implemented
			*/
			var os = require('os')
			var interfaces = os.networkInterfaces();
			var addresses = [];
			for (var k in interfaces) {
				for (var k2 in interfaces[k]) {
					var address = interfaces[k][k2];
					if (address.family == 'IPv4' && !address.internal) {
						streamModel.attributes.src = streamModel.attributes.src.replace('127.0.0.1', address.address); 
						addresses.push(address.address)
					}
				}
			}

			return this.selected.play(streamModel);
		},

		setDevice: function(deviceID) {
			console.log(deviceID);
			this.selected = this.findWhere({id: deviceID});
		}

	});

	var collection = new DeviceCollection (new Device());
        collection.setDevice('local');

	var ChooserView = Backbone.PT.SelectableChooserView.extend({
		template: '#player-chooser-tpl',
                onSelect: function (el) {
			$('.imgplayerchoice').attr('src',  el.children('img').attr('src'));
		}
	});

	var createChooserView = function (el) {
		return new ChooserView ({
			collection: collection,
			el: el
		});
	};

	App.Device = {
		Generic: Device,
		Collection: collection,
		ChooserView: createChooserView
	};
})(window.App);
