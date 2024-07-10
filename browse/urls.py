from django.conf.urls import url
from . import views

app_name = "browse"

urlpatterns = [
    url(r'^tree_test/$', views.tree_test, name="tree_test"),
    url(r'^projects/HistoneDB2\.0/$', views.browse_types, name="browse_types"),
    url(r'^$', views.browse, name="browse"),
    url(r'^browse/$', views.browse, name="browse"),
    url(r'^browse_types/$', views.browse_types, name="browse_types"),

    url(r'^type/([a-zA-Z0-9]+)/$', views.browse_variants, name="browse_variants"),
    url(r'^type/([a-zA-Z0-9]+)/variant/([a-zA-Z0-9\._\(\)]+)/$', views.browse_variant, name="browse_variant"),
    url(r'^variant/([a-zA-Z0-9\._\(\)\?]+)/$', views.browse_variant_clipped, name="browse_variant_clipped"),
    # url(r'^type/([a-zA-Z0-9]+)/variant/([a-zA-Z0-9\._]+)/(\d+)$', views.browse_variant_with_highlighted_sequence, name="browse_variant_with_highlighted_sequence"),
    url(r'^type/([a-zA-Z0-9]+)/variant/([a-zA-Z0-9\._\(\)]+)/([a-zA-Z0-9\._]+)/$', views.browse_variant_with_highlighted_sequence, name="browse_variant_with_highlighted_sequence"),

    url(r'^addnewtype/$')
    url(r'^addnewvariant/$')
    url(r'^edittype/$')
    url(r'^editvariant/$')
    url(r'^deltype/$')
    url(r'^delvariant/$')

    url(r'^search/$', views.search, name="search"),
    url(r'^analyze/$', views.analyze, name="analyze"),
    url(r'^blast_sequences/$', views.blast_sequences, name="blast_sequences"),
    url(r'^help/$', views.help, name="help"),
    url(r'^basket/$', views.basket, name="basket"),
    url(r'^human/$', views.human, name="human"),
    url(r'^statistics/$', views.statistics, name="statistics"),

    #Parameters are stored as session variables a GET response
    url(r'^data/sequences/json$', views.get_sequence_table_data, name="get_sequence_table_data"),
    url(r'^data/scores/json$', views.get_all_scores, name="get_all_scores"),
    url(r'^data/msa/json$', views.get_all_sequences, name="get_all_sequences"),
    url(r'^data/features/gff$', views.get_sequence_features, name="get_sequence_features"),
    url(r'^data/sequences\+features/json$', views.get_aln_and_features, name="get_aln_and_features"),
    url(r'^data/sequences\+features_1/json$', views.get_aln_and_features_1, name="get_aln_and_features_1"),
    url(r'^data/seed/([a-zA-Z0-9\._]+)$', views.get_seed_aln_and_features, name="get_seed_aln_and_features"),
    url(r'^data/sunburst$', views.get_sunburst_json, name="get_sunburst_json"),
]
