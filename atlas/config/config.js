(function () {
    window.globalConfig = {
        contextPath: '/arch-atlas',
        planetTypes: ['web', 'gw', 'i-', 'app', 'job', 'svc', 'srv'],
        typedNames: {'web': 'desert', 'gw': 'ice', 'i-': 'fire', 'app': 'gas', 'job': 'forests', 'svc': 'sea', 'srv': 'rocks'},
    }
    window.globalResource = {
        appList: 'Planet List',
        depLine: 'Solar Links',
        solarPie: 'Solar Pie',
        hintSet: ['ToPlanets', 'ToSolar', 'fromPlanets', 'fromSolar', 'biDirectPlanets', 'biDirectSolars'],
        appNameDecorator: function (name) {
            return name;
        },
        title: 'arch-atlas',
        appListHead: ['planet name', 'total call out','planet type'],
        domainCallOutTotal: " Total call out times:"
    }
}).call(this)