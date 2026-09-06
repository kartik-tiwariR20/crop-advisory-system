from pathlib import Path
import os
import secrets
from dotenv import load_dotenv
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / '.env')

# =============================================================================
# ENVIRONMENT DETECTION
# =============================================================================
IS_RENDER = os.getenv('RENDER', 'false').lower() == 'true'
IS_CI = os.getenv('CI', 'false').lower() == 'true' or \
        os.getenv('GITHUB_ACTIONS', 'false').lower() == 'true'
IS_LOCAL = not (IS_RENDER or IS_CI)

# =============================================================================
# SECURITY
# =============================================================================
# Get SECRET_KEY from environment, or generate for CI/Render
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')
if not SECRET_KEY:
    if IS_CI:
        # Auto-generate for CI (ephemeral environment)
        SECRET_KEY = 'django-insecure-ci-test-key-do-not-use-in-production'
    elif IS_RENDER:
        # Generate a random key for Render if not set (better to set in env)
        SECRET_KEY = secrets.token_urlsafe(50)
        print("⚠️ WARNING: Auto-generated SECRET_KEY on Render. Set DJANGO_SECRET_KEY in environment variables for production.")
    else:
        raise ValueError("DJANGO_SECRET_KEY environment variable must be set")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'False') == 'True'

# Allow all hosts in production, or specific ones
if IS_RENDER:
    ALLOWED_HOSTS = ['*']  # Update with your Render URL in production
elif IS_CI:
    ALLOWED_HOSTS = ['*']
else:
    ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# =============================================================================
# INSTALLED APPS
# =============================================================================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'api',
]

# =============================================================================
# REST FRAMEWORK
# =============================================================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# =============================================================================
# MIDDLEWARE
# =============================================================================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# =============================================================================
# DATABASE
# =============================================================================
if IS_CI:
    # CI: Use local PostgreSQL service container
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'test_db'),
            'USER': os.getenv('DB_USER', 'postgres'),
            'PASSWORD': os.getenv('DB_PASSWORD', 'postgres'),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }
else:
    # Production (Render) and Local Development
    # Try DATABASE_URL first (preferred), then individual variables
    DATABASE_URL = os.getenv('DATABASE_URL')
    
    if DATABASE_URL:
        # Use dj-database-url if available, otherwise parse manually
        try:
            import dj_database_url
            DATABASES = {
                'default': dj_database_url.config(
                    default=DATABASE_URL,
                    conn_max_age=600,
                    ssl_require=True,
                )
            }
        except ImportError:
            # Fallback to manual parsing if dj-database-url not installed
            # Parse DATABASE_URL manually
            import re
            match = re.match(r'postgres(?:ql)?://([^:]+):([^@]+)@([^:/]+)(?::(\d+))?/(.+)', DATABASE_URL)
            if match:
                user, password, host, port, dbname = match.groups()
                DATABASES = {
                    'default': {
                        'ENGINE': 'django.db.backends.postgresql',
                        'NAME': dbname,
                        'USER': user,
                        'PASSWORD': password,
                        'HOST': host,
                        'PORT': port or '5432',
                        'OPTIONS': {
                            'sslmode': 'require',
                            'connect_timeout': 30,
                        }
                    }
                }
            else:
                raise ValueError(f"Invalid DATABASE_URL format: {DATABASE_URL}")
    elif os.getenv('DB_HOST') and os.getenv('DB_PASSWORD'):
        # Individual Postgres environment variables were explicitly provided
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': os.getenv('DB_NAME', 'postgres'),
                'USER': os.getenv('DB_USER', 'postgres'),
                'PASSWORD': os.getenv('DB_PASSWORD'),
                'HOST': os.getenv('DB_HOST', 'localhost'),
                'PORT': os.getenv('DB_PORT', '5432'),
                'OPTIONS': {
                    'sslmode': 'require',
                    'connect_timeout': 30,
                }
            }
        }
    elif IS_LOCAL:
        # Zero-config local development fallback: no DATABASE_URL and no
        # DB_* vars were provided, so use the bundled SQLite file instead of
        # requiring a local Postgres server.
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'db.sqlite3',
            }
        }
    else:
        raise ValueError(
            "No database configured. Set DATABASE_URL or DB_HOST/DB_USER/DB_PASSWORD."
        )

# =============================================================================
# PASSWORD VALIDATION
# =============================================================================
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# =============================================================================
# INTERNATIONALIZATION
# =============================================================================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# =============================================================================
# STATIC FILES
# =============================================================================
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# =============================================================================
# EMAIL
# =============================================================================
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# =============================================================================
# CORS
# =============================================================================
CORS_ALLOW_ALL_ORIGINS = True  # Only for development!

# =============================================================================
# DEFAULT PRIMARY KEY FIELD
# =============================================================================
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# =============================================================================
# LOGGING (Optional - helps debug)
# =============================================================================
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'WARNING',
    },
    'loggers': {
        'django.db.backends': {
            'level': 'ERROR',
            'handlers': ['console'],
            'propagate': False,
        },
    },
}