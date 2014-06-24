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

			//console.log('hc',this._hc);

			this.$watch('options.series',function(){

				this._hc.series.forEach(function(s){
					s.remove(false);
				})

				//console.log(1,this._hc.series);
				
				this.options.series.forEach(function(s,i){
					var _s = JSON.parse(JSON.stringify(s));
					//console.log(_s);
					if(self._hc.series[i]) self._hc.series[i].update(_s,false);
					else self._hc.addSeries(_s,false);
				});

				//console.log(2,this._hc.series);

				var isData = this.options.series.some(function(d){
					return d.data && d.data.length;
				});
				if (!isData) this._hc.showLoading('no data');
				else this._hc.hideLoading();
              
            
				self._hc.redraw();
				//console.log('series change',arguments);
				//console.log(3,this._hc.series);
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