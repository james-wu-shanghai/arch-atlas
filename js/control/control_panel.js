/**
 * Created by jameswu on 17-1-7.
 */
function findDomain(arg) {
    var domainObj = atlas.scence.getObjectByName(arg.value)
    console.log(domainObj)
    if (domainObj) {
        var posObj = domainObj.position;
        var posCamera = atlas.camera.position;
        console.log(posObj)
        console.log(posCamera)
        var xDist = posObj.x - posCamera.x;
        var zDist = posObj.z - posCamera.z;
        console.log(xDist)
        console.log(zDist)
        // atlas.camera.position.set(domainObj.x, atlas.camera.position.y, domainObj.z)
        atlas.camera.lookAt(new THREE.Vector3(100,100,0))
    }
}
