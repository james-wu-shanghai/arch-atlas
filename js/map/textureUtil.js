/**
 * Created by jameswu on 17-1-15.
 */
(function () {
        var textureUtil = window.textureUtil = {}

        var pics = window.textureUtil.pics = ['blue.jpg',
            'dark-red.jpg',
            'golden.jpg',
            'pink.jpg',
            'red-black.jpg',
            'solar.jpg',
            'very-red.jpg',
            'yellow.jpg'];

        var earth = 'earth.jpg'
        var plane = 'universe.jpg'

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

            _loadTexture('./jpg/universe.jpg', plane, textureLoader, textures)
            _loadTexture('./jpg/planet/earth.jpg', earth, textureLoader, textures)
            for (var i = 0; i < pics.length; i++) {
                var fileName = "./jpg/stars/" + pics[i];
                _loadTexture(fileName, pics[i], textureLoader, textures)
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
