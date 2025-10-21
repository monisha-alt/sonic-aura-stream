"""
Environment validation module for Aura Music backend.
Validates required environment variables at startup.
"""
import os
import sys
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class EnvValidationError(Exception):
    """Raised when environment validation fails."""
    pass

def validate_environment() -> Dict[str, Any]:
    """
    Validate all required environment variables.
    Returns validated configuration dict.
    Raises EnvValidationError if validation fails.
    """
    required_vars = {
        # Core API Keys
        "OPENAI_API_KEY": "OpenAI API key for emotion detection and song summarization",
        "SPOTIFY_CLIENT_ID": "Spotify client ID for music integration",
        "SPOTIFY_CLIENT_SECRET": "Spotify client secret for music integration",
        
        # Database
        "DATABASE_URL": "PostgreSQL database connection string",
        
        # Security
        "SECRET_KEY": "JWT secret key for authentication",
        
        # External APIs
        "WEATHER_API_KEY": "OpenWeatherMap API key for contextual recommendations",
    }
    
    optional_vars = {
        "GOOGLE_CLIENT_ID": "Google OAuth client ID for Calendar integration",
        "GOOGLE_CLIENT_SECRET": "Google OAuth client secret for Calendar integration",
        "REDIS_URL": "Redis connection URL for caching",
        "FRONTEND_URL": "Frontend URL for CORS configuration",
        "DEBUG": "Debug mode flag",
        "LOG_LEVEL": "Logging level (DEBUG, INFO, WARNING, ERROR)",
    }
    
    validated_config = {}
    missing_vars = []
    
    # Check required variables
    for var_name, description in required_vars.items():
        value = os.getenv(var_name)
        if not value:
            missing_vars.append(f"{var_name}: {description}")
        else:
            validated_config[var_name] = value
            logger.info(f"✅ {var_name} is configured")
    
    # Check optional variables
    for var_name, description in optional_vars.items():
        value = os.getenv(var_name)
        if value:
            validated_config[var_name] = value
            logger.info(f"✅ {var_name} is configured")
        else:
            logger.warning(f"⚠️  {var_name} is not configured: {description}")
    
    # Validate specific formats
    try:
        # Validate Spotify credentials
        if len(validated_config.get("SPOTIFY_CLIENT_ID", "")) != 32:
            raise ValueError("SPOTIFY_CLIENT_ID should be 32 characters long")
        
        if len(validated_config.get("SPOTIFY_CLIENT_SECRET", "")) != 32:
            raise ValueError("SPOTIFY_CLIENT_SECRET should be 32 characters long")
        
        # Validate OpenAI API key format
        if not validated_config.get("OPENAI_API_KEY", "").startswith("sk-"):
            raise ValueError("OPENAI_API_KEY should start with 'sk-'")
        
        # Validate database URL
        if not validated_config.get("DATABASE_URL", "").startswith("postgresql://"):
            raise ValueError("DATABASE_URL should start with 'postgresql://'")
        
    except ValueError as e:
        missing_vars.append(f"Format validation error: {str(e)}")
    
    # If any required variables are missing, fail fast
    if missing_vars:
        error_msg = "❌ Environment validation failed!\n\nMissing or invalid required variables:\n"
        for missing in missing_vars:
            error_msg += f"  - {missing}\n"
        error_msg += "\nPlease check your .env file and ensure all required variables are set."
        
        logger.error(error_msg)
        raise EnvValidationError(error_msg)
    
    logger.info("🎉 Environment validation passed! All required variables are configured.")
    return validated_config

def check_external_dependencies() -> bool:
    """
    Check if external dependencies (ffmpeg, etc.) are available.
    Returns True if all dependencies are available.
    """
    dependencies_ok = True
    
    # Check ffmpeg availability
    try:
        import subprocess
        result = subprocess.run(['ffmpeg', '-version'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            logger.info("✅ ffmpeg is available")
        else:
            logger.warning("⚠️  ffmpeg not found - audio conversion may not work")
            dependencies_ok = False
    except (subprocess.TimeoutExpired, FileNotFoundError):
        logger.warning("⚠️  ffmpeg not found - audio conversion may not work")
        dependencies_ok = False
    
    return dependencies_ok

if __name__ == "__main__":
    # Run validation when script is executed directly
    try:
        config = validate_environment()
        deps_ok = check_external_dependencies()
        
        print("🎉 Environment validation completed successfully!")
        print(f"📦 External dependencies: {'✅ OK' if deps_ok else '⚠️  Some missing'}")
        
    except EnvValidationError as e:
        print(str(e))
        sys.exit(1)
