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
            scale:16
        }


        atlas.init = function (name) {

            atlas.step = 0
            atlas.raycaster = new THREE.Raycaster();

            atlas.textureLoader = new THREE.TextureLoader()
            atlas.scence = initScene()
            atlas.camera = initCamera();
            atlas.trackball = initTrackball(atlas.camera);
            atlas.render = initRender();
            atlas.clock = new THREE.Clock();
            atlas.plane = initPlane(param.planeWidth*1.5, param.planeHeight*1.5, param.planeWdtSeg, param.planeHgtSeg)
            addGridHelper()
            atlas.stars = []
            atlas.planets = []
            atlas.solarObjects = []
            initDomains();


            // atlas.camera.lookAt(atlas.scence.position)
            atlas.render.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
            $(name).append(atlas.render.domElement)

            atlas.draw();
        }


        function initScene() {
            var scene = new THREE.Scene();
            var mat = new THREE.MeshBasicMaterial()
            scene.material = mat;
            return scene
        }

        function initDomains() {
            d3.json('libs/data/entity.json', function (error, entityJson) {
                var domains = jsonConvert.convert(entityJson)
                // var domains = entityJson.domains
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
                    var distance = param.solarSize+ (i + 1) * param.spaceUnit;
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
            trackballControls.zoomSpeed = 1
            trackballControls.noZoom = true
            trackballControls.panSpeed = 0.05
            trackballControls.noRotate = true
            trackballControls.noRoll = true
            // trackballControls.maxDistance = 100
            // trackballControls.minDistance = 20
            atlas.trackball = trackballControls;
            return atlas.trackball
        }

        function initRender() {
            var render = new THREE.WebGLRenderer()
            render.setClearColor(0x111111, 0.0)

            render.setSize(window.innerWidth, window.innerHeight)
            render.shadowMapEnabled = false;
            return render;
        }

        function initCamera() {
            var scale = param.scale;
            var camera = new THREE.OrthographicCamera(window.innerWidth / -scale, window.innerWidth / scale,
                window.innerHeight / scale, window.innerHeight / -scale, -1000, 5000);
            camera.position.set(300, 300, 300);
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
                    size: 3,
                    height: 0.1,
                    font: atlas.font,
                    weight: 'normal',
                    style: 'normal',
                    bevelThickness: 0,
                    bevelSize: 2,
                    bevelEnabled: false,
                    bevelSegments: 2,
                    curveSegments: 2,
                    steps: 2
                }
                for (var i = 0; i < domains.length; i++) {
                    var domain = domains[i]

                    var text = new THREE.Mesh(new THREE.TextGeometry(domain.name, options))
                    text.position.set(domain.x+3, param.entityHeight - 5, domain.y+3)
                    // text.rotateX(-8 / 16 * Math.PI)
                    text.rotateY(4 / 16 * Math.PI)
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
            // if (delta > 0.02) {
            //     param.scale += 1;
            //     if (param.scale >= 32)
            //         param.scale = 1;
            // }
            // var scale = param.scale;
            // atlas.camera.left = window.innerWidth / -scale
            // atlas.camera.right = window.innerWidth / scale
            // atlas.camera.top = window.innerHeight / scale
            // atlas.camera.buttom = window.innerHeight / -scale
            // atlas.camera.updateProjectionMatrix();
            atlas.render.render(atlas.scence, atlas.camera)
            requestAnimationFrame(atlas.draw);
        }

        function createPlaneMesh(geom, imageFile) {
            if (imageFile != null) {
                var texture = atlas.textureLoader.load("./jpg/" + imageFile);
                var mesh = new THREE.Mesh(
                    geom,
                    new THREE.MeshBasicMaterial({
                        map: texture
                    }));
                mesh.material.map.wrapS = THREE.RepeatWrapping;
                mesh.material.map.wrapT = THREE.RepeatWrapping;
                return mesh

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
