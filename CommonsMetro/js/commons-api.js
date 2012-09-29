Commons = {
    apiUrl: 'https://commons.wikimedia.org/w/api.php',

    /**
     * @param {object} params
     * @return promise
     */
    request: function (params) {
        var xparams = $.extend({
            format: 'json'
        }, params);
        return $.ajax({
            url: Commons.apiUrl,
            data: xparams,
            dataType: 'json'
        });
    }


}
