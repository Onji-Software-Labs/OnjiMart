import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  View,
  StyleSheet,
  Image,
  Easing,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

const { height } = Dimensions.get('window');

const AnimatedImage = Animated.createAnimatedComponent(Image);

// FIX: Added useRouter to handle navigation after splash animation completes on Android
export default function SplashScreen({ onAnimationEnd }: { onAnimationEnd?: () => void } = {}) {
  const router = useRouter();
  // FIX: Added after animation end handler for Android - navigates to login after splash
  const handleAnimationEnd = () => {
    if (onAnimationEnd) {
      onAnimationEnd();
    } else {
      router.replace('/(auth)/login');
    }
  };
  const logoScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const bgColorAnim = useRef(new Animated.Value(0)).current; // 0 = white, 1 = green
  const slideUpAnim = useRef(new Animated.Value(0)).current; // Y-translation for slide-up
  const [colorInverted, setColorInverted] = useState(false);
  const [showFinalWhiteScreen, setShowFinalWhiteScreen] = useState(false);

  useEffect(() => {
    Animated.timing(logoScale, {
      toValue: 1,
      duration: 2000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          setTimeout(() => {
            setColorInverted(true); // update images
            Animated.timing(bgColorAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: false,
            }).start(() => {
              setTimeout(() => {
                // Start final slide-up animation
                setShowFinalWhiteScreen(true);
                Animated.timing(slideUpAnim, {
                  toValue: -height,
                  duration: 800,
                  easing: Easing.inOut(Easing.ease),
                  useNativeDriver: true,
                }).start(() => {
                  // FIX: Updated callback to use handleAnimationEnd which manages Android navigation
                  setTimeout(handleAnimationEnd, 400);
                });
              }, 1000);
            });
          }, 1000);
        });
      }, 1000);
    });
  }, [handleAnimationEnd]);

  const backgroundColor = bgColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFFFFF', '#2E7D32'],
  });

  return (
    <View style={{ flex: 1 }}>
      {/* Final white screen underneath */}
      {showFinalWhiteScreen && (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none" />
      )}

      {/* Splash content that slides up */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { transform: [{ translateY: slideUpAnim }] },
        ]}
      >
        <Animated.View style={[styles.container, { backgroundColor }]}>
          <AnimatedImage
            source={
              colorInverted
                ? require('../../assets/images/logo_white.png')
                : require('../../assets/images/Splash.png')
            }
            style={[
              styles.logo,
              {
                transform: [{ scale: logoScale }],
              },
            ]}
            resizeMode="contain"
          />

          <Animated.View
            style={[
              styles.textRow,
              {
                opacity: textOpacity,
                marginTop: 20,
              },
            ]}
          >
            <Image
              source={
                colorInverted
                  ? require('../../assets/images/onji_white.png')
                  : require('../../assets/images/Frame 6096.png')
              }
              style={styles.onji}
              resizeMode="contain"
            />
            <Image
              source={
                colorInverted
                  ? require('../../assets/images/mart_white.png')
                  : require('../../assets/images/Frame 6097.png')
              }
              style={styles.mart}
              resizeMode="contain"
            />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 141,
    height: 190,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  onji: {
    width: 112,
    height: 40,
    marginRight: 5,
  },
  mart: {
    width: 127,
    height: 40,
  },
});
