from django.db import models
from django.conf import settings

class Task(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=[
        ('Incomplete', 'Incomplete'),
        ('Upcoming', 'Upcoming'),
        ('Completed', 'Completed')
    ])
    due_date = models.DateField()
    position = models.PositiveIntegerField(default=0)  

    class Meta:
        ordering = ['position']

    def __str__(self):
        return f"{self.title} - {self.status}"
