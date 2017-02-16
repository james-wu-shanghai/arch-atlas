/**
 * Created by james on 17-1-11.
 */
(function () {
    var sbar = window.sbar = {}
    // sbar.messagebox = []
    // sbar.boxSize = 5
    sbar.messageNoReset = function (msg) {
        $('#stateBarHint').html(msg)
    }
    sbar.message = function (msg) {
        // sbar.messagebox.push(msg)
        // if (sbar.messagebox.length > sbar.boxSize)
        //     sbar.messagebox.shift()
        $('#stateBarHint').html(msg)
        setTimeout("sbar.reset()", 10000)
    }
    sbar.reset = function () {
        $('#stateBarHint').text('状态栏')
    }
}).call(this)
