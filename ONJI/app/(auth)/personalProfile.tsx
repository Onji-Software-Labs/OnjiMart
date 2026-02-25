import RadioInput from "@/components/auth/RadioInput";
import { Formik } from "formik";
import React, { useState } from "react";
import {
    Dimensions,
    Image,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { Alert } from "react-native";
import { useLocalSearchParams,router } from "expo-router";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as yup from "yup";
import "yup-phone";
const { height, width } = Dimensions.get("window");

interface formValues {
    fullName: string;
    phoneNumber: string;
}

const indianPhoneRegex = /^[6-9]\d{9}$/;

const formSchema = yup.object().shape({
    fullName: yup.string().required(),
    phoneNumber: yup.string().matches(indianPhoneRegex).required(),
});

const PersonalProfile = () => {
    const [radioState, setRadioState] = useState("Supplier");
    const handlePress = ({ label }: { label: string }) => {
        setRadioState(label);
    };
    const insets = useSafeAreaInsets();
    const handleSubmit = (values: formValues) => {
        console.log(
            "name : " + values.fullName + "   number : " + values.phoneNumber
        );
        const name=values.fullName
        const number=values.phoneNumber
        router.push({
            pathname:"/(auth)/buisnessScreen",
            params:{name,number,radioState}
        });
    };
    return (
        <View
            className="bg-surface-page flex-1 justify-between"
            style={{ paddingBottom: insets.bottom }}
        >
            <View className="mx-4  flex-1">
                <SafeAreaView className="">
                    <Pressable
                        onPress={()=>router.navigate("/(auth)/login")}
                    >
                    <Image
                        source={require("../../assets/images/arrow_back.png")}
                    ></Image>
                    </Pressable>
                </SafeAreaView>

                <View className="mt-3 flex-1 ">
                    <Text className="text-heading-h5 font-primarysemibold text-text-headings">
                        Personal Profile
                    </Text>
                    <View className="mt-3 flex-1 ">
                        <Text className="text-text-action font-primarysemibold">
                            Profile Picture
                        </Text>
                        <View className="mx-auto mt-3">
                            <View className="border-none rounded-full">
                                <Image
                                    source={require("../../assets/images/3d_avatar_1.png")}
                                ></Image>
                            </View>
                        </View>
                        <Pressable 
                        onPress={()=>console.log("Image is editable")}
                        >
                        <Text className="text-text-action font-primarysemibold mx-auto mt-3">Edit</Text>
                        </Pressable>
                        <View className="flex-1 ">
                            <View className="mt-5">
                                <Text className="text-text-headings font-primarymedium text-heading-h5">
                                    Are you a supplier or retailer?
                                </Text>
                                <View
                                    className="flex-row justify-between mt-6"
                                    style={{ height: height * 0.04 }}
                                >
                                    <RadioInput
                                        handleMethod={handlePress}
                                        label={"Supplier"}
                                        radioState={radioState}
                                    />
                                    <RadioInput
                                        handleMethod={handlePress}
                                        label={"Retailer"}
                                        radioState={radioState}
                                    />
                                </View>
                            </View>
                            <View className="mt-6 flex-1 ">
                                <Formik
                                    initialValues={{
                                        fullName: "",
                                        phoneNumber: "",
                                    }}
                                    onSubmit={(values) => handleSubmit(values)}
                                    validateOnChange
                                    validateOnMount
                                    validationSchema={formSchema}
                                >
                                    {({
                                        values,
                                        isValid,
                                        handleSubmit,
                                        setFieldTouched,
                                        touched,
                                        handleBlur,
                                        handleChange,
                                        errors,
                                    }) => (
                                        <View className="flex-1 justify-between">
                                            <View>
                                                <View>
                                                    <Text className="text-text-action text-sm font-primarymedium">
                                                        Full Name
                                                    </Text>
                                                    <TextInput
                                                        placeholder="Enter your name"
                                                        className={`h-[44px] font-primary 
                                                        ${
                                                            errors.fullName
                                                                ? "border-border-disabled"
                                                                : "border-border-success"
                                                        } 
                                                        focus:outline-none bg-surface-pressed  border-xs rounded-md px-[12] py-[11px]`}
                                                        placeholderTextColor={
                                                            "#AAB2B8"
                                                        }
                                                        value={values.fullName}
                                                        onChangeText={handleChange(
                                                            "fullName"
                                                        )}
                                                        onBlur={handleBlur(
                                                            "fullName"
                                                        )}
                                                        onFocus={() =>
                                                            setFieldTouched(
                                                                "fullName",
                                                                true
                                                            )
                                                        }
                                                    ></TextInput>
                                                </View>
                                                <View className="mt-6">
                                                    <Text className="text-text-action text-sm font-primarymedium">
                                                        Phone number
                                                    </Text>
                                                    <View
                                                        className={`flex-row  border-xs px-[12] overflow-hidden bg-surface-pressed rounded-md ${
                                                            !touched.phoneNumber
                                                                ? "border-border-disabled"
                                                                : touched.phoneNumber &&
                                                                    errors.phoneNumber
                                                                  ? "border-border-error"
                                                                  : "border-border-success"
                                                        }`}
                                                    >
                                                        <Text className="text-text-action mt-3 font-primarymedium ">
                                                            +91
                                                        </Text>
                                                        <TextInput
                                                            placeholder="Mobile number"
                                                            className="h-[44px] ml-4 w-full font-primary border-none focus:outline-none bg-surface-pressed "
                                                            placeholderTextColor={
                                                                "#AAB2B8"
                                                            }
                                                            onBlur={handleBlur(
                                                                "phoneNumber"
                                                            )}
                                                            value={
                                                                values.phoneNumber
                                                            }
                                                            keyboardType="numeric"
                                                            onChangeText={handleChange(
                                                                "phoneNumber"
                                                            )}
                                                            onFocus={() =>
                                                                setFieldTouched(
                                                                    "phoneNumber",
                                                                    true
                                                                )
                                                            }
                                                        ></TextInput>
                                                    </View>
                                                    {errors.phoneNumber &&
                                                        touched.phoneNumber && (
                                                            <Text className="text-text-error font-primarymedium">
                                                                Phone number is
                                                                not valid
                                                            </Text>
                                                        )}
                                                </View>
                                            </View>
                                            <View>
                                                <Pressable
                                                    className="justify-center  rounded-[12px] items-center h-[60] "
                                                    disabled={!isValid}
                                                    style={{
                                                        backgroundColor: isValid
                                                            ? "#4CAF50"
                                                            : "#E0E0E0",
                                                    }}
                                                    onPress={() =>
                                                        handleSubmit()
                                                    }
                                                >
                                                    <Text
                                                        className="text-[20px]  font-primarysemibold"
                                                        style={{
                                                            color: isValid
                                                                ? "#F3FAF3"
                                                                : "#AAB2B8",
                                                        }}
                                                    >
                                                        Continue
                                                    </Text>
                                                </Pressable>
                                            </View>
                                        </View>
                                    )}
                                </Formik>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default PersonalProfile;
