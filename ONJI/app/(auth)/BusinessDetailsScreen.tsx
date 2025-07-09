import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { RadioButton } from "react-native-paper";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";
import FormikTextInput from "../../components/auth/FormikTextInput";
import RadioInput from "../../components/auth/RadioInput";
import { router } from "expo-router";

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

  
  const handleFormSubmit = (values: formValues) => {
    console.log(values);
    
    // Navigate based on user selection
    if (values.radioState === "Supplier") {
      router.replace("/(supplier)/(tabs)/dashboard");
    } else if (values.radioState === "Retailer") {
      router.replace("/(retailer)/(tabs)/home");
    }
  };

  return (
    <View className="bg-[#FFFFFF] flex-1">
      <View className="flex-1" style={{ paddingBottom: insets.bottom }}>
        <SafeAreaView className="mx-7">
          <Pressable onPress={() => router.back()}>
            <Image
              source={require("../../assets/images/Onji Mart/auth/arrow_back.png")}
              className="w-[28px] h-[24px]"
            />
          </Pressable>

          <View className="mt-5">
            <Text
              className="text-[#242525] font-poppins font-medium"
              style={{ fontSize: 20 }}
            >
              Are you a supplier or retailer?
            </Text>
          </View>
        </SafeAreaView>

        <View className="flex-1 mx-7">
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
                    <View style={{ marginTop: -22, width: "49.5%" }}>
                      <FormikTextInput
                        name="city"
                        fieldName="City"
                        placeholder="City"
                        keyboardType="default"
                      />
                    </View>

                    <View className="w-[49.5%]">
                      <View className="h-[22px]">
                        <Text
                          className={`text-sm ${
                            errors.pinCode && touched.pinCode
                              ? "text-[#FF0000]"
                              : "text-[#2E7D32]"
                          }`}
                          style={{ fontWeight: "500" }}
                        >
                          Pincode
                        </Text>
                      </View>
                      <TextInput
                        placeholder="Pincode"
                        className={`h-[44px] font-poppins border bg-[#F7F8F8] rounded-[4px] px-[12] py-[11] ${
                          errors.pinCode && touched.pinCode
                            ? "border-[#FF0000] text-[#FF0000]"
                            : "border-[#2E7D32]"
                        }`}
                        placeholderTextColor={"#92999E"}
                        value={values.pinCode}
                        onChangeText={handleChange("pinCode")}
                        onBlur={handleBlur("pinCode")}
                        keyboardType="numeric"
                      />
                      {errors.pinCode && touched.pinCode && (
                        <Text className="text-[#FF0000]">{errors.pinCode}</Text>
                      )}
                    </View>
                  </View>
                </View>

                <View className="w-full pb-6">
                  <Pressable
                    disabled={!isValid}
                    onPress={() => handleSubmit()}
                    className={`w-full rounded-[12px] ${
                      isValid ? "bg-[#2E7D32]" : "bg-[#B9BDC0]"
                    }`}
                    style={{
                      paddingVertical: 16,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      className="text-[18px] font-semibold"
                      style={{ color: isValid ? "#F3FAF3" : "#92999E" }}
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