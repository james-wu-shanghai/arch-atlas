/**
 * Created by jameswu on 17-1-30.
 */
(function () {
    window.LinkPlugin = new LinkPlugin();

    function LinkPlugin() {
        this.pluginRoot = 'src/plugins/linkPlugin/';
        importUtil.import(this.pluginRoot + "js/link.js")
        importUtil.import(this.pluginRoot + "js/linksInfo.js")
        this.name = 'linkView'
        this.inited = false;


        this.init = function () {
            if (this.inited)
                return this;
            $('.nav.nav-tabs').append('<li class="active"><a href="#dependency" data-view="linkView" data-toggle="tab">依赖视图</a></li>')
            $.get(this.pluginRoot + "navbar.html", function (data) {
                $('.tab-content').append(data);
                $('#dep_filter :radio').on('change', links.filterBiDep)
                $('.linkReport').on('click', linkInfoReport.open)
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
                LinkPlugin.inited = true;
            })
            return this;
        }

        this.removeAllLinkHints = function () {
            if (LinkPlugin.inited) {
                linkFloatWindow.close()
                links.dehighlightAllEdges()
            }
        }
        this.open = function () {

        }
        this.close = function () {
            if (LinkPlugin.inited)
                this.removeAllLinkHints()
        }
    }

    cp.register(window.LinkPlugin);

}).call(this)
