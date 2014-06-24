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
var highchart = require('components/highchart');

['forEach', 'map', 'filter', 'reduce', 'reduceRight', 'every', 'some'].forEach(
    function(p) {
    NodeList.prototype[p] = HTMLCollection.prototype[p] = Array.prototype[p];
});

Vue.component('content', {
	template: '<input type="text" v-model="content"> <input type="checkbox" v-model="done"> <button v-on="click:onRemove($index)">X</button>'
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

Vue.component('x-autocomplete', autocomplete);
Vue.component('x-colorpicker', colorpicker);
Vue.component('x-datepicker', datepicker);
Vue.component('x-imageholder', imageholder);
Vue.component('x-sortable', sortable);
Vue.component('x-highchart', highchart);

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
		image1: 'guitar1.jpg',
		image2: null,
		list: [1,2,3,4,5,6],
		date: '2014-05-21',
		chartOptions: {
			series: [{
            	data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]
        	}]
		}
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
		onSelect: function (selected){
			console.log('selectedXXX',selected,this,arguments);
			if(selected) this.$.auto1.$input.value = selected.value;
		},
		////
		changeChartData: function(){
			this.chartOptions.series.$set(this.chartOptions.series.length-1,{name:'asd',data: [20.9, 51.5, 10.4, 12.2, 144.0, 6.0, 35.6, 148.5, 216.4, 94.1, 95.6, 54.4,200, 300, 400]});
		},
		addSerie: function(){
			this.chartOptions.series.push({data: [20.9, 51.5, 10.4, 1.2, 14.0, 6.0, 35.6, 48.5, 216.4, 4.1, 55.6, 54.4]});
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
		//this.$el.style.position = 'absolute';
		this.$el.style.zIndex = '10000';
		//console.log(this.$el.style)
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

// drag

// Hammer(document.querySelector('h3')).on("dragstart drag dragend", function(event) {
// 		event.preventDefault();
// 		if(event.type == 'dragstart'){
// 			this._top =  parseInt(this.style.top || '0');
// 			this._left =  parseInt(this.style.left || '0');
// 			this.style.position = 'relative';
// 			this.style['z-index'] = 10000;
// 		}

// 		if(event.type == 'drag'){
// 			this.style.top = this._top + event.gesture.deltaY + 'px';
// 			this.style.left = this._left + event.gesture.deltaX + 'px';
// 		}
		
//         //console.log(event.type,event.gesture.center,this);
//         console.log('target',document.elementFromPoint(event.gesture.center.pageX,event.gesture.center.pageX));
//     });



});

