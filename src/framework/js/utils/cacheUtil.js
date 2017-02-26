/**
 * Created by jameswu on 17-2-26.
 */
(function () {
    window.cacheUtil = new CacheUtil();
    function CacheUtil() {

        var cacheDivId = '#cacheDiv'

        function elementExists($element) {
            return $element.attr('id')
        }

        function convertSelectorName(idSelector) {
            // return idSelector.replace(/\//g, '_').replace(/\./g, '-');
            return $.base64.encode(idSelector).replace(/=/g, '')
        }

        this.load = function (idSelector) {
            var cvtSelector = convertSelectorName(idSelector)
            cacheUtil.checkAndCreateCacheDiv()
            var cached = $('#' + cvtSelector)
            if (elementExists(cached) && Date.parse(new Date()) < cached.attr('endAt'))
                return JSON.parse(cached.attr('data-cache'));
            return null;
        }

        this.setCache = function (idSelector, value, endAtTimestamp) {
            if (!endAtTimestamp)
                endAtTimestamp = Date.parse(new Date()) + 24 * 60 * 60 * 1000
            var cvtSelector = convertSelectorName(idSelector);
            cacheUtil.checkAndCreateCacheDiv()
            var cache = $(cacheDivId + " " + cvtSelector);
            if (!elementExists(cache))
                $(cacheDivId).append(function (id, value, endAtTimestamp) {
                    cache = $('<div></div>')
                    cache.attr("id", id)
                    cache.attr('data-cache', JSON.stringify(value));
                    cache.attr('endAt', endAtTimestamp);
                    return cache;
                }(cvtSelector, value, endAtTimestamp))
        }

        this.checkAndCreateCacheDiv = function () {
            var cacheDiv = $(cacheDivId)
            if (!elementExists(cacheDiv))
                $('body').append(function () {
                    return $("<div id='cacheDiv'  class='cacheDiv' style='display: none'></div>")
                })
        }
    }
}).call(this)
