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
    <View className="mt-6">
      <View className="h-[22px] ">
        <Text className="text-text-action text-sm font-primarymedium" >
          {fieldName}
        </Text>
      </View>
      <View className="">
        <TextInput
          placeholder={placeholder}
          className="h-[44px] font-primary focus:outline-none bg-surface-pressed  border-xs rounded-md px-[12] py-[11px]"
          placeholderTextColor={"#AAB2B8"}
          style={{borderColor: meta.error ? "#AAB2B8" : "#4CAF50" }}
          value={field.value}
          onChangeText={helpers.setValue}
          keyboardType={keyboardType}
        ></TextInput>

      </View>
    </View>
  );
};

export default FormikTextInput;
