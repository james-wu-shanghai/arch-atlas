/**
 * Created by jameswu on 17-2-15.
 */
(function () {
    window.DatabasePlugin = new DatabasePlugin();

    function DatabasePlugin() {
        this.pluginRoot = 'src/plugins/databasePlugin/';
        importUtil.import(this.pluginRoot + "js/database.js")
        this.name = 'databaseView'
        this.inited = false;


        this.init = function () {
            if (this.inited)
                return this;
            $('.nav.nav-tabs').append('<li><a href="#database" data-view="databaseView" data-toggle="tab">数据库信息</a></li>')
            $.get(this.pluginRoot + "database.html", function (data) {
                $('.tab-content').append(data);
                $('#databaseList').on('click', dbMap.openModal)
            })

            this.inited = true;
            return this;
        }

        this.open = function () {
            if (this.inited)
                dbMap.load();
        }

        this.close = function () {
            if (this.inited) {
                dbMap.unload();
                dbMap.closeReport();
            }
        }

        this.handleMouseDown = function (rayCaster, e) {
            if (this.inited) {
                var intersect = rayCaster.intersectObjects(dbMap.activatedDatabase);
                if (intersect.length > 0) {
                    var db = intersect[0].object
                    dbMap.openReport(db, e.clientX + 10, e.clientY + 10);
                } else
                    dbMap.closeReport();
            }
        }
        this.handleHover = function (rayCaster, e) {
            if (this.inited) {
                var intersect = rayCaster.intersectObjects(dbMap.activatedDatabase);
                if (intersect.length > 0) {
                    var db = intersect[0].object
                    dbMap.showHint(db, e.clientX + 10, e.clientY + 10);
                } else
                    dbMap.closeHint();
            }
        }
    }

    cp.register(window.DatabasePlugin);
}).call(this)