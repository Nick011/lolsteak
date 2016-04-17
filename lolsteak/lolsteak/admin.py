from django.contrib import admin

from lolsteak.models import (
    LolAccount,
    LolStat,
    Profile,
)

admin.site.register(LolAccount)
admin.site.register(LolStat)
admin.site.register(Profile)
