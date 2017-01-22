(function () {
        var tu = window.tableUtil = {}
        tu.addContent = function (table, contentArray) {
            var tr = $('<tr></tr>')
            for (var i = 0; i < contentArray.length; i++) {
                var td = $('<td></td>')
                td.append(contentArray[i])
                tr.append(td)
            }
            table.append(tr)
        }
        tu.buildTable = function (containerId, heads, foots) {
            var container = $(containerId)
            if (container == null) {
                console.warn('table with id not found:' + containerId)
                return
            }
            var table = $('<table class="table table-striped table-hover"></table>')
            var tableId = container.attr('id') + 'Table';
            $('#' + tableId).html("");
            table.attr('id', tableId)

            if (heads)
                tableUtil.addHead(table, heads)
            if (foots)
                tableUtil.addFoot(table, foots)
            container.append(table)
            return table
        }
        tu.addHead = function (table, heads) {
            var thead = $('<thead></thead>')
            var tr = $('<tr></tr>')
            thead.append(tr)
            for (var i = 0; i < heads.length; i++) {
                var td = $('<th></th>')
                td.text(heads[i])
                tr.append(td)
            }
            table.append(thead)
        }
        tu.addFoot = function (table, foots) {
            var tfoot = $('<tfoot></tfoot>')
            var tr = $('<tr></tr>')
            tfoot.append(tr)
            for (var i = 0; i < foots.length; i++) {
                var td = $('<th></th>')
                td.text(foots[i])
                tr.append(td)
            }
            table.append(tfoot)
        }
        tu.draw = function (table, params) {
            // params.language.zeroRecords = globalResource.zeroRecords
            $('#' + table.attr('id')).DataTable(params)
        }
    }
).call(this)