var authors = [
    {{ range $name, $taxonomy := .Site.Taxonomies.authors }}
    "{{ $name }}",
    {{ end }}
];
var maps = [
    {{ range $index, $page := where .Site.Pages "Params.categories" "!=" nil }}
    "{{ .File.BaseFileName }}",
    {{ end }}
];
var players = [
    {{ range $index, $page := where .Site.Pages "Type" "==" "players" }}
    "{{ .File.BaseFileName }}",
    {{ end }}
];
