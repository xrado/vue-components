define(function(require){
	
	var Vue = require('vue');
	var utils = Vue.require('utils');
	var template = require('text!components/imageholder.html');

	var component = Vue.extend({
		template: template,
		data: {
			value: null,
		},
		ready: function(){
			var self = this;

			this.$el.addEventListener('dragover', function (e) {
				if (e.preventDefault) e.preventDefault(); // allows us to drop
				return false;
			});

			this.$el.addEventListener('dragenter', function (e) {
				self.$root._dragging.forEach(function(el) {
			        if (el.type == 'image' && el.el.draggingAt.x == e.x && el.el.draggingAt.y == e.y) {
			            this.className += " hover";
			        }
			    }, this);
			});

			this.$el.addEventListener('dragleave', function (e) {
				 self.$root._dragging.forEach(function(el) {
			        if (el.type == 'image' && el.el.draggingAt.x == e.x && el.el.draggingAt.y == e.y) {
			            this.className = el.el.className.replace(/ hover\b/g, "");
			        }
			    }, this);
			});

			this.$el.addEventListener('drop', function (e) {
				console.log('drop',self.$get('_dragging'))
				if (e.preventDefault) e.preventDefault(); // allows us to drop
				if (e.stopPropagation) e.stopPropagation(); // stops the browser from redirecting...why???
				this.className = '';	
				//console.log('drop',e.dataTransfer.getData('Text'),this,self);
				var dropped = self.$root._dragging.filter(function(el) {
					return el.type == 'image' && el.value == e.dataTransfer.getData('Text');
			    });
				if(!dropped.length) return;
				dropped = dropped[0];

				// swap
				if(dropped.vm) dropped.vm.value = self.value;

				self.value = dropped.value; //e.dataTransfer.getData('Text');

				console.log('droped',dropped);
			});

			// swap support
			var $img = this.$el.querySelector('img');

			$img.addEventListener('dragstart', function (e) {
				console.log('dragstart2')
				self.$root._dragging[0].vm = self;
			});

		},
		methods: {
			remove: function () {
				this.value = null;
			}	  
		}
	});


	return component;

});