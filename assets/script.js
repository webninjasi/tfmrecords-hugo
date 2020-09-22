
$(function() {
    var baseURL = "{{ .Site.BaseURL }}";

    var maps = {
        {{ range $index, $page := where .Site.Pages "Params.categories" "!=" nil }}
        "{{ .File.BaseFileName }}": 1,
        {{ end }}
    };
    var players = {
        {{ range $index, $page := where .Site.Pages "Type" "==" "players" }}
        "{{ .File.BaseFileName }}": 1,
        {{ end }}
    };

    $('.date-convert').each(function() {
        $(this).text(moment.unix($(this).text()).format('LL'));
    });

    $("#book-search-input").keypress(function(e) {
        if (e.keyCode != 13) {
            return true;
        }

        var search_text = $(this).val().trim();
        var mapid = parseInt(search_text.replace('@', ''));

        if (isNaN(mapid)) {
            search_text = search_text.toLowerCase();

            if (search_text in players)
            {
                $("#book-search-results").text("Redirecting to player page...");
                document.location = baseURL + "players/" + encodeURIComponent(search_text) + "/";
            } else {
                search_text += "#0000";

                if (search_text in players)
                {
                    $("#book-search-results").text("Redirecting to player page...");
                    document.location = baseURL + "players/" + encodeURIComponent(search_text) + "/";
                } else {
                    $("#book-search-results").text("Page not found!");
                }
            }

            return false;
        }
        
        if (!(mapid in maps)) {
            $("#book-search-results").text("Page not found!");
            return false;
        }

        $("#book-search-results").text("Redirecting to map page...");
        document.location = baseURL + "maps/" + mapid;

        return false;
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
