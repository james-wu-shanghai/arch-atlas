/**
 * Created by james on 17-1-12.
 */
(function () {
    var solarReport = window.solarReport = {}
    solarReport.render = function (solar) {
        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip") //用于css设置类样式
            .attr("opacity", 0.0);
        solarReport.renderAppList(solar);
        solarReport.renderStaticPie(solar);
        solarReport.renderDepLines(solar);
    }
    solarReport.renderAppList = function renderAppList(solar) {
        var report = d3.select('#appList')
        report.style('height', (solar.planets.length * 0.8 + 2) + 'em')
        var svg = report.append('svg');
        svg.style('height', (solar.planets.length * 0.8 + 2) + 'em')
        svg.append('text').text('Domain Name: ' + solar.name).attr({
            fill: 'black',
            'font-size': '0.8em',
            y: '1em'
        })
        svg.append('text').text('App No.: ' + solar.planets.length).attr({
            fill: 'black',
            'font-size': '0.8em',
            y: '2em'
        })


        var names = jsonConvert.sortByType(solar.planets)
        for (var i = 0; i < names.length; i++) {
            var name = names[i]
            svg.append('text').html(
                name
            ).attr({
                fill: 'black',
                'font-size': '0.8em',
                y: (3 + i) + 'em',
                x: '1em'
            })
        }
    }
    solarReport.doStatic = function (solar) {
        var planetStatic = solar.domainJsonObj.planetStatic;
        var validSuffix = jsonConvert.valid_suffix;

        if (planetStatic)
            return planetStatic

        planetStatic = []
        for (var i = 0; i < validSuffix.length; i++)
            planetStatic[i] = 0
        for (var i = 0; i < solar.planets.length; i++) {
            var planet = solar.planets[i]
            for (var j = 0; j < validSuffix.length; j++) {
                if (jsonConvert.endWith(planet.name, validSuffix[j])) {
                    planetStatic[j]++;
                }
            }
        }
        solar.domainJsonObj.planets = planetStatic
        return planetStatic;
    }
    solarReport.renderStaticPie = function (solar) {
        var planetTypes = solarReport.doStatic(solar)
        var dataset = []
        for (var i = 0; i < jsonConvert.valid_suffix.length; i++) {
            dataset.push([jsonConvert.valid_suffix[i], planetTypes[i]])
        }
        var pie = d3.layout.pie().value(function (d) {
            return d[1];
        })
        var piedata = pie(dataset)

        var width = 200
        var height = 200
        var outerRadius = width / 3
        var innerRadius = 0;
        var arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius)
        var color = d3.scale.category20()
        var svg = d3.select("#solarPie").append("svg").attr({width: width, height: height})
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
    solarReport.renderDepLines = function (solar) {

        var static = null;
        for (var i = 0; i < atlas.edges.length; i++) {
            if (solar.name == atlas.edges[i].domain) {
                static = atlas.edges[i];
                break;
            }
        }
        if (!static)
            return
        var dataset = [static.byApps.length, static.byDomains.length, static.onApps.length, static.onDomains.length, static.biApps.length, static.biDomains.length]
        var depSet = [static.byApps, static.byDomains, static.onApps, static.onDomains, static.biApps, static.biDomains]
        var hintSet = ['ToPlanets', 'ToSolar', 'fromPlanets', 'fromSolar', 'biDirectPlanets', 'biDirectSolars']
        var width = 200
        var height = 300;
        var step = 30;
        var lineHeight = 20
        var lineWidthUnit = 30;
        var svg = d3.select("#depBar").append("svg").attr("width", width).attr("height", height);
        var enter = svg.selectAll('rect').data(dataset).enter();
        var rect = enter.append("rect").attr("fill", "steelblue")
            .attr('y', function (d, i) {
                return i * (lineHeight + step) + step - 5
            }).attr('x', 0)
            .attr('height', lineHeight)
            .attr('width', function (d, i) {
                var wid = Math.log2(1 + d)
                if (wid > 10)
                    wid = 10
                return wid * lineWidthUnit;
            })
            .style('cursor', 'help')
            .on('mouseenter', function (d, i) {
                    var $depContent = $('#depContent')
                    if ($depContent.css('display') == 'none') {
                        $depContent.html(function () {

                            var hint = "<text><tspan>" + hintSet[i] + ":" + depSet[i] + "</tspan></text>"
                            // for (var j = 0; j < depSet.length; j++)
                            //     for (var k = 0; k < depSet[i].length; k++)
                            //         hint += '\<a title=\'展示应用依赖\' target=\'vaadin\' href=\'/ui/vaadin/?appName=' + depSet[j][k] + '\'\>' + depSet[j][k] + '\</a\>'
                            return hint;
                        })
                        var $pop = $('#pop-report');
                        var popTop = Number.parseInt($pop.css('top'))
                        var popLeft = Number.parseInt($pop.css('left'))
                        var hintTop = event.clientY - popTop
                        var hintLeft = event.clientX - popLeft
                        $depContent.css({'display': 'block', 'top': hintTop, 'left': hintLeft})
                    }
                }
            ).on('mouseleave', function () {
                console.log('mouse out')
                var $depContent = $('#depContent')
                if ($depContent.css('display') == 'block') {
                    $depContent.text("")
                    $depContent.css({"display": "none", "left": '0px', 'top': '0px'})
                }
            })
        // var rectTran = rect.transition()
        //     .duration(2000).ease("back-in")
        //     .attrTween("width", function (d, i, a) {
        //         return function (t) {
        //             return Number(a) + t * 300
        //         }
        //     })
        var textEnter = svg.selectAll('#depBar text').data(dataset).enter()
        textEnter.append("text")
            .attr("fill", "white")
            .attr('y', function (d, i) {
                return i * (lineHeight + step) + step - 5
            })
            .attr('x', 5)
            .attr({dy: "1.2em"})
            .text(function (d, i) {
                return d
            })
            .attr('style', 'pointer-events:none')
        for (var i = 0; i < hintSet.length; i++) {
            svg.append("text").attr('x', 0).attr({'fill': 'steelblue', 'dy': '1.2em'}).attr('y', function () {
                return i * (step + lineHeight)
            }).text(hintSet[i])

        }
    }


}).call(this)