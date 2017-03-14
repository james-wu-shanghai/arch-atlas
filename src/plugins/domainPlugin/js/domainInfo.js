/**
 * Created by james on 17-1-12.
 */
(function () {
    var solarReport = window.solarReport = {}

    solarReport.init = function () {
        var popReport = d3.select('body').append('div')
        popReport.attr('id', 'solar-report')
    }

    solarReport.showSolarReport = function (x, y, domain) {
        d3.select('#solar-report').style({
            left: x + "px",
            top: y + "px",
            display: 'block',
        })

        //在看不太见的地方死磕的例子
        $('#solar-report').load('src/plugins/domainPlugin/domain.html', {}, function () {
            window.solarReport.render(domain)
            var $solarReport = $('#solar-report');
            var top = Number.parseInt($solarReport.css('top'));
            var height = Number.parseInt($solarReport.css('height'));
            if (top + height > window.innerHeight) {
                $solarReport.css('top', window.innerHeight - height);
            }
            var left = Number.parseInt($solarReport.css('left'));
            var width = Number.parseInt($solarReport.css('width'));
            if (left + width > window.innerWidth)
                $solarReport.css('left', window.innerWidth - width)
        })
    }

    solarReport.close = function () {
        var report = d3.select('#solar-report')
        if (report) {
            report.html('')
            report.style('display', 'none')
        }
    }

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
        var edgesInfo = links.getBySolarName(solar.name);
        var title = solar.name
        if (edgesInfo)
            title += globalResource.domainCallOutTotal + edgesInfo.totalCatOut
        $('#domainTitle').text(title);
        var table = tableUtil.buildTable('#appList', globalResource.appListHead);
        var planets = solarReport.sortByType(solar.planets)['oneDimArray']

        for (var i = 0; i < planets.length; i++) {
            var typedPlanets = planets[i]
            for (var j = 0; j < typedPlanets.allApps.length; j++) {
                var planetName = typedPlanets.allApps[j].name
                var name = globalResource.appNameDecorator(planetName)
                var content = [name, 0, globalConfig.typedNames[typedPlanets.typedJson.type]]
                if (edgesInfo) {
                    sumCallOuts(planetName, edgesInfo.out, content);
                    sumCallOuts(planetName, edgesInfo.bi, content);
                }
                tableUtil.addContent(table, content)
            }
        }
        tableUtil.draw(table, {
            "info": false,
            "paging": false,
            "searching": false,
            scrollY: "400px",
            sorting: [[2, 'asc']],
        })
        function sumCallOuts(planetName, domainConns, content) {
            for (var i = 0; i < domainConns.length; i++) {
                var appConns = domainConns[i].appConns
                for (var j = 0; j < appConns.length; j++) {
                    if (appConns[j].from == planetName) {
                        content[1] = appConns[j].catcnt + content[1]
                    }
                }
            }
        }
    }
    //按照类型排序
    solarReport.sortByType = function (planets) {
        var typeSort = globalConfig.planetTypes;
        var sorts = [[], [], [], [], [], [], []]
        var result = []
        for (var i = 0; i < planets.length; i++) {
            var planet = planets[i]
            for (var j = 0; j < typeSort.length; j++) {
                if (domainParser.startWith(planet.name, typeSort[j]) || domainParser.endWith(planet.name, typeSort[j])) {
                    sorts[j].push(planet)
                    break;
                }
            }
        }
        for (var i = 0; i < sorts.length; i++)
            for (var j = 0; j < sorts[i].length; j++)
                result.push(sorts[i][j])
        return {'oneDimArray': result, 'twoDimArray': sorts}
    },
        solarReport.doStatic = function (solar) {
            var planetStatic = solar.domainJson.planetStatic;
            var validSuffix = domainParser.valid_suffix;

            if (planetStatic)
                return planetStatic

            planetStatic = []
            for (var i = 0; i < validSuffix.length; i++)
                planetStatic[i] = 0
            for (var i = 0; i < solar.planets.length; i++) {
                var typedPlanets = solar.planets[i]
                for (var j = 0; j < validSuffix.length; j++) {
                    if (domainParser.endWith(typedPlanets.name, validSuffix[j])) {
                        planetStatic[j] = typedPlanets.allApps.length;
                    }
                }
            }
            solar.domainJson.planets = planetStatic
            return planetStatic;
        }
    solarReport.renderStaticPie = function (solar) {
        var planetTypes = solarReport.doStatic(solar)
        var dataset = []
        for (var i = 0; i < domainParser.valid_suffix.length; i++) {
            dataset.push([domainParser.valid_suffix[i], planetTypes[i]])
        }
        reportUtil.drawPieChart('#solarPie', dataset, {height: 200, width: 200, radius: 200 / 3})
    }
    solarReport.renderDepLines = function (solar) {
        $('#depControl > #deps').attr("href", globalResource.depDownloadLink(solar.name))
        $('#depControl > #interfaces').attr("href", globalResource.domainInterfaceDownloadLink(solar.name))
        var edgesInfo = atlas.edgesMap[solar.name]
        if (edgesInfo == null || edgesInfo.stat == null)
            return
        var stat = edgesInfo.stat;

        var dataset = [stat.byApps.length, stat.byDomains.length, stat.onApps.length, stat.onDomains.length, stat.biApps.length, stat.biDomains.length]
        var depSet = [stat.byApps, stat.byDomains, stat.onApps, stat.onDomains, stat.biApps, stat.biDomains]
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
                        var $pop = $('#solar-report');
                        var popTop = Number.parseInt($pop.css('top'))
                        var popLeft = Number.parseInt($pop.css('left'))
                        var hintTop = event.clientY - popTop
                        var hintLeft = event.clientX - popLeft
                        $depContent.css({'display': 'block', 'top': hintTop, 'left': hintLeft})
                    }
                }
            ).on('mouseleave', function () {
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