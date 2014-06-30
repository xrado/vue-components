define(function(require){
	
	var Vue = require('vue');
	var utils = Vue.require('utils');
	var template = require('text!components/colorpicker.html');
	require('vendor/colorpicker');

	var component = Vue.extend({
		data: {
			value: null,
			rgba: null
		},
		template: template,
		ready: function(){
			var self = this;
			this.$cp = this.$el.querySelector('div.x-colorpicker');
			this.$holder = this.$el.querySelector('div.x-colorpicker-holder');
			this.$color = this.$el.querySelector('.x-colorpicker-color');
			this.cp = new ColorPicker(this.$cp,function(hex, hsv, rgb) {
				//console.log(JSON.stringify(arguments));
                if(rgb.a < 1)  self.$color.style.backgroundColor = 'rgba('+rgb.r+', '+rgb.g+', '+rgb.b+', '+rgb.a+')';
                else self.$color.style.backgroundColor = '#'+hex.substr(-6);
                self.value = hex;
                self.rgba = rgb;
            });
            
            utils.nextTick(function(){
            	if(self.value) self.cp.setHex(self.value);
            	utils.addClass(self.$holder,'hide');
            });

            this.$watch('value',function(){
            	if(!this.value) self.$color.style.backgroundColor = 'transparent';
            });
		},
		methods: {
			onFocus: function () {
				utils.removeClass(this.$holder,'hide');
			},
			onBlur: function () {
				utils.addClass(this.$holder,'hide');
			},
			onEnter: function (event) {
				var key = event.keyIdentifier || event.key;
				if(key == 'Enter') {
					if(event.target.value) this.cp.setHex(event.target.value);
					else this.value = this.rgba = null;
				}
			}
		}
	});

	return component;

});