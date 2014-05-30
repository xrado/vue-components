define(function(require){
	
	var Vue = require('vue');
	var utils = Vue.require('utils');

	var component = Vue.extend({
		data: {
			options: {}
		},
		ready: function(){
			var self = this;
			if(!this.options.chart) this.options.chart = {};
			this.options.chart.renderTo = this.$el;

			this._hc = new Highcharts.Chart(this.options);

			console.log('hc',this._hc);

			this.$watch('options.series',function(){

				// this._hc.series.forEach(function(s){
				// 	s.remove(false);
				// })
				
				this.options.series.forEach(function(s,i){
					if(self._hc.series[i]) self._hc.series[i].update(s,false);
					else self._hc.addSeries(s,false);
				});


				var isData = this.options.series.some(function(d){
					return d.data && d.data.length;
				});
				if (!isData) this._hc.showLoading('no data');
				else this._hc.hideLoading();
              
            
				self._hc.redraw();
				console.log('series change',arguments);
			});
		},
		methods: {
			showLoading: function(){
				this._hc.showLoading();
			}
		}
	});
	
	return component;

});