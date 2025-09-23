import axiosInstance from "@/lib/api/axiosConfig";
import { router, Href } from "expo-router";
import { Formik, FormikProps } from "formik";
import React, { useEffect, useRef, useState } from "react";
import {
    Dimensions,
    Image,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as Yup from "yup";
import FormikTextInput from "../../components/auth/FormikTextInput";
import RadioInput from "../../components/auth/RadioInput";

const { height, width } = Dimensions.get("window");

// ✅ Fixed interface to include all form fields
interface formValues {
    fullName: string;
    businessAddress: string;
    businessName: string;
    city: string;
    pinCode: string;
    radioState: string;
}

const formSchema = Yup.object({
    fullName: Yup.string().required(),
    businessAddress: Yup.string().required(),
    businessName: Yup.string().required(),
    city: Yup.string().required(),
    pinCode: Yup.string()
        .required("Information is not valid")
        .min(6, "Information is not valid")
        .max(6, "Information is not valid"),
});

export function BusinessDetailsScreen() {
    const [radioState, setRadioState] = useState("Supplier");
    const handlePress = ({ label }: { label: string }) => {
        setRadioState(label);
    };

    const insets = useSafeAreaInsets();
    const formikRef = useRef<FormikProps<formValues>>(null);

    useEffect(() => {
        if (formikRef.current) {
            formikRef.current.setFieldValue("radioState", radioState);
        }
    }, [radioState]);

    const handleFormSubmit = async (values: formValues) => {
        const role = "ROLE_" + values.radioState.toUpperCase();
        try {
            const response = await axiosInstance.put(
                "api/users/1c4c2263-ce75-4fa1-a55c-26eb9acd8d0c",
                {
                    username: values.fullName,
                    password: "string",
                    roles: [role],
                    cityName: values.city,
                    pincode: values.pinCode,
                    buisnessName: values.businessName,
                    buisnessAddress: values.businessAddress,
                    email: "sample@gmail.com",
                    status: "ACTIVE",
                    userType: radioState.toUpperCase(),
                    active: true,
                    dateEntered: "2025-07-16T18:13:56.652Z",
                    dateModified: "2025-07-16T18:13:56.652Z",
                    onboardingStatus: true,
                }
            );
            console.log(
                "Role: " + role + "Name : " + values.fullName + "\nResponse : ",
                response.data,
                `cityname ${values.city}`
            );

            // ✅ Navigate based on user selection
            if (values.radioState === "Supplier") {
                router.replace("/(retailer)/(tabs)/home");
            } else if (values.radioState === "Retailer") {
                router.replace("/(supplier)/(tabs)/dashboard");
            }

        } catch (e) {
            console.log("Role: " + role + e);
        }
    };

    return (
        <View className="bg-surface-page flex-1">
            <View
                className="mx-7 flex-1 "
                style={{ paddingBottom: insets.bottom }}
            >
                <SafeAreaView>
                    <Pressable onPress={() => router.back()}>
                        <Image
                            source={require("../../assets/images/arrow_back.png")}
                            className="w-[28px] h-[24px]"
                        />
                    </Pressable>

                    <View className="mt-5">
                        <Text className="text-text-headings font-primarymedium text-heading-h5">
                            Are you a supplier or retailer?
                        </Text>
                    </View>
                </SafeAreaView>

                <View className="flex-1">
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

                    <Formik
                        innerRef={formikRef}
                        initialValues={{
                            fullName: "",
                            businessAddress: "",
                            businessName: "",
                            city: "",
                            pinCode: "",
                            radioState: radioState,
                        }}
                        validateOnMount
                        validateOnChange
                        onSubmit={handleFormSubmit}
                        validationSchema={formSchema}
                    >
                        {({
                            values,
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            touched,
                            isValid,
                            errors,
                        }) => (
                            <View className="flex-1 justify-between">
                                <View className="mt-6">
                                    <FormikTextInput
                                        name="fullName"
                                        fieldName="Full Name"
                                        placeholder="Enter your name"
                                        keyboardType="default"
                                    />
                                    <FormikTextInput
                                        name="businessAddress"
                                        fieldName="Business Address"
                                        placeholder="Business address"
                                        keyboardType="default"
                                    />
                                    <FormikTextInput
                                        name="businessName"
                                        fieldName="Business Name"
                                        placeholder="Business name"
                                        keyboardType="default"
                                    />

                                    <View className="mt-[22px] flex-row justify-between">
                                        <View
                                            style={{
                                                marginTop: -22,
                                                width: "49.5%",
                                            }}
                                        >
                                            <FormikTextInput
                                                name="city"
                                                fieldName="City"
                                                placeholder="City"
                                                keyboardType="default"
                                            ></FormikTextInput>
                                        </View>
                                        <View className="w-[49.5%]">
                                            <View className="h-[22px] ">
                                                <Text
                                                    className={`text-sm ${errors.pinCode && touched.pinCode ? "text-text-error" : "text-text-action"} font-primarymedium`}
                                                >
                                                    Pincode
                                                </Text>
                                            </View>
                                            <View>
                                                <TextInput
                                                    placeholder="Pincode"
                                                    className={`h-[44px] font-primary focus:outline-none bg-surface-pressed  border-xs rounded-md px-[12] py-[11px]"`}
                                                    style={{
                                                        borderColor:
                                                            !touched.pinCode
                                                                ? "#AAB2B8"
                                                                : errors.pinCode
                                                                  ? "#F44336"
                                                                  : "#4CAF50",
                                                    }}
                                                    placeholderTextColor={
                                                        errors.pinCode &&
                                                        touched.pinCode
                                                            ? "#F44336"
                                                            : "#AAB2B8"
                                                    }
                                                    value={values.pinCode}
                                                    onChangeText={handleChange(
                                                        "pinCode"
                                                    )}
                                                    onFocus={() =>
                                                        formikRef.current?.setFieldTouched(
                                                            "pinCode",
                                                            true
                                                        )
                                                    }
                                                    onBlur={handleBlur(
                                                        "pinCode"
                                                    )}
                                                    keyboardType="numeric"
                                                ></TextInput>
                                            </View>
                                        </View>
                                    </View>
                                    {errors.pinCode && touched.pinCode && (
                                        <View>
                                            <Text className="text-text-error">
                                                {errors.pinCode}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <View>
                                    <Pressable
                                        className="justify-center rounded-[12px] items-center h-[60] "
                                        disabled={!isValid}
                                        style={{
                                            backgroundColor: isValid
                                                ? "#4CAF50"
                                                : "#E0E0E0",
                                        }}
                                        onPress={() => handleSubmit()}
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
    );
}

export default BusinessDetailsScreen;
