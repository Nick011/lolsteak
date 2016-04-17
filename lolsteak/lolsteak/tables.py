import datetime
import django_tables2 as tables
from django_tables2.utils import A
from lolsteak.models import LolStat


class LolStatTable(tables.Table):
    #summoner_name = tables.LinkColumn(viewname='summoner', args=[A('pk')])
    summoner_name = tables.Column(verbose_name='Name')
    champions_killed = tables.Column(verbose_name='Champion Kills')
    assists = tables.Column(verbose_name='Assists')
    minions_killed = tables.Column(verbose_name='Minion Kills')
    neutral_minions_killed = tables.Column(verbose_name='Creep Kills')
    turrets_killed = tables.Column(verbose_name='Turrets')

    class Meta:
        model = LolStat
        attrs = {'class': 'table table-striped'}
        fields = ('summoner_name',
                  'champions_killed',
                  'turrets_killed',
                  'minions_killed',
                  'neutral_minions_killed',
                  'assists')
        order_by = ('champions_killed')
