from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase
from api.models import Category, SparePart, Customer, Booking, BookingItem

class SparePartValidationTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Engine", description="Engine parts")

    def test_create_part_with_negative_price(self):
        url = "/api/parts/"
        data = {
            "name": "Brake Pad",
            "part_number": "BP-9999",
            "brand": "Bosch",
            "vehicle_make": "Toyota",
            "vehicle_model": "Corolla",
            "vehicle_year": 2020,
            "condition": "new",
            "price": -10.00,  # Negative price
            "stock_quantity": 10,
            "category": self.category.id
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("price", response.data)

    def test_create_part_with_negative_stock(self):
        url = "/api/parts/"
        data = {
            "name": "Brake Pad",
            "part_number": "BP-9999",
            "brand": "Bosch",
            "vehicle_make": "Toyota",
            "vehicle_model": "Corolla",
            "vehicle_year": 2020,
            "condition": "new",
            "price": 49.99,
            "stock_quantity": -5,  # Negative stock
            "category": self.category.id
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("stock_quantity", response.data)

class BookingStockTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Suspension")
        self.part = SparePart.objects.create(
            category=self.category,
            name="Shock Absorber",
            part_number="SA-111",
            brand="KyB",
            vehicle_make="Honda",
            vehicle_model="Civic",
            vehicle_year=2018,
            price=120.00,
            stock_quantity=5
        )
        self.customer = Customer.objects.create(
            first_name="Alice",
            last_name="Smith",
            email="alice@example.com",
            phone="123456789"
        )

    def test_create_booking_success_and_stock_decrease(self):
        url = "/api/bookings/"
        data = {
            "customer": self.customer.id,
            "payment_method": "cash",
            "notes": "Testing success",
            "items": [
                {
                    "part": self.part.id,
                    "quantity": 2
                }
            ]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify stock decreased
        self.part.refresh_from_db()
        self.assertEqual(self.part.stock_quantity, 3)

    def test_create_booking_insufficient_stock(self):
        url = "/api/bookings/"
        data = {
            "customer": self.customer.id,
            "payment_method": "cash",
            "notes": "Testing failure",
            "items": [
                {
                    "part": self.part.id,
                    "quantity": 10  # Exceeds stock (5)
                }
            ]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Verify stock not modified
        self.part.refresh_from_db()
        self.assertEqual(self.part.stock_quantity, 5)

    def test_booking_cancellation_restores_stock(self):
        # Create a booking first
        booking = Booking.objects.create(
            customer=self.customer,
            status='confirmed',
            payment_method='cash',
            total_amount=240.00
        )
        item = BookingItem.objects.create(
            booking=booking,
            part=self.part,
            quantity=2,
            unit_price=120.00
        )
        # Manually decrease stock as would happen in create
        self.part.stock_quantity -= 2
        self.part.save()

        # Update status to cancelled
        url = f"/api/bookings/{booking.id}/update_status/"
        response = self.client.patch(url, {"status": "cancelled"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify stock restored
        self.part.refresh_from_db()
        self.assertEqual(self.part.stock_quantity, 5)

    def test_booking_deletion_restores_stock(self):
        booking = Booking.objects.create(
            customer=self.customer,
            status='confirmed',
            payment_method='cash',
            total_amount=240.00
        )
        item = BookingItem.objects.create(
            booking=booking,
            part=self.part,
            quantity=2,
            unit_price=120.00
        )
        self.part.stock_quantity -= 2
        self.part.save()

        # Delete booking
        url = f"/api/bookings/{booking.id}/"
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Verify stock restored
        self.part.refresh_from_db()
        self.assertEqual(self.part.stock_quantity, 5)
