/**
 * Created by jameswu on 16-11-26.
 */
(function () {
        var atlas = window.atlas = {}
        var param = atlas.param = {
            baseGalaxySize: 500,
            spaceUnit: 1,
            solarSize: 2.5,
            planetSize: 0.2,
            stepIncrease: 0.0005,
            radius: 300,
            planeWdtSeg: 10,
            planeHgtSeg: 6,
            entityHeight: 5,
            scale: 16,
            atlasHeight: window.innerHeight,
            atlasWidth: window.innerWidth,
        }


        //TODO:these one become solar fonts
        atlas.fonts = []
        atlas.domainJsons = {}
        atlas.init = function (name) {
            textureUtil.loadTexture()

            progressUtils.progress(10, '加载字库中')
            new THREE.FontLoader().load('atlas/font/helvetiker_regular.typeface.json', function (response) {
                atlas.font = response;
                progressUtils.progress(30, '加载域对象中')
                // d3.json(globalConfig.contextPath + "/service/sso/domains/all", function (error, entityJson) {
                d3.json('atlas/data/all.json', function (error, entityJson) {
                    progressUtils.progress(50, '加载域依赖中')
                    atlas.entityJson = entityJson;
                    // d3.json(globalConfig.contextPath + '/service/sso/domains/all-dependencies', function (error, edgesJson) {
                    d3.json('atlas/data/all-dependencies.json', function (error, edgesJson) {
                        if (error)
                            alert(error)
                        progressUtils.progress(90, '3D建模中')
                        atlas.step = 0
                        atlas.edges = edgesJson;
                        atlas.edgesMap = function (edgesJson) {
                            var map = {}
                            for (var i = 0; i < edgesJson.length; i++) {
                                var edges = edgesJson[i];
                                map[edges.name] = edges;
                            }
                            return map;
                        }(edgesJson);
                        atlas.raycaster = new THREE.Raycaster();

                        atlas.scence = initScene()
                        atlas.camera = initCamera();
                        atlas.render = initRender();
                        atlas.clock = new THREE.Clock();
                        atlas.plane = initPlane(param.radius * 1.5)
                        addGridHelper()
                        atlas.stars = []
                        atlas.planets = []
                        atlas.solarObjects = []
                        initDomains();
                        cp.initSearchItems()
                        window.addEventListener('resize', cp.autoResize, false)
                        atlas.render.domElement.addEventListener('mousedown', cp.onMousedown, false);
                        atlas.render.domElement.addEventListener('mousewheel', cp.onMousewheel, false);
                        atlas.render.domElement.addEventListener('mousemove', cp.onMousemove, false);

                        $(name).append(atlas.render.domElement)

                        atlas.trackball = initTrackball(atlas.camera);
                        atlas.draw();
                        cp.reset();
                        progressUtils.end('资源加载完毕')
                    })
                })
            }, function (progress) {
                progressUtils.progress(progress.loaded / progress.total * 0.2 * 100 + 10)
            }, function (error) {
                console.error(error)
            });
        }

        function initScene() {
            var scene = new THREE.Scene();
            return scene
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

            render.setSize(param.atlasWidth, param.atlasHeight)
            render.shadowMapEnabled = false;
            return render;
        }

        function initCamera() {
            var scale = param.scale;
            var camera = new THREE.OrthographicCamera(param.atlasWidth / -scale, param.atlasWidth / scale,
                param.atlasHeight / scale, param.atlasHeight / -scale, -1000, 5000);
            camera.position.set(300, 300, 300);
            return camera;
        }

        function initPlane(width) {
            var plane = createPlaneMesh(
                new THREE.CircleGeometry(width * .75, 108))
            plane.rotation.x = -0.5 * Math.PI
            plane.name = 'plane'
            plane.position.set(0, 0, 0)
            atlas.plane = plane;
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

        function initDomains() {
            var domains = jsonConvert.convert(atlas.entityJson)
            for (var i = 0; i < domains.length; i++) {
                var domain = domains[i]
                addDomainSolar(domain)
            }
            addTags(domains);

        }

        function addDomainSolar(domain) {
            atlas.domainJsons[domain.name] = domain
            var solar = createSolarMesh(new THREE.SphereGeometry(param.solarSize, 30, 30), domain.pic)
            solar.planets = []
            //addLightSpot(domain);

            solar.domainJson = domain;
            domain.solar = solar;
            solar.position.set(domain.x, param.entityHeight, domain.y)
            solar.name = domain.name
            cp.addSearchItem(domain.name)
            atlas.scence.add(solar)
            atlas.stars.push(domain.name)
            atlas.solarObjects.push(solar)
            addPlanetsNew(domain);

            function addPlanetsNew(domain) {
                var solar = domain.solar
                var typePlanets = solarReport.sortByType(domain.planets)
                for (var i = 0; i < typePlanets['twoDimArray'].length; i++) {
                    var typedPlanets = typePlanets['twoDimArray'][i];
                    if (typedPlanets.length == 0)
                        continue;
                    var type = typedPlanets.type = globalConfig.planetTypes[i]


                    var planet = createPlanetMesh(new THREE.SphereGeometry(Math.log2(typedPlanets.length + 2) * param.planetSize, 10, 10), i)
                    planet.typedJson = typedPlanets;

                    var distance = param.solarSize + (i + 1) * param.spaceUnit;
                    var currentX = domain.x + distance
                    var currentY = domain.y
                    planet.position.set(currentX, param.entityHeight, currentY)
                    planet.name = typedPlanets.name = "[" + domain.name + "]." + type;
                    typedPlanets.allApps = planet.allApps = function (typePlanet) {
                        var apps = []
                        for (var i = -0; i < typePlanet.length; i++) {
                            apps.push(typePlanet[i])
                        }
                        return apps;
                    }(typedPlanets);

                    solar.planets.push(planet)
                    atlas.scence.add(planet)
                    atlas.stars.push(planet.name)
                    for (var j = 0; j < planet.allApps.length; j++)
                        cp.addSearchItem('[' + domain.name + ']' + planet.allApps[j].name)

                    atlas.planets.push({
                        'name': planet.name,
                        'cx': domain.x,
                        'cy': domain.y,
                        'd': distance,
                        angle: Math.random() * 2 * Math.PI
                    })

                }
            }

        }

        function addTags(domains) {
            var options = {
                size: 3,
                height: 0.1,
                font: atlas.font,
                weight: 'normal',
                style: 'normal',
                // bevelThickness: 0,
                // bevelSize: 0,
                bevelEnabled: false,
                // bevelSegments: 2,
                curveSegments: 5,
                steps: 5
            }
            for (var i = 0; i < domains.length; i++) {
                var domain = domains[i]

                var text = new THREE.Mesh(new THREE.TextGeometry(domain.name, options))
                text.position.set(domain.x + 3, param.entityHeight - 3, domain.y + 3)
                text.rotateY(4 / 16 * Math.PI)
                atlas.fonts.push(text)
                atlas.scence.add(text)
            }
        }

        function createPlaneMesh(geom) {
            //var texture = textureUtil.getTexture('universe.jpg')
            var mesh = new THREE.Mesh(
                geom,
                new THREE.MeshBasicMaterial({
                    //map: texture,
                    color: 0x222222,
                    transparent: true,
                    //opacity: 0.5
                }));
            return mesh
        }

        function createSolarMesh(geom, textureName) {
            var texture = textureUtil.getTexture(textureName)
            var basicMaterial = new THREE.MeshBasicMaterial({map: texture, transparent: true, opacity: 1});
            var mesh = new THREE.Mesh(geom, basicMaterial);
            //mesh.castShadow = true;
            //mesh.receiveShadow = true;
            return mesh
        }

        function createPlanetMesh(geom, planetTypeNo) {
            var textureName = textureUtil.planets[planetTypeNo]
            var texture = textureUtil.getTexture(textureName)
            var basicMat = new THREE.MeshBasicMaterial({map: texture, color: 0xffffff});
            return new THREE.Mesh(geom, basicMat)

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
    }
).call(this)
