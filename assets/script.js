
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

    $('img').on("error", function () {
        if (this.originalSrc || this.src.indexOf('imgur') == -1) {
            return;
        }

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

    $('.menu-toggle').click(function() {
        var $elm = $(this);
        var is_open;
        $elm.next('.menu-children').toggle();

        if ($elm.hasClass('right')) {
            $elm.removeClass('right');
            $elm.addClass('down');
            is_open = true;
        } else {
            $elm.removeClass('down');
            $elm.addClass('right');
            is_open = false;
        }

        if (window.localStorage)
        {
            var toggles = window.localStorage.getItem('toggles');
            var elm_id = $elm.attr('id');

            if (toggles)
            {
                toggles = toggles.split(',');
            } else {
                toggles = [];
            }

            var idx = toggles.indexOf(elm_id);

            if (idx == -1)
            {
                if (is_open)
                {
                    toggles.push(elm_id);
                }
            } else {
                if (!is_open)
                {
                    toggles.splice(idx, 1);
                }
            }

            window.localStorage.setItem('toggles', toggles.join(','));
        }
    });

    $('.completions-toggle').click(function() {
        var $elm = $(this);
        $elm.closest('tr').next('.player-completions').toggle();

        if ($elm.hasClass('right')) {
            $elm.removeClass('right');
            $elm.addClass('down');
        } else {
            $elm.removeClass('down');
            $elm.addClass('right');
        }
    });

    if (window.localStorage) {
        if (window.localStorage.getItem('useProxy')) {
            $('img').each(function () {
                if (this.src.indexOf('imgur') == -1)
                {
                    return;
                }

                this.originalSrc = this.src;
                this.src = 'https://images-docs-opensocial.googleusercontent.com/gadgets/proxy?url=' + encodeURIComponent(this.originalSrc) + '&container=docs&gadget=a&rewriteMime=image%2F*&refresh=86400';
            });
        }

        var toggles = window.localStorage.getItem('toggles');

        if (toggles) {
            toggles = toggles.split(',');
        } else {
            toggles = [];
        }

        for (var k in toggles) {
            $('#' + toggles[k]).click();
        }
    }
});
