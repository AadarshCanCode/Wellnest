from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .forms import JournalForm
from .models import JournalEntry
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from django.utils import timezone
from datetime import date, timedelta
from calendar import monthrange
import random
from django.urls import reverse

sid = SentimentIntensityAnalyzer()

def redirect_to_login(request):
    if not request.user.is_authenticated:
        return redirect('login')
    return redirect('home')

def home(request):
    end_date = timezone.now().replace(hour=23, minute=59, second=59, microsecond=999999)  # End of today

    # Start from most recent Sunday
    start_date = end_date - timedelta(days=(end_date.weekday() + 1) % 7)
    days = [start_date + timedelta(days=i) for i in range(7)]  # Sunday to Saturday

    # Get entries for this week
    entries = JournalEntry.objects.filter(user=request.user, timestamp__date__gte=start_date.date()).order_by('timestamp')
    ordered_counts = [entries.filter(timestamp__date=day.date()).count() for day in days]

    streak = calculate_streak(request.user)
    calendar = get_month_calendar(request.user)

    context = {
        'quote': "Your emotions are valid. Your space is safe.",
        'chart_data': {
            'labels': [day.strftime('%a') for day in days],  # ['Sun', 'Mon', ...]
            'counts': ordered_counts,
        },
        'streak': streak,
        'calendar': calendar,
        'today': date.today(),
    }
    return render(request, 'wellnest/home.html', context)

@login_required
def journal(request):
    if request.method == 'POST':
        form = JournalForm(request.POST)
        if form.is_valid():
            text = form.cleaned_data['text']
            entry = JournalEntry(user=request.user, text=text, timestamp=timezone.now())
            entry.save()
            if 'save_suggest' in request.POST:
                scores = sid.polarity_scores(text)
                compound = scores['compound']
                pos = scores['pos']
                neg = scores['neg']
                neu = scores['neu']

                if compound >= 0.75:
                    sentiment = 'excited'  # Strongly positive
                elif 0.4 <= compound < 0.75:
                    sentiment = 'happy'  # Clear positive tone
                elif 0.1 <= compound < 0.4 and neu >= 0.4:
                    sentiment = 'calm'  # Light positive and mostly neutral
                elif -0.1 < compound < 0.1 and neu > 0.6:
                    sentiment = 'neutral'  # No strong tone, mostly neutral
                elif -0.4 <= compound <= -0.1 and neg > pos:
                    sentiment = 'sad'  # Clear negative, not too intense
                elif compound < -0.4:
                    if "worried" in text.lower() or "anxious" in text.lower() or neg > pos and "fear" in text.lower():
                        sentiment = 'anxious'  # Fearful or nervous tone
                    else:
                        sentiment = 'angry'  # Strong negative tone
                else:
                    sentiment = 'neutral'
                entry.sentiment = sentiment
                entry.save()
                return redirect('sentiment')
            return redirect(reverse('home') + '?refresh=' + str(timezone.now().timestamp()))
    else:
        form = JournalForm()
    return render(request, 'wellnest/journal.html', {'form': form})

@login_required
def sentiment(request):
    try:
        entry = JournalEntry.objects.filter(user=request.user).latest('timestamp')
    except JournalEntry.DoesNotExist:
        return redirect('journal')
    videos = {
    'excited': [
        'https://www.youtube.com/embed/2FGR-OspxsU',  # Goodful: 10-Minute Meditation For Healing
        'https://www.youtube.com/embed/YIstArpXdAQ'   # NO EXCUSES - Best Motivational Video
    ],
    'happy': [
        'https://www.youtube.com/embed/67qwX_NPmPw',  # Goodful: 5-Minute Meditation You Can Do Anywhere
        'https://www.youtube.com/embed/3m0xy_HXICw'   # THE DESIRE TO GET BETTER - Best Morning Motivational Video
    ],
    'calm': [
        'https://www.youtube.com/embed/0m6tOWgOYBA',  # 10 Minute Meditation - for Mindfulness, Stress Relief
        'https://www.youtube.com/embed/pVj7E58RywQ'   # The Most Powerful Motivational Speech Compilation for Success
    ],
    'neutral': [
        'https://www.youtube.com/embed/cO2VNQNW_8U',  # Meditation Tips for Beginners - Goodful
        'https://www.youtube.com/embed/5VnmxjOoiSg'   # Powerful Motivational Speech Video (ft. Will Smith, Les Brown)
    ],
    'sad': [
        'https://www.youtube.com/embed/itZMM5gCboo',  # Goodful Meditation! Relaxing Music
        'https://www.youtube.com/embed/Zp4wnZAmqs4'   # Defeat Negative Thinking - Inspirational & Motivational Video
    ],
    'angry': [
        'https://www.youtube.com/embed/wkse4PPxkk4',  # Goodful: 10-Minute Meditation For Healing
        'https://www.youtube.com/embed/AJ1-WE1B2Ss'   # YOU OWE IT TO YOU IN 2025 - Best Motivational Speech
    ],
    'anxious': [
        'https://www.youtube.com/embed/p7Rfz3M0hIo',  # 10 Minute Meditation - for Mindfulness, Stress Relief
        'https://www.youtube.com/embed/mGD3kO-Rs3Y'   # Best Motivational Speeches
    ],
}

    affirmations = {
        'excited': ["Your energy is electric today!", "Ride this wave of enthusiasm!", "You’re unstoppable right now!", "The world is yours to conquer!", "Keep that spark alive!", "Your passion is inspiring!", "Big things are coming your way!", "You’re bursting with potential!"],
        'happy': ["You’re shining bright today!", "Keep spreading joy!", "Your positivity is contagious.", "You’re making a difference!", "Today is full of possibilities!", "Your smile lights up the world!", "Embrace this happiness!", "You’re a ray of sunshine!"],
        'calm': ["Your peace is powerful.", "Breathe easy—you’re grounded.", "Serenity is your strength.", "You’re in perfect balance.", "This calm is yours to keep.", "Rest in this quiet moment.", "You’re steady as a rock.", "Tranquility suits you."],
        'neutral': ["You’ve got this!", "One step at a time.", "You’re exactly where you need to be.", "Keep going—you’re doing great.", "Every moment is a fresh start.", "Stay steady, stay strong.", "Trust your journey.", "You’re moving forward."],
        'sad': ["It’s okay to feel this way.", "You are enough.", "This will pass—you’ll rise again.", "You’re stronger than you know.", "Take it one step at a time.", "You’re allowed to heal.", "Your feelings are valid.", "Tomorrow is a new day."],
        'angry': ["Your feelings are real.", "Channel this energy wisely.", "You’re in control, even now.", "Let it out—you’ve got this.", "You’re stronger than this moment.", "Breathe, and let it go.", "You’ll find your calm again.", "You’re bigger than this anger."],
        'anxious': ["You’re safe right now.", "One breath at a time.", "You’ve faced this before.", "You’re not alone in this.", "This feeling will ease.", "You’re stronger than your worries.", "Focus on the present.", "You’ll get through this."],
    }
    sentiment = entry.sentiment
    context = {
        'sentiment': sentiment,
        'videos': videos.get(sentiment, videos['neutral']),
        'affirmations': random.sample(affirmations.get(sentiment, affirmations['neutral']), 8),
    }
    return render(request, 'wellnest/sentiment.html', context)

def calculate_streak(user):
    today = date.today()
    streak = 0
    entries = JournalEntry.objects.filter(user=user).order_by('-timestamp')
    if not entries:
        return streak
    last_entry_date = entries.first().timestamp.date()
    if last_entry_date == today:
        streak = 1
        current_date = today - timedelta(days=1)
        while JournalEntry.objects.filter(user=user, timestamp__date=current_date).exists():
            streak += 1
            current_date -= timedelta(days=1)
    return streak

def get_month_calendar(user):
    today = date.today()
    current_month = today.month
    current_year = today.year

    _, days_in_month = monthrange(current_year, current_month)
    start_date = date(current_year, current_month, 1)
    end_date = date(current_year, current_month, days_in_month)

    end_date = end_date + timedelta(days=7 - end_date.weekday())  # Extend to end of week
    start_date = start_date - timedelta(days=start_date.weekday())  # Start of week

    calendar = []
    current_date = start_date
    while current_date <= end_date:
        week = []
        for i in range(7):
            if current_date.month == current_month or current_date <= end_date:
                has_entry = JournalEntry.objects.filter(
                    user=user,
                    timestamp__date=current_date
                ).exists() if current_date <= today else False
                week.append({
                    'date': current_date,
                    'has_entry': has_entry,
                    'is_current_month': current_date.month == current_month,
                })
            else:
                week.append({
                    'date': current_date,
                    'has_entry': False,
                    'is_current_month': False,
                })
            current_date += timedelta(days=1)
        calendar.append(week)

    return {
        'month_name': today.strftime('%B %Y'),
        'weeks': calendar
    }
