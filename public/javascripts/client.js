$(function(exports){
	var Backbone = require('backbone@0.3.3'),
		_ = require('underscore')._,
		resources = require('./models/resources'),
		drawing = new resources.collections.Drawing;
	
	window.Point = Backbone.View.extend({
		initialize: function() {
			_.bindAll(this, 'render');
			this.model.view = this;
			this.canvas = $('.game').dom[0];
			this.ctx = this.canvas.getContext("2d");
			this.ctx.fillStyle = "rgb(200,0,0)";
			this.render();
		},
		render: function() {
			this.ctx.beginPath();
			this.ctx.arc(this.model.get('x'), this.model.get('y'), 10, 0, Math.PI*2, true); 
			this.ctx.closePath();
			this.ctx.fill();
			return this;
		}
	});
	
	window.AppView = Backbone.View.extend({
		el: $(".area"),
		events: {
			"mousedown .game": "setNewPoint"
		},
		initialize: function() {
			this.canvas = $('.game').dom[0];
			this.ctx = this.canvas.getContext("2d");
			
			_.bindAll(this, 'drawPoint', 'drawnPoints');
			var self = this;
			drawing.bind('add', this.drawPoint);
			drawing.bind('refresh', function(data) {
				data.each(function(model){
					if(self.drawnPoints[model.id]) {
						self.drawnPoints[model.id].model.set(model.attributes);
					} else {
						self.drawPoint(model);
					}
				});
			});
			
			// old fashion request to get the current state
			drawing.fetch({success: function(data) { } });
			
			DNode({
				add: function(data) {
					console.log(data);
					if (!drawing.get(data.id)) drawing.add(data)
				}
			}).connect(function(remote){
				var em = require('events').EventEmitter.prototype;
				remote.subscribe(function () {
					em.emit.apply(em, arguments);
				});
				drawing.bind('dnode:add', function(data){
					remote.add(data);
				});
			});
		},
		drawnPoints: {},
		drawPoint: function(model) {
			var point = new Point({model: model});
			this.drawnPoints[model.id] = point;
		},
		setNewPoint: function(event) {
			drawing.trigger('dnode:add', {x: event.clientX-this.canvas.offsetLeft, y: event.clientY-this.canvas.offsetTop});
			
		}
	});
	
	window.App = new AppView;
});
