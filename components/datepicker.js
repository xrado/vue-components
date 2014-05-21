define(function(require){

	var Vue = require('vue');
	var utils = Vue.require('utils');
	var moment = require('moment');
	var template = require('text!components/datepicker.html');

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
			//console.log('uu',this,arguments);
		}
	};

	var component = Vue.extend({
		data: {
			value: null
		},
		template: template,
		directives: {
			options: options
		},
		created: function(){
			var self = this;
			this.$holder = this.$el.querySelector('div.x-datepicker-holder');
			this.$input = this.$el.querySelector('input.x-datepicker-input');

           	this.checkDate();
            this.makeMonth();            
		},
		methods: {
			checkDate: function(){
				this._date = this.value ? moment(this.value) : moment();
           		this._month = this.value ? moment(this.value) : moment();
			},
			onFocus: function (argument) {
				this.checkDate();
				this.makeMonth();
				utils.removeClass(this.$holder,'hide');
			},
			onBlur: function (argument) {
				setTimeout(function(){
					if(document.activeElement && document.activeElement == this.$input) return;
					utils.addClass(this.$holder,'hide');
				}.bind(this),250);
			},
			makeMonth: function(){
				var self = this;
				var today = moment();
				var todayYmd = today.format('YYYY-MM-DD');
				
				// calendar
				var dayOfWeek = this._month.clone().startOf('month').isoWeekday();
				var startOfMonth = this._month.clone().startOf('month').subtract('days', dayOfWeek);
				var monthYm = this._month.format('YYYY-MM');

				var month = [];
				var i = 0;
				[0,1,2,3,4,5].forEach(function(wi){
					month.push({
						weekNo: wi,
						days: []
					});
					[0,1,2,3,4,5,6].forEach(function(di){
						var date = startOfMonth.clone().add('days',i);
						var ymd = date.format('YYYY-MM-DD')
						month[wi].days.push({
							day: date.format('DD'),
							date: ymd,
							today: todayYmd == ymd,
							thisMonth: monthYm == date.format('YYYY-MM'),
							selected: self.value && self._date.format('YYYY-MM-DD') == ymd
						});
						i++;
					});
				});

                this.month = month;
                this.monthName = this._date.format('MMMM YYYY');
			},
			setDate: function(e){
				this.value = e.target.getAttribute('rel');
				this._date = this.value ? moment(this.value) : moment();
				this.$input.focus();
				this.makeMonth();
			},
			changeMonth: function(way){
				this.$input.focus();
				this._month = way == 'next' ? this._month.add('months',1) : this._month.subtract('months',1);
				this.makeMonth();
			}
		}
	});


	return component;

});