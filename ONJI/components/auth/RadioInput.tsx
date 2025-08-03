import { View, Text, Pressable } from 'react-native'
import React from 'react'

interface RadioLabelType{
  label:string,
  radioState:string,
  handleMethod:({label}:{label:string})=>any
}

const RadioInput = ({ label, radioState, handleMethod }: RadioLabelType) => {
  return (
    <Pressable
      onPress={() => {
        handleMethod({ label });
      }}
    >
      <View className="flex-row" style={{ width: 126, height: 24 }}>
        <View className="mt-0.5" style={{ width: 24, height: 24 }}>
          <View className=" rounded-2xl border-2 w-full h-full justify-center items-center">
            {radioState === label && (
              <View
                className="rounded-3xl bg-text-action "
                style={{ width: 15, height: 15 }}
              ></View>
            )}
          </View>
        </View>
        <View className="mx-2">
          <Text className="text-xl font-primary">{label}</Text>
        </View>
      </View>
    </Pressable>
  );
};

export default RadioInput;
