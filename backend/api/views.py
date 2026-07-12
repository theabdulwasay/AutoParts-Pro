import random
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Q, Sum, Count
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail

from .models import Category, SparePart, Customer, Booking, BookingItem, OTPVerification, Review, Wishlist
from .serializers import (
    CategorySerializer, SparePartSerializer, CustomerSerializer,
    BookingSerializer, BookingCreateSerializer, BookingItemSerializer,
    ProfileSerializer, ReviewSerializer, WishlistSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class SparePartViewSet(viewsets.ModelViewSet):
    queryset = SparePart.objects.select_related('category').all()
    serializer_class = SparePartSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search', '')
        category = self.request.query_params.get('category', '')
        in_stock = self.request.query_params.get('in_stock', '')
        condition = self.request.query_params.get('condition', '')

        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(part_number__icontains=search) |
                Q(brand__icontains=search) |
                Q(vehicle_make__icontains=search) |
                Q(vehicle_model__icontains=search)
            )
        if category:
            qs = qs.filter(category_id=category)
        if in_stock == 'true':
            qs = qs.filter(stock_quantity__gt=0)
        if condition:
            qs = qs.filter(condition=condition)
        return qs


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search', '')
        if search:
            qs = qs.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search)
            )
        return qs


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.select_related('customer').prefetch_related('items__part').all()
    serializer_class = BookingSerializer

    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        return BookingSerializer

    def get_queryset(self):
        qs = super().get_queryset()

        # Non-staff authenticated users only see their own bookings
        user = self.request.user
        if user.is_authenticated and not user.is_staff:
            qs = qs.filter(customer__user=user)

        status_filter = self.request.query_params.get('status', '')
        customer = self.request.query_params.get('customer', '')
        if status_filter:
            qs = qs.filter(status=status_filter)
        if customer:
            qs = qs.filter(customer_id=customer)
        return qs

    def perform_create(self, serializer):
        """Auto-assign customer from the logged-in user when not staff."""
        user = self.request.user
        if user.is_authenticated and not user.is_staff:
            try:
                customer = user.customer_profile
                serializer.save(customer=customer)
                return
            except Customer.DoesNotExist:
                pass
        serializer.save()

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        booking = self.get_object()
        new_status = request.data.get('status')
        valid = [s[0] for s in Booking.STATUS_CHOICES]
        if new_status not in valid:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        old_status = booking.status
        if old_status != new_status:
            # Transition to cancelled: restore stock
            if new_status == 'cancelled' and old_status != 'cancelled':
                for item in booking.items.all():
                    part = item.part
                    part.stock_quantity += item.quantity
                    part.save()
            # Transition from cancelled: deduct stock
            elif old_status == 'cancelled' and new_status != 'cancelled':
                insufficient_stock = []
                for item in booking.items.all():
                    if item.quantity > item.part.stock_quantity:
                        insufficient_stock.append(f"{item.part.name} (needs {item.quantity}, has {item.part.stock_quantity})")
                if insufficient_stock:
                    return Response(
                        {'error': f"Cannot restore booking. Insufficient stock for: {', '.join(insufficient_stock)}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                for item in booking.items.all():
                    part = item.part
                    part.stock_quantity -= item.quantity
                    part.save()
            
            booking.status = new_status
            booking.save()
            
        return Response(BookingSerializer(booking).data)

    def perform_destroy(self, instance):
        if instance.status != 'cancelled':
            for item in instance.items.all():
                part = item.part
                part.stock_quantity += item.quantity
                part.save()
        instance.delete()


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [AllowAny()]

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_authenticated and not user.is_staff:
            try:
                serializer.save(customer=user.customer_profile)
            except Customer.DoesNotExist:
                serializer.save()
        else:
            serializer.save()

    def get_queryset(self):
        qs = super().get_queryset()
        part_id = self.request.query_params.get('part')
        if part_id:
            qs = qs.filter(part_id=part_id)
        return qs


class WishlistViewSet(viewsets.ModelViewSet):
    queryset = Wishlist.objects.all()
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(customer__user=user)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_staff:
            try:
                serializer.save(customer=user.customer_profile)
            except Customer.DoesNotExist:
                serializer.save()
        else:
            serializer.save()


@api_view(['GET'])
def dashboard_stats(request):
    today = timezone.now()
    last_30 = today - timedelta(days=30)

    total_parts = SparePart.objects.count()
    low_stock = SparePart.objects.filter(stock_quantity__lt=5).count()
    total_customers = Customer.objects.count()
    total_bookings = Booking.objects.count()
    pending_bookings = Booking.objects.filter(status='pending').count()
    revenue_30d = Booking.objects.filter(
        booking_date__gte=last_30, status__in=['confirmed', 'shipped', 'delivered']
    ).aggregate(total=Sum('total_amount'))['total'] or 0

    recent_bookings = Booking.objects.select_related('customer').order_by('-booking_date')[:5]

    return Response({
        'total_parts': total_parts,
        'low_stock_parts': low_stock,
        'total_customers': total_customers,
        'total_bookings': total_bookings,
        'pending_bookings': pending_bookings,
        'revenue_30_days': float(revenue_30d),
        'recent_bookings': BookingSerializer(recent_bookings, many=True).data,
    })


# ---------------------------------------------------------------------------
# Auth views
# ---------------------------------------------------------------------------

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    first_name = request.data.get('first_name', '').strip()
    last_name = request.data.get('last_name', '').strip()
    email = request.data.get('email', '').strip()
    phone = request.data.get('phone', '').strip()
    password = request.data.get('password', '')
    address = request.data.get('address', '').strip()

    if not all([first_name, last_name, email, phone, password]):
        return Response(
            {'error': 'first_name, last_name, email, phone, and password are required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(password) < 6:
        return Response(
            {'error': 'Password must be at least 6 characters.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(username=email).exists():
        return Response(
            {'error': 'A user with this email already exists.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
    )

    Customer.objects.create(
        user=user,
        first_name=first_name,
        last_name=last_name,
        email=email,
        phone=phone,
        address=address,
    )

    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        'token': token.key,
        'user': {
            'id': user.id,
            'email': user.email,
            'is_staff': user.is_staff,
            'first_name': user.first_name,
            'last_name': user.last_name,
        },
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '')

    if not email or not password:
        return Response(
            {'error': 'Email and password are required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(username=email, password=password)
    if user is None:
        return Response(
            {'error': 'Invalid email or password.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    token, _ = Token.objects.get_or_create(user=user)

    customer_id = None
    try:
        customer_id = user.customer_profile.id
    except Customer.DoesNotExist:
        pass

    return Response({
        'token': token.key,
        'user': {
            'id': user.id,
            'email': user.email,
            'is_staff': user.is_staff,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'customer_id': customer_id,
        },
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password_view(request):
    email = request.data.get('email', '').strip()

    if not email:
        return Response(
            {'error': 'Email is required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not User.objects.filter(email=email).exists():
        return Response(
            {'error': 'No account found with this email.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    otp = str(random.randint(100000, 999999))
    OTPVerification.objects.create(email=email, code=otp)

    try:
        send_mail(
            subject='AutoParts Pro - Your Password Reset OTP',
            message=f'Your OTP for password reset is: {otp}. This code is valid for 10 minutes.',
            from_email=None, # Uses DEFAULT_FROM_EMAIL from settings
            recipient_list=[email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"Failed to send email to {email}: {e}")
        # In development, you might still want to print it
        print(f"OTP for {email}: {otp}")

    return Response({'message': 'OTP sent to your email.'})


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp_view(request):
    email = request.data.get('email', '').strip()
    code = request.data.get('code', '').strip()

    if not email or not code:
        return Response(
            {'error': 'Email and code are required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    otp_record = OTPVerification.objects.filter(email=email).order_by('-created_at').first()

    if otp_record is None:
        return Response(
            {'error': 'No OTP found for this email.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    if otp_record.code != code:
        return Response(
            {'error': 'Invalid OTP code.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Check expiry – 10 minutes
    if timezone.now() - otp_record.created_at > timedelta(minutes=10):
        return Response(
            {'error': 'OTP has expired. Please request a new one.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    otp_record.is_verified = True
    otp_record.save()

    return Response({'message': 'OTP verified.'})


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_view(request):
    email = request.data.get('email', '').strip()
    code = request.data.get('code', '').strip()
    new_password = request.data.get('new_password', '')

    if not all([email, code, new_password]):
        return Response(
            {'error': 'Email, code, and new_password are required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(new_password) < 6:
        return Response(
            {'error': 'Password must be at least 6 characters.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    otp_record = (
        OTPVerification.objects
        .filter(email=email, code=code, is_verified=True)
        .order_by('-created_at')
        .first()
    )

    if otp_record is None:
        return Response(
            {'error': 'OTP not verified. Please verify your OTP first.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {'error': 'No account found with this email.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    user.set_password(new_password)
    user.save()

    # Clean up all OTPs for this email
    OTPVerification.objects.filter(email=email).delete()

    return Response({'message': 'Password reset successful.'})


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    try:
        customer = request.user.customer_profile
    except Customer.DoesNotExist:
        return Response(
            {'error': 'Customer profile not found.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == 'GET':
        serializer = ProfileSerializer(customer)
        return Response(serializer.data)

    # PUT
    serializer = ProfileSerializer(customer, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()

    # Keep User model in sync
    user = request.user
    user.first_name = customer.first_name
    user.last_name = customer.last_name
    user.save()

    return Response(serializer.data)
