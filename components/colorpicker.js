define(function(require){
	
	var Vue = require('vue');
	var utils = Vue.require('utils');
	var template = require('text!components/colorpicker.html');
	require('vendor/colorpicker');

	var component = Vue.extend({
		data: {
			value: null
		},
		template: template,
		ready: function(){
			var self = this;
			this.$cp = this.$el.querySelector('div.x-colorpicker');
			this.$holder = this.$el.querySelector('div.x-colorpicker-holder');
			this.$color = this.$el.querySelector('.x-colorpicker-color');
			this.cp = new ColorPicker(this.$cp,function(hex, hsv, rgb) {
                self.$color.style.backgroundColor = hex;
                self.value = hex;
            });
            
            utils.nextTick(function(){
            	if(self.value) self.cp.setHex(self.value);
            	utils.addClass(self.$holder,'hide');
            });
            
		},
		methods: {
			onFocus: function (argument) {
				utils.removeClass(this.$holder,'hide');
			},
			onBlur: function (argument) {
				utils.addClass(this.$holder,'hide');
			}
		}
	});


	return component;

});