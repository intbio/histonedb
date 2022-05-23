from django.conf.urls import include, url
from django.contrib import admin
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    url(r'', include('browse.urls')),
]

urlpatterns += [url(r'^admin/', admin.site.urls)]
urlpatterns += [url(r'human_hist/', include('human_hist.urls'))]
