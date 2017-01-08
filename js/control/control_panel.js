/**
 * Created by jameswu on 17-1-7.
 */
function findDomain(arg) {
    var domainObj = atlas.scence.getObjectByName(arg.value)
    if (domainObj)
        atlas.trackball.target = domainObj.position.clone();

}
