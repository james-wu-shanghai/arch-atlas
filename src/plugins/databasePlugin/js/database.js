/**
 * Created by jameswu on 17-2-15.
 */
(function () {
    function DatabaseMap() {
        this.activatedDatabase = []
        this.hoverDatabase = null;
        this.inited = false;
        this.reportInited = false;
        this.param = {
            hintMarkOpacity: 0.5
        }
        this.load = function () {
            cp.setRotate(false);
            cp.setAllDomainsTransparent(true)
            if (!this.inited) {
                var url = globalConfig.localMode ? DatabasePlugin.pluginRoot + "data/dbDep.json" : globalConfig.contextPath + "/service/sso/domains/all/databases"
                d3.json(url, function (dbDepJson) {
                    for (var i = 0; i < dbDepJson.length; i++) {
                        var dbDep = dbDepJson[i];
                        var domain = atlas.domainJsons[dbDep.domain]
                        if (!domain)
                            continue
                        if (!domain.databases)
                            domain.databases = []
                        var db = domain.databases;
                        db.push(dbDep);
                    }
                    dbMap.render(atlas.domainJsons);
                })
                this.inited = true;
            }
            else
                dbMap.render((atlas.domainJsons));
        }
        this.render = function (domainJson) {
            for (var domainName in domainJson) {
                var domain = domainJson[domainName];
                var databases = domain.databases;
                if (databases && databases.length > 0) {
                    var mesh = this.drawDatabases(domain, databases);
                    this.activatedDatabase.push(mesh)
                }
            }
        }
        this.drawDatabases = function (domainJson, databases) {
            var geo = new THREE.ConeGeometry(1, 3, 15);
            var mat = new THREE.MeshBasicMaterial({
                opacity: this.param.hintMarkOpacity,
                transparent: true,
                color: 0x009900,
            })
            var mesh = new THREE.Mesh(geo, mat);
            mesh.rotateZ(Math.PI)
            mesh.position.x = domainJson.solar.position.x
            mesh.position.z = domainJson.solar.position.z
            mesh.position.y = domainJson.solar.position.y + 5;
            mesh.databaseJson = databases;
            mesh.name = domainJson.name + "|dbs"
            atlas.scence.add(mesh);
            return mesh;
        }
        this.unload = function () {
            for (var i = 0; i < this.activatedDatabase.length; i++)
                atlas.scence.remove(this.activatedDatabase[i])
            this.activatedDatabase = []
            cp.setAllDomainsTransparent(false)
        }
        this.initReport = function () {
            if (this.reportInited)
                return;
            var popReport = d3.select('body').append('div')
            popReport.attr('id', 'database-report')
            this.reportInited = true;
        }
        this.renderReport = function (database) {
            var dbJsons = database.databaseJson;
            if (dbJsons == null)
                dbJsons = []
            var table = tableUtil.buildTable('#databaseReportInfo', ['库', '域', '应用', 'Schema'])
            for (var i = 0; i < dbJsons.length; i++) {
                var dbJson = dbJsons[i]
                tableUtil.addContent(table, [dbJson.db, dbJson.domain, dbJson.app, dbJson.schema])
            }
            tableUtil.draw(table, {
                "info": false,
                "paging": false,
                "searching": false,
            })
        }
        this.closeReport = function () {
            $('#database-report').html("");
            d3.select('#database-report').style('display', 'none')
        }
        this.openReport = function (database, x, y) {
            this.initReport()
            d3.select('#database-report').style({
                left: x + "px",
                top: y + "px",
                display: 'block',
            }).attr('class', 'tooltip')

            $('#database-report').load(DatabasePlugin.pluginRoot + 'dbInfo.html', {}, function () {
                dbMap.renderReport(database)
                var $report = $('#database-report');
                var top = Number.parseInt($report.css('top'));
                var height = Number.parseInt($report.css('height'));
                if (top + height > window.innerHeight) {
                    $report.css('top', window.innerHeight - height);
                }
                var left = Number.parseInt($report.css('left'));
                var width = Number.parseInt($report.css('width'));
                if (left + width > window.innerWidth)
                    $report.css('left', window.innerWidth - width)
            })
        }
        this.showHint = function (database, x, y) {
            var msg = "依赖数据库:"
            cp.setTransparentDomain(false, database.name.split('|')[0])
            var dedup = {}
            for (var i = 0; i < database.databaseJson.length; i++)
                dedup[database.databaseJson[i]['db']] = 1;

            for (var name in dedup)
                msg += "[" + name + "] "
            msg += " 左键单击查看详情"
            sbar.messageNoReset(msg)
            this.hoverDatabase = database
            database.material.opacity = this.param.hintMarkOpacity * 2
        }
        this.closeHint = function () {
            if (this.hoverDatabase) {
                this.hoverDatabase.material.opacity = this.param.hintMarkOpacity
                cp.setTransparentDomain(true, this.hoverDatabase.name.split('|')[0])
            }
            sbar.reset()
        }
        this.openModal = function () {
            $("#infoPanel").load(DatabasePlugin.pluginRoot + "dbModal.html", {}, function () {
                $('#infoPanel').modal({backdrop: true})
                $('#infoPanel').on('hidden.bs.modal', dbMap.closeModal);
                $('#infoPanel .modal-title').html("数据库列表")
                var table = tableUtil.buildTable('#panelInfoBody', ['库', '域', '应用', 'Schema'])
                for (var domainName in atlas.domainJsons) {
                    var dbJsons = atlas.domainJsons[domainName].databases;
                    if (!dbJsons)
                        continue
                    for (var i = 0; i < dbJsons.length; i++) {
                        var dbJson = dbJsons[i]
                        tableUtil.addContent(table, [dbJson.db, dbJson.domain, dbJson.app, dbJson.schema])
                    }
                }
                tableUtil.draw(table, {
                    // "info": false,
                    // "paging": false,
                    // "searching": false,
                    buttons: ['copy', 'excel', 'pdf', 'print'],
                    dom: 'Bfltip',
                    scrollY: '300px'
                })
            })
        }
        this.closeModal = function () {
            $('#infoPanel').html("");
        }
    }

    window.dbMap = new DatabaseMap();
}).call(this)
