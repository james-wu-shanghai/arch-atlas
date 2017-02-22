/**
 * Created by jameswu on 17-1-20.
 */
(function () {
    var lir = window.linkInfoReport = {}
    lir.setInfo = function (edge) {
        lir.edge = edge
    }

    lir.open = function (e) {
        $('#infoPanel').load(LinkPlugin.pluginRoot + "linkInfo.html", {}, function () {
            $('#infoPanel').on('show.bs.modal', function () {
                //TODO: this should move to control panel by message
                solarReport.close()
                linkFloat.close();
                lir.hideComments();
            });
            $('#infoPanel').modal({backdrop: true})
            var type = e.target.attributes['data-type'].value;
            if (type == 'linkInfo')
                lir.openLinkInfo();
            else if (type == 'biDepReport')
                lir.openBiDepReport();
            else if (type == 'noCatReport')
                lir.openNoCatReport();
            else if (type == 'appDepValidReport')
                lir.openAppDepValidReport();

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
            scrollY: "300px",
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
                scrollY: "300px",
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
            "应用依赖合理性列表",
            [
                {title: 'FromDomain'},
                {title: 'FromApp'},
                {title: 'ToDomain'},
                {title: 'ToApp'},
                {title: '有效性'},
            ],
            {
                "displayLength": 100,
                scrollY: "300px",
                "dom": 'Bfltip',
                buttons: [
                    'copy', 'excel', 'print'
                ]
            }
        )
    }
    lir._genericReport = function (localUrl, remoteUrl, head, title, tableParam) {
        var url = globalConfig.localMode ?
            localUrl : remoteUrl
        d3.json(url, function (response) {
            $('#infoPanel .modal-title').html(head)
            tableUtil.buildTableByArray('#panelInfoBody',
                title,
                response,
                tableParam
            )
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