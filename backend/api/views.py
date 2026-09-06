from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.views.decorators.csrf import csrf_exempt
from .models import Farmer
from . import ml_models


def serialize_user(user):
    """Serialize Django User data"""
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'name': user.first_name or user.username,
        'full_name': user.get_full_name() or user.first_name or user.username,
    }


def serialize_farmer(farmer):
    """Serialize Farmer model data"""
    return {
        'id': farmer.id,
        'name': farmer.name,
        'email': farmer.email,
        'location': farmer.location,
        'created_at': farmer.created_at.isoformat() if farmer.created_at else None,
    }


def get_tokens_for_user(user):
    """Generate JWT tokens for Django User"""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def get_or_create_farmer(user, location=None):
    """Get or create Farmer profile for a Django User"""
    try:
        farmer = Farmer.objects.get(email=user.email)
        return farmer, False
    except Farmer.DoesNotExist:
        farmer = Farmer.objects.create(
            name=user.first_name or user.username,
            email=user.email,
            password='',  # Not storing password in Farmer model
            location=location or 'Not specified',
        )
        return farmer, True


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def login_view(request):
    """
    Login view that returns JWT tokens
    Accepts email or username and password
    """
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response(
            {'error': 'Email and password are required.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    # Find user by email or username
    try:
        if '@' in email:
            user_obj = User.objects.get(email__iexact=email)
        else:
            user_obj = User.objects.get(username__iexact=email)
        username = user_obj.username
    except User.DoesNotExist:
        return Response(
            {'error': 'Invalid credentials.'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Authenticate user
    user = authenticate(username=username, password=password)

    if user is not None:
        # Check if user is active
        if not user.is_active:
            return Response(
                {'error': 'User account is disabled.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Generate tokens
        tokens = get_tokens_for_user(user)
        
        # Get or create Farmer profile
        farmer, created = get_or_create_farmer(user)
        
        return Response({
            'message': 'Login successful!',
            'user': serialize_user(user),
            'farmer': serialize_farmer(farmer),
            'access': tokens['access'],
            'refresh': tokens['refresh'],
        }, status=status.HTTP_200_OK)
    else:
        return Response(
            {'error': 'Invalid credentials.'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def register_view(request):
    """
    Register view that creates User and Farmer profile
    """
    name = request.data.get('name')
    email = request.data.get('email')
    password = request.data.get('password')
    location = request.data.get('location', 'Not specified')

    if not name or not email or not password:
        return Response(
            {'error': 'Name, email and password are required.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate email format
    if '@' not in email:
        return Response(
            {'error': 'Please provide a valid email address.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if user already exists
    if User.objects.filter(Q(email__iexact=email) | Q(username__iexact=email)).exists():
        return Response(
            {'error': 'A user with that email already exists.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    # Create Django User
    try:
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=name,
        )
        
        # Create Farmer profile
        farmer = Farmer.objects.create(
            name=name,
            email=email,
            password='',  # Not storing password in Farmer model
            location=location,
        )
        
        # Generate tokens
        tokens = get_tokens_for_user(user)
        
        return Response({
            'message': 'Registration successful!',
            'user': serialize_user(user),
            'farmer': serialize_farmer(farmer),
            'access': tokens['access'],
            'refresh': tokens['refresh'],
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        # Clean up if farmer creation fails
        if 'user' in locals():
            user.delete()
        return Response(
            {'error': f'Registration failed: {str(e)}'}, 
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logout view that blacklists the refresh token
    """
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
            
        return Response(
            {'message': 'Logout successful!'}, 
            status=status.HTTP_200_OK
        )
    except TokenError:
        return Response(
            {'error': 'Invalid token.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Logout failed: {str(e)}'}, 
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """
    Get current user's profile with Farmer data
    """
    user = request.user
    
    try:
        farmer = Farmer.objects.get(email=user.email)
        farmer_data = serialize_farmer(farmer)
    except Farmer.DoesNotExist:
        farmer_data = None
    
    return Response({
        'user': serialize_user(user),
        'farmer': farmer_data,
    }, status=status.HTTP_200_OK)


@api_view(['PATCH', 'PUT'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    """
    Update user profile and Farmer data
    """
    user = request.user
    data = request.data
    
    # Update Django User fields
    if 'name' in data:
        user.first_name = data['name']
    
    if 'email' in data and data['email'] != user.email:
        # Check if new email already exists
        if User.objects.filter(email__iexact=data['email']).exclude(id=user.id).exists():
            return Response(
                {'error': 'Email already in use.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        user.email = data['email']
        user.username = data['email']  # Update username to match email
    
    user.save()
    
    # Update or create Farmer profile
    try:
        farmer = Farmer.objects.get(email=user.email)
        if 'name' in data:
            farmer.name = data['name']
        if 'location' in data:
            farmer.location = data['location']
        farmer.email = user.email
        farmer.save()
    except Farmer.DoesNotExist:
        farmer = Farmer.objects.create(
            name=user.first_name or user.username,
            email=user.email,
            password='',
            location=data.get('location', 'Not specified'),
        )
    
    return Response({
        'message': 'Profile updated successfully!',
        'user': serialize_user(user),
        'farmer': serialize_farmer(farmer),
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_crop_data(request):
    """
    Add crop data for the authenticated farmer
    """
    user = request.user
    data = request.data
    
    crop_name = data.get('crop_name')
    soil_type = data.get('soil_type')
    field_area_acres = data.get('field_area_acres')
    planted_date = data.get('planted_date')
    
    if not crop_name or not soil_type or not field_area_acres or not planted_date:
        return Response(
            {'error': 'All crop data fields are required.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Get or create farmer profile
        farmer, _ = get_or_create_farmer(user)
        
        from .models import CropData
        from datetime import datetime
        
        crop = CropData.objects.create(
            farmer=farmer,
            crop_name=crop_name,
            soil_type=soil_type,
            field_area_acres=float(field_area_acres),
            planted_date=datetime.strptime(planted_date, '%Y-%m-%d').date() if isinstance(planted_date, str) else planted_date,
        )
        
        return Response({
            'message': 'Crop data added successfully!',
            'crop_id': crop.id,
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to add crop data: {str(e)}'}, 
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_crop_data(request):
    """
    Get all crop data for the authenticated farmer
    """
    user = request.user
    
    try:
        farmer = Farmer.objects.get(email=user.email)
        from .models import CropData
        
        crops = CropData.objects.filter(farmer=farmer)
        crop_list = [
            {
                'id': crop.id,
                'crop_name': crop.crop_name,
                'soil_type': crop.soil_type,
                'field_area_acres': crop.field_area_acres,
                'planted_date': crop.planted_date.isoformat(),
            }
            for crop in crops
        ]
        
        return Response({
            'crops': crop_list,
        }, status=status.HTTP_200_OK)
        
    except Farmer.DoesNotExist:
        return Response(
            {'error': 'Farmer profile not found.'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to fetch crop data: {str(e)}'}, 
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def ml_options_view(request):
    """
    Metadata endpoint the frontend uses to build the recommendation forms:
    valid dropdown values for the fertilizer model + the label list the
    crop model can predict.
    """
    try:
        crop_pipeline = ml_models.get_crop_pipeline()
        crop_labels = sorted(str(c) for c in crop_pipeline.label_encoder.classes_)
    except Exception:
        crop_labels = []

    return Response({
        'crop_features': ml_models.CROP_FEATURE_ORDER,
        'fertilizer_features': ml_models.FERTILIZER_FEATURE_COLUMNS,
        'fertilizer_options': ml_models.FERTILIZER_OPTIONS,
        'possible_crops': crop_labels,
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def predict_crop_view(request):
    """
    Recommend the best crop for the given soil & weather readings.
    Body: { N, P, K, temperature, humidity, ph, rainfall }
    """
    data = request.data
    required = ml_models.CROP_FEATURE_ORDER
    missing = [f for f in required if data.get(f) in (None, '')]
    if missing:
        return Response(
            {'error': f"Missing required field(s): {', '.join(missing)}"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        values = {f: float(data[f]) for f in required}
    except (TypeError, ValueError):
        return Response(
            {'error': 'All fields must be numeric.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        crop, confidence = ml_models.predict_crop(**{
            'n': values['N'], 'p': values['P'], 'k': values['K'],
            'temperature': values['temperature'], 'humidity': values['humidity'],
            'ph': values['ph'], 'rainfall': values['rainfall'],
        })
    except Exception as e:
        return Response(
            {'error': f'Prediction failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # Best-effort: persist the recommendation as an Advisory entry for the
    # logged-in farmer so it shows up in their history.
    if request.user and request.user.is_authenticated:
        try:
            farmer, _ = get_or_create_farmer(request.user)
            crop_entry = farmer.crops.filter(crop_name__iexact=crop).first()
            if crop_entry:
                from .models import Advisory
                Advisory.objects.create(
                    crop_data=crop_entry,
                    advisory_text=f"ML crop recommendation: {crop} (confidence {confidence:.2%})",
                    temperature_celsius=values['temperature'],
                    humidity_percent=values['humidity'],
                )
        except Exception:
            pass  # Recommendation still returns even if history logging fails

    return Response({
        'recommended_crop': crop,
        'confidence': round(confidence, 4),
        'inputs': values,
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def predict_fertilizer_view(request):
    """
    Recommend the best fertilizer for the given soil, crop & weather readings.
    Body: { Soil_Type, Soil_pH, Soil_Moisture, Organic_Carbon, Nitrogen_Level,
            Phosphorus_Level, Potassium_Level, Temperature, Humidity, Rainfall,
            Crop_Type, Crop_Growth_Stage, Season, Irrigation_Type }
    """
    data = request.data
    required = ml_models.FERTILIZER_FEATURE_COLUMNS
    missing = [f for f in required if data.get(f) in (None, '')]
    if missing:
        return Response(
            {'error': f"Missing required field(s): {', '.join(missing)}"},
            status=status.HTTP_400_BAD_REQUEST
        )

    numeric_fields = [
        'Soil_pH', 'Soil_Moisture', 'Organic_Carbon', 'Nitrogen_Level',
        'Phosphorus_Level', 'Potassium_Level', 'Temperature', 'Humidity', 'Rainfall',
    ]
    categorical_fields = ['Soil_Type', 'Crop_Type', 'Crop_Growth_Stage', 'Season', 'Irrigation_Type']

    for field in categorical_fields:
        valid = ml_models.FERTILIZER_OPTIONS.get(field, [])
        if valid and data.get(field) not in valid:
            return Response(
                {'error': f"'{field}' must be one of: {', '.join(valid)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

    payload = {}
    try:
        for field in numeric_fields:
            payload[field] = float(data[field])
        for field in categorical_fields:
            payload[field] = data[field]
    except (TypeError, ValueError):
        return Response(
            {'error': 'Numeric fields must contain numbers.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        fertilizer, confidence = ml_models.predict_fertilizer(**payload)
    except Exception as e:
        return Response(
            {'error': f'Prediction failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return Response({
        'recommended_fertilizer': fertilizer,
        'confidence': round(confidence, 4),
        'inputs': payload,
    }, status=status.HTTP_200_OK)