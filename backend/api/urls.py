from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, SparePartViewSet, CustomerViewSet, BookingViewSet,
    ReviewViewSet, WishlistViewSet,
    dashboard_stats, signup_view, login_view, forgot_password_view,
    verify_otp_view, reset_password_view, profile_view,
)

router = DefaultRouter()
router.register('categories', CategoryViewSet)
router.register('parts', SparePartViewSet)
router.register('bookings', BookingViewSet)
router.register('customers', CustomerViewSet)
router.register('reviews', ReviewViewSet)
router.register('wishlist', WishlistViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', dashboard_stats, name='dashboard-stats'),
    path('auth/signup/', signup_view, name='signup'),
    path('auth/login/', login_view, name='login'),
    path('auth/forgot-password/', forgot_password_view, name='forgot-password'),
    path('auth/verify-otp/', verify_otp_view, name='verify-otp'),
    path('auth/reset-password/', reset_password_view, name='reset-password'),
    path('auth/profile/', profile_view, name='profile'),
]
