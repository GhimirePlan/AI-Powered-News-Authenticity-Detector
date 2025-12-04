import threading
import json
import hashlib
from datetime import datetime
from django.shortcuts import render, HttpResponse
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from googletrans import Translator

from django.views.decorators.csrf import csrf_exempt
from .models import Feedback, ReportIssue, TodaysNews, News, UserQueryLog
from .webscrapper import WebScrapper
from .TrainingModel.AuthenticityChecker import AuthenticityChecker, Prediction
from .TrainingModel.trainer import TrainModel

CONFIGURATION = {
    "10": "Unauthentic",
    "30": "Likely Unauthentic",
    "60": "Possibly Unauthentic",
    "95": "Likely Authentic",    
    "100": "Authentic"
}

SCRAPER_LOCK = threading.Lock()

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def _background_scraper_task():
    if not SCRAPER_LOCK.acquire(blocking=False):
        return

    try:
        today = datetime.today().date()
        if TodaysNews.objects.filter(date=today).exists():
            return

        TodaysNews.objects.create()
        
        scrapper = WebScrapper()
        predictor = Prediction()
        
        fake_news_sample = News.objects.filter(isfake=True).order_by('?').first()
        fake_desc = fake_news_sample.description if fake_news_sample else "Fake news placeholder"

        for item in scrapper.lists:
            if not News.objects.filter(title=item.title).exists():
                News.objects.create(
                    title=item.title,
                    description=predictor.getPurified(item.description),
                    source=item.source,
                    isfake=False,
                    meta_data={"original_url": item.source, "scraped_at": str(timezone.now())}
                )
                
                News.objects.create(
                    title="Fake: " + item.title,
                    description=fake_desc,
                    source="Generated-Fake",
                    isfake=True
                )
        
        TrainModel().trainModel()

    except Exception as e:
        print(f"Error in background scraper: {e}")
    finally:
        SCRAPER_LOCK.release()

def trigger_scraper_if_needed():
    today = datetime.today().date()
    if not TodaysNews.objects.filter(date=today).exists():
        t = threading.Thread(target=_background_scraper_task, daemon=True)
        t.start()

def perform_fake_news_check(query_text, request_obj):
    translator = Translator()
    try:
        lang_detect = translator.detect(query_text)
        source_lang = lang_detect.lang
        
        if source_lang != 'ne':
            translated_text = translator.translate(query_text, dest="ne").text
            input_for_model = translated_text
        else:
            translated_text = query_text
            input_for_model = query_text
    except Exception:
        source_lang = 'ne'
        input_for_model = query_text

    score = AuthenticityChecker().check(input_for_model)

    label = "Unauthentic"
    prev_threshold = 0
    for threshold, val in CONFIGURATION.items():
        if score < int(threshold) and score >= prev_threshold:
            label = val
            break
        prev_threshold = int(threshold)

    if request_obj.user.is_authenticated:
        user_identifier = str(request_obj.user.id)
    else:
        user_identifier = request_obj.session.session_key or get_client_ip(request_obj)

    hashed_id = hashlib.sha256(str(user_identifier).encode()).hexdigest()

    UserQueryLog.objects.create(
        user_hash=hashed_id,
        query_text=query_text,
        prediction_score=score,
        prediction_label=label,
        explainability_data={"input_length": len(input_for_model), "lang": source_lang}
    )

    if source_lang != 'ne':
        final_status = translator.translate(label, dest=source_lang).text
    else:
        final_status = label

    return final_status, score

def MainPage(request):
    trigger_scraper_if_needed()
    return render(request, "index.html")

@login_required
def Download(request):
    return render(request, "download.html")

def ResultPage(request):
    trigger_scraper_if_needed()
    
    query = request.GET.get("q")
    if not query:
        return render(request, "searchreasult.html")

    status_text, percentage = perform_fake_news_check(query, request)

    context = {
        "status": status_text,
        "searchfor": query, 
        "percentage": percentage
    }
    return render(request, "searchreasult.html", context)

@csrf_exempt
def ResultForExtension(request):
    if request.method == "POST":
        try:
            if request.content_type == 'application/json':
                data = json.loads(request.body)
                query = data.get("content")
            else:
                query = request.POST.get("content")
            
            if not query:
                return JsonResponse({"status": False, "error": "No content provided"})

            status_text, percentage = perform_fake_news_check(query, request)

            return JsonResponse({
                "authentic": status_text,
                "accuracy": percentage,
                "searchfor": query
            })
        except Exception as e:
            return JsonResponse({"status": False, "error": str(e)})

    return JsonResponse({"status": False})

def GetReviews(request):
    feedbacks = Feedback.objects.select_related('user').all()
    data = []
    for f in feedbacks:
        data.append({
            "reviews": f.reviews,
            "message": f.message,
            "Username": f"{f.user.first_name} {f.user.last_name}"
        })
    return HttpResponse(json.dumps(data), content_type="application/json")

def FeedbackPage(request):
    if request.method == "POST":
        if request.user.is_authenticated:
            message = request.POST.get("message")
            review_score = request.POST.get("review", 5)
            
            if message:
                Feedback.objects.create(
                    user=request.user,
                    message=message,
                    reviews=review_score
                )
                return JsonResponse({"status": True})
            return JsonResponse({"status": False})
        else:
            return JsonResponse({"authentication": True, "status": False})
    return HttpResponse("Invalid Request", status=400)

def ReportIssuePage(request):
    if request.method == "POST":
        if request.user.is_authenticated:
            message = request.POST.get("message")
            if message:
                ReportIssue.objects.create(user=request.user, message=message)
                return JsonResponse({"status": True})
            return JsonResponse({"status": False})
        else:
            return JsonResponse({"authentication": True, "status": False})
    return HttpResponse("Invalid Request", status=400)