from lolsteak.models import LolAccount
from django.conf import settings

from cassiopeia import riotapi
from cassiopeia.type.core.common import StatSummaryType

from lolsteak.models import LolStat

riotapi.set_region("NA")
riotapi.set_api_key(settings.LOL_KEY)


def update_lol_stats():
    lol_accounts = LolAccount.objects.all()
    account_stats = []
    for account in lol_accounts:
        stats = get_lol_stats(account.summoner_name)
        stat, created = LolStat.objects.get_or_create(
            account=account,
            stat_type=LolStat.UNRANKED
        )
        stat.turrets_killed = stats.totalTurretsKilled
        stat.minions_killed = stats.totalMinionKills
        stat.nuetral_minions_killed = stats.totalNeutralMinionsKilled
        stat.champions_killed = stats.totalChampionKills
        stat.assists = stats.totalAssists
        stat.save()
        account_stats.append(stat)
    return account_stats


def get_lol_stats(summoner_name):
    summoner = riotapi.get_summoner_by_name(summoner_name)
    stats = summoner.stats()
    unranked = stats[StatSummaryType.normal_fives]
    #kills = unranked.stats.kills
    return unranked.stats.data

