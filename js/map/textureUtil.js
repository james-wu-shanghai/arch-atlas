/**
 * Created by jameswu on 17-1-15.
 */
(function () {
        var textureUtil = window.textureUtil = {}

        var stars = window.textureUtil.stars = [
            'blue.jpg',
            'golden.jpg',
            'pink.jpg',
            'red.jpg',
            'very-red.jpg',
            'purple.jpg',
            'yellow.jpg',
            'green.jpg',
            'brown.jpg',
            'cyan.jpg'];
        var planets = window.textureUtil.planets = ['earth.jpg',
            'jupeter.jpg',
            'mars.jpg ',
            'mercury.jpg',
            'neptune.jpg',
            'satum.jpg',
            'venus.jpg',]

        var textures = window.textureUtil.textures = [];
        textureUtil.loadTexture = function () {
            var textureLoader = new THREE.TextureLoader();

            function _loadTexture(path, name, loader, txrs) {
                var txr = loader.load(path);
                var txrObj = {}
                txrObj.name = name
                txrObj.texture = txr;
                txrs.push(txrObj);
            }

            for (var i = 0; i < planets.length; i++) {
                var fileName = "./jpg/planet/" + planets[i];
                _loadTexture(fileName, planets[i], textureLoader, textures)
            }
            for (var i = 0; i < stars.length; i++) {
                var fileName = "./jpg/stars/" + stars[i];
                _loadTexture(fileName, stars[i], textureLoader, textures)
            }
        }

        window.textureUtil.getTexture = function (textureName) {
            for (var i = 0; i < textures.length; i++) {
                if (textureName == textures[i].name)
                    return textures[i].texture;
            }
        }

    }
).call(this)
