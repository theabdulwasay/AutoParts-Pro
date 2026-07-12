from rest_framework import serializers
from django.db.models import Avg
from .models import Category, SparePart, Customer, Booking, BookingItem, Review, Wishlist


class CategorySerializer(serializers.ModelSerializer):
    parts_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = '__all__'

    def get_parts_count(self, obj):
        return obj.parts.count()


class SparePartSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)
    average_rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()

    class Meta:
        model = SparePart
        fields = '__all__'

    def get_average_rating(self, obj):
        avg = obj.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 0.0

    def get_reviews_count(self, obj):
        return obj.reviews.count()

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value

    def validate_stock_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock quantity cannot be negative.")
        return value

    def validate_vehicle_year(self, value):
        import datetime
        current_year = datetime.datetime.now().year
        if value < 1900 or value > current_year + 1:
            raise serializers.ValidationError(f"Vehicle year must be between 1900 and {current_year + 1}.")
        return value


class CustomerSerializer(serializers.ModelSerializer):
    total_bookings = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = '__all__'

    def get_total_bookings(self, obj):
        return obj.bookings.count()


class BookingItemSerializer(serializers.ModelSerializer):
    part_name = serializers.CharField(source='part.name', read_only=True)
    part_number = serializers.CharField(source='part.part_number', read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = BookingItem
        fields = '__all__'


class BookingSerializer(serializers.ModelSerializer):
    items = BookingItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.__str__', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'


class BookingItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingItem
        fields = ['part', 'quantity', 'unit_price']
        extra_kwargs = {'unit_price': {'required': False}}


class BookingCreateSerializer(serializers.ModelSerializer):
    items = BookingItemCreateSerializer(many=True)

    class Meta:
        model = Booking
        fields = ['customer', 'payment_method', 'notes', 'items']
        extra_kwargs = {'customer': {'required': False}}

    def validate(self, data):
        items = data.get('items', [])
        if not items:
            raise serializers.ValidationError("Booking must contain at least one item.")
        
        # Check stock limits and non-positive quantities
        part_quantities = {}
        for item in items:
            part = item['part']
            qty = item['quantity']
            if qty <= 0:
                raise serializers.ValidationError(f"Quantity for part '{part.name}' must be greater than zero.")
            part_quantities[part] = part_quantities.get(part, 0) + qty

        for part, total_qty in part_quantities.items():
            if total_qty > part.stock_quantity:
                raise serializers.ValidationError(
                    f"Insufficient stock for part '{part.name}'. Available: {part.stock_quantity}, requested: {total_qty}."
                )
        return data

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        booking = Booking.objects.create(**validated_data)
        total = 0
        for item_data in items_data:
            part = item_data['part']
            qty = item_data['quantity']
            price = part.price
            BookingItem.objects.create(
                booking=booking,
                part=part,
                quantity=qty,
                unit_price=price
            )
            total += qty * price
            # Reduce stock
            part.stock_quantity -= qty
            part.save()
        booking.total_amount = total
        booking.save()
        return booking


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'first_name', 'last_name', 'email', 'phone', 'address']
        read_only_fields = ['email']


class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.__str__', read_only=True)

    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['customer']


class WishlistSerializer(serializers.ModelSerializer):
    part_details = SparePartSerializer(source='part', read_only=True)

    class Meta:
        model = Wishlist
        fields = '__all__'
        read_only_fields = ['customer']
