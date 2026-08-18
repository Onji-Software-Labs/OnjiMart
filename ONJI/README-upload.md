# Profile picture upload testing

## Backend
- Start the Spring Boot app.
- Ensure the uploads directory exists and is writable.
- The app serves local uploaded files from /uploads/**.

## Frontend
- Set the Expo environment variable before starting the app:
  - Windows PowerShell:
    - $env:EXPO_PUBLIC_API_BASE_URL="http://192.168.1.20:5000"
  - Or use a local .env file with:
    - EXPO_PUBLIC_API_BASE_URL=http://192.168.1.20:5000

## USB testing (Android)
1. Connect the phone by USB.
2. Run:
   - adb reverse tcp:5000 tcp:5000
3. Set:
   - EXPO_PUBLIC_API_BASE_URL=http://localhost:5000
4. Start the app and upload a photo.

## iOS USB testing
- Practical options are:
  1. use iproxy/usbmuxd forwarding, or
  2. use USB tethering / same-network testing.
- For quick local testing, USB tethering or same-network testing is usually easier.
