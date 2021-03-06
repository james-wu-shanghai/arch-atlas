/**
 * Created by jameswu on 16-12-19.
 */
var domainParser = {
    stars: window.textureUtil.stars,
    valid_suffix: ["gw", "app", "svc", "srv", "web"],
    convert: function (entityJson) {
        var domains = [];

        for (var i = 0; i < entityJson.length; i++) {
            var entity = entityJson[i];
            for (var j = 0; j < this.valid_suffix.length; j++) {
                if (this.endWith(entity.key, this.valid_suffix[j])) {
                    var planet = this.generatePlanet(entity);
                    if (planet.domainName != null)
                        this.insertPlanet(domains, planet);
                }
            }
        }
        function hasUnknown(domains, pic) {
            var unknown = null
            for (var i = 0; i < domains.length; i++) {
                if (domains[i].name == 'Unknown') {
                    unknown = domains[i]
                    domains = domains.splice(i, 1)
                    break;
                }
            }
            unknown.pic = pic
            unknown.x = atlas.param.baseGalaxySize / 2
            unknown.y = -atlas.param.baseGalaxySize / 2
            return unknown
        };
        var known = hasUnknown(domains, this.stars[0])

        for (var i = 0; i < domains.length; i++) {
            var domain = domains[i];
            domain.pic = this.stars[i % this.stars.length]
            var base = atlas.param.baseGalaxySize
            domain.x = base / 8 * (i % 8) - base / 2 + Math.random() * base / 15;
            domain.y = base / 8 * (i / 8) - base / 2 + Math.random() * base / 15;
        }
        if (known != null)
            domains.push(known)
        return domains;
    },

    endWith: function (original, suffix) {
        if (suffix == null || suffix == "" || !original || original.length == 0 || suffix.length > original.length)
            return false;
        if (original.substring(original.length - suffix.length) == suffix)
            return true;
        else
            return false;
        return true;
    },
    startWith: function (original, prefix) {
        if (prefix == null || prefix == "" || !original || original.length == 0 || prefix.length > original.length)
            return false;
        if (original.substring(0, prefix.length) == prefix)
            return true;
        else
            return false;
    },
    generatePlanet: function (entity) {
        var planet = {};
        planet.name = entity.key;
        planet.size = 1;
        planet.domainName = entity.attributes.domain;
        return planet;
    },

    insertPlanet: function (domains, planet) {
        for (var i = 0; i < domains.length; i++) {
            var domain = domains[i];
            if (domain.name == planet.domainName) {
                domains[i].planets.push(planet);
                return;
            }
        }
        var domain = {};
        domain.name = planet.domainName;
        domain.planets = [planet];
        domains.push(domain);
    },


}
