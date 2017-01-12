/**
 * Created by jameswu on 17-1-7.
 */
(function () {
    var cp = window.cp = {}
    cp.actSolarLmt = 10;
    cp.activatedSolar = [];

    cp.param = {}

    cp.findDomain = function (arg) {
        var domainObj = atlas.scence.getObjectByName(arg.value)
        if (domainObj) {
            atlas.trackball.target = domainObj.position.clone();
            atlas.camera.position = new THREE.Vector3(300, 300, 300)
            atlas.camera.updateProjectionMatrix()
        }
    }

    cp.resize = function (size) {
        atlas.camera.left = window.innerWidth / -size
        atlas.camera.right = window.innerWidth / size
        atlas.camera.top = window.innerHeight / size
        atlas.camera.buttom = window.innerHeight / -size
        atlas.camera.updateProjectionMatrix();
    }

    cp.reset = function () {
        atlas.trackball.reset();
        var middleSize = 16;
        this.resize(middleSize)
        $("#changeSize").val(middleSize)
        links.deactivateAllLinks({byForce: true})
        report.hideSolarReport()
        $('#biDepChk').attr('checked', false);
        cp.removeAllSolarBoxes()
        cp.param = {}
    }
    cp.removeAllSolarBoxes = function () {
        for (var i = 0; i < atlas.solarObjects.length; i++) {
            var solar = atlas.solarObjects[i]
            var boxName = solar.name + "|box"
            if (solar.activated) {
                atlas.scence.remove(atlas.scence.getObjectByName(boxName));
                solar.activated = false
            }
        }
    }
    cp.showBiDomainDep = function () {
        var isShow = $('#biDepChk').is(':checked')
        if (isShow) {
            progressUtils.start('开始更新依赖')
            links.deactivateAllLinks({byForce: true})
            this.param.dependencyLock = true;
            for (var i = 0; i < atlas.edges.length; i++) {
                progressUtils.progress(i / atlas.edges.length * 100, '更新依赖中')
                var edge = atlas.edges[i];
                if (edge.bidirect == 'false')
                    continue;
                if (edge.from == null || edge.to == null)
                    continue

                var mesh = edge.link// atlas.scence.getObjectByName(edge.from + "|" + edge.to)

                if (mesh == null) {
                    var mesh = links.build(edge, 'BIDIRECT')
                    if (mesh == null)
                        continue;
                    edge.link = mesh;
                }
                edge.activated = true
                atlas.scence.add(mesh)
                progressUtils.end('完成更新')
            }
        } else {
            links.deactivateAllLinks({byForce: true})
            this.param.dependencyLock = false;
        }
    }

    cp.showBackground = function () {
        var isShow = $('#showPlanChk').is(':checked')
        if (isShow) {
            if (!atlas.scence.getObjectByName('plane'))
                atlas.scence.add(atlas.plane)
        } else {
            atlas.scence.remove(atlas.plane)
        }
    }

    cp.activeSolar = function (solar, evtX, evtY) {
        if (!cp.param.activatedSolarCount)
            cp.param.activatedSolarCount = 0;


        if (!solar.activated) {

            if (cp.param.activatedSolarCount >= cp.actSolarLmt) {
                sbar.message('激活太多域了...我就是一个浏览器，别折腾我了，取消几个吧...或者干脆复原一下？')
                return
            }
            ++cp.param.activatedSolarCount;
            solar.activated = true
            links.activate(solar.name)
            var box = new THREE.BoxHelper(solar, 0x00ff00)
            box.name = solar.name + "|box"
            atlas.scence.add(box)
            report.showSolarReport(evtX, evtY, solar);
        } else {
            links.deactivateSolarLinks(solar.name)
            report.hideSolarReport();
            solar.activated = false;
            atlas.scence.remove(atlas.scence.getObjectByName(solar.name + "|box"))
            if (cp.param.activatedSolarCount > 0)
                --cp.param.activatedSolarCount

        }
    }


}).call(this)
