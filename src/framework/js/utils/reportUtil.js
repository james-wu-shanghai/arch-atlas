(function () {
    var reportUtil = window.reportUtil = {}

    reportUtil.byDefault = function (val, defaultVal) {
        if (val)
            return val;
        return defaultVal;
    }


    // dataset format: [[key1, val1], [key2, val2],....,[keyN, valN]]
    reportUtil.drawPieChart = function (targetSelector, dataset, parameters) {
        var height = parameters.height
        var width = parameters.width
        var innerRadius = 0;
        var outerRadius = parameters.radius
        var color = this.byDefault(parameters.color, d3.scale.category20())

        var pie = d3.layout.pie().value(function (d) {
            return d[1];
        })
        var piedata = pie(dataset)

        var arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius)
        var svg = d3.select(targetSelector).append("svg").attr({width: width, height: height})
        var arcs = svg.selectAll("g").data(piedata).enter()
            .append("g")
            .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")")
        arcs.append("path")
            .attr("fill", function (d, i) {
                return color(i)
            })
            .attr("d", function (d) {
                return arc(d)
            })
        arcs.append("text")
            .attr("transform", function (d) {
                var x = arc.centroid(d)[0] * 1.4;
                var y = arc.centroid(d)[1] * 1.4;
                return "translate(" + x + "," + y + ")";
            })
            .attr("text-anchor", "middle")
            .text(function (d) {
                var percent = Number(d.value) / d3.sum(dataset, function (d) {
                        return d[1]
                    }) * 100
                if (percent != 0)
                    return percent.toFixed(1) + "%"
            })
        arcs.append("line")
            .attr("stroke", "black")
            .attr("x1", function (d) {
                return arc.centroid(d)[0] * 2
            })
            .attr("y1", function (d) {
                return arc.centroid(d)[1] * 2
            })
            .attr("x2", function (d) {
                var longX = 2.2
                if (d.data[1] == 0)
                    longX = 2
                return arc.centroid(d)[0] * longX
            })
            .attr("y2", function (d) {
                var longY = 2.2
                if (d.data[1] == 0)
                    longY = 2
                return arc.centroid(d)[1] * longY
            })
        arcs.append("text")
            .attr("transform", function (d) {
                var x = arc.centroid(d)[0] * 2.5
                var y = arc.centroid(d)[1] * 2.5
                return "translate(" + x + "," + y + ")"
            })
            .attr("text-anchor", "middle")
            .text(function (d) {
                if (d.data[1] != 0)
                    return d.data[0]
                return ""
            })
    }

}).call(this)