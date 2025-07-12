import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from "react-native";
import React, { Component, useEffect, useRef, useState } from "react";
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

interface formValues {
  radioState: string;
  pinCode: string;
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
  const [btnDisable, setBtnDisable] = useState(false);

  const formikRef = useRef<FormikProps<formValues>>(null);

  useEffect(() => {
    if (formikRef.current) {
      formikRef.current.setFieldValue("radioState", radioState);
    }
  }, [radioState]);

  return (
    <View className="bg-surface-page flex-1">
      <View className="mx-7 flex-1 " style={{ paddingBottom: insets.bottom }}>
        <SafeAreaView>
          <Pressable onPress={() => router.back()}>
            <Image
              source={require("../../assets/images/Onji Mart/auth/arrow_back.png")}
              className="w-[28px] h[24px]"
            ></Image>
          </Pressable>
          <View className="mt-5">
            <Text className="text-text-headings font-primarymedium text-heading-h5">
              Are you a supplier or retailer?
            </Text>
          </View>
        </SafeAreaView>
        <View
          className="flex-row justify-between"
          style={{ height: height * 0.04 }}
        >
          <RadioInput
            handleMethod={handlePress}
            label={"Supplier"}
            radioState={radioState}
          ></RadioInput>
          <RadioInput
            handleMethod={handlePress}
            label={"Retailer"}
            radioState={radioState}
          ></RadioInput>
        </View>
        <View className=" flex-1 ">
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
            onSubmit={(values) => console.log(values)}
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
            }) => {
              return (
                <>
                  <View className="flex-column  justify-between flex-1 ">
                    <View>
                      <FormikTextInput
                        name="fullName"
                        fieldName="Full Name"
                        placeholder="Enter your name"
                        keyboardType="default"
                      ></FormikTextInput>
                      <FormikTextInput
                        name="businessAddress"
                        fieldName="Business Address"
                        placeholder="Business address"
                        keyboardType="default"
                      ></FormikTextInput>
                      <FormikTextInput
                        name="businessName"
                        fieldName="Business Name"
                        placeholder="Business name"
                        keyboardType="default"
                      ></FormikTextInput>

                      <View className="mt-[22px] flex-row justify-between">
                        <View style={{ marginTop: -22, width: "49.5%" }}>
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
                                borderColor: !touched.pinCode
                                  ? "#AAB2B8"
                                  : errors.pinCode
                                    ? "#F44336" // error color when touched and error exists
                                    : "#4CAF50",
                              }}
                              placeholderTextColor={errors.pinCode && touched.pinCode ? "#F44336" : "#92999E"}
                              value={values.pinCode}
                              onChangeText={handleChange("pinCode")}
                              onFocus={() =>
                                formikRef.current?.setFieldTouched(
                                  "pinCode",
                                  true
                                )
                              }
                              onBlur={handleBlur("pinCode")}
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
                          backgroundColor: isValid ? "#4CAF50" : "#E0E0E0",
                        }}
                        onPress={() => handleSubmit()}
                      >
                        <Text
                          className="text-[20px]  font-primarysemibold"
                          style={{ color: isValid ? "#F3FAF3" : "#AAB2B8" }}
                        >
                          Continue
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </>
              );
            }}
          </Formik>
        </View>
      </View>
    </View>
  );
}

export default BusinessDetailsScreen;
