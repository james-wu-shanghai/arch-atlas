/**
 * Created by jameswu on 17-1-7.
 */
function findDomain(arg) {
    var domainObj = atlas.scence.getObjectByName(arg.value)
    if (domainObj) {
        atlas.trackball.target = domainObj.position.clone();
        atlas.camera.position = new THREE.Vector3(300,300,300)
        atlas.camera.updateProjectionMatrix()
    }
}
