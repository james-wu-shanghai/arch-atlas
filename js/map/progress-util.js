/**
 * Created by jameswu on 17-1-10.
 */
(function () {
    var progressUtils = window.progressUtils = {}
    progressUtils.current = 0;
    progressUtils.start = function (hint) {
        if (!hint)
            hint = '开始加载'
        $('.modal').modal('show')
        this.progress(5, hint)
    }
    progressUtils.progress = function (percentage, hint) {
        $('.progress .progress-bar').css('width', percentage + '%')
        if (hint)
            $('h4.modal-title').text(hint)
    }
    progressUtils.end = function (hint) {
        if (!hint)
            hint = '加载结束'
        this.progress(100, hint)
        setInterval("$('.modal').modal('hide')", 200)
        progressUtils.current = 0
    }
}).call(this)