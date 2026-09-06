from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Auth
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Profile
    path('profile/', views.get_user_profile, name='get_profile'),
    path('profile/update/', views.update_user_profile, name='update_profile'),

    # Crop data
    path('crops/', views.get_crop_data, name='get_crops'),
    path('crops/add/', views.add_crop_data, name='add_crop'),

    # ML recommendations
    path('predict/options/', views.ml_options_view, name='ml_options'),
    path('predict/crop/', views.predict_crop_view, name='predict_crop'),
    path('predict/fertilizer/', views.predict_fertilizer_view, name='predict_fertilizer'),
]
