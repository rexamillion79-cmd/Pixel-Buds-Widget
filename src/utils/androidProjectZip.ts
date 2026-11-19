import JSZip from 'jszip';
import { BatteryState, WidgetTheme } from '../types/widget';
import { hexToAndroidArgb } from './color';

export async function buildAndroidStudioProjectZip(
  battery: BatteryState,
  theme: WidgetTheme,
  appUrl: string
): Promise<Blob> {
  const zip = new JSZip();

  const bgArgb = hexToAndroidArgb(theme.bgColor, theme.bgOpacity).replace('#', '0x');
  const ringArgb = hexToAndroidArgb(theme.ringColor, 100).replace('#', '0x');
  const trackArgb = hexToAndroidArgb(theme.trackColor, theme.trackOpacity).replace('#', '0x');
  const discArgb = hexToAndroidArgb(theme.innerDiscColor, theme.innerDiscOpacity).replace('#', '0x');
  const boltBgArgb = hexToAndroidArgb(theme.boltBgColor, 100).replace('#', '0x');
  const boltIconArgb = hexToAndroidArgb(theme.boltIconColor, 100).replace('#', '0x');
  const textArgb = hexToAndroidArgb(theme.textColor, 100).replace('#', '0x');

  zip.file(
    'settings.gradle.kts',
    `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "PixelBuds2aWidget"
include(":app")
`
  );

  zip.file(
    'build.gradle.kts',
    `plugins {
    id("com.android.application") version "8.6.1" apply false
    id("org.jetbrains.kotlin.android") version "2.0.20" apply false
}
`
  );

  zip.file(
    'gradle.properties',
    `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
kotlin.code.style=official
android.nonTransitiveRClass=true
`
  );

  zip.file(
    'gradle/wrapper/gradle-wrapper.properties',
    `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.9-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`
  );

  zip.file(
    'app/build.gradle.kts',
    `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.budswidget.pixel9"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.budswidget.pixel9"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.webkit:webkit:1.12.1")
}
`
  );

  zip.file(
    'app/src/main/AndroidManifest.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />

    <application
        android:allowBackup="true"
        android:icon="@drawable/buds_case_icon"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="@style/Theme.AppCompat.NoActionBar">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <receiver
            android:name=".BudsWidgetProvider"
            android:exported="true">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
                <action android:name="android.bluetooth.device.action.BATTERY_LEVEL_CHANGED" />
            </intent-filter>
            <meta-data
                android:name="android.appwidget.provider"
                android:resource="@xml/buds_widget_info" />
        </receiver>
    </application>
</manifest>
`
  );

  zip.file(
    'app/src/main/java/com/budswidget/pixel9/MainActivity.kt',
    `package com.budswidget.pixel9

import android.Manifest
import android.annotation.SuppressLint
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.BLUETOOTH_CONNECT)
                != PackageManager.PERMISSION_GRANTED
            ) {
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf(Manifest.permission.BLUETOOTH_CONNECT),
                    1001
                )
            }
        }

        webView = WebView(this).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.cacheMode = WebSettings.LOAD_DEFAULT
            webViewClient = WebViewClient()
            loadUrl("${appUrl}")
        }
        setContentView(webView)

        val updateIntent = Intent(this, BudsWidgetProvider::class.java).apply {
            action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
            val ids = AppWidgetManager.getInstance(application)
                .getAppWidgetIds(ComponentName(application, BudsWidgetProvider::class.java))
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
        }
        sendBroadcast(updateIntent)
    }
}
`
  );

  zip.file(
    'app/src/main/java/com/budswidget/pixel9/BudsWidgetProvider.kt',
    `package com.budswidget.pixel9

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.graphics.*
import android.widget.RemoteViews
import androidx.core.graphics.drawable.toBitmap

class BudsWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        val manager = AppWidgetManager.getInstance(context)
        val ids = manager.getAppWidgetIds(
            android.content.ComponentName(context, BudsWidgetProvider::class.java)
        )
        onUpdate(context, manager, ids)
    }

    companion object {
        private val BG_COLOR = (${bgArgb}).toInt()
        private val RING_COLOR = (${ringArgb}).toInt()
        private val TRACK_COLOR = (${trackArgb}).toInt()
        private val DISC_COLOR = (${discArgb}).toInt()
        private val BOLT_BG_COLOR = (${boltBgArgb}).toInt()
        private val BOLT_ICON_COLOR = (${boltIconArgb}).toInt()
        private val TEXT_COLOR = (${textArgb}).toInt()
        private const val CORNER_RADIUS_DP = ${theme.cornerRadius}f

        fun updateWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val bitmap = renderWidgetBitmap(context)
            val views = RemoteViews(context.packageName, R.layout.buds_widget_layout)
            views.setImageViewBitmap(R.id.widget_canvas, bitmap)

            val launchIntent = Intent(context, MainActivity::class.java)
            val pendingIntent = PendingIntent.getActivity(
                context,
                0,
                launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_canvas, pendingIntent)
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        private fun renderWidgetBitmap(context: Context): Bitmap {
            val width = 1020
            val height = 430
            val bmp = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(bmp)

            val bgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = BG_COLOR
                style = Paint.Style.FILL
            }
            val radiusPx = CORNER_RADIUS_DP * 2.5f
            canvas.drawRoundRect(
                RectF(0f, 0f, width.toFloat(), height.toFloat()),
                radiusPx,
                radiusPx,
                bgPaint
            )

            val leftLevel = ${battery.left}
            val caseLevel = ${battery.caseLevel}
            val rightLevel = ${battery.right}

            val cxPositions = floatArrayOf(width * 0.19f, width * 0.50f, width * 0.81f)
            val cy = height * 0.43f
            val ringRadius = 110f

            drawRing(canvas, cxPositions[0], cy, ringRadius, leftLevel, ${battery.leftCharging}, "L: $leftLevel%")
            drawRing(canvas, cxPositions[1], cy, ringRadius, caseLevel, ${battery.caseCharging}, "C: $caseLevel%")
            drawRing(canvas, cxPositions[2], cy, ringRadius, rightLevel, ${battery.rightCharging}, "R: $rightLevel%")

            val caseDrawable = context.getDrawable(R.drawable.buds_case_icon)
            caseDrawable?.let {
                val caseBmp = it.toBitmap(126, 126)
                canvas.drawBitmap(caseBmp, cxPositions[1] - 63f, cy - 63f, null)
            }

            return bmp
        }

        private fun drawRing(
            canvas: Canvas,
            cx: Float,
            cy: Float,
            radius: Float,
            percent: Int,
            charging: Boolean,
            label: String
        ) {
            val isLow = percent < 20
            val warningColor = if (percent < 10) 0xFFEF4444.toInt() else 0xFFF59E0B.toInt()
            val activeRingColor = if (isLow) warningColor else RING_COLOR

            val discPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = DISC_COLOR
                style = Paint.Style.FILL
            }
            canvas.drawCircle(cx, cy, radius - 22f, discPaint)

            val stroke = ${(theme.ringThickness * 2.5).toFixed(1)}f
            val rect = RectF(cx - radius, cy - radius, cx + radius, cy + radius)
            val hasTopBadge = charging || isLow
            val gap = if (hasTopBadge) 22f else 0f
            val startAngle = -90f + gap
            val totalSweep = 360f - gap * 2f

            val trackPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = TRACK_COLOR
                style = Paint.Style.STROKE
                strokeWidth = stroke
                strokeCap = Paint.Cap.BUTT
            }
            canvas.drawArc(rect, startAngle, totalSweep, false, trackPaint)

            val ringPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = activeRingColor
                style = Paint.Style.STROKE
                strokeWidth = stroke
                strokeCap = if (hasTopBadge || percent >= 100) Paint.Cap.BUTT else Paint.Cap.ROUND
            }
            canvas.drawArc(rect, startAngle, totalSweep * (percent / 100f), false, ringPaint)

            if (charging) {
                val badgePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                    color = if (isLow) warningColor else BOLT_BG_COLOR
                    style = Paint.Style.FILL
                }
                val bx = cx
                val by = cy - radius
                canvas.drawCircle(bx, by, 26f, badgePaint)

                val boltPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                    color = BOLT_ICON_COLOR
                    style = Paint.Style.FILL
                }
                val path = Path().apply {
                    moveTo(bx + 3f, by - 14f)
                    lineTo(bx - 10f, by + 2f)
                    lineTo(bx, by + 2f)
                    lineTo(bx - 3f, by + 14f)
                    lineTo(bx + 10f, by - 2f)
                    lineTo(bx, by - 2f)
                    close()
                }
                canvas.drawPath(path, boltPaint)
            } else if (isLow) {
                val badgePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                    color = warningColor
                    style = Paint.Style.FILL
                }
                val bx = cx
                val by = cy - radius
                canvas.drawCircle(bx, by, 26f, badgePaint)

                val markPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                    color = 0xFF0B182C.toInt()
                    style = Paint.Style.FILL
                }
                canvas.drawRoundRect(bx - 3f, by - 13f, bx + 3f, by + 3f, 3f, 3f, markPaint)
                canvas.drawCircle(bx, by + 10f, 3.5f, markPaint)
            }

            val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = if (isLow) warningColor else TEXT_COLOR
                textSize = 40f
                textAlign = Paint.Align.CENTER
                typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.NORMAL)
            }
            val displayLabel = if (isLow) "! $label" else label
            canvas.drawText(displayLabel, cx, cy + radius + 62f, textPaint)
        }
    }
}
`
  );

  zip.file(
    'app/src/main/res/layout/buds_widget_layout.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <ImageView
        android:id="@+id/widget_canvas"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:contentDescription="@string/app_name"
        android:scaleType="fitCenter" />
</FrameLayout>
`
  );

  zip.file(
    'app/src/main/res/xml/buds_widget_info.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="250dp"
    android:minHeight="110dp"
    android:targetCellWidth="4"
    android:targetCellHeight="2"
    android:updatePeriodMillis="1800000"
    android:initialLayout="@layout/buds_widget_layout"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen" />
`
  );

  zip.file(
    'app/src/main/res/values/strings.xml',
    `<resources>
    <string name="app_name">Pixel Buds 2a Widget</string>
</resources>
`
  );

  zip.file(
    '.github/workflows/build-apk.yml',
    `name: Build Pixel Buds 2a APK
on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
      - name: Setup Gradle
        uses: gradle/actions/setup-gradle@v4
        with:
          gradle-version: '8.9'
      - name: Build Debug APK
        run: gradle assembleDebug
      - name: Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: PixelBuds2aWidget-debug-apk
          path: app/build/outputs/apk/debug/app-debug.apk
`
  );

  zip.file(
    'README.md',
    `# Pixel Buds 2a Battery Widget (Android APK Project)

This project was exported with your exact widget colors, transparency (${theme.bgOpacity}%), and corner radius (${theme.cornerRadius}dp).

## Option 1: Build APK with Android Studio (Local)
1. Unzip this folder and open it in **Android Studio**.
2. Wait for Gradle sync to complete.
3. Click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
4. Copy \`app/build/outputs/apk/debug/app-debug.apk\` to your Pixel 9 and install it.

## Option 2: Build APK Automatically on GitHub (No Android Studio needed)
1. Create a new GitHub repository and upload this unzipped folder.
2. Open the **Actions** tab on GitHub and run **Build Pixel Buds 2a APK**.
3. Download the \`PixelBuds2aWidget-debug-apk\` artifact and install the \`.apk\` on your Pixel 9.
`
  );

  // Embed the user's attached PNG icon into res/drawable-nodpi/buds_case_icon.png
  try {
    const res = await fetch('/assets/aistudio/840353930506-frontimage_60ccabdd.png');
    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      zip.file('app/src/main/res/drawable-nodpi/buds_case_icon.png', arrayBuffer);
    }
  } catch {
    // Skip binary embed if unavailable offline
  }

  return zip.generateAsync({ type: 'blob' });
}
