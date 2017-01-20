/**
 * Created by jameswu on 17-1-20.
 */
(function () {
    var lir = window.linkInfoReport = {}
    lir.setInfo = function (edge) {
        lir.edge = edge

    }
    lir.open = function () {
        $('#infoPanel').modal({backdrop: true})
        $('#panelInfoBodyTable').DataTable();
    }
}).call(this)