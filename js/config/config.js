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
        }
    }
}).call(this)