define(function(require){
	
	var Vue = require('vue');
	var utils = Vue.require('utils');
	var template = require('text!components/sortable.html');

	var component = Vue.extend({
		template: template,
		data: {
			items: null,
			_dragElem: null,
			_insertIndex: null
		},
		methods: {
		  reorder: function(){
			var i$, to$, i, e, sourceIndex;
			for (i$ = 0, to$ = this.items.length; i$ <= to$; ++i$) {
			  i = i$;
			  e = i;
			  if (this._dragElem != null) {
				sourceIndex = this._dragElem.$index;
				if (sourceIndex < e) {
				  --e;
				}
			  }
			}
		  },
		  dragstart: function(ev){
			var st;
			ev.dataTransfer.effectAllowed = 'move';
			this._dragElem = ev.targetVM;
			this._dragNode = ev.target;
			this.reorder();
		  },
		  dragend: function(ev){
			this._dragNode = null;
			this._dragElem = null;
			this.reorder();
			ev.preventDefault();
		  },
		  drop: function(ev){
			this.dragend(ev);
		  },
		  dragover: function(ev){
			ev.preventDefault();
			return true;
		  },
		  dragenter: function(ev){
			var insertIndex, sourceIndex, removed;
			insertIndex = ev.targetVM.$index;
			if(!this._dragElem) return;
			sourceIndex = this._dragElem.$index;
			if (sourceIndex === insertIndex) {
			  return;
			}
			removed = this.items.splice(sourceIndex, 1);
			this.items.splice(insertIndex, 0, removed[0]);
			this.reorder();
			ev.preventDefault();
			return true;
		  }
		},
		ready: function(){
		  this.reorder();
		}
	});


	return component;

});