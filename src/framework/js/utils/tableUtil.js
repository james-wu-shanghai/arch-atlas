(function () {
        var tu = window.tableUtil = {}
        tu.defaultSortFunction = function () {
            this.api().columns().every(function () {
                var column = this;
                var select = $('<select class="form-control input-sm"><option value=""></option></select>')
                    .appendTo($(column.footer()).empty())
                    .on('change', function () {
                        var val = $.fn.dataTable.util.escapeRegex(
                            $(this).val()
                        );
                        column
                            .search(val ? '^' + val + '$' : '', true, false)
                            .draw();
                    });

                column.data().unique().sort().each(function (d, j) {
                    select.append('<option value="' + d + '">' + d + '</option>')
                });
            });
        };
        tu.buildTableByArray = function (containerId, columnDefs, array, otherParams) {
            if (containerId.substring(0, 1) == '#')
                containerId = containerId.substring(1)
            //containerId 是一个selector,带#号的那种
            var table = $('<table class="table table-striped table-hover"></table>')
            table.attr("id", containerId + 'Table')

            var ft = [];
            for (var i = 0; i < columnDefs.length; i++)
                ft.push("")
            tu.addFoot(table, ft)

            $('#' + containerId).append(table)
            if (otherParams.truncToLong) {
                var arrObj = array
                for (var i = 0; i < arrObj.length; i++) {
                    for (var j = 0; j < arrObj[i].length; j++) {
                        if (arrObj[i][j].length > 80)
                            arrObj[i][j] = escape(arrObj[i][j]).substring(0, 80) + "..."
                    }
                }
                array = arrObj
            }

            var params = {
                data: array,
                columns: columnDefs,
            }
            if (otherParams) {
                for (var key in otherParams)
                    params[key] = otherParams[key];
                if (otherParams.sortAllFields) {
                    if (!params.initComplete)
                        params.initComplete = tu.defaultSortFunction
                }
            }
            table.DataTable(params)
        }
        tu.buildTable = function (containerId, heads, foots) {
            if (containerId.substring(0, 1) == '#')
                containerId = containerId.substr(1);
            var container = $('#' + containerId)
            if (container == null) {
                console.warn('table with id not found:' + containerId)
                return
            }

            var table = $('<table class="table table-striped table-hover"></table>')
            var tableId = container.attr('id') + 'Table';
            $('#' + tableId).html("");
            table.attr('id', tableId.substring(1))

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
        tu.addContent = function (table, contentArray) {
            var tr = $('<tr></tr>')
            for (var i = 0; i < contentArray.length; i++) {
                var td = $('<td></td>')
                td.append(contentArray[i])
                tr.append(td)
            }
            table.append(tr)
        }
        tu.defaultTitle = function (titleArray) {
            var titleMapArray = [];
            for (var index in titleArray) {
                titleMapArray.push({'title': titleArray[index]})
            }
            return titleMapArray;
        }
        tu.draw = function (table, params) {
            // params.language.zeroRecords = globalResource.zeroRecords
            var id = table.attr('id');
            $('#' + id).DataTable(params)
        }
    }
).call(this)