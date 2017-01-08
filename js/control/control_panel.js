/**
 * Created by jameswu on 17-1-7.
 */
function findDomain(arg) {
    var domainObj = atlas.scence.getObjectByName(arg.value)
    if (domainObj) {
        atlas.trackball.target = domainObj.position.clone();
        atlas.camera.position = new THREE.Vector3(300, 300, 300)
        atlas.camera.updateProjectionMatrix()
    }
}

function resize(size) {
    atlas.camera.left = window.innerWidth / -size
    atlas.camera.right = window.innerWidth / size
    atlas.camera.top = window.innerHeight / size
    atlas.camera.buttom = window.innerHeight / -size
    atlas.camera.updateProjectionMatrix();
}

function reset() {
    atlas.trackball.reset();
    resize(16)
}
