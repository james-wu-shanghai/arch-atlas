/**
 * Created by jameswu on 16-12-20.
 */
var links = {
    segments: 64,
    radius: 0.5,
    radiusSegments: 12,
    closed: false,
    opacity: 0.3,
    portDistance: 3,
    portLength: 8,

    add: function (param) {
        links.param = param
        d3.json('libs/data/entity-connections.json', function (error, edgesJson) {
            atlas.edges = edgesJson;
        })
    },
    activate: function (fromSolarName) {
        if (atlas.edges == null)
            return;

        for (var i = 0; i < atlas.edges.length; i++) {
            var edge = atlas.edges[i]
            var mesh = null;
            if (edge.bidirect == 'true')
                mesh = links.build(edge, 'BIDIRECT')
            //被域调用
            else if (edge.from == fromSolarName && edge.to != null)
                mesh = links.build(edge, 'OUT');
            // 调用域
            else if (edge.to == fromSolarName && edge.from != null)
                mesh = links.build(edge, 'IN')

            if (mesh == null)
                continue;
            edge.activated = true
            atlas.scence.add(mesh);

        }
    },
    build: function (edge, type) {
        if (edge.link != null)
            return edge.link;
        var fromSolar = atlas.scence.getObjectByName(edge.from);
        var toSolar = atlas.scence.getObjectByName(edge.to)
        if (fromSolar.name == toSolar.name)
            return null;
        if (fromSolar == null || toSolar == null) {
            console.warn('from or to object not found, from:' + edge.from + " to:" + edge.to);
            return null;
        }

        var points = this.generatePoints(fromSolar.position, toSolar.position);

        console.log(points)

        var tubeGeometry = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(points), links.segments, links.radius, links.radiusSegments, links.closed)

        var color = type == 'BIDIRECT' ? 0xff00ff : type == 'IN' ? 0xff0000 : 0x0000ff;
        var mesh = new THREE.Mesh(tubeGeometry, new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.3,
            color: color
        }))
        mesh.name = fromSolar.name + "|" + toSolar.name;
        edge.link = mesh
        return mesh;
    },

    generatePoints: function (from, to) {
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

    deactivate: function () {
        if (atlas.edges == null)
            return;
        for (var i = 0; i < atlas.edges.length; i++) {
            var edge = atlas.edges[i]
            if (edge.activated == true) {
                atlas.scence.remove(edge.link);
            }
        }
    }

}