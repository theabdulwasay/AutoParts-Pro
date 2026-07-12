import os
import django
import sys

# Ensure the backend directory is in the python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'spareparts_project.settings')
django.setup()

from django.contrib.auth.models import User

email = 'admin@autopartspro.com'
password = 'AdminPassword123!'

if not User.objects.filter(username=email).exists():
    User.objects.create_superuser(
        username=email,
        email=email,
        password=password,
        first_name='Super',
        last_name='Admin'
    )
    print(f"Superuser {email} created successfully.")
else:
    # Update password if it already exists to be sure
    user = User.objects.get(username=email)
    user.set_password(password)
    user.is_staff = True
    user.is_superuser = True
    user.save()
    print(f"Superuser {email} updated successfully.")
