(function () {
    window.globalConfig = {
        contextPath: '/cloud-atlas'
    }
    window.globalResource = {
        appList: 'Planet List',
        depLine: 'Solar Links',
        solarPie: 'Solar Pie',
        hintSet: ['ToPlanets', 'ToSolar', 'fromPlanets', 'fromSolar', 'biDirectPlanets', 'biDirectSolars'],
        appNameDecorator: function (name) {
            return name;
        },
        title: 'cloud-atlas',
        appListHead: ['planet name', 'total call out'],
        domainCallOutTotal: " Total call out times:"
    }
}).call(this)