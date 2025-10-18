import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Custom Tab Bar Component to achieve the floating effect
function CustomTabBar({ state, descriptors, navigation }) {
    return (
        <View style={styles.floatingTabContainer}>
            <LinearGradient colors={['#ffffff', '#f9fafb']} style={styles.floatingTabBar}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label = options.tabBarLabel !== undefined ? options.tabBarLabel : options.title !== undefined ? options.title : route.name;
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    const iconName = options.tabBarIconName || 'circle';

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={options.tabBarTestID}
                            onPress={onPress}
                            style={[styles.floatingTabButton, isFocused && styles.activeFloatingTabButton]}
                        >
                            {isFocused ? (
                                <LinearGradient colors={['#f97316', '#ef4444']} style={styles.activeTabIconContainer}>
                                    <Feather name={iconName} size={24} color="#ffffff" />
                                </LinearGradient>
                            ) : (
                                <View style={styles.inactiveTabIconContainer}>
                                    <Feather name={iconName} size={20} color="#6b7280" />
                                </View>
                            )}
                            {isFocused && (
                                <Text style={styles.activeTabText}>{label}</Text>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </LinearGradient>
        </View>
    );
}

export default function TabLayout() {
    return (
        <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false, // We will use custom headers inside each screen
            }}
        >
            <Tabs.Screen name="home" options={{ title: 'Home', tabBarIconName: 'home' }} />
            <Tabs.Screen name="events" options={{ title: 'Events', tabBarIconName: 'calendar' }} />
            <Tabs.Screen name="clubs" options={{ title: 'Clubs', tabBarIconName: 'users' }} />
            <Tabs.Screen name="wallet" options={{ title: 'Wallet', tabBarIconName: 'award' }} />
            <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIconName: 'user' }} />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    floatingTabContainer: {
        position: 'absolute',
        bottom: 30,
        left: 16,
        right: 16,
        zIndex: 1000,
    },
    floatingTabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 15,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        minHeight: 56,
    },
    floatingTabButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 20,
        minWidth: 44,
        minHeight: 44,
    },
    activeFloatingTabButton: {
        flexDirection: 'row',
        backgroundColor: '#fff7ed',
        paddingHorizontal: 12,
        minWidth: 80,
        borderRadius: 24,
    },
    activeTabIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    inactiveTabIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeTabText: {
        marginLeft: 6,
        fontSize: 12,
        fontWeight: '600',
        color: '#f97316',
    },
});