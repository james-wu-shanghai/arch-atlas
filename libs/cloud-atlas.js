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
            d3.json('libs/data/entity.json', function (error, entityJson) {
                var domains = jsonConvert.convert(entityJson)
                for (var i = 0; i < domains.length; i++) {
                    var domain = domains[i]
                    addDomainSolar(domain)
                }
                loadFont(domains);

                if (links)
                    links.add(param)

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
                links.activate(domain.name)
            } else {
                window.report.hideSolarReport();
                links.deactivate()
            }

        }

    }

).call(this)
