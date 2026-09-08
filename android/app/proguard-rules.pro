# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# React Native core & JNI
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.soloader.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# React Native Reanimated
-keep class com.swmansion.reanimated.** { *; }

# Expo modules & plugins
-keep class expo.modules.** { *; }

# SQLite
-keep class expo.modules.sqlite.** { *; }
-keep class androidx.sqlite.** { *; }
-keep class androidx.room.** { *; }

# Strip source file names and line numbers to prevent reverse-engineering
-renamesourcefileattribute SourceFile
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod

# Suppress harmless warnings from third-party libraries during minification
-dontwarn com.facebook.react.**
-dontwarn expo.modules.**

