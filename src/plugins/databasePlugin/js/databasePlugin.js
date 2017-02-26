/**
 * Created by jameswu on 17-2-15.
 */
(function () {
    function DatabasePlugin() {
        this.pluginRoot = 'src/plugins/databasePlugin/';
        importUtil.import(this.pluginRoot + "js/database.js")
        this.name = 'databaseView'
        var inited = DatabasePlugin.prototype.inited = false;


        this.init = function () {
            if (inited)
                return this;
            $('.nav.nav-tabs').append('<li><a href="#database" data-view="databaseView" data-toggle="tab">数据库信息</a></li>')
            $.get(this.pluginRoot + "database.html", function (data) {
                $('.tab-content').append(data);
                $('#databaseList').on('click', dbMap.openModal)
            })

            inited = true;
            return this;
        }

        this.open = function () {
            if (inited)
                dbMap.load();
        }

        this.close = function () {
            if (inited) {
                dbMap.unload();
                dbMap.closeReport();
            }
        }

        this.handleMouseDown = function (rayCaster, e) {
            if (inited) {
                var intersect = rayCaster.intersectObjects(dbMap.activatedDatabase);
                if (intersect.length > 0) {
                    var db = intersect[0].object
                    dbMap.openReport(db, e.clientX + 10, e.clientY + 10);
                } else
                    dbMap.closeReport();
            }
        }
        this.handleHover = function (rayCaster, e) {
            if (inited) {
                var intersect = rayCaster.intersectObjects(dbMap.activatedDatabase);
                if (intersect.length > 0) {
                    var db = intersect[0].object
                    dbMap.showHint(db, e.clientX + 10, e.clientY + 10);
                } else
                    dbMap.closeHint();
            }
        }
    }

    window.DatabasePlugin = new DatabasePlugin();
    cp.register(window.DatabasePlugin);
}).call(this)