import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Category, SparePart, Customer, Review

class Command(BaseCommand):
    help = 'Seeds the database with realistic auto parts data'

    def handle(self, *args, **kwargs):
        self.stdout.write("Clearing existing data...")
        Review.objects.all().delete()
        SparePart.objects.all().delete()
        Category.objects.all().delete()
        # Keep users and customers to not break auth, but we could add some mock users.

        self.stdout.write("Creating Categories...")
        categories_data = [
            ("Engine Components", "Pistons, valves, timing belts, and core engine parts"),
            ("Brakes & Traction", "Brake pads, rotors, calipers, and ABS sensors"),
            ("Suspension & Steering", "Shock absorbers, struts, tie rods, and steering racks"),
            ("Electrical & Lighting", "Alternators, starters, batteries, headlights, and fuses"),
            ("Transmission", "Clutch kits, gearboxes, and transmission fluids"),
            ("Exhaust Systems", "Mufflers, catalytic converters, and exhaust manifolds"),
            ("Cooling System", "Radiators, water pumps, thermostats, and coolant hoses"),
            ("Interior & Comfort", "Seats, dashboard trims, AC compressors, and floor mats"),
            ("Exterior & Body", "Bumpers, mirrors, fenders, and door handles"),
            ("Filters & Maintenance", "Oil filters, air filters, cabin filters, and spark plugs"),
        ]
        categories = {}
        for name, desc in categories_data:
            categories[name] = Category.objects.create(name=name, description=desc)

        self.stdout.write("Creating Spare Parts...")
        
        brands = ["Bosch", "Brembo", "Denso", "NGK", "Monroe", "KYB", "Valeo", "ACDelco", "Motorcraft", "Aisin"]
        makes = ["Toyota", "Honda", "Ford", "Chevrolet", "BMW", "Mercedes-Benz", "Audi", "Nissan"]
        
        parts_data = [
            # Engine
            ("High Performance Spark Plug", "Engine Components", 15.99),
            ("Timing Belt Kit", "Engine Components", 125.50),
            ("Engine Oil Pump", "Engine Components", 89.99),
            # Brakes
            ("Ceramic Brake Pads (Front)", "Brakes & Traction", 45.00),
            ("Vented Brake Rotor", "Brakes & Traction", 65.20),
            ("Brake Caliper Assembly", "Brakes & Traction", 110.00),
            # Suspension
            ("Gas Shock Absorber", "Suspension & Steering", 75.50),
            ("Control Arm with Ball Joint", "Suspension & Steering", 130.00),
            ("Outer Tie Rod End", "Suspension & Steering", 25.99),
            # Electrical
            ("12V Car Battery", "Electrical & Lighting", 150.00),
            ("LED Headlight Bulb Set", "Electrical & Lighting", 55.00),
            ("Alternator 130 Amp", "Electrical & Lighting", 195.00),
            # Transmission
            ("Clutch Kit Pro", "Transmission", 210.00),
            ("Transmission Fluid (1L)", "Transmission", 12.50),
            # Exhaust
            ("Stainless Steel Muffler", "Exhaust Systems", 85.00),
            ("O2 Sensor", "Exhaust Systems", 45.00),
            # Cooling
            ("Aluminum Radiator", "Cooling System", 145.00),
            ("Water Pump Assembly", "Cooling System", 68.00),
            # Filters
            ("Premium Oil Filter", "Filters & Maintenance", 8.99),
            ("High Flow Air Filter", "Filters & Maintenance", 18.50),
        ]

        created_parts = []
        for i, (name, cat_name, price) in enumerate(parts_data):
            part = SparePart.objects.create(
                category=categories[cat_name],
                name=name,
                part_number=f"PT-{random.randint(10000, 99999)}-{i}",
                brand=random.choice(brands),
                vehicle_make=random.choice(makes),
                vehicle_model="Generic Model",
                vehicle_year=random.randint(2010, 2024),
                condition=random.choice(["new", "new", "new", "refurbished"]), # Mostly new
                price=Decimal(str(price)),
                stock_quantity=random.randint(10, 100),
                description=f"High quality {name.lower()} suitable for various vehicles. Manufactured by top tier suppliers."
            )
            created_parts.append(part)

        self.stdout.write("Creating Dummy Customers & Reviews...")
        # Create some dummy users for reviews
        dummy_customers = []
        for i in range(5):
            username = f"dummy_user_{i}@example.com"
            user, _ = User.objects.get_or_create(username=username, email=username)
            user.set_password("password123")
            user.save()
            customer, _ = Customer.objects.get_or_create(
                user=user,
                email=username,
                defaults={'first_name': f"Dummy{i}", 'last_name': "User", 'phone': "123456789"}
            )
            dummy_customers.append(customer)

        review_comments = [
            "Great part, fit perfectly!",
            "Good quality for the price.",
            "Fast shipping, item as described.",
            "A bit tricky to install, but works well.",
            "Highly recommended brand.",
            "Decent, but packaging was a bit damaged."
        ]

        for part in created_parts:
            # Add 0 to 4 reviews per part
            num_reviews = random.randint(0, 4)
            reviewers = random.sample(dummy_customers, num_reviews)
            for reviewer in reviewers:
                Review.objects.create(
                    part=part,
                    customer=reviewer,
                    rating=random.choice([3, 4, 4, 5, 5, 5]), # Mostly positive
                    comment=random.choice(review_comments)
                )

        self.stdout.write(self.style.SUCCESS('Successfully seeded database with rich data!'))
