/**
 * Created by jameswu on 17-1-30.
 */
(function () {
    function LinkPlugin() {
        this.pluginRoot = 'src/plugins/linkPlugin/';
        importUtil.import(this.pluginRoot + "js/link.js")
        importUtil.import(this.pluginRoot + "js/linksInfo.js")
        this.name = 'linkView'
        var inited = LinkPlugin.prototype.inited = false;


        this.init = function () {
            if (inited)
                return this;
            $('.nav-tabs').append('<li class="active"><a href="#dependency" data-toggle="tab">依赖视图</a></li>')
            $.get(this.pluginRoot + "navbar.html", function (data) {
                $('.tab-content').append(data);
                $('#dep_filter :radio').on('change', links.filterBiDep)
                $('#biDepAppReport').on('click', linkInfoReport.open)
            })

            var linkUrl = globalConfig.localMode ?
            this.pluginRoot + 'data/all-dependencies.json' : globalConfig.contextPath + '/service/sso/domains/all-dependencies';
            d3.json(linkUrl, function (error, edgesJson) {
                progressUtils.progress(50, '加载域依赖中')
                if (error)
                    alert(error)
                atlas.edges = edgesJson;
                atlas.edgesMap = function (edgesJson) {
                    var map = {}
                    for (var i = 0; i < edgesJson.length; i++) {
                        var edges = edgesJson[i];
                        map[edges.name] = edges;
                    }
                    return map;
                }(edgesJson);
            })
            inited = true;
            return this;
        }

        this.removeAllLinkHints = function () {
            linkFloatWindow.close()
            links.dehighlightAllEdges()
        }

    }

    window.LinkPlugin = new LinkPlugin();
    cp.register(window.LinkPlugin);

}).call(this)
