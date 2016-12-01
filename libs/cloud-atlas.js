/**
 * Created by jameswu on 16-11-26.
 */
(function () {
        var atlas = window.atlas = {}
        var domainJson = {
            "domains": [
                {
                    'name': 'solar', 'x': 0, 'y': 0, 'planets': [{name: 'earth', 'size': '1'}]
                },
                {
                    'name': 'south', 'x': 100, 'y': 100, 'planets': [{name: 'primary-2', 'size': '2'}]
                },
                {
                    'name': 'three', 'x': -100, 'y': 100, 'planets': [{name: 'primary', 'size': '2'}]
                },
                {
                    'name': 'north', 'x': 100, 'y': -100, 'planets': [{name: 'primary-3', 'size': '2'}]
                },
                {
                    'name': 'west', 'x': -100, 'y': -100, 'planets': [{name: 'primary-4', 'size': '2'}]
                },

            ]

        }

        var edgesJson = [
            {'from': 'solar', 'to': 'south'},
            {'from': 'solar', 'to': 'three'},
            {'from': 'solar', 'to': 'north'},
            {'from': 'solar', 'to': 'west'},
            {'from': 'north', 'to': 'south'},
            {'from': 'north', 'to': 'west'},
            {'from': 'south', 'to': 'west'},
            {'from': 'south', 'to': 'three'},
            {'from': 'west', 'to': 'three'},
        ]


        var param = {
            spaceUnit: 5,
            solarSize: 2,
            planetSize: 0.5,
            stepIncrease: 0.002,
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
            addLinks: function () {
                for (var i = 0; i < edgesJson.length; i++) {
                    var edge = edgesJson[i];
                    var fromSolar = atlas.scence.getObjectByName(edge.from);
                    var toSolar = atlas.scence.getObjectByName(edge.to)
                    if (fromSolar == null || toSolar == null) {
                        console.warn('from or to object not found, from:' + edge.from + " to:" + edge.to);
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
                        opacity: 0.15,
                        color: 0xffffff
                    }))
                    edge.link = mesh
                    atlas.scence.add(mesh)
                }
            }
            ,

            activateLinks: function (fromSolarName) {
                for (var i = 0; i < edgesJson.length; i++) {
                    var edge = edgesJson[i]
                    if (edge.from == fromSolarName) {
                        var link = edge.link
                        if (link != null) {
                            edge.activated = true
                            link.material.color = new THREE.Color(0xfff)
                        }
                    }
                }
            }
            ,

            deactivateLinks: function () {
                for (var i = 0; i < edgesJson.length; i++) {
                    var edge = edgesJson[i]
                    if (edge.activated == true) {
                        edge.link.material.color = new THREE.Color(0xffffff)
                        edge.activated = false
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
            initDomains(domainJson);

            atlas.camera.lookAt(atlas.scence.position)
            atlas.render.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
            // atlas.render.domElement.addEventListener('mouseup', onDocumentMouseUp, false);
            $(name).append(atlas.render.domElement)

            loadFont(name);

            link.addLinks()

            atlas.draw();
        }


        function initScence() {
            var scence = new THREE.Scene();
            var mat = new THREE.MeshBasicMaterial()
            scence.material = mat;
            return scence
        }

        function initDomains(domainJson) {
            var domains = domainJson.domains
            for (var i = 0; i < domains.length; i++) {
                var domain = domains[i]
                addDomainSolar(domain)
            }

        }

        function addDomainSolar(domain) {
            var solar = createPlaneMesh(new THREE.SphereGeometry(param.solarSize, 20, 20), 'solar.jpg')
            addLightSpot();

            solar.position.set(domain.x, param.entityHeight, domain.y)
            solar.name = domain.name
            atlas.scence.add(solar)
            atlas.stars.push(domain.name)
            atlas.solarObjects.push(solar)
            addPlanet();


            function addPlanet() {
                var planets = domain.planets
                for (var i = 0; i < planets.length; i++) {
                    var planet = createPlaneMesh(new THREE.SphereGeometry(param.planetSize, 10, 10), 'earth.jpg')
                    var currentX = domain.x + (i + 1) * param.spaceUnit
                    var currentY = domain.y
                    planet.position.set(currentX, param.entityHeight, currentY)
                    planet.name = planets[i].name
                    atlas.scence.add(planet)
                    atlas.stars.push(planet.name)
                    atlas.planets.push({
                        'name': planet.name, 'cx': domain.x, 'cy': domain.y, 'd': (i + 1) * param.spaceUnit
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

        function loadFont() {
            var loader = new THREE.FontLoader();
            loader.load('font/helvetiker_regular.typeface.json', function (response) {
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
                var domains = domainJson.domains
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
                planetObj.position.x = Math.cos(atlas.step * Math.PI * 2) * planet.d + planet.cx
                planetObj.position.z = Math.sin(atlas.step * Math.PI * 2) * planet.d + planet.cy
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
                SELECTED = intersect[0].object;
                window.report.showSolarReport(e.clientX, e.clientY);
                link.activateLinks(SELECTED.name)
            } else {
                window.report.hideSolarReport();
                link.deactivateLinks()
            }

        }

    }

).call(this)
