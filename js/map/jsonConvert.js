/**
 * Created by jameswu on 16-12-19.
 */
var jsonConvert = {
    pics: window.textureUtil.pics,
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
            unknown.x = 220
            unknown.y = -200
            return unknown
        };
        var known = hasUnknown(domains, this.pics[0])

        for (var i = 0; i < domains.length; i++) {
            var domain = domains[i];
            domain.pic = this.pics[i % this.pics.length]
            domain.x = 300 / 8 * (i % 8) - 150 + Math.random() * 20;
            domain.y = 300 / 8 * (i / 8) - 150 + Math.random() * 20;
        }
        if (known != null)
            domains.push(known)
        return domains;
    },

    endWith: function (original, suffix) {
        if (suffix == null || suffix == "" || original.length == 0 || suffix.length > original.length)
            return false;
        if (original.substring(original.length - suffix.length) == suffix)
            return true;
        else
            return false;
        return true;
    },
    startWith: function (original, prefix) {
        if (prefix == null || prefix == "" || original.length == 0 || prefix.length > original.length)
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

    //按照类型排序
    sortByType: function (planets) {
        var typeSort = ['web', 'gw', 'i-', 'app', '-job', 'svc']
        var sorts = [[], [], [], [], [], []]
        var result = []
        for (var i = 0; i < planets.length; i++) {
            var planet = planets[i]
            for (var j = 0; j < typeSort.length; j++) {
                if (jsonConvert.startWith(planet.appName, typeSort[j]) || jsonConvert.endWith(planet.appName, typeSort[j])) {
                    sorts[j].push(planet.appName)
                    break;
                }
            }
        }
        for (var i = 0; i < sorts.length; i++)
            for (var j = 0; j < sorts[i].length; j++)
                result.push(sorts[i][j])
        return result
    }
}
