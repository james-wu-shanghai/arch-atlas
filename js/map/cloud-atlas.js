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
            scale: 16,
            atlasHeight: window.innerHeight,
            atlasWidth: window.innerWidth,
        }


        atlas.init = function (name) {
            var progressUtils = window.progressUtils;
            // progressUtils.start('开始加载资源')
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
                            atlas.edges = edgesJson;

                            atlas.step = 0
                            atlas.raycaster = new THREE.Raycaster();

                            atlas.textureLoader = new THREE.TextureLoader()
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


                            // atlas.camera.lookAt(atlas.scence.position)
                            // atlas.render.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
                            atlas.render.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
                            $(name).append(atlas.render.domElement)

                            atlas.trackball = initTrackball(atlas.camera);
                            atlas.draw();
                            cp.reset();
                        })
                    })
                })
            }, function (progress) {
                progressUtils.progress(progress.loaded / progress.total * 0.6 * 100 + 10)
            }, function (error) {
                console.error(error)
            });
        }

        //根据材质加载更新进度条，完成解锁模弹
        atlas.textureProgress = {}
        atlas.textureProgress.textureLmt = 55
        atlas.textureProgress.loadedImages = []
        atlas.textureProgress.loaded = function (texture) {
            atlas.textureProgress.loadedImages.push(texture.image.baseURI)
            if (atlas.textureProgress.loadedImages.length >= atlas.textureProgress.textureLmt)
                progressUtils.end('资源加载完毕')
        }
        atlas.textureProgress.loading = function (evt) {
            progressUtils.progress(90 + atlas.textureProgress.loadedImages.length / atlas.textureProgress.textureLmt * 100)
        }

        function initScene() {
            var scene = new THREE.Scene();
            var mat = new THREE.MeshBasicMaterial()
            scene.material = mat;
            return scene
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
            var solar = createPlaneMesh(new THREE.SphereGeometry(param.solarSize, 30, 30), 'stars/' + domain.pic)
            solar.planets = []
            addLightSpot();

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
                    var planet = createPlaneMesh(new THREE.SphereGeometry(param.planetSize, 10, 10))
                    planet.material.color = new THREE.Color('#1874CD')
                    // console.log(planet)
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
                var texture = atlas.textureLoader.load("./jpg/" + imageFile, atlas.textureProgress.loaded, atlas.textureProgress.loading);
                var mesh = new THREE.Mesh(
                    geom,
                    new THREE.MeshBasicMaterial({
                        map: texture
                    }));
                return mesh

            } else {
                return new THREE.Mesh(geom, new THREE.MeshBasicMaterial({color: 0x000000}))
            }
        }


        function onDocumentMouseDown(e) {
            e.preventDefault();
            var vector = new THREE.Vector2(( e.clientX / param.atlasWidth) * 2 - 1, -( e.clientY / param.atlasHeight) * 2 + 1)

            var rayCaster = new THREE.Raycaster()
            rayCaster.setFromCamera(vector, atlas.camera);

            var intersect = rayCaster.intersectObjects(atlas.solarObjects);
            if (intersect.length > 0) {
                var solar = intersect[0].object
                cp.activeSolar(solar, e.clientX + 10, e.clientY + 10)
            } else
                window.report.hideSolarReport();

        }
    }

).call(this)
