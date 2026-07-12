from django.contrib import admin
from .models import Category, SparePart, Customer, Booking, BookingItem

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']

@admin.register(SparePart)
class SparePartAdmin(admin.ModelAdmin):
    list_display = ['name', 'part_number', 'brand', 'vehicle_make', 'vehicle_model', 'price', 'stock_quantity', 'condition']
    list_filter = ['category', 'condition', 'brand']
    search_fields = ['name', 'part_number', 'brand']

class BookingItemInline(admin.TabularInline):
    model = BookingItem
    extra = 1

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'status', 'total_amount', 'payment_method', 'booking_date']
    list_filter = ['status', 'payment_method']
    inlines = [BookingItemInline]

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'email', 'phone']
    search_fields = ['first_name', 'last_name', 'email']
