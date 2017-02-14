/**
 * Created by jameswu on 17-2-14.
 */
(function () {
    function SysInfoPlugin() {
        this.pluginRoot = 'src/plugins/sysInfoPlugin/';
        importUtil.import(this.pluginRoot + "js/sysinfo.js")
        this.name = 'sysInfoView'
        var inited = SysInfoPlugin.prototype.inited = false;


        this.init = function () {
            if (inited)
                return this;
            $('.nav.nav-tabs').append('<li><a href="#sysinfo" data-toggle="tab">系统信息</a></li>')
            $.get(this.pluginRoot + "sysinfo.html", function (data) {
                $('.tab-content').append(data);
                $('#appOwnerList').on('click', sysinfo.open)
            })

            inited = true;
            return this;
        }

        this.close = function () {
            sysinfo.close()
        }

    }

    window.SysinfoPlugin = new SysInfoPlugin();
    cp.register(window.SysinfoPlugin);

}).call(this)
