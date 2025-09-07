# wellnest/forms.py
from django import forms
from django.contrib.auth import get_user_model
from .models import JournalEntry
from django.core.exceptions import ValidationError

User = get_user_model()

class JournalForm(forms.ModelForm):
    class Meta:
        model = JournalEntry
        fields = ['text']
        widgets = {
            'text': forms.Textarea(attrs={'rows': 5, 'placeholder': 'Write your thoughts...'}),
        }

class SimpleRegisterForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput, min_length=8, max_length=128)

    class Meta:
        model = User
        fields = ['username', 'password']

    def clean_password(self):
        password = self.cleaned_data.get('password')
        if len(password) < 8:
            raise ValidationError("Password must be at least 8 characters long.")
        return password

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password'])
        if commit:
            user.save()
        return user
