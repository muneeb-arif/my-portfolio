// Debug script to identify update notification source
console.log('🔍 DEBUGGING UPDATE NOTIFICATION');
console.log('='.repeat(50));

// Check localStorage
console.log('\n📦 LOCALSTORAGE CHECK:');
const themeVersion = localStorage.getItem('theme_version');
const lastUpdateAttempt = localStorage.getItem('last_update_attempt');
const autoUpdateClientId = localStorage.getItem('auto_update_client_id');
const automaticUpdatesSupported = localStorage.getItem('automatic_updates_supported');

console.log('theme_version:', themeVersion);
console.log('auto_update_client_id:', autoUpdateClientId);
console.log('automatic_updates_supported:', automaticUpdatesSupported);
if (lastUpdateAttempt) {
  try {
    const parsed = JSON.parse(lastUpdateAttempt);
    console.log('last_update_attempt:', parsed);
  } catch (e) {
    console.log('last_update_attempt (raw):', lastUpdateAttempt);
  }
}

// Check for existing notifications in DOM
console.log('\n🎯 DOM NOTIFICATION CHECK:');
const updateNotificationBar = document.querySelector('.update-notification-bar');
const themeUpdateNotification = document.querySelector('.theme-update-notification');
const automaticUpdateNotification = document.querySelector('.automatic-update-notification');

console.log('update-notification-bar found:', !!updateNotificationBar);
console.log('theme-update-notification found:', !!themeUpdateNotification);
console.log('automatic-update-notification found:', !!automaticUpdateNotification);

if (updateNotificationBar) {
  console.log('update-notification-bar content:', updateNotificationBar.textContent);
}

// Check if UpdateNotificationBar component is rendered
console.log('\n🧩 REACT COMPONENT CHECK:');
const updateNotificationBarElement = document.querySelector('[class*="update-notification"]');
console.log('Any update notification element found:', !!updateNotificationBarElement);

// Check browser cache
console.log('\n💾 BROWSER CACHE CHECK:');
console.log('Current URL:', window.location.href);
console.log('User Agent:', navigator.userAgent);

// Check if there are any global variables
console.log('\n🌐 GLOBAL VARIABLES CHECK:');
console.log('window.themeUpdateService:', !!window.themeUpdateService);
console.log('window.automaticUpdateService:', !!window.automaticUpdateService);
console.log('window.sharedHostingUpdateService:', !!window.sharedHostingUpdateService);

// Check for any active intervals or timeouts
console.log('\n⏰ TIMER CHECK:');
console.log('This will help identify if there are any active update checks running');

// Instructions for manual debugging
console.log('\n🔧 MANUAL DEBUGGING STEPS:');
console.log('1. Open browser DevTools (F12)');
console.log('2. Go to Application tab > Local Storage');
console.log('3. Clear all localStorage items related to updates');
console.log('4. Go to Network tab and check if API calls are being made');
console.log('5. Check Console for any error messages');
console.log('6. Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)');

console.log('\n🎯 NEXT STEPS:');
console.log('1. Clear browser cache and localStorage');
console.log('2. Check if the notification appears after page reload');
console.log('3. If it still appears, check the Network tab for API calls');
console.log('4. Look for any cached responses from /api/shared-hosting-updates');

console.log('\n💡 QUICK FIX ATTEMPTS:');
console.log('1. localStorage.clear() - Clear all localStorage');
console.log('2. Hard refresh the page');
console.log('3. Check if notification appears in incognito/private mode');
console.log('4. Disable browser extensions temporarily');

console.log('\n🔍 DEBUG COMPLETE');
console.log('='.repeat(50)); 