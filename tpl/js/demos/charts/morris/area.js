$(function () {

	if (!$('#area-chart').length) { return false; }
	
	area ();	

	$(window).resize (App.debounce (area, 250));

});

function isInteger(n) {
    return n === +n && n === (n|0);
}

function area () {
	$('#area-chart').empty ();

	Morris.Line ({
		element: 'area-chart',
		data: [
      {period: '2013-11-11', leads: 61, deposits: 12.1},
			{period: '2013-11-12', leads: 65, deposits: 11.6},
			{period: '2013-11-13', leads: 56, deposits:  16.2},
			{period: '2013-11-14', leads: 65, deposits: 11.5},
			{period: '2013-11-15', leads: 82, deposits: 23.5},
			{period: '2013-11-16', leads: 101, deposits: 14.1},
			{period: '2013-11-17', leads: 82, deposits: 12.4}
		],
		xkey: 'period',
		ykeys: ['leads', 'deposits'],
		labels: ['Leads', 'Deposits'],
    yLabelFormat: function(d) {    
      return isInteger(d) ? d : "$" + d + 'K';
    },
		pointSize: 3,
		hideHover: 'auto',
		lineColors: [App.chartColors[0], App.chartColors[1], App.chartColors[3]]
	});
}