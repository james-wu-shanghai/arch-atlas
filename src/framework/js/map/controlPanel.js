/**
 * Created by jameswu on 17-1-7.
 */
(function () {

    var cp = window.cp = {}

    cp.actSolarLmt = 10;
    cp.activatedSolar = [];
    cp.undercontrol = false;
    cp.param = {}
    cp.searchItem = [];

    cp.plugins = {};
    cp.currentPlugin;

    cp.loadPlugin = function (viewName) {
        cp.currentPlugin = viewName;
        var plugin = cp.plugins[viewName]
        plugin.init();
    }

    cp.register = function (plugin) {
        this.plugins[plugin.name] = plugin;
    }

    cp.filterBiDep = function () {
        var type = $('#dep_filter :radio:checked').attr('data-type')
        if (type == 'dep_in')
            filterLinks('IN')
        else if (type == 'dep_out')
            filterLinks('OUT')
        else if (type == 'dep_bi')
            filterLinks('BIDIRECT')
        else if (type == 'dep_none')
            filterLinks('NONE')
        else
            filterLinks('ALL')

        function filterLinks(type) {
            links.activateByType(type)
        }
    }
    cp.initSearchItems = function () {
        var si = []
        for (var i = 0; i < cp.searchItem.length; i++) {
            si.push('"' + cp.searchItem[i] + '"')
        }
        $('#starSearch').attr('data-source', '[' + si + ']');
    }
    cp.addSearchItem = function (item) {
        cp.searchItem.push(item)
    }

    cp.searchEntity = function (searchInput) {
        var name = searchInput.value;
        if (domainParser.startWith(name, "["))
            name = name.split(']')[0].substring(1)
        var domainObj = atlas.scence.getObjectByName(name)
        if (domainObj) {
            atlas.trackball.target = domainObj.position.clone();
            atlas.camera.position = new THREE.Vector3(300, 300, 300)
            atlas.camera.updateProjectionMatrix()
        }
    }

    cp.resize = function (size) {
        if (typeof(size) != 'string' && typeof(size) != 'number')
            size = $('#changeSize option:selected').val()
        atlas.camera.left = window.innerWidth / -size
        atlas.camera.right = window.innerWidth / size
        atlas.camera.top = window.innerHeight / size
        atlas.camera.buttom = window.innerHeight / -size
        atlas.param.scale = size
        atlas.camera.updateProjectionMatrix();
        $("#changeSize").val(size)
        var index = $('#changeSize option:selected').index()
        atlas.trackball.panSpeed = 0.05 + (3 - index) * 0.02
        // auto adjust size
        for (var i = 0; i < atlas.fonts.length; i++) {
            var font = atlas.fonts[i]
            var _scale = (1 + (2 - index) * 0.5)
            font.scale.set(_scale, _scale, _scale)
        }
    }

    cp.reset = function () {
        atlas.trackball.reset();
        var middleSize = 16;

        this.resize(middleSize)
        links.deactivateAll()
        solarReport.close()
        // $('#biDepChk').attr('checked', false);
        cp.removeAllSolarBoxes()
        cp.param = {}
        cp.removeAllLinkHints()
        atlas.camera.position.set(300, 300, 300)
        atlas.camera.updateProjectionMatrix()
    }
    cp.autoResize = function () {
        var height = atlas.param.atlasHeight = window.innerHeight;
        var width = atlas.param.atlasWidth = window.innerWidth
        var camera = atlas.camera;
        var scale = atlas.param.scale;
        camera.left = width / -scale;
        camera.right = width / scale;
        camera.top = height / scale;
        camera.bottom = height / -scale;
        camera.updateProjectionMatrix();
        atlas.render.setSize(width, height);
    };
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
            solarReport.showSolarReport(evtX, evtY, solar);
        } else {
            links.deactivate(solar.name)
            solarReport.close();
            solar.activated = false;
            atlas.scence.remove(atlas.scence.getObjectByName(solar.name + "|box"))
            if (cp.param.activatedSolarCount > 0)
                --cp.param.activatedSolarCount

        }
        cp.filterBiDep()
    }
    cp.searchKeyUp = function (searchInput) {
        var keyCode = parseInt(event.keyCode);
        if (keyCode == 13) {
            this.searchEntity(searchInput)
            searchInput.select()
        }
    }

    cp.onMousedown = function (e) {
        e.preventDefault();
        var vector = new THREE.Vector2(( e.clientX / atlas.param.atlasWidth) * 2 - 1, -( e.clientY / atlas.param.atlasHeight) * 2 + 1)

        var rayCaster = new THREE.Raycaster()
        rayCaster.setFromCamera(vector, atlas.camera);

        var intersect = rayCaster.intersectObjects(atlas.solarObjects);
        if (intersect.length > 0) {
            var solar = intersect[0].object
            cp.activeSolar(solar, e.clientX + 10, e.clientY + 10)
        } else
            solarReport.close();

    }

    cp.onMousewheel = function (event) {
        event.preventDefault();
        var delta = 0;
        if (event.wheelDelta)  // WebKit / Opera / Explorer 9
            delta = event.wheelDelta / 40;
        else if (event.detail)  // Firefox
            delta = -event.detail / 3;

        var index = $('#changeSize option:selected').index();
        var size = $('#changeSize').get('0').options.length;
        var zoomValue = Math.sign(delta);
        if (index + zoomValue >= 0 && index + zoomValue < size) {
            cp.resize($("#changeSize").get(0).options[index + zoomValue].value)
        }
    }


    cp.onMousemove = function (e) {
        e.preventDefault();
        var vector = new THREE.Vector2(( e.clientX / atlas.param.atlasWidth) * 2 - 1, -( e.clientY / atlas.param.atlasHeight) * 2 + 1)

        var rayCaster = new THREE.Raycaster()
        rayCaster.setFromCamera(vector, atlas.camera);

        var activatedLinks = []
        for (var i = 0; i < links.activatedEdges.length; i++)
            activatedLinks.push(links.activatedEdges[i].link)

        var intersect = rayCaster.intersectObjects(activatedLinks, true);
        if (intersect.length > 0) {
            $('#linkHint').empty()
            var tableData = []
            for (var i = 0; i < intersect.length; i++) {
                var link = intersect[i].object.parent
                if (link.edge.show) {
                    tableData.push(link.edge)
                    links.highlightEdge(link);
                }
            }

            linkFloatWindow.showLinkHints(e, tableData);
        }
        else
            cp.removeAllLinkHints();

    }

    cp.removeAllLinkHints = function () {
        linkFloatWindow.close()
        links.dehighlightAllEdges()
    }

    /***
     * start init
     */

    $('#dep_filter :radio').on('change', cp.filterBiDep)
    $('#showPlanChk').on('change', cp.showBackground)
    $('#changeSize').on('change', cp.resize)
    $('#starSearch').on('change', function (event) {
        cp.searchEntity(event.target)
        return true;
    })
    /***
     * end init
     */
}).call(this)
