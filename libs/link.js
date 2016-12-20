/**
 * Created by jameswu on 16-12-20.
 */
var links = {
    segments: 64,
    radius: 0.5,
    radiusSegments: 12,
    closed: false,
    opacity: 0.3,

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
            if (edge.from == fromSolarName && edge.to != null) {
                var mesh = links.build(edge)
                if (mesh == null)
                    continue;
                edge.activated = true
                atlas.scence.add(mesh);
            }
        }
    },
    build: function (edge) {
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

        var points = []

        var direction = new THREE.Vector3();
        points.push(direction.set(fromSolar.position.x, links.param.entityHeight, fromSolar.position.z).clone())
        points.push(direction.set(toSolar.position.x, links.param.entityHeight, toSolar.position.z).clone())
        var tubeGeometry = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(points), links.segments, links.radius, links.radiusSegments, links.closed)

        var mesh = new THREE.Mesh(tubeGeometry, new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.3,
            color: 0xfff
        }))
        mesh.name = fromSolar.name + "|" + toSolar.name;
        edge.link = mesh
        return mesh;
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