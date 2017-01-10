/**
 * Created by jameswu on 17-1-10.
 */
(function () {
    var progressUtils = window.progressUtils = {}

    progressUtils.start = function () {
        $('.modal').modal('show')
        this.progress(0, '开始加载资源')
    }
    progressUtils.progress = function (percentage, hint) {
        $('.progress .progress-bar').css('width', percentage + '%')
        $('h4.modal-title').text(hint)
    }
    progressUtils.end = function () {
        this.progress(100, '资源加载完毕')
        setInterval("$('.modal').modal('hide')", 500)
    }
}).call(this)
