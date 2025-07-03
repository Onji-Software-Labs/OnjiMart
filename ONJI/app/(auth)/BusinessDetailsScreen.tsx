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
    <View className="bg-[#FFFFFF] flex-1">
      <View className="mx-7 flex-1 " style={{ paddingBottom: insets.bottom }}>
        <SafeAreaView>
          <Pressable>
            <Image
              source={require("../../assets/images/Onji Mart/auth/arrow_back.png")}
              className="w-[28px] h[24px]"
            ></Image>
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
                              className={`text-sm ${errors.pinCode && touched.pinCode ? "text-[#FF0000]" : "text-[#2E7D32]"}`}
                              style={{ fontWeight: 500 }}
                            >
                              Pincode
                            </Text>
                          </View>
                          <View>
                            <TextInput
                              placeholder="Pincode"
                              className={`h-[44px] font-poppins  border bg-[#F7F8F8] border- rounded-[4px] focus:outline-none px-[12] py-[11] ${
                                errors.pinCode && touched.pinCode
                                  ? "border-[#FF0000] text-[#FF0000] "
                                  : "border-[#2E7D32] "
                              }`}
                              placeholderTextColor={"#92999E"}
                              value={values.pinCode}
                              onChangeText={handleChange("pinCode")}
                              onBlur={handleBlur("pinCode")}
                              keyboardType="numeric"
                            ></TextInput>
                          </View>
                        </View>
                      </View>
                      {errors.pinCode && touched.pinCode && (
                        <View>
                          <Text className="text-[#FF0000]">
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
                          backgroundColor: isValid ? "#2E7D32" : "#B9BDC0",
                        }}
                        onPress={() => handleSubmit()}
                      >
                        <Text
                          className="text-[20px]  font-semibold"
                          style={{ color: isValid ? "#F3FAF3" : "#92999E" }}
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
