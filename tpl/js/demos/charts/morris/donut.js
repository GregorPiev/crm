$(function () {
	
    if (!$('#donut-chart').length) { return false; }

	donut ();

	$(window).resize (App.debounce (donut, 325));

});

function donut () {
	$('#donut-chart').empty ();

	Morris.Donut({
        element: 'donut-chart',
        data: [
            {label: 'United Kingdom', value: 25 },
            {label: 'Australia', value: 40 },
            {label: 'United Arab Emirates', value: 25 },
            {label: 'Saudi Arabia', value: 10 }
        ],
        colors: App.chartColors,
        hideHover: true,
        formatter: function (y) { return y + "%" }
    });
}