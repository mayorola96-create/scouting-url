const fs = require('fs');
const path = require('path');

console.log('--- Configuring Android project for StoreScout ---');

// 1. Configure AndroidManifest.xml
const manifestPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
if (fs.existsSync(manifestPath)) {
  let manifest = fs.readFileSync(manifestPath, 'utf8');

  // Ensure INTERNET permission
  if (!manifest.includes('android.permission.INTERNET')) {
    manifest = manifest.replace(
      '<application',
      '    <uses-permission android:name="android.permission.INTERNET" />\n    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />\n    <application'
    );
  }

  // Ensure usesCleartextTraffic="true"
  if (!manifest.includes('android:usesCleartextTraffic')) {
    manifest = manifest.replace(
      '<application',
      '<application\n        android:usesCleartextTraffic="true"'
    );
  }

  fs.writeFileSync(manifestPath, manifest, 'utf8');
  console.log('✓ AndroidManifest.xml updated successfully');
} else {
  console.warn('⚠️ Manifest not found at:', manifestPath);
}

// 2. Configure MainActivity.java
const mainActivityDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'java', 'com', 'storescout', 'app');
fs.mkdirSync(mainActivityDir, { recursive: true });

const mainActivityPath = path.join(mainActivityDir, 'MainActivity.java');

const mainActivityContent = `package com.storescout.app;

import android.graphics.Bitmap;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebView webView = this.bridge.getWebView();
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setUseWideViewPort(true);
            settings.setLoadWithOverviewMode(true);
            settings.setSupportZoom(true);
            settings.setBuiltInZoomControls(true);
            settings.setDisplayZoomControls(false);

            // Intercept all store URLs inside the WebView instead of opening Chrome
            webView.setWebViewClient(new WebViewClient() {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString();
                    if (url.startsWith("mailto:") || url.startsWith("tel:")) {
                        return true;
                    }
                    // Keep external store domains inside the app's WebView
                    return false;
                }

                @Override
                public void onPageFinished(WebView view, String url) {
                    super.onPageFinished(view, url);

                    // Automatic contact-page finder and form auto-fill JavaScript
                    String jsEngine =
                        "(function() {" +
                        "  try {" +
                        "    const currentUrl = window.location.href.toLowerCase();" +
                        "    // Check if on a store contact route" +
                        "    if (!currentUrl.includes('/contact') && !currentUrl.includes('/get-in-touch') && !currentUrl.includes('/support')) {" +
                        "      const keywords = ['contact', 'contact us', 'contact-us', 'get in touch', 'reach us', 'support'];" +
                        "      const links = Array.from(document.querySelectorAll('a[href]'));" +
                        "      for (const k of keywords) {" +
                        "        for (const a of links) {" +
                        "          const text = (a.textContent || '').trim().toLowerCase();" +
                        "          const href = (a.getAttribute('href') || '').toLowerCase();" +
                        "          if (text === k || text.includes(k) || href.includes('pages/contact') || href.includes('/contact')) {" +
                        "            const target = a.href;" +
                        "            if (target && !target.startsWith('mailto:') && !target.startsWith('tel:')) {" +
                        "              window.location.href = target;" +
                        "              return;" +
                        "            }" +
                        "          }" +
                        "        }" +
                        "      }" +
                        "    }" +
                        "    // Find and center Submit button" +
                        "    const submitBtn = document.querySelector('input[type=\"submit\"], button[type=\"submit\"], form button');" +
                        "    if (submitBtn) {" +
                        "      submitBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });" +
                        "      submitBtn.style.outline = '3px solid #6366f1';" +
                        "    }" +
                        "  } catch (e) { console.error('StoreScout WebView auto-inject error:', e); }" +
                        "})();";

                    view.evaluateJavascript(jsEngine, null);
                }
            });
        }
    }
}
`;

fs.writeFileSync(mainActivityPath, mainActivityContent, 'utf8');
console.log('✓ MainActivity.java configured with WebView settings, URL interception, and JS engine at:', mainActivityPath);
`;
