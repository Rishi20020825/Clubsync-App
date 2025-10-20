import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoadingAnimation({ message = "Loading...", subMessage = "" }) {
  const rotate1 = useRef(new Animated.Value(0)).current;
  const rotate2 = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Rotation animation for shape 1
    Animated.loop(
      Animated.timing(rotate1, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Rotation animation for shape 2 (opposite direction)
    Animated.loop(
      Animated.timing(rotate2, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: true,
      })
    ).start();

    // Scale pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin1 = rotate1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spin2 = rotate2.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.animationBox}>
        {/* Shape 1 - Rotating rounded square */}
        <Animated.View
          style={[
            styles.shape,
            {
              transform: [{ rotate: spin1 }, { scale }],
              borderRadius: 20,
            },
          ]}
        >
          <LinearGradient
            colors={['#f97316', '#ef4444']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>

        {/* Shape 2 - Rotating circle */}
        <Animated.View
          style={[
            styles.shape,
            styles.shape2,
            {
              transform: [{ rotate: spin2 }],
              borderRadius: 40,
            },
          ]}
        >
          <LinearGradient
            colors={['#ef4444', '#f97316']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
      </View>

      {/* Text */}
      <View style={styles.textContainer}>
        <Text style={styles.message}>{message}</Text>
        {subMessage ? (
          <Text style={styles.subMessage}>{subMessage}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  animationBox: {
    width: 80,
    height: 80,
    marginBottom: 32,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shape: {
    position: 'absolute',
    width: 80,
    height: 80,
    overflow: 'hidden',
  },
  shape2: {
    opacity: 0.7,
  },
  gradient: {
    flex: 1,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  subMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
