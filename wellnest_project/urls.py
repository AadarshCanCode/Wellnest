"""
URL configuration for wellnest_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.contrib.auth.views import LoginView, LogoutView
from django.views.generic.edit import CreateView
from wellnest.forms import SimpleRegisterForm
from django.views.generic import RedirectView
from wellnest.views import redirect_to_login  # Import the custom view
urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', LoginView.as_view(
        template_name='wellnest/login.html',
        success_url='home'
    ), name='login'),
    path('logout/', LogoutView.as_view(next_page='login'), name='logout'),
    path('register/', CreateView.as_view(
        template_name='registration/register.html',
        form_class=SimpleRegisterForm,
        success_url='/login/'
    ), name='register'),
    path('', include('wellnest.urls')),
    # Remove redundant redirect
    # path('login/', RedirectView.as_view(url='login/', permanent=False)),
]