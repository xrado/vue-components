define(function(require){
	
	var Vue = require('vue');
	var utils = Vue.require('utils');
	var template = require('text!components/autocomplete.html');

	var options = {
		isFn: true,
		bind: function () {
			this.context = this.binding.isExp
				? this.vm
				: this.binding.compiler.vm
		},

		update: function (handler) {
			var vm = this.vm,
				context = this.context;
			if (typeof handler == 'function') vm[this.arg] = handler.bind(context);
			else vm[this.arg] = this.key;
		}
	};

	var component = Vue.extend({
		data: {
			minlen: 1,
			width: '100px',
			showList: false,
			selected: null,
			suggestions: []
		},
		template: template,
		directives: {
			options: options
		},
		ready: function(){
			this.$input = this.$el.querySelector('input.x-autocomplete-input');
			this.$list = this.$el.querySelector('div.x-autocomplete-suggestions');
			this.$watch('suggestions',function(){
				utils.removeClass(this.$input,'loading');
			}.bind(this));
		},
		methods: {
			keys: function (event) {
				var self = this;
				var key = event.keyIdentifier || event.key;

				if(['Left','Right','Tab'].indexOf(key) != -1) return; // Ignored keys

				if(['Down','Up'].indexOf(key) != -1){
					this.navigate(event);
					return;
				}
				if(event.keyCode == 27) { // Esc
					this.hide();
					return;
				}
				if(key == 'Enter'){
					this._select();
					return;
				}
				if(this.value) {
					if(this.timer) clearTimeout(this.timer);
					if(this.value && this.value.length >= this.minlen && this.options) {
						this.timer = setTimeout(function(){
							utils.addClass(this.$input,'loading');
							this.options.call(this.vm);
						}.bind(this),400);
					}
				}
				else this.hide();
			},
			show: function () {
				this.selected = null;
				this.$list.scrollTop = 0;
				this.showList = true;
			},
			hide: function () {
				var self = this;
				setTimeout(function(){
					self.showList = false;
				},500);
			},
			navigate: function (event) {
				if(!this.suggestions || !this.suggestions.length) return;
				var self = this;
				if((event.keyIdentifier || event.key) == 'Down' && this.selected < this.suggestions.length-1){
					if (this.selected === null) this.selected = 0 ;
					else ++this.selected;
				}
				if(this.selected && (event.keyIdentifier || event.key) == 'Up') --this.selected;
				this.suggestions.forEach(function(d,i) {
					d.selected = i === self.selected; 
				});

				if(this.suggestions.length && this.$list.scrollHeight > this.$list.clientHeight) this.$list.scrollTop = (self.selected * this.$list.scrollHeight/this.suggestions.length );
				else this.$list.scrollTop = 0;
			},
			_select: function (index) {
				if(!this.suggestions || !this.suggestions.length) return;
				this.select.call(this.vm,this.suggestions[+(this.selected || index)])
				this.hide();
			}
		}
	});
	
	return component;

});