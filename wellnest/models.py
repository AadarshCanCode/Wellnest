from django.db import models
from django.contrib.auth.models import User

class JournalEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    sentiment = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.timestamp}"