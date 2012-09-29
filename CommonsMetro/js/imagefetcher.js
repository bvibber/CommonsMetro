function ImageFetcher(width, height) {
    this.titles = [];
    this.deferreds = {};
    this.width = width;
    this.height = height;
}

ImageFetcher.prototype.addDeferred = function( title, deferred ) {
    this.deferreds[ title.replace(/ /g, '_') ] = deferred;
};

ImageFetcher.prototype.getDeferred = function( title ) {
    return this.deferreds[ title.replace(/ /g, '_') ];
};

ImageFetcher.prototype.request = function(filename) {
    var d = $.Deferred();
    var title = 'File:' + filename;
    this.titles.push(title);
    this.addDeferred( title, d );
    return d.promise();
};

ImageFetcher.prototype.send = function() {
    var that = this;
    var data = {
        action: 'query',
        titles: this.titles.join('|'),
        prop: 'imageinfo',
        iiprop: 'url',
        format: 'json'
    };
    if (this.width) {
        data.iiurlwidth = this.width;
    }
    if (this.height) {
        data.iiurlheight = this.height;
    }
    Commons.request(data).done(function(data) {
        if (!data.query) {
            console.log('no return image data');
            return;
        }
        var origName = {};
        if(data.query.normalized) {
            $.each(data.query.normalized, function(i, pair) {
                origName[pair.to] = pair.from;
            });
        }

        $.each(data.query.pages, function(pageId, page) {
            var title = page.title;
            if(origName.title) {
                console.log('Normalizing title');
                title = origName[title];
            }
            var deferred = that.getDeferred( title );
            if(page.imageinfo) {
                var imageinfo = page.imageinfo[0];
                if( deferred ) {
                    // Preload the thumbnail image before resolving the deferred.
                    // This avoids delays between returning the imageinfo and showing the image.
                    var img = new Image(),
                        $img = $( img );
                    $img.attr( 'src', imageinfo.thumburl ).one( 'load', function() {
                        deferred.resolve( imageinfo );
                        $img.unbind( 'error' );
                    } ).one( 'error', function() {
                        // Image failed to load -- such as broken thumbnail or 404.
                        deferred.reject();
                        $img.unbind( 'load' );
                    } );
                } else {
                    console.log( 'Failed to locate deferred image with title ' + title );
                }
            } else {
                if( deferred ) {
                    // Sorry, no image data available.
                    deferred.reject();
                }
            }
        });
    });
};
