@echo off
:: Deployment script for Nigeria 2.0 Website

:: CONFIGURATION
set BUCKET_NAME=nigeria2.com
set CLOUDFRONT_DIST_ID=EPM5OO052C7VQ

echo ==========================================
echo 🚀 Starting Deployment for Nigeria 2.0
echo ==========================================

echo.
echo 📦 Step 1: Building project...
call pnpm build
if %ERRORLEVEL% neq 0 (
    echo ❌ Build failed! Exiting...
    exit /b %ERRORLEVEL%
)

echo.
echo ☁️ Step 2: Syncing build assets to S3 (s3://%BUCKET_NAME%)...
:: We sync the dist/client folder which contains both compiled assets and public files
aws s3 sync dist/client s3://%BUCKET_NAME% --delete
if %ERRORLEVEL% neq 0 (
    echo ❌ S3 Sync failed! Exiting...
    exit /b %ERRORLEVEL%
)

echo.
echo 🔄 Step 3: Invalidating CloudFront cache...
if "%CLOUDFRONT_DIST_ID%"=="YOUR_CLOUDFRONT_DISTRIBUTION_ID" (
    echo ⚠️ CloudFront Distribution ID not configured. Skipping invalidation...
) else (
    aws cloudfront create-invalidation --distribution-id %CLOUDFRONT_DIST_ID% --paths "/*"
    if %ERRORLEVEL% neq 0 (
        echo ❌ CloudFront invalidation failed!
    )
)

echo.
echo ==========================================
echo 🎉 Deployment Finished Successfully!
echo ==========================================
