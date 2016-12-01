/**
 * Created by jameswu on 16-11-29.
 */
(function () {
    window.report = {}
    window.report.init = function () {
        var svg = d3.select('body').append('svg')
        window.report.svg = svg
    }

    report.showSolarReport = function (x, y, domain) {
        var svg = window.report.svg
        var report = d3.select('.solarReport')
        if (report.empty()) {
            report = svg.append("rect").attr('class', 'solarReport')
        }
        // console.log(report)
        svg.style({left: x + "px", top: y + "px", width: "100px", height: "160px"})
        report.style({
            width: "100px",
            height: "160px",
        })
    }

    report.hideSolarReport = function () {
        var report = d3.select('.solarReport')
        if (report) {
            report.remove()
        }
        window.report.svg.style({height: 0, width: 0})
    }
}).call(this)
