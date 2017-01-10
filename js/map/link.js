/**
 * Created by jameswu on 16-12-20.
 */
var links = {
    segments: 64,
    radius: 0.5,
    radiusSegments: 12,
    closed: false,
    opacity: 0.3,
    portDistance: 4,
    portLength: 8,

    add: function (param) {
        links.param = param
        d3.json('libs/data/entity-connections.json', function (error, edgesJson) {
            // d3.json('/service/domains/links/all', function (error, edgesJson) {
            atlas.edges = edgesJson;
        })
    },
    activate: function (fromSolarName) {
        if (atlas.edges == null)
            return;

        for (var i = 0; i < atlas.edges.length; i++) {
            var edge = atlas.edges[i]
            var mesh = null;

            //被域调用
            if (edge.from == fromSolarName && edge.to != null)
                mesh = links.build(edge, edge.bidirect == 'true' ? 'BIDIRECT' : 'OUT')
            // 调用域
            else if (edge.to == fromSolarName && edge.from != null)
                mesh = links.build(edge, edge.bidirect == 'true' ? 'BIDIRECT' : 'IN')


            if (mesh == null)
                continue;
            edge.activated = true
            atlas.scence.add(mesh)
            var arrow = this.generateArrow(mesh, mesh.geometry.parameters.path.points)
            atlas.scence.add(arrow)

        }
    },
    generateArrow: function (cubeMesh, points) {
        var endPoint = points[3];
        var cone = new THREE.Mesh(new THREE.ConeGeometry(links.radius * 1.5, links.radius * 6, 8), new THREE.MeshBasicMaterial({
            opacity: links.opacity*1.5,
            transparent: true,
            color: cubeMesh.material.color
        }))

        var direction = new THREE.Vector3(Math.sign(points[2].x - points[3].x), Math.sign(points[2].y - points[3].y), Math.sign(points[2].z - points[3].z));
        cone.position.setX(endPoint.x - direction.x * links.radius * 3)
        cone.position.setY(endPoint.y - direction.y * links.radius * 3)
        cone.position.setZ(endPoint.z - direction.z * links.radius * 3)

        //TODO: Now only support 2D, need support 3D
        cone.rotateZ(direction.x * 1 / 2 * Math.PI)
        // cone.rotateY(direction.y * 1 / 2 * Math.PI)
        cone.rotateX(direction.z * -1 / 2 * Math.PI)


        cone.name = cubeMesh.name + "|cone";
        return cone;
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
                var cone = atlas.scence.getObjectByName(edge.link.name + "|cone")
                atlas.scence.remove(cone);
            }
        }
    }

}