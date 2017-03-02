/**
 * Created by jameswu on 17-1-20.
 */
(function () {
    var lir = window.linkInfoReport = {}
    lir.setInfo = function (edge) {
        lir.edge = edge
    }

    lir.open = function (e) {
        var template = e.target.attributes['data-template']
        var tmpVal = (template && template.value) ? template.value : 'linkInfo.html';

        $('#infoPanel').load(LinkPlugin.pluginRoot + tmpVal, {}, function () {
            $('#infoPanel').on('show.bs.modal', function () {
                //TODO: this should move to control panel by message
                solarReport.close()
                linkFloat.close();
                lir.hideComments();
            });
            $('#infoPanel').modal({backdrop: true})
            $('#infoPanel .modal-lg').css('width', window.innerWidth - 50)
            var type = e.target.attributes['data-type'].value;
            if (type == 'linkInfo')
                lir.openLinkInfo();
            else if (type == 'biDepReport')
                lir.openBiDepReport();
            else if (type == 'noCatReport')
                lir.openNoCatReport();
            else if (type == 'appDepValidReport')
                lir.openAppDepValidReport();
            else if (type == 'dbFileDepValidReport')
                lir.openDbFileValidReport()
            else if (type == 'interfaceReport')
                lir.openInterfaceReport()


            $('#infoPanel').on('hidden.bs.modal', linkInfoReport.close);
        })
    }
    lir.openBiDepReport = function () {
        $('#infoPanel .modal-title').html("双向依赖应用列表")
        var table = tableUtil.buildTable('#panelInfoBody', ['双向依赖', '调入方', '调出方', '记录到的调用次数'])
        var dedup = {}

        for (var key in atlas.edgesMap) {
            var edge = atlas.edgesMap[key];
            for (var i = 0; i < edge.bi.length; i++) {
                var appConns = edge.bi[i].appConns;
                for (var j = 0; j < appConns.length; j++) {
                    var appConn = appConns[j];
                    if (appConn.bidirect) {
                        var linkKey = (appConn.from + "|" + appConn.to);
                        if (dedup[linkKey] != null)
                            continue;
                        var sortedMark = [appConn.from, appConn.to].sort().join("/")
                        tableUtil.addContent(table, [sortedMark, appConn.from, appConn.to, appConn.catcnt])
                        dedup[linkKey] = appConn.catcnt;
                    }
                }
            }
        }
        tableUtil.draw(table, {
            scrollCollapse: true,
            scrollY: window.innerHeight * 0.5,
            sorting: [[2, 'desc']],
            "dom": 'Bfltip',
            buttons: [
                'copy', 'excel', 'print'
            ]
        })
    }
    lir.openNoCatReport = function () {
        lir._genericReport(
            LinkPlugin.pluginRoot + "data/nocat.json",
            globalConfig.contextPath + "/service/sso/domains/all/nocat",
            "未接入Cat的应用列表",
            [
                {title: '域'},
                {title: '应用'},
                {title: '负责人'},
                {title: '说明'}
            ],
            {
                scrollY: window.innerHeight * 0.5,
                "dom": 'Bfltip',
                buttons: [
                    'copy', 'excel', 'print'
                ]
            }
        )

    }
    lir.openAppDepValidReport = function () {
        lir._genericReport(
            LinkPlugin.pluginRoot + "data/dep-valid-all.json",
            globalConfig.contextPath + "/service/sso/marks/all",
            "应用依赖合理性统计",
            [
                {title: 'FromDomain'},
                {title: 'FromApp'},
                {title: 'ToDomain'},
                {title: 'ToApp'},
                {title: '有效性'},
                {title: '描述'}
            ],
            {
                "lengthMenu": [[200, 500, -1], [200, 500, "All"]],
                scrollY: window.innerHeight * 0.5,
                "dom": 'Bfltip',
                buttons: [
                    'copy', 'excel', 'print'
                ],
                sortAllFields: true
            }
        )
        lir.showPieChart("#commentList", LinkPlugin.pluginRoot + "data/app-static.json", globalConfig.contextPath + "/service/sso/marks/all/static")

    }
    lir.openDbFileValidReport = function () {
        lir._genericReport(
            LinkPlugin.pluginRoot + "data/db-file.json",
            globalConfig.contextPath + "/service/sso/marks/all/db-file",
            "数据库和文件存储依赖统计",
            [
                {title: '域'},
                {title: '应用'},
                {title: '存储名称'},
                {title: '存储类型'},
                {title: '用户'},
                {title: '有效性'},
                {title: '描述'}
            ],
            {
                // "displayLength": 100,
                "lengthMenu": [[200, 500, -1], [200, 500, "All"]],
                scrollY: window.innerHeight * 0.5,
                "dom": 'Bfltip',
                buttons: [
                    'copy', 'excel', 'print'
                ],
                sortAllFields: true
            }
        );
        lir.showPieChart("#commentList", LinkPlugin.pluginRoot + "data/db-static.json", globalConfig.contextPath + "/service/sso/marks/all/db-file/static")

    }
    lir.openInterfaceReport = function () {
        lir._genericReport(
            LinkPlugin.pluginRoot + "data/all-interface.json",
            globalConfig.contextPath + "/service/sso/interface/all/",
            "接口依赖统计",
            [
                {
                    title: "id",
                    targets: [0],
                    visible: false
                }, {title: 'from'}, {title: "to"}, {title: '接口名称'}, {title: '总共调用'}, {title: '失败调用'},
                {title: "最短调用时间"}, {title: "最长调用时间"}, {title: "平均调用时间"}, {title: "标准差"}, {title: "95线"}
            ],
            {
                // "displayLength": 100,
                "lengthMenu": [[200, 500, -1], [200, 500, "All"]],
                scrollY: window.innerHeight * 0.5,
                "dom": 'Bfltip',
                buttons: [
                    'copy', 'excel', 'print'
                ],
                sortAllFields: true,
                initComplete: function () {
                    this.api().columns().every(function () {
                        var column = this;
                        var header = $(column.header()).html();
                        if (header == 'from' || header == 'to') {
                            var select = $('<select class="form-control input-sm"><option value=""></option></select>')
                                .appendTo($(column.footer()).empty())
                                .on('change', function () {
                                    var val = $.fn.dataTable.util.escapeRegex(
                                        $(this).val()
                                    );
                                    column
                                        .search(val ? '^' + val + '$' : '', true, false)
                                        .draw();
                                });

                            column.data().unique().sort().each(function (d, j) {
                                select.append('<option value="' + d + '">' + d + '</option>')
                            });
                        }
                    });
                }
            }
        );

    }
    lir.showPieChart = function (selectorId, localUrl, remoteUrl) {
        var eclipseButton = $('<div class="row text-center"><span class="glyphicon glyphicon-chevron-down"></span></div>')
        eclipseButton.on('click', function () {
            $(selectorId).collapse('toggle');
            $('#panelInfoBody').collapse('toggle');
            $(selectorId).load(LinkPlugin.pluginRoot + "dep-static.html", function () {
                var url = globalConfig.localMode ? localUrl : remoteUrl;
                d3.json(url, function (response) {
                    for (var domain in response) {
                        var option = $("<option value='" + domain + "'>" + domain + "</option>");
                        if (domain == '总共') {
                            option.attr('selected', 'selected');
                            $('#dep-domains option:first').before(option)

                        } else
                            $('#dep-domains').append(option)
                    }

                    var pieStaticId = '#dep-static-pie'
                    $('#dep-domains').on('change', function () {
                        $('#dep-static-pie').html("")
                        reportUtil.drawPieChart(pieStaticId, buildDataset(response[$('#dep-domains option:selected').val()]))
                    })


                    reportUtil.drawPieChart(pieStaticId, buildDataset(response[$('#dep-domains option:selected').val()]))

                    function buildDataset(input) {
                        var data = [];
                        for (var key in input) {
                            data.push([key, input[key]])
                        }
                        return data;
                    }
                })
            })
        })
        $('#panelInfoBody').after(eclipseButton)
    }
    lir._genericReport = function (localUrl, remoteUrl, head, title, tableParam) {
        var url = globalConfig.localMode ?
            localUrl : remoteUrl
        $('#infoPanel .modal-title').html(head)
        var cacheFound = cacheUtil.load('#' + url)
        if (cacheFound) {
            tableUtil.buildTableByArray('#panelInfoBody',
                title,
                cacheFound,
                tableParam
            )
        } else
            d3.json(url, function (response) {
                tableUtil.buildTableByArray('#panelInfoBody',
                    title,
                    response,
                    tableParam
                )
                cacheUtil.setCache('#' + url, response)
            })
    }
    lir.openLinkInfo = function () {
        var table = tableUtil.buildTable('#panelInfoBody', ['调入方', '调出方', '记录到的调用次数', '操作'])
        var edge = lir.edge;
        $('#infoPanel .modal-title').html("从域<strong> " + edge.from + "</strong> 到域 <strong>" + edge.to + "</strong> 的应用依赖列表")
        for (var i = 0; i < edge.appConns.length; i++) {
            var appConn = edge.appConns[i]
            var commentButton = $('<button class="btn btn-danger glyphicon glyphicon-comment" title="评论" data-toggle="collapse" data-target="#commentList"></button>')
            var commentInfo = edge.from + "|" + edge.to + "|" + appConn.from + "|" + appConn.to;
            commentButton.attr('data-info', commentInfo)
            commentButton.on('click', function (button) {
                var info = button.target.attributes['data-info'].value

                $('#submitComments').attr('data-info', button.target.attributes['data-info'].value);
                $('#commentHead h4').text("添加 " + info.split("|")[2] + " -> " + info.split("|")[3] + " 的评论")


                lir.showComments(info.split("|")[2], info.split("|")[3]);
                return true;
            })
            tableUtil.addContent(table, [appConn.from, appConn.to, appConn.catcnt, commentButton])
        }
        tableUtil.draw(table, {
            "displayLength": 100,
            "info": false,
            "paging": false,
        })
    }
    lir.close = function () {
        $('#infoPanel').html("")
    }

    lir.showComments = function showComments(fromApp, toApp) {
        var commentsLink = globalConfig.localMode ?
        LinkPlugin.pluginRoot + 'data/comments.json' :
        globalConfig.contextPath + '/service/sso/marks/dependency/apps/' + fromApp + '/' + toApp + '/' + 0 + '/' + 50
        d3.json(commentsLink, function (error, response) {
            $('#historyList').html("<table id='historyListTable'></table>")
            $('#historyListTable').DataTable({
                data: response,
                columns: [
                    {title: "时间"},
                    {title: "内容"},
                    {title: "评论人"},
                ],
                searching: false,
//                displayLength: 20,
                info: false,
                paging: false,
                scrollY: "100px",
                scrollCollapse: true,
                sorting: [[0, 'desc']],
            });
            $('#inputComment textarea').val("");//.css('width', parseInt($('#panelInfoBody').css('width')))

        })
    }
    lir.hideComments = function () {
        $('#inputComment textarea').val("");
        $('#commentList').attr('class', 'collapse')
    }

    var linkFloat = window.linkFloatWindow = {}
    linkFloat.addLinkHints = function (edges, table) {
        for (var i = 0; i < edges.length; i++) {
            var edge = edges[i]
            //from
            var from = edge.from;
            //to
            var to = edge.to;

            //icon
            var icon = 'glyphicon-arrow-down'
            var title = '调入'
            if (edge.type == 'OUT') {
                icon = 'glyphicon-arrow-up'
                var title = '调出'
            }
            else if (edge.type == 'BIDIRECT') {
                icon = ' glyphicon-resize-vertical'
                var title = '双向依赖'
            }
            var span = $('<span class="glyphicon ' + icon + '"></span>')
            span.attr('title', title)

            //open button
            var openInfo = $('<button title="详情" data-type="linkInfo" class="glyphicon glyphicon-list btn btn-primary"></button>')
            linkInfoReport.setInfo(edge)
            openInfo.on('click', linkInfoReport.open)

            tableUtil.addContent(table, [span, from, to, openInfo])
        }
    }
    linkFloat.showLinkHints = function (e, data) {
        var $linkHintDiv = $('#linkHint');
        $linkHintDiv.css('display', 'block')
        d3.select('#linkHint').style({
            left: e.clientX + "px",
            top: e.clientY + "px",
        })
        var table = tableUtil.buildTable('#linkHint', ['类型', '调入方', '调出方', ''])
        linkFloat.addLinkHints(data, table);
        lir.close()
        tableUtil.draw(table, {
            "displayLength": 100,
            "info": false,
            "paging": false,
            "searching": false,
        })
    }
    linkFloat.close = function () {
        $('#linkHint').css('display', 'none')
        $('#linkHint').empty()
    }

    $('#submitComments').on('click', function (button) {
        var comments = $('#dependencyComments').val()
        if (comments == null || $.trim(comments) == "") {
            alert('评论不能为空!');
            return false;
        }
        var info = button.target.attributes['data-info'].value
        var infoArr = info.split("|")
        var commRespUrl = globalConfig.localMode ?
        globalConfig.contextPath + "/" + LinkPlugin.pluginRoot + "data/commentresp.json" :
        globalConfig.contextPath + "/service/sso/marks/dependency/apps/" + infoArr[2] + "/" + infoArr[3] + "/comment"
        $.post(commRespUrl, {comment: comments})
            .success(function (result) {
                if (result.code == '00')
                    lir.showComments(infoArr[2], infoArr[3])
                else
                    alert('评论失败！ code:' + result.code)
            })
            .error(function (event, xhr, options, exc) {
                alert("error");
            })
        ;
    })
}).call(this)