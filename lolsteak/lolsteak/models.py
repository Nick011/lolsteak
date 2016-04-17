from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user = models.ForeignKey(User)
    birthday = models.DateField(null=True, blank=True)
    bio = models.TextField(null=True, blank=True)

    def __str__(self):
        return ' '.join([self.user.first_name, self.user.last_name])

    class Meta:
        verbose_name_plural = 'Profiles'


class LolAccount(models.Model):
    user = models.OneToOneField(User, null=True)
    summoner_name = models.CharField(max_length=255, unique=True, db_index=True)

    def __str__(self):
        return self.summoner_name

    class Meta:
        verbose_name_plural = 'LOL Accounts'


class LolStat(models.Model):
    UNRANKED = 1
    RANKED = 2
    STAT_TYPES = (
        (UNRANKED, 'unranked'),
        (RANKED, 'ranked'),
    )
    account = models.ForeignKey(LolAccount)
    stat_type = models.IntegerField(choices=STAT_TYPES)
    turrets_killed = models.IntegerField(default=0)
    minions_killed = models.IntegerField(default=0)
    neutral_minions_killed = models.IntegerField(default=0)
    champions_killed = models.IntegerField(default=0)
    assists = models.IntegerField(default=0)

    def __str__(self):
        return self.account.summoner_name

    class Meta:
        verbose_name_plural = 'Lol Stats'

    @property
    def summoner_name(self):
        return self.account.summoner_name
