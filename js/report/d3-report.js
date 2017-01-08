/**
 * Created by jameswu on 16-11-29.
 */
(function () {
    window.report = {}
    report.init = function () {
        var popReport = d3.select('body').append('div')
        popReport.attr('id', 'pop-report')
        window.report.showSolarReport = showSolarReport
        window.report.hideSolarReport = hideSolarReport
    }

    function showSolarReport(x, y, domain) {
        d3.select('#pop-report').style({
            left: x + "px",
            top: y + "px",
        })
        $('#pop-report').load('planet-report.html', {}, function () {
            window.solarReport.render(domain)
        })
    }

    function hideSolarReport() {
        var report = d3.select('#pop-report')
        if (report) {
            report.html('')
        }
    }
}).call(this)
