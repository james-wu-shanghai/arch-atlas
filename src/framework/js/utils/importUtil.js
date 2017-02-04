/**
 * Created by james on 17-2-4.
 */
(function () {
        function ImportUtil() {
            this.import = function (path) {
                var a = document.createElement("script");
                a.type = "text/javascript";
                a.src = path;
                // var head = document.getElementsByTagName("head")[0];
                // head.appendChild(a);
                document.body.appendChild(a);
            }
        }
        window.importUtil = new ImportUtil();
    }
).call(this)
