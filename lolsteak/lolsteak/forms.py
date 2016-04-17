from __future__ import unicode_literals

from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.db.models.manager import Manager
from django import forms
from django.utils.http import int_to_base36
from django.utils.translation import ugettext, ugettext_lazy as _

from mezzanine.accounts import (get_profile_model, get_profile_user_fieldname,
                                get_profile_for_user, ProfileNotConfigured)
from mezzanine.conf import settings
from mezzanine.core.forms import Html5Mixin
from mezzanine.utils.urls import slugify, unique_slug

from lolsteak.models import Profile, LolAccount

User = get_user_model()

_exclude_fields = tuple(getattr(settings,
                                "ACCOUNTS_PROFILE_FORM_EXCLUDE_FIELDS", ()))

if settings.ACCOUNTS_NO_USERNAME:
    _exclude_fields += ("username",)


class LolAccountFieldsForm(forms.ModelForm):
    class Meta:
        model = LolAccount
        exclude = ('user',)


class ProfileFieldsForm(forms.ModelForm):
    class Meta:
        model = Profile
        exclude = ('user',)


class ProfileForm(Html5Mixin, forms.ModelForm):
    """
    ModelForm for auth.User - used for signup and profile update.
    If a Profile model is defined via ``AUTH_PROFILE_MODULE``, its
    fields are injected into the form.
    """

    password1 = forms.CharField(label=_("Password"),
                                widget=forms.PasswordInput(render_value=False))
    password2 = forms.CharField(label=_("Password (again)"),
                                widget=forms.PasswordInput(render_value=False))

    class Meta:
        model = User
        fields = (
            "first_name",
            "last_name",
            "email",
            "username",
        )
        exclude = _exclude_fields

    def __init__(self, *args, **kwargs):
        super(ProfileForm, self).__init__(*args, **kwargs)
        self._signup = self.instance.id is None
        user_fields = set([f.name for f in User._meta.get_fields()])
        try:
            self.fields["username"].help_text = ugettext(
                        "Only letters, numbers, dashes or underscores please")
        except KeyError:
            pass
        for field in self.fields:
            # Make user fields required.
            if field in user_fields:
                self.fields[field].required = True
            # Disable auto-complete for password fields.
            # Password isn't required for profile update.
            if field.startswith("password"):
                self.fields[field].widget.attrs["autocomplete"] = "off"
                self.fields[field].widget.attrs.pop("required", "")
                if not self._signup:
                    self.fields[field].required = False
                    if field == "password1":
                        self.fields[field].help_text = ugettext(
                                               "Leave blank unless you want "
                                               "to change your password")

        # Add any profile fields to the form.
        profile_fields_form = self.get_profile_fields_form()
        profile_fields = profile_fields_form().fields
        self.fields.update(profile_fields)
        if not self._signup:
            user_profile = Profile.objects.get(user=self.instance)
            for field in profile_fields:
                value = getattr(user_profile, field)
                # Check for multiple initial values, i.e. a m2m field
                if isinstance(value, Manager):
                    value = value.all()
                self.initial[field] = value

        # Add Lol Account fields to form.
        lolaccount_fields = LolAccountFieldsForm().fields
        self.fields.update(lolaccount_fields)
        if not self._signup:
            lol_account = LolAccount.objects.get(user=self.instance)
            for field in lolaccount_fields:
                value = getattr(lol_account, field)
                self.initial[field] = value

    def clean_username(self):
        """
        Ensure the username doesn't exist or contain invalid chars.
        We limit it to slugifiable chars since it's used as the slug
        for the user's profile view.
        """
        username = self.cleaned_data.get("username")
        if username.lower() != slugify(username).lower():
            raise forms.ValidationError(
                ugettext("Username can only contain letters, numbers, dashes "
                         "or underscores."))
        lookup = {"username__iexact": username}
        try:
            User.objects.exclude(id=self.instance.id).get(**lookup)
        except User.DoesNotExist:
            return username
        raise forms.ValidationError(
                            ugettext("This username is already registered"))

    def clean_password2(self):
        """
        Ensure the password fields are equal, and match the minimum
        length defined by ``ACCOUNTS_MIN_PASSWORD_LENGTH``.
        """
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")

        if password1:
            errors = []
            if password1 != password2:
                errors.append(ugettext("Passwords do not match"))
            if len(password1) < settings.ACCOUNTS_MIN_PASSWORD_LENGTH:
                errors.append(
                        ugettext("Password must be at least %s characters") %
                        settings.ACCOUNTS_MIN_PASSWORD_LENGTH)
            if errors:
                self._errors["password1"] = self.error_class(errors)
        return password2

    def clean_email(self):
        """
        Ensure the email address is not already registered.
        """
        email = self.cleaned_data.get("email")
        qs = User.objects.exclude(id=self.instance.id).filter(email=email)
        if len(qs) == 0:
            return email
        raise forms.ValidationError(
                                ugettext("This email is already registered"))

    def save(self, *args, **kwargs):
        """
        Create the new user. If no username is supplied (may be hidden
        via ``ACCOUNTS_PROFILE_FORM_EXCLUDE_FIELDS`` or
        ``ACCOUNTS_NO_USERNAME``), we generate a unique username, so
        that if profile pages are enabled, we still have something to
        use as the profile's slug.
        """

        kwargs["commit"] = False
        user = super(ProfileForm, self).save(*args, **kwargs)
        try:
            self.cleaned_data["username"]
        except KeyError:
            if not self.instance.username:
                try:
                    username = ("%(first_name)s %(last_name)s" %
                                self.cleaned_data).strip()
                except KeyError:
                    username = ""
                if not username:
                    username = self.cleaned_data["email"].split("@")[0]
                qs = User.objects.exclude(id=self.instance.id)
                user.username = unique_slug(qs, "username", slugify(username))
        password = self.cleaned_data.get("password1")
        if password:
            user.set_password(password)
        elif self._signup:
            user.set_unusable_password()
        user.save()

        # save profile
        profile, created = Profile.objects.get_or_create(user=user)
        profile_form = self.get_profile_fields_form()
        profile_form(self.data, self.files, instance=profile).save()

        # save lol account
        lol_account, created = LolAccount.objects.get_or_create(user=user)
        lolaccount_form = LolAccountFieldsForm
        lolaccount_form(self.data, self.files, instance=lol_account).save()

        if self._signup:
            if (settings.ACCOUNTS_VERIFICATION_REQUIRED or
                    settings.ACCOUNTS_APPROVAL_REQUIRED):
                user.is_active = False
                user.save()
            else:
                token = default_token_generator.make_token(user)
                user = authenticate(uidb36=int_to_base36(user.id),
                                    token=token,
                                    is_active=True)
        return user

    def get_profile_fields_form(self):
        return ProfileFieldsForm
