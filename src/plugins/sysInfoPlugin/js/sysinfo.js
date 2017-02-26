/**
 * Created by jameswu on 17-2-14.
 */
(function () {
    var sysinfo = window.sysinfo = {}
    sysinfo.open = function () {
        $("#infoPanel").load(SysinfoPlugin.pluginRoot + "sysModal.html", {}, function () {
            var url = globalConfig.localMode ? SysinfoPlugin.pluginRoot + "data/owner.json" : globalConfig.contextPath + "/service/sso/domains/apps/owners";
            $('#infoPanel').modal({backdrop: true})
            $('#infoPanel').on('hidden.bs.modal', sysinfo.close);
            $('#infoPanel .modal-title').html("应用负责人列表")
            var cached = cacheUtil.load(url)
            if (cached)
                tableUtil.buildTableByArray(
                    '#panelInfoBody',
                    [
                        {title: '域'},
                        {title: '应用'},
                        {title: '负责人'},
                    ],
                    cached,
                    {
                        buttons: ['copy', 'excel', 'print'],
                        dom: 'Bfltip',
                        scrollY: '300px'
                    });
            else
                d3.json(url, function (resp) {
                    cacheUtil.setCache(url, resp)
                    tableUtil.buildTableByArray(
                        '#panelInfoBody',
                        [
                            {title: '域'},
                            {title: '应用'},
                            {title: '负责人'},
                        ],
                        resp,
                        {
                            buttons: ['copy', 'excel', 'print'],
                            dom: 'Bfltip',
                            scrollY: '300px'
                        });
                })
        })
    }
    sysinfo.close = function () {
        $('#infoPanel').html("");
    }
}).call(this)
