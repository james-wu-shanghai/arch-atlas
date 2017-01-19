/**
 * Created by jameswu on 16-12-20.
 */
var links = {
    segments: 64,
    radius: 0.5,
    radiusSegments: 12,
    closed: false,
    opacity: 0.3,
    portDistance: 5.5,
    portLength: 9,
    activatedLinks: [],
    highlightLinkEdges: [],
    initEdgesInfo: function (edgesInfo) {
        if (edgesInfo.inited)
            return;
        edgesInfo.initEdge = function (edge, edgeType) {
            links.build(edge, edgeType);
            edge.setVisible = function (isVisible, params) {
                for (var i = 0; i < this.link.children.length; i++) {
                    var obj = this.link.children[i]
                    var opacity = links.opacity
                    if (params && params.highlight)
                        opacity *= 3
                    obj.material.opacity = isVisible ? opacity * 1.5 : 0.1
                }
                this.show = isVisible
            }
            edge.activate = function () {
                atlas.scence.add(this.link);
            }
            edge.deactivate = function () {
                atlas.scence.remove(this.link);
            }
        }
        edgesInfo.initEdges = function (edges, edgeType) {
            for (var i = 0; i < edges.length; i++) {
                this.initEdge(edges[i], edgeType)
            }
        }
        edgesInfo.addOrRemoveEdges = function (edges, isAdd, copyActivatedLinks) {
            for (var i = 0; i < edges.length; i++) {
                var edge = edges[i]
                if (edge.from == edge.to)
                    continue
                if (isAdd) {
                    edge.activate()
                    copyActivatedLinks.push(edge.link)
                }
                else
                    edge.deactivate()
            }
            links.activatedLinks = copyActivatedLinks;
        }
        edgesInfo.turnSwitchOnEdges = function (swArray, copyActivatedLinks) {
            var edgesArray = [this.in, this.out, this.bi]
            for (var i = 0; i < edgesArray.length; i++) {
                this.addOrRemoveEdges(edgesArray[i], swArray[i], copyActivatedLinks)
            }
        }
        edgesInfo.activateLinks = function (type) {
            this.activated = true
            var copyActivatedLinks = []
            if (type == 'IN')
                this.turnSwitchOnEdges([1, 0, 0], copyActivatedLinks)
            else if (type == 'OUT')
                this.turnSwitchOnEdges([0, 1, 0], copyActivatedLinks)
            else if (type == 'BIDIRECT')
                this.turnSwitchOnEdges([0, 0, 1], copyActivatedLinks)
            else if (type == 'ALL')
                this.turnSwitchOnEdges([1, 1, 1], copyActivatedLinks)
            else
                this.turnSwitchOnEdges([0, 0, 0], copyActivatedLinks)

        }
        edgesInfo.deactivateLinks = function () {
            if (!this.activated)
                return
            this.activateLinks('NONE')
            this.activated = false;

        }
        edgesInfo.initEdges(edgesInfo.in, 'IN')
        edgesInfo.initEdges(edgesInfo.out, 'OUT')
        edgesInfo.initEdges(edgesInfo.bi, 'BIDIRECT')
        edgesInfo.inited = true;
    },
    getBySolarName: function (solarName) {
        for (var i = 0; i < atlas.edges.length; i++) {
            var edgesInfo = atlas.edges[i]
            if (edgesInfo.name == solarName)
                return edgesInfo;
        }
        return null;
    },
    activate: function (solarName) {
        var edgesInfo = this.getBySolarName(solarName)
        if (edgesInfo != null) {
            this.initEdgesInfo(edgesInfo)
            edgesInfo.activateLinks('ALL')
        }
    },
    activateByType: function (type) {
        for (var i = 0; i < atlas.edges.length; i++) {
            var edgesInfo = atlas.edges[i]
            if (edgesInfo.activated)
                edgesInfo.activateLinks(type)
        }
    },


    generateArrow: function (cubeMesh, points) {
        var endPoint = points[3];
        var cone = new THREE.Mesh(new THREE.ConeGeometry(links.radius * 1.5, links.radius * 6, 8), new THREE.MeshBasicMaterial({
            opacity: links.opacity * 2,
            transparent: true,
            color: cubeMesh.material.color
        }))

        var direction = new THREE.Vector3(Math.sign(points[2].x - points[3].x), Math.sign(points[2].y - points[3].y), Math.sign(points[2].z - points[3].z));
        cone.position.setX(endPoint.x - direction.x * links.radius * 3)
        cone.position.setY(endPoint.y - direction.y * links.radius * 3)
        cone.position.setZ(endPoint.z - direction.z * links.radius * 3)

        //TODO: Now only support 2D, need support 3D
        cone.rotateZ(direction.x * 1 / 2 * Math.PI)
        cone.rotateY(direction.y * Math.PI)
        cone.rotateX(direction.z * -1 / 2 * Math.PI)

        cone.name = cubeMesh.name + "|cone";
        return cone;
    },

    build: function (edge, type) {
        if (edge.link != null)
            return edge.link;
        var fromSolar = atlas.scence.getObjectByName(edge.from);
        var toSolar = atlas.scence.getObjectByName(edge.to)
        if (fromSolar == null || toSolar == null || fromSolar.name == toSolar.name)
            return null;
        if (fromSolar == null || toSolar == null) {
            console.warn('from or to object not found, from:' + edge.from + " to:" + edge.to);
            return null;
        }

        var points = this._generatePoints(fromSolar.position, toSolar.position);

        var tubeGeometry = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(points), links.segments, links.radius, links.radiusSegments, links.closed)

        var color = null;
        if (type == 'BIDIRECT')
            color = 0xff00ff
        else if (type == 'IN')
            color = 0xff0000
        else
            color = 0x0000ff;


        var mesh = new THREE.Mesh(tubeGeometry, new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: links.opacity,
            color: color
        }))

        var arrow = this.generateArrow(mesh, mesh.geometry.parameters.path.points)

        var group = new THREE.Object3D()
        group.add(mesh)
        group.add(arrow)
        group.edgeJson = edge
        group.name = fromSolar.name + "|" + toSolar.name;
        edge.link = group
        edge.activated = true
        edge.show = true

        return group;
    },

    _generatePoints: function (from, to) {
        var direction = new THREE.Vector3();

        var _xDiff = from.x - to.x
        var _yDiff = from.y - to.y
        var _zDiff = from.z - to.z

        var portVector = new THREE.Vector3(Math.sign(_xDiff) * this.portDistance, Math.sign(_yDiff) * this.portDistance, Math.sign(_zDiff) * this.portDistance);

        var _point1 = null;
        var _point4 = null;
        var _point3 = null;
        var _point2 = null;

        var maxDimDiff = Math.max(Math.abs(_xDiff), Math.abs(_yDiff), Math.abs(_zDiff));
        if (maxDimDiff == Math.abs(_xDiff)) {
            _point1 = direction.set(from.x - portVector.x, from.y, from.z).clone()
            _point2 = direction.set(from.x - portVector.x / this.portDistance * this.portLength, from.y, from.z).clone()
            _point4 = direction.set(to.x + portVector.x, to.y, to.z).clone()
            _point3 = direction.set(to.x + portVector.x / this.portDistance * this.portLength, to.y, to.z).clone()
        } else if (maxDimDiff == Math.abs(_zDiff)) {
            _point1 = direction.set(from.x, from.y, from.z - portVector.z).clone()
            _point2 = direction.set(_point1.x, _point1.y, _point1.z - portVector.z / this.portDistance * this.portLength).clone()
            _point4 = direction.set(to.x, to.y, to.z + portVector.z).clone()
            _point3 = direction.set(_point4.x, _point4.y, _point4.z + portVector.z / this.portDistance * this.portLength).clone()
        }
        else {
            _point1 = direction.set(from.x, from.y - portVector.y, from.z).clone()
            _point2 = direction.set(_point1.x, _point1.y - portVector.y / this.portDistance * this.portLength, _point1.z).clone()
            _point4 = direction.set(to.x, to.y + portVector.y, to.z).clone()
            _point3 = direction.set(_point4.x, _point4.y + portVector.y / this.portDistance * this.portLength, _point4.z).clone()
        }
        return [_point1, _point2, _point3, _point4];
    },

    deactivateAll: function () {
        for (var i = 0; i < atlas.edges.length; i++) {
            var edgesInfo = atlas.edges[i];
            if (edgesInfo.inited)
                edgesInfo.deactivateLinks()
        }
    },

    deactivate: function (solarName) {
        var edgesInfo = this.getBySolarName(solarName)
        if (edgesInfo != null)
            edgesInfo.deactivateLinks();
    }
}