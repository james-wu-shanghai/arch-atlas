/**
 * Created by jameswu on 16-11-26.
 */
(function () {
        var atlas = window.atlas = {}
        var param = atlas.param = {
            spaceUnit: 0.45,
            solarSize: 2.2,
            planetSize: 0.3,
            stepIncrease: 0.0005,
            planeWidth: 250,
            planeHeight: 250,
            planeWdtSeg: 10,
            planeHgtSeg: 6,
            entityHeight: 5,
            scale: 16,
            atlasHeight: window.innerHeight,
            atlasWidth: window.innerWidth,
        }

        //TODO:these 2 move to links
        atlas.allLinks = []
        atlas.linkEdges = []

        atlas.init = function (name) {
            textureUtil.loadTexture()

            //cache ajax request,mainly for html xhr included, i remove them from xhr html pages, so no longer needed.
            // $.ajaxSetup({cache:true})

            progressUtils.progress(10, '加载字库中')
            new THREE.FontLoader().load('font/helvetiker_regular.typeface.json', function (response) {
                atlas.font = response;
                progressUtils.progress(30, '加载域对象中')
                // d3.json(globalConfig.contextPath + "/service/domains/all", function (error, entityJson) {
                d3.json('libs/data/entity.json', function (error, entityJson) {
                    progressUtils.progress(50, '加载域依赖中')
                    atlas.domainJson = entityJson;
                    // d3.json(globalConfig.contextPath + '/service/domains/links/static', function (error, depStaticJson) {
                    d3.json('libs/data/static.json', function (error, depStaticJson) {
                        progressUtils.progress(70, '加载依赖统计中')
                        atlas.depStatic = depStaticJson;
                        // d3.json(globalConfig.contextPath + '/service/domains/links/all', function (error, edgesJson) {
                        d3.json('libs/data/entity-connections.json', function (error, edgesJson) {
                            if (error)
                                alert(error)
                            progressUtils.progress(90, '3D建模中')
                            atlas.step = 0
                            atlas.edges = edgesJson;
                            atlas.raycaster = new THREE.Raycaster();

                            atlas.scence = initScene()
                            atlas.camera = initCamera();
                            atlas.render = initRender();
                            atlas.clock = new THREE.Clock();
                            atlas.plane = initPlane(param.planeWidth * 1.5, param.planeHeight * 1.5, param.planeWdtSeg, param.planeHgtSeg)
                            addGridHelper()
                            atlas.stars = []
                            atlas.planets = []
                            atlas.solarObjects = []
                            initDomains();


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
                })
            }, function (progress) {
                progressUtils.progress(progress.loaded / progress.total * 0.3 * 100 + 10)
            }, function (error) {
                console.error(error)
            });
        }

        function initScene() {
            var scene = new THREE.Scene();
            scene.add(new THREE.AmbientLight(0x888888));
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

        function initPlane(width, height, widthSeg, heightSeg) {
            var plane = createPlaneMesh(
                new THREE.PlaneGeometry(width, height, widthSeg, heightSeg), 'universe.jpg')
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
            var domains = jsonConvert.convert(atlas.domainJson)
            for (var i = 0; i < domains.length; i++) {
                var domain = domains[i]
                addDomainSolar(domain)
            }
            addTags(domains);

        }

        function addDomainSolar(domain) {
            var solar = createSolarMesh(new THREE.SphereGeometry(param.solarSize, 30, 30), domain.pic)
            solar.planets = []
            addLightSpot(domain);

            solar.domainJsonObj = domain;
            solar.position.set(domain.x, param.entityHeight, domain.y)
            solar.name = domain.name
            atlas.scence.add(solar)
            atlas.stars.push(domain.name)
            atlas.solarObjects.push(solar)
            addPlanet(domain, solar);


            function addPlanet(domain, solar) {
                var planets = domain.planets
                for (var i = 0; i < planets.length; i++) {
                    var planet = createPlanetMesh(new THREE.SphereGeometry(param.planetSize, 10, 10))
                    var distance = param.solarSize + (i + 1) * param.spaceUnit;
                    var currentX = domain.x + distance
                    var currentY = domain.y
                    planet.position.set(currentX, param.entityHeight, currentY)
                    planet.name = "[" + domain.name + "]." + planets[i].name
                    planet.appName = planets[i].name
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

            function addLightSpot(domain) {
                var pointLight = new THREE.PointLight(0xffffff, 10, 10);
                pointLight.position.set(domain.x, param.entityHeight, domain.y)
                atlas.scence.add(pointLight)
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
                atlas.scence.add(text)
            }
        }

        function createPlaneMesh(geom) {
            var texture = textureUtil.getTexture('universe.jpg')
            var mesh = new THREE.Mesh(
                geom,
                new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    opacity: 0.5
                }));
            return mesh
        }

        function createSolarMesh(geom, textureName) {
            var texture = textureUtil.getTexture(textureName)
            var basicMaterial = new THREE.MeshBasicMaterial({map: texture, transparent: true, opacity: 1});
            var mesh = new THREE.Mesh(geom, basicMaterial);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh
        }

        function createPlanetMesh(geom) {
            var texture = textureUtil.getTexture('earth.jpg')
            var basicMat = new THREE.MeshBasicMaterial({map: texture, transparent: true, opacity: 0.5});
            var normalMat = new THREE.MeshLambertMaterial({color: 0x3399ff})
            return new THREE.SceneUtils.createMultiMaterialObject(geom, [basicMat, normalMat])

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
