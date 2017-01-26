/**
 * Created by jameswu on 17-1-20.
 */
(function () {
    var lir = window.linkInfoReport = {}
    lir.setInfo = function (edge) {
        lir.edge = edge
    }
    lir.commentCollapse = function () {
        $('#inputComment textarea').val("");
        $('#commentList').attr('class', 'collapse')
    }

    lir.open = function () {
        //TODO: this should move to control panel by message
        solarReport.close()
        linkFloat.close();
        lir.commentCollapse();
        $('#infoPanel').modal({backdrop: true})
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
        $('#panelInfoBody').html("")
    }
    lir.showComments = function showComments(fromApp, toApp) {
        // d3.json(globalConfig.contextPath + '/service/sso/marks/dependency/apps/' + fromApp + '/' + toApp + '/' + 0 + '/' + 50, function (error, response) {
        d3.json('../plugins/linkPlugin/data/comments.json', function (error, response) {
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
                scrollCollapse: true
            });
            $('#inputComment textarea').val("");//.css('width', parseInt($('#panelInfoBody').css('width')))

        })
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
            var openInfo = $('<button title="详情" class="glyphicon glyphicon-list btn btn-primary"></button>')
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
        // $.post(globalConfig.contextPath + "/service/sso/marks/dependency/apps/" + infoArr[2] + "/" + infoArr[3] + "/comment", {comment: comments})
        $.post(globalConfig.contextPath + "../plugins/linkPlugin/data/commentresp.json", {})
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