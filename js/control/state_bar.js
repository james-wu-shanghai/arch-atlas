/**
 * Created by james on 17-1-11.
 */
(function () {
    var sbar = window.sbar = {}
    // sbar.messagebox = []
    // sbar.boxSize = 5
    sbar.message = function (msg) {
        // sbar.messagebox.push(msg)
        // if (sbar.messagebox.length > sbar.boxSize)
        //     sbar.messagebox.shift()
        $('#stateBarHint').html(msg)
        setTimeout("$('#stateBarHint').text('状态栏')", 10000)
    }
}).call(this)
