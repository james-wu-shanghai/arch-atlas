/**
 * Created by james on 17-1-12.
 */
(function () {
    var solarReport = window.solarReport = {}
    solarReport.initResource = function () {
        $('ul a:contains(${appList})').html(globalResource.appList)
        $('ul a:contains(${depLine})').html(globalResource.depLine)
        $('ul a:contains(${solarPie})').html(globalResource.solarPie)
    }
    solarReport.render = function (solar) {
        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip") //用于css设置类样式
            .attr("opacity", 0.0);
        this.initResource()
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
                globalResource.appNameDecorator(name)
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
        reportUtil.drawPieChart('#solarPie', dataset, {height: 200, width: 200, radius: 200 / 3})
    }
    solarReport.renderDepLines = function (solar) {
        var static = null;
        for (var i = 0; i < atlas.edges.length; i++) {
            if (solar.name == atlas.edges[i].name) {
                static = atlas.edges[i].stat;
                break;
            }
        }
        if (!static)
            return
        var dataset = [static.byApps.length, static.byDomains.length, static.onApps.length, static.onDomains.length, static.biApps.length, static.biDomains.length]
        var depSet = [static.byApps, static.byDomains, static.onApps, static.onDomains, static.biApps, static.biDomains]
        var hintSet = globalResource.hintSet
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
                            var hint = hintSet[i] + ":" + depSet[i]
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