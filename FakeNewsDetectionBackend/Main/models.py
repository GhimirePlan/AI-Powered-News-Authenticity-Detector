from django.db import models
from django.contrib.auth.models import User
import hashlib

# POSTGRES-SPECIFIC IMPORTS 
from django.contrib.postgres.fields import ArrayField
from django.contrib.postgres.search import SearchVectorField
from django.contrib.postgres.indexes import GinIndex

class Feedback(models.Model):
    user = models.ForeignKey(User, related_name="feedbacks", on_delete=models.CASCADE)
    reviews = models.IntegerField(default=5)
    message = models.TextField()

class ReportIssue(models.Model):
    user = models.ForeignKey(User, related_name="issues", on_delete=models.CASCADE)
    message = models.TextField()

class News(models.Model):
    # Added title for better indexing
    title = models.CharField(max_length=500, blank=True, null=True)
    description = models.TextField() # The main text content
    source = models.CharField(max_length=255)
    isfake = models.BooleanField(default=False)
    
    meta_data = models.JSONField(default=dict, blank=True)
    search_vector = SearchVectorField(null=True)

    class Meta:
        indexes = [
            GinIndex(fields=['search_vector']),
        ]

    def __str__(self) -> str:
        return self.source

class UserQueryLog(models.Model):
    """
    [PRIVACY] 
    Instead of linking queries to the User model (ForeignKey), 
    we store a one-way Hash. This allows us to analyze traffic 
    patterns without knowing WHO searched for what.
    """
    user_hash = models.CharField(max_length=64, db_index=True)
    query_text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    prediction_score = models.FloatField(help_text="Model confidence (0.0 to 1.0)")
    prediction_label = models.CharField(max_length=100, choices=[('FAKE', 'Fake'), ('REAL', 'Real')])
    
    explainability_data = models.JSONField(default=dict, blank=True)

    @staticmethod
    def hash_user(user_id):
        # Helper to anonymize user ID before saving
        return hashlib.sha256(str(user_id).encode()).hexdigest()

    def __str__(self):
        return f"Log {self.id} - {self.prediction_label}"

class TodaysNews(models.Model):
    # Improved to store actual news items for the day, linked to the optimized News model
    date = models.DateField(auto_now_add=True)
    headlines = models.ManyToManyField(News, related_name="daily_features")

    def __str__(self) -> str:
        return self.date.strftime(f"%d/%m/%Y")