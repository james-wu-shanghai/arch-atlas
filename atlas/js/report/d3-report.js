/**
 * Created by jameswu on 16-11-29.
 */
(function () {
    var report = window.report = {}
    report.init = function () {
        var popReport = d3.select('body').append('div')
        popReport.attr('id', 'pop-report')
        report.showSolarReport = showSolarReport
        report.hideSolarReport = hideSolarReport
    }

    function showSolarReport(x, y, domain) {
        d3.select('#pop-report').style({
            left: x + "px",
            top: y + "px",
        })

        //在看不太见的地方死磕的例子
        $('#pop-report').load('planet-report.html', {}, function () {
            window.solarReport.render(domain)
            var top = Number.parseInt($('#pop-report').css('top'));
            var height = Number.parseInt($('#pop-report').css('height'));
            if (top + height > window.innerHeight) {
                $('#pop-report').css('top', window.innerHeight - height);
            }
            var left = Number.parseInt($('#pop-report').css('left'));
            var width = Number.parseInt($('#pop-report').css('width'));
            if (left + width > window.innerWidth)
                $('#pop-report').css('left', window.innerWidth - width)
        })
    }

    function hideSolarReport() {
        var report = d3.select('#pop-report')
        if (report) {
            report.html('')
        }
    }
}).call(this)
