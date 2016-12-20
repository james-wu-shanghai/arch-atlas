/**
 * Created by jameswu on 16-11-26.
 */
(function () {
        var atlas = window.atlas = {}
        var domainJson = null;
        var edgesJson = null;

        var param = {
            spaceUnit: 0.5,
            solarSize: 1.5,
            planetSize: 0.2,
            stepIncrease: 0.0005,
            planeWidth: 250,
            planeHeight: 250,
            planeWdtSeg: 10,
            planeHgtSeg: 6,
            entityHeight: 5,
        }
        var link = {
            segments: 64,
            radius: 0.5,
            radiusSegments: 12,
            closed: false,
            opacity: 0.3,
            addLinks: function () {
                d3.json('libs/data/entity-connections.json', function (error, edgesJson) {
                    atlas.edges = edgesJson;
                    for (var i = 0; i < edgesJson.length; i++) {
                        if (edgesJson != null)
                            var mesh = link.buildLink(edgesJson[i]);
                        //atlas.scence.add(mesh)
                    }
                })
            },
            buildLink: function (edge) {
                if (edge.link != null)
                    return edge.link;
                var fromSolar = atlas.scence.getObjectByName(edge.from);
                var toSolar = atlas.scence.getObjectByName(edge.to)
                // // if (fromSolar.name == toSolar.name)
                //     return null;
                if (fromSolar == null || toSolar == null) {
                    console.warn('from or to object not found, from:' + edge.from + " to:" + edge.to);
                    return null;
                }

                var points = []

                var direction = new THREE.Vector3();
                points.push(direction.set(fromSolar.position.x, param.entityHeight, fromSolar.position.z).clone())

                // points.push(direction.set(fromSolar.position.x, 0, fromSolar.position.z).clone())
                // points.push(direction.set(toSolar.position.x, 0, toSolar.position.z).clone())
                points.push(direction.set(toSolar.position.x, param.entityHeight, toSolar.position.z).clone())
                var tubeGeometry = new THREE.TubeGeometry(
                    new THREE.CatmullRomCurve3(points), link.segments, link.radius, link.radiusSegments, link.closed)

                var mesh = new THREE.Mesh(tubeGeometry, new THREE.MeshBasicMaterial({
                    transparent: true,
                    opacity: 0.3,
                    color: 0xfff
                }))
                mesh.name = fromSolar.name + "|" + toSolar.name;
                edge.link = mesh
                return mesh;
            },

            activateLinks: function (fromSolarName) {
                if (atlas.edges == null)
                    return;
                for (var i = 0; i < atlas.edges.length; i++) {
                    var edge = atlas.edges[i]
                    if (edge.from == fromSolarName && edge.to != null) {
                        var mesh = link.buildLink(edge)
                        if (mesh == null)
                            continue;
                        // if (link != null) {
                        edge.activated = true
                        atlas.scence.add(mesh);
                        // return;
                        // link.material.opacity = 1//link.opacity
                        // link.material.color = new THREE.Color(0xfff)
                        // }
                    }
                }
            }
            ,

            deactivateLinks: function () {
                if (atlas.edges == null)
                    return;
                for (var i = 0; i < atlas.edges.length; i++) {
                    var edge = atlas.edges[i]
                    if (edge.activated == true) {
                        atlas.scence.remove(edge.link);
                        //     edge.link.material.opacity = 0
                        //     edge.link.material.color = new THREE.Color(0xffffff)
                        //     edge.activated = false
                    }
                }
            }

        }

        atlas.init = function (name) {

            atlas.step = 0
            atlas.raycaster = new THREE.Raycaster();

            atlas.textureLoader = new THREE.TextureLoader()
            atlas.scence = initScence()
            atlas.camera = initCamera();
            atlas.trackball = initTrackball(atlas.camera);
            atlas.render = initRender();
            atlas.clock = new THREE.Clock();
            atlas.plane = initPlane(param.planeWidth, param.planeHeight, param.planeWdtSeg, param.planeHgtSeg)
            addGridHelper()
            atlas.stars = []
            atlas.planets = []
            atlas.solarObjects = []
            initDomains();


            atlas.camera.lookAt(atlas.scence.position)
            atlas.render.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
            // atlas.render.domElement.addEventListener('mouseup', onDocumentMouseUp, false);
            $(name).append(atlas.render.domElement)

            atlas.draw();
        }


        function initScence() {
            var scence = new THREE.Scene();
            var mat = new THREE.MeshBasicMaterial()
            scence.material = mat;
            return scence
        }

        function initDomains() {
            // d3.json('libs/data/domain.json', function (error, domainjson) {
            // var domains = domainjson.domains


            d3.json('libs/data/entity.json', function (error, entityJson) {
                var domains = jsonConvert.convert(entityJson)
                for (var i = 0; i < domains.length; i++) {
                    var domain = domains[i]
                    addDomainSolar(domain)
                }
                loadFont(domains);

                link.addLinks()
            })
        }

        function addDomainSolar(domain) {
            var solar = createPlaneMesh(new THREE.SphereGeometry(param.solarSize, 20, 20), 'stars/' + domain.pic)
            solar.planets = []
            addLightSpot();

            solar.position.set(domain.x, param.entityHeight, domain.y)
            solar.name = domain.name
            atlas.scence.add(solar)
            atlas.stars.push(domain.name)
            atlas.solarObjects.push(solar)
            addPlanet(domain, solar);


            function addPlanet(domain, solar) {
                var planets = domain.planets
                for (var i = 0; i < planets.length; i++) {
                    var planet = createPlaneMesh(new THREE.SphereGeometry(param.planetSize, 10, 10), 'planet/earth.jpg')
                    var distance = (i + 1) * param.spaceUnit;
                    var currentX = domain.x + distance
                    var currentY = domain.y
                    planet.position.set(currentX, param.entityHeight, currentY)
                    planet.name = "[" + domain.name + "]." + planets[i].name
                    solar.planets.push(planet)
                    atlas.scence.add(planet)
                    atlas.stars.push(planet.name)
                    atlas.planets.push({
                        'name': planet.name,
                        'cx': domain.x,
                        'cy': domain.y,
                        'd': distance,
                        angle: Math.random() * 2 * Math.PI
                    })
                }
            }

            function addLightSpot() {
                var pointLight = new THREE.PointLight('#FFFFFF', 10, 10);
                pointLight.position.set(domain.x, param.entityHeight, domain.y)
                atlas.scence.add(pointLight)
            }
        }


        function initTrackball(camera) {
            var trackballControls = new THREE.TrackballControls(camera)
            // trackballControls.rotateSpeed = 1
            // trackballControls.zoomSpeed = 1
            trackballControls.panSpeed = 0.05
            trackballControls.noRotate = true
            trackballControls.noZoom = true
            trackballControls.noRoll = true
            // trackballControls.maxDistance = 100
            // trackballControls.minDistance = 20
            return trackballControls
        }

        function initRender() {
            var render = new THREE.WebGLRenderer()
            render.setClearColor(0x111111, 0.0)

            render.setSize(window.innerWidth, window.innerHeight)
            render.shadowMapEnabled = false;
            return render;
        }

        function initCamera() {
            var camera = new THREE.OrthographicCamera(window.innerWidth / -16, window.innerWidth / 16,
                window.innerHeight / 16, window.innerHeight / -16, -200, 1500);
            camera.position.set(-250, 250, 250);
            return camera;
        }

        function initPlane(width, height, widthSeg, heightSeg) {
            var plane = createPlaneMesh(
                new THREE.PlaneGeometry(width, height, widthSeg, heightSeg), 'universe.jpg')
            plane.rotation.x = -0.5 * Math.PI
            plane.name = 'plane'
            plane.position.set(0, 0, 0)
            atlas.scence.add(plane)
            //universe background
            // var plane2 = createPlaneMesh(new THREE.PlaneBufferGeometry(width * 4, height * 4, 1, 1), 'universe.jpg')
            // plane2.rotation.x = -0.5 * Math.PI
            // plane2.position.set(0, -10, 0)
            // atlas.scence.add(plane2)

            return plane

        }

        function addGridHelper() {
            var helper = new THREE.GridHelper(1000, 100);
            helper.position.y = 1;
            helper.material.opacity = 0.25;
            helper.material.transparent = true;
            atlas.scence.add(helper);
        }

        function loadFont(domains) {
            var loader = new THREE.FontLoader();
            // loader.load('font/helvetiker_regular.typeface.json', function (response) {
            loader.load('font/FZFangSong-Z02_Regular.json', function (response) {
                atlas.font = response;
                addDomainTags()

            }, function (progress) {
                // console.trace(progress)

            }, function (error) {
                console.error(error)
            });
            function addDomainTags() {
                var options = {
                    size: 2,
                    height: 0.1,
                    font: atlas.font,
                    weight: 'normal',
                    style: 'normal',
                    bevelThickness: 0,
                    bevelSize: 0,
                    bevelEnabled: false,
                    bevelSegments: 3,
                    curveSegments: 1,
                    steps: 1
                }
                for (var i = 0; i < domains.length; i++) {
                    var domain = domains[i]

                    var text = new THREE.Mesh(new THREE.TextGeometry(domain.name, options))
                    text.position.set(domain.x, param.entityHeight - 5, domain.y)
                    text.rotateY(-4 / 16 * Math.PI)
                    atlas.scence.add(text)
                }
            }
        }

        atlas.draw = function () {
            var delta = atlas.clock.getDelta();
            atlas.trackball.update(delta)

            atlas.step += param.stepIncrease
            for (var i = 0; i < atlas.stars.length; i++) {
                atlas.scence.getObjectByName(atlas.stars[i]).rotation.y = atlas.step
            }
            for (var i = 0; i < atlas.planets.length; i++) {
                var planet = atlas.planets[i]
                var planetObj = atlas.scence.getObjectByName(planet.name);
                planetObj.position.x = Math.cos(planet.angle + atlas.step * Math.PI * 2) * planet.d + planet.cx
                planetObj.position.z = Math.sin(planet.angle + atlas.step * Math.PI * 2) * planet.d + planet.cy
            }
            atlas.render.render(atlas.scence, atlas.camera)
            requestAnimationFrame(atlas.draw);
        }

        function createPlaneMesh(geom, imageFile) {
            if (imageFile != null) {
                var texture = atlas.textureLoader.load("./jpg/" + imageFile);
                return new THREE.Mesh(
                    geom,
                    new THREE.MeshBasicMaterial({
                        map: texture
                    }))

            } else {
                return new THREE.Mesh(geom, new THREE.MeshBasicMaterial({color: 0x000000}))
            }
        }

        function onDocumentMouseMove(e) {
            e.preventDefault();
            var vector = new THREE.Vector2(( e.clientX / window.innerWidth) * 2 - 1, -( e.clientY / window.innerHeight ) * 2 + 1)

            var rayCaster = new THREE.Raycaster()
            rayCaster.setFromCamera(vector, atlas.camera);

            var intersect = rayCaster.intersectObjects(atlas.solarObjects);
            if (intersect.length > 0) {
                var domain = intersect[0].object;
                window.report.showSolarReport(e.clientX, e.clientY, domain);
                link.activateLinks(domain.name)
            } else {
                window.report.hideSolarReport();
                link.deactivateLinks()
            }

        }

    }

).call(this)
