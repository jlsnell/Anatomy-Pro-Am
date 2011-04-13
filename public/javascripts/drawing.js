components.drawing = function(){
	console.log('loaded drawing');
	
	window.ComputerView = Backbone.View.extend({
		el: $('#game'),
		events: {
			'click .light_grey_gradient_text': 'goBack',
			"mousedown .scanvas": "startLine",
			"mousemove .scanvas" : "drawLine",
			"mouseup .scanvas": "endLine",
			"change .slider": "changeLayer"
		},
		initialize: function() {
			_.bindAll(this, 'render');
			this.render();
		},
		render: function() {
			if (view.computer) {
				this.el.html('');
				this.el.html(view.computer);
				this.setupView();
			} else {
				$.get('/renders/computer.html', function(t){
					this.el.html('');
					view.computer = t;
					this.el.html(view.computer);
					this.setupView();
				}.bind(this));
			}
		},
		setupView: function() {
			this.canvas = $('canvas')[0];
			this.ctx = this.canvas.getContext("2d");
			
			// queue per user for drawing points, we might want to refactor this and add this info to the user model?
			this.users = {};
			
			em.on('pointColered', function(player_id, point) {
				var user = this.users[player_id];
				
				if(!user) {
					user = this.users[player_id] = {};
				}
				
				if(user.x != 0 && user.y != 0) {
					this.colorPoint(point.x, point.y, point.slide, 1);
				}
				
			}.bind(this));
			
			em.on('pointErased', function(player_id, point) {
				console.log(player_id, point)
			});
			
			// fixtures for the images (scans):
			var imageRefs = ['/images/cases/case1/1.png', '/images/cases/case1/2.png','/images/cases/case1/3.png', '/images/cases/case1/4.png'];
			
			imageRefs.forEach(function(img){
				this.$('#images').append('<img src="'+img+'" style="dislay: none;" />');
			});
			
			this.slides = this.$('#images').children();
			$(this.slides[0]).show();
			this.slide = 0;
		},
		goBack: function(e) {
			e.preventDefault();
			delete this;
			new CaseView;
		},
		colorPoint: function(x, y, slide, tool) {
			if(this.slide == slide) {
				this.ctx.fillStyle = "rgb(255,0,0)";
				this.ctx.beginPath();
				this.ctx.arc(x,y,1,0,Math.PI*2,true);
				this.ctx.closePath();
				this.ctx.fill();
			}
		},
		startLine: function(event) {
			event.preventDefault();
			this.isDrawing = true;
		},
		drawLine: function(event) {
			event.preventDefault();
			if(this.isDrawing) {
				remote.pointColored(myUID, {x: event.clientX-this.canvas.offsetLeft, y: event.clientY-this.canvas.offsetTop, slide: this.slide});
			}
		},
		endLine: function(event) {
			event.preventDefault();
			this.isDrawing = false;
		},
		changeLayer: function(event) {
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.slide = $('.slider')[0].value;
			var slide = this.slide;
			this.slides.each(function(n, el){
				if(slide != n) {
					$(el).hide();
				} else {
					$(el).show();
					$('#slide').html('#'+(n+1));
				}
			});
		}
	});
};