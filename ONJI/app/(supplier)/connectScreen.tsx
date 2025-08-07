import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

export interface ISupplier {
    id: string;
    name: string;
    category: string,
    location: string;
    rating: number;
    reviews: number;
    imageUrl: string;
}

interface ISupplierTabProps {
    supplier: ISupplier;
}

const windowWidth = Dimensions.get("window").width;

const ConnectScreen: React.FC<ISupplierTabProps> = ({ supplier }) => {
    const [isFavorite, setIsFavorite] = useState<boolean>(false);

    const [isConnected, setIsConnected] = useState(false);

    const insets = useSafeAreaInsets();

    const heartScale = useRef(new Animated.Value(1)).current;
    const heartRotation = useRef(new Animated.Value(0)).current;

    const connectScale = useRef(new Animated.Value(1)).current;
    const connectBgColor = useRef(new Animated.Value(0)).current;

    const toggleFavorite = () => {
        setIsFavorite((prev) => !prev);

        heartScale.setValue(1);
        heartRotation.setValue(0);
        Animated.parallel([
            Animated.spring(heartScale, {
                toValue: 1.3,
                friction: 3,
                useNativeDriver: true,
            }),
            Animated.timing(heartRotation, {
                toValue: 1,
                duration: 200,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
        ]).start(() => {
            Animated.spring(heartScale, {
                toValue: 1,
                friction: 7,
                useNativeDriver: true,
            }).start();
            heartRotation.setValue(0);
        });
    };

    const handleConnectPressIn = () => {
        // Animated.parallel([
        //     Animated.timing(connectScale, {
        //         toValue: 0.9,
        //         duration: 100,
        //         easing: Easing.linear,
        //         useNativeDriver: true,
        //     }),
        //     Animated.timing(connectBgColor, {
        //         toValue: 1,
        //         duration: 100,
        //         easing: Easing.linear,
        //         useNativeDriver: false,
        //     }),
        // ]).start();
    };

    const handleConnectPressOut = () => {
        // Animated.parallel([
        //     Animated.timing(connectScale, {
        //         toValue: 1,
        //         duration: 100,
        //         easing: Easing.linear,
        //         useNativeDriver: true,
        //     }),
        //     Animated.timing(connectBgColor, {
        //         toValue: 0,
        //         duration: 100,
        //         easing: Easing.linear,
        //         useNativeDriver: false,
        //     }),
        // ]).start();
    };

    const rotateHeart = heartRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "12deg"],
    });

    const interpolatedConnectBgColor = connectBgColor.interpolate({
        inputRange: [0, 1],
        outputRange: ["white", "#D1FAE5"],
    });

    return (
        <View
            className="flex-1"
            // style={{paddingBottom:insets.bottom}}
        >
            <View className="flex-1 justify-between">
                <View>
                    <SafeAreaView>
                        <Pressable
                            onPress={() => {
                                router.navigate("/(auth)/personalProfile");
                            }}
                        >
                            <Image
                                source={require("../../assets/images/arrow_back.png")}
                            ></Image>
                        </Pressable>
                    </SafeAreaView>
                </View>
                <View className="bg-pink-100 border-none rounded-b-3xl">
                    <Text className="text-text-body font-primarysemibold pt-2 ml-6">
                        Buisness Information
                    </Text>

                    <View style={styles.card}>
                        <>
                            <View style={styles.profileImageContainer}>
                                <Image
                                    source={require("../../assets/images/react-logo.png")}
                                    style={styles.profileImage}
                                    onError={(error) =>
                                        console.log(
                                            "Image loading error:",
                                            error.nativeEvent.error
                                        )
                                    }
                                />
                            </View>

                            <View style={styles.supplierInfo}>
                                <View className="flex-row justify-between">
                                    <Text style={styles.companyName}>
                                      {/* supplier.name */}
                                        Sunways Trading
                                    </Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text className="text-text-body">
                                      {/* supplier.name */}
                                        Aslam
                                    </Text>
                                    <View
                                        style={styles.reviewContent}
                                        className="mt-0.5"
                                    >
                                        <FontAwesome
                                            name="star"
                                            size={16}
                                            color="#0F9D58"
                                            style={styles.starIcon}
                                        />
                                        <Text style={styles.reviewText}>
                                          {/* supplier.review */}
                                            {4.5}
                                        </Text>
                                        <Text style={styles.reviewText}>
                                          {/* supplier.rating  */}
                                            {" "}
                                            ({6})
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.supplierLocation}>
                                  {/* supplier.category  */}
                                    Category : Fruits
                                </Text>
                                <View className="flex-row">
                                    <View className="mt-1">
                                        <View className="border-xs rounded-full w-fit flex-row">
                                            <Entypo
                                                name="star"
                                                size={10}
                                                color="grey"
                                            />
                                        </View>
                                    </View>
                                    <Text style={styles.supplierLocation}>
                                        {" "}
                                        Verified user: 2 years
                                    </Text>
                                </View>
                                <View className="flex-row">
                                    <View className="mt-1">
                                        <AntDesign
                                            name="checkcircleo"
                                            size={12}
                                            color="grey"
                                        />
                                    </View>
                                    <Text style={styles.supplierLocation}>
                                        {" "}
                                        GST: 03BOMPS0736L2ZM
                                    </Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <View className="flex-row">
                                        <View className="mt-0 -ml-1 -mr-1">
                                            <EvilIcons
                                                name="location"
                                                size={20}
                                                color="grey"
                                            />
                                        </View>
                                        <Text className="text-text-body">
                                            {" "}
                                            Ambalpady, Udupi
                                        </Text>
                                    </View>
                                    <View></View>
                                </View>

                                {/* <LinearGradient
                                    colors={[
                                        "rgba(248, 248, 248, 1)",
                                        "rgba(248, 248, 248, 0)",
                                    ]}
                                    start={{ x: 0, y: 0.5 }}
                                    end={{ x: 1, y: 0.5 }}
                                    locations={[0.85, 1]}
                                    style={styles.reviewSectionBackground}
                                ></LinearGradient> */}
                            </View>
                        </>

                        <TouchableOpacity
                            onPress={() => {
                                setIsConnected(!isConnected);

                                console.log(
                                    " `Connect button clicked for ${supplier.name}!`"
                                );
                            }}
                            onPressIn={handleConnectPressIn}
                            onPressOut={handleConnectPressOut}
                            style={styles.connectButtonWrapper}
                            activeOpacity={1}
                        >
                          {!isConnected ? 
                            <Animated.View
                                style={[
                                    styles.connectButton,
                                    {
                                        transform: [{ scale: connectScale }],
                                        backgroundColor:
                                            interpolatedConnectBgColor,
                                    },
                                ]}
                            >
                                <Text style={styles.connectButtonText}>
                                    Connect
                                </Text>
                                <MaterialCommunityIcons
                                    name="account-plus"
                                    size={20}
                                    color="#0F9D58"
                                />
                            </Animated.View>
                            : 
                            <Animated.View
                                style={[
                                    styles.connectButton,
                                    {
                                        transform: [{ scale: connectScale }],
                                        backgroundColor:
                                            interpolatedConnectBgColor,
                                    },
                                ]}
                            >
                                <Text style={styles.connectButtonText}>
                                    Cancel
                                </Text>
                                <Entypo className="" name="cross" size={20} color="#0F9D58" />
                            </Animated.View>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
                {!isConnected ? <View className="mx-auto -mb-20 mt-6  w-3/4">
                    <Image
                        source={require("../../assets/images/Lock.png")} // <-- your image path
                        style={[styles.image]}
                    ></Image>
                    <Text className="text-text-disabled mx-auto font-primarysemibold text-xl">
                        Connect with supplier to{" "}
                    </Text>
                    <Text className="text-text-disabled mx-auto font-primarysemibold text-xl">
                        start placing orders
                    </Text>
                </View> 
                : <View className="mx-auto -mb-20 mt-6  w-3/4">
                    <Image
                        source={require("../../assets/images/IconClock.png")} // <-- your image path
                        style={[styles.image]}
                    ></Image>
                    <Text className="text-text-disabled mx-auto font-primarysemibold text-xl">
                        Connection request sent
                    </Text>
                    <Text className="text-text-disabled mx-auto font-primary text-xs">
                        Great things are coming your way with this supplier
                    </Text>
                </View>
                }
                <View
                    className=""
                    style={[styles.container, { width: windowWidth }]}
                >
                    <Image
                        source={require("../../assets/images/fruits-vegetables-background-style 1.png")} // <-- your image path
                        style={[styles.image, { width: windowWidth }]}
                        resizeMode="cover"
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: "hidden",
    },
    image: {
        marginHorizontal: "auto",
    },
    card: {
        backgroundColor: "white",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        padding: 16,
        marginHorizontal: "auto",
        marginVertical: 20,
        flexDirection: "row",
        alignItems: "center",
        maxWidth: 400,
        width: "90%",
        position: "relative",
        paddingBottom: 64,
        paddingRight: 16,
    },
    favoriteButton: {
        position: "absolute",
        top: 16,
        right: 16,
        padding: 8,
        borderRadius: 9999,
        zIndex: 10,
    },
    profileImageContainer: {
        flexShrink: 0,
        paddingTop: 32,
    },
    profileImage: {
        height: 96,
        width: 96,
        borderRadius: 9999,
        resizeMode: "cover",
    },
    supplierInfo: {
        flexGrow: 1,
        marginLeft: 16,
    },
    companyName: {
        fontSize: 20,
        fontWeight: "600",
        color: "#545557ff",
    },
    supplierDescription: {
        fontSize: 16,
        color: "#4B5563",
        fontWeight: "400",
    },
    supplierLocation: {
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "400",
    },
    reviewSectionBackground: {
        marginTop: 4,
        borderRadius: 9999,
        paddingVertical: 4,
        paddingHorizontal: 8,
        alignSelf: "flex-start",
    },
    reviewContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    starIcon: {
        marginRight: 4,
    },
    reviewText: {
        fontSize: 14,
        color: "#0F9D58",
        fontWeight: "400",
    },
    connectButtonWrapper: {
        position: "absolute",
        bottom: 16,
        right: 16,
        zIndex: 10,
    },
    connectButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: "#0F9D58",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        columnGap: 8,
        elevation: 0,
    },
    connectButtonText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#0F9D58",
        marginRight: 4,
    },
});

export default ConnectScreen;
