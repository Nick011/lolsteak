from django.shortcuts import render
from django_tables2 import RequestConfig

from lolsteak.tables import LolStatTable
from lolsteak.models import LolStat


def league_home(request):
    stats = LolStat.objects.all()
    stat_table = LolStatTable(stats)
    RequestConfig(request).configure(stat_table)

    c = {
        'lol_stats': stat_table
    }
    return render(request, 'league/home.html', c)
