define(function(require){

var Vue = require('vue');
var Draggabilly = require('vendor/draggabilly.pkgd.min');
var utils = Vue.require('utils');
var tpl = require('text!tpl.html');
var tpl_modal = require('text!modal.html');
var autocomplete = require('components/autocomplete');
var colorpicker = require('components/colorpicker');
var datepicker = require('components/datepicker');
var imageholder = require('components/imageholder');
var sortable = require('components/sortable');

['forEach', 'map', 'filter', 'reduce', 'reduceRight', 'every', 'some'].forEach(
    function(p) {
    NodeList.prototype[p] = HTMLCollection.prototype[p] = Array.prototype[p];
});

Vue.component('content', {
	template: '<input type="text" v-model="content" v-valid="required"> <input type="checkbox" v-model="done"> <button v-on="click:onRemove($index)">X</button>'
});

Vue.validators = {
	trim: {
		errMsg: null,
		test: function(element,arg){
			if(element.value) element.value = element.value.replace(/(^\s+|\s+$)/g, '');
			return true;
		}
	},
	required: {
		errMsg: 'required',
		test: function(element,arg){
			return !!element.value;
		}
	},
	minLength: {
		errMsg: function(element,arg){
			return 'min '+arg+' characters required';
		},
		test: function(element,arg){
			return element.value && element.value.length && element.value.length >= +arg;
		}
	},
	maxLength: {
		errMsg: function(element,arg){
			return 'max '+arg+' characters allowed';
		},
		test: function(element,arg){
			return element.value && element.value.length && element.value.length <= +arg;
		}
	}
}

// Validator

Vue.directive('valid', {
    bind: function (value) {

        var self = this,
            el   = self.el,
            type = el.type,
            tag  = el.tagName;

            console.log('bind1',this.el.validIndex);

       	if (!this.vm._valid) this.vm._valid = [];
       	if(typeof this.el.validIndex == 'undefined') {
       		this.el.validIndex = this.vm._valid.length;
       		console.log('bind',this.el.validIndex);
       		this.vm._valid.push({
       			validate: [],
       			directive: this
       		});

       		console.log('l',this.vm._valid.length);

	    	this.onValidate = self.validate.bind(this);
	       	el.addEventListener('keyup', this.onValidate);
	       	el.addEventListener('change', this.onValidate);
	       	el.addEventListener('blur', this.onValidate);
	    }
       	//utils.nextTick(this.onValidate);
    },
    update: function () {
    	console.log('update',this.el.validIndex);
    	this.vm._valid[this.el.validIndex].validate.push({
    		validator: this.arg || this.key,
    		arg: this.key || null,
    	});
    },
    validate: function () {
    	console.log('vi',this.el.validIndex);
    	if(this.vm._valid[this.el.validIndex].validate.length){
    		utils.removeClass(this.el,'invalid');
    		utils.removeClass(this.el,'valid');
    		var valid = this.vm._valid[this.el.validIndex].validate.every(function(d){
    			return Vue.validators[d.validator].test.call(this,this.el,d.arg);
    		}.bind(this));
    		utils.addClass(this.el,valid?'valid':'invalid');
    	}
    	var value = this.el.value;
    },
    unbind: function () {
        this.el.removeEventListener('keyup', this.onValidate);
        this.el.removeEventListener('change', this.onValidate);
        this.el.removeEventListener('blur', this.onValidate);
    }
});

Vue.directive('draggable', {
    bind: function (value) {
    	var self = this;

    	if(!self.el._dragged) self.el._dragged = { el: this.el };

    	//console.log('draggable',this.arg,value,self.el.dragged,this,arguments)

    	if(!this.el.getAttribute('draggable')){
    		this.el.setAttribute('draggable','true');

	    	this.el.addEventListener('dragstart', function (e) {
				e.dataTransfer.effectAllowed = 'move'; // only dropEffect='copy' will be dropable
	  			e.dataTransfer.setData('Text', self.el._dragged.value); // required otherwise doesn't work
	  			self.vm.$root._dragging.push(self.el._dragged);
			});

			this.el.addEventListener('drag', function (e) {
				this.draggingAt = { x: e.x, y: e.y };
			});

			this.el.addEventListener('dragend', function (e) {
				self.vm.$root._dragging.splice(self.vm.$root._dragging.indexOf(self.el._dragged), 1);
			});
    	}
    },
    update: function(value){
		this.el._dragged[this.arg] = value;
    }
});

// Autocomplete
Vue.component('x-autocomplete', autocomplete);
Vue.component('x-colorpicker', colorpicker);
Vue.component('x-datepicker', datepicker);
Vue.component('x-imageholder', imageholder);
Vue.component('x-sortable', sortable);

var demo = new Vue({
	template: tpl,
	data: {
		_dragging: [],
		_valid: [],
		//
		name: '',
		contents: [
			{
				done: true,
				content: 'Learn JavaScript'
			},
			{
				done: false,
				content: 'Learn vue.js'
			}
		],
		color1: '#555555',
		color2: null,
		image1: 'guitar1.JPG',
		image2: null,
		list: [1,2,3,4,5,6],
		date: '2014-05-21'
	},
	methods: {
		isValid: function () {
			console.log(this._valid);
			var el;
			for(el in this._valid) {
				console.log('el',el)
				if(el.className.match(/invalid/)) return false;
			}
			return true;
		},
		onAdd: function () {
			this.$data.contents.push({
				done: false,
				content: ''
			});
		},
		onRemove: function (index) {
			this.$data.contents.$remove(index);
		},
		onSave: function () {
			if(this.isValid()) console.log(JSON.stringify(this.$data));
		},
		onOpen: function () {
			modal.$appendTo(document.body);
		},
		suggest: function () {
			console.log('aab')
		},
		getOptions: function () {
			console.log('getOptions',this,arguments);
			this.$.auto1.suggestions = [
				{value: 1, selected: false},
				{value: 2, selected: false},
				{value: 3, selected: false},
				{value: 4, selected: false},
				{value: 5, selected: false},
				{value: 6, selected: false}
			];
			this.$.auto1.show();
		},
		getOptions2: function () {
			console.log('getOptions2',this,arguments);
		},
		onSelect: function (){
			console.log('selected',this,arguments);
		}
	},
	attached: function  (argument) {
		
	}
});

demo.$appendTo(document.querySelector('div.container'));

// Modal

var modal = new Vue({
	className: 'modal-dialog',
	template: tpl_modal,
	ready: function () {
		this.$el.addEventListener('mousedown',this.mousedown);
		new Draggabilly(this.$el,{
			handle: '.modal-header'
		});
		this.$el.style.top = '100px';
		this.$el.style.left = '100px';
		this.$el.style.position = 'absolute';
		this.$el.style.zIndex = '10000';
		console.log(this.$el.style)
	},
	methods: {
		mousedown : function () {
			console.log(arguments);
		},
		close: function () {
			this.$remove();
		}
	}
});



});

