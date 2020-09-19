
$(function() {
    var baseURL = "{{ .Site.BaseURL }}";

    var maps = {
        {{ range $index, $page := where .Site.Pages "Params.categories" "!=" nil }}
        "{{ .File.BaseFileName }}": 1,
        {{ end }}
    };

    $('.date-convert').each(function() {
        $(this).text(moment($(this).text()).format('LL'));
    });

    $("#book-search-input").keypress(function(e) {
        if (e.keyCode != 13) {
            return true;
        }
        
        var mapid = parseInt($(this).val().trim().replace('@', ''));
        if (isNaN(mapid)) {
            $("#book-search-results").text("Map ID is invalid!");
            return false;
        }
        
        if (!(mapid in maps)) {
            $("#book-search-results").text("Map not found!");
            return false;
        }

        $("#book-search-results").text("Redirecting to the page...");
        document.location = baseURL + "maps/" + mapid;
    });

    if (window.localStorage.getItem('useProxy'))
    {
        $('img').each(function () {
            if (this.src.indexOf('imgur') == -1)
            {
                return;
            }

            this.originalSrc = this.src;
            this.src = 'https://images-docs-opensocial.googleusercontent.com/gadgets/proxy?url=' + encodeURIComponent(this.originalSrc) + '&container=docs&gadget=a&rewriteMime=image%2F*&refresh=86400';
        });
    }

    $('img').on("error", function () {
        this.originalSrc = this.src;
        this.src = 'https://images-docs-opensocial.googleusercontent.com/gadgets/proxy?url=' + encodeURIComponent(this.originalSrc) + '&container=docs&gadget=a&rewriteMime=image%2F*&refresh=86400';
        window.localStorage.setItem('useProxy', true);
    });

    $('#pagination-list').on('change', function (e) {
        var pageNum = parseInt(this.value);
        if (!isNaN(pageNum)) {
            window.location = window.location.href.replace(/(categories\/[^\/]+)(\/?|\/(page\/.+))$/, '$1/page/' + pageNum);
        }
    });
});
