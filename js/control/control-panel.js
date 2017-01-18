/**
 * Created by jameswu on 17-1-7.
 */
(function () {
    var cp = window.cp = {}
    cp.actSolarLmt = 5;
    cp.activatedSolar = [];

    cp.param = {}

    cp.filterBiDep = function () {
        var type = $('#dep_filter :radio:checked').attr('data-type')
        if (type == 'dep_in')
            filterLinks('IN')
        else if (type == 'dep_out')
            filterLinks('OUT')
        else if (type == 'dep_bi')
            filterLinks('BIDIRECT')
        else
            filterLinks('ALL')

        function filterLinks(type) {
            for (var i = 0; i < links.activatedLinks.length; i++) {
                var link = links.activatedLinks[i]
                var edgeJson = link.edgeJson;
                var edgeType = edgeJson.edgeType;
                if (type == edgeType || type == 'ALL')
                    edgeJson.setVisible(true, {highlight: false})
                else if (edgeType != type)
                    edgeJson.setVisible(false)
            }
        }
    }


    cp.findDomain = function (searchInput) {
        var domainObj = atlas.scence.getObjectByName(searchInput.value)
        if (domainObj) {
            atlas.trackball.target = domainObj.position.clone();
            atlas.camera.position = new THREE.Vector3(300, 300, 300)
            atlas.camera.updateProjectionMatrix()
        }
    }

    cp.resize = function (size) {
        if ($("#changeSize").val() == size)
            return true
        atlas.camera.left = window.innerWidth / -size
        atlas.camera.right = window.innerWidth / size
        atlas.camera.top = window.innerHeight / size
        atlas.camera.buttom = window.innerHeight / -size
        atlas.param.scale = size
        atlas.camera.updateProjectionMatrix();
        $("#changeSize").val(size)
        // auto adjust size
        var index = $('#changeSize option:selected').index()
        for (var i = 0; i < atlas.fonts.length; i++) {
            var font = atlas.fonts[i]
            var _scale = (1 + (2 - index) * 0.1)
            font.scale.set(_scale, _scale, _scale)
        }
    }

    cp.reset = function () {
        atlas.trackball.reset();
        var middleSize = 16;
        //自适应, 效果不好，不做了
        //if (window.innerWidth < 1440)
        //    middleSize = 8

        this.resize(middleSize)
        links.deactivateAllLinks()
        report.hideSolarReport()
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
            report.showSolarReport(evtX, evtY, solar);
        } else {
            links.deactivateSolarLinks(solar.name)
            report.hideSolarReport();
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
            this.findDomain(searchInput)
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
            report.hideSolarReport();

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

        var intersect = rayCaster.intersectObjects(links.activatedLinks, true);
        if (intersect.length > 0) {
            $('#linkHint').empty()
            for (var i = 0; i < intersect.length; i++) {
                var link = intersect[i].object.parent
                if (link.edgeJson.show) {
                    addLinkHints(link);
                    highlightEdge(link);
                }
            }
            showLinkHints();

        }
        else {
            cp.removeAllLinkHints();
        }
        function addLinkHints(link) {
            var edgeJson = link.edgeJson;
            var from = edgeJson.from;
            var to = edgeJson.to;
            var span = $('<span class="glyphicon glyphicon-arrow-right"></span>')

            span.text('从:' + from + " 到:" + to + ( edgeJson.bidirect == 'true' ? ' 双向依赖' : ''))
            var p = $('<p>')
            $('#linkHint').append(span).append(p)

        }

        function highlightEdge(link) {
            link.edgeJson.setVisible(true, {highlight: true})
            links.highlightLinkEdges.push(link)
        }

        function showLinkHints() {
            if ($('#linkHint').html() != "") {
                $('#linkHint').css('display', 'block')
                d3.select('#linkHint').style({
                    left: e.clientX + "px",
                    top: e.clientY + "px",
                })
            }
        }
    }

    cp.removeAllLinkHints = function () {
        $('#linkHint').css('display', 'none')
        $('#linkHint').empty()
        for (var i = 0; i < links.highlightLinkEdges.length; i++) {
            var link = links.highlightLinkEdges[i]
            link.edgeJson.setVisible(true)
        }
        links.highlightLinkEdges = []
    }

    /***
     * start init
     */

    $('#dep_filter :radio').on('change', cp.filterBiDep)
    $('#showPlanChk').on('change', cp.showBackground)
    /***
     * end init
     */
}).call(this)
