import { View, Text, TextInput } from "react-native";
import React from "react";
import { useField } from "formik";

interface viewProps {
  name: string;
  placeholder: string;
  keyboardType: "numeric" | "default";
  fieldName: string;
}

const FormikTextInput = ({
  name,
  placeholder,
  fieldName,
  keyboardType,
}: viewProps) => {
  const [field, meta, helpers] = useField(name);

  return (
    <View className="mt-[22px]">
      <View className="h-[22px] ">
        <Text className="text-[#2E7D32] text-sm" style={{ fontWeight: 500 }}>
          {fieldName}
        </Text>
      </View>
      <View className="">
        <TextInput
          placeholder={placeholder}
          className="h-[44px] focus:outline-none font-poppins border  bg-[#F7F8F8] border- rounded-[4px] border-[#2E7D32] px-[12] py-[11px]"
          placeholderTextColor={"#92999E"}
          value={field.value}
          onChangeText={helpers.setValue}
          keyboardType={keyboardType}
        ></TextInput>

      </View>
    </View>
  );
};

export default FormikTextInput;
