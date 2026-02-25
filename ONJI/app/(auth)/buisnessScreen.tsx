import FormikTextInput from "@/components/auth/FormikTextInput";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router, useLocalSearchParams } from "expo-router";
import { Formik, FormikProps } from "formik";
import React, { useEffect, useRef, useState } from "react";
import {
    FlatList,
    Image,
    Modal,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Checkbox } from "react-native-paper";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as Yup from "yup";
interface formValues {
    buisnessName: string;
    buisnessAddress: string;
    buisnessPhoneNumber: string;
    city: string;
    pinCode: string;
    category: string[];
    subCategory: string[];
    phoneNumber: string;
    fullName: string;
    radioState: string;
}
const indianPhoneRegex = /^[6-9]\d{9}$/;
const formSchema = Yup.object().shape({
    buisnessName: Yup.string().required(),
    buisnessAddress: Yup.string().required(),
    buisnessPhoneNumber: Yup.string().matches(indianPhoneRegex),
    city: Yup.string().required(),
    pinCode: Yup.string().required().min(6).max(6),
});

const CategoryOptions = ["Vegetable", "Fruits", "Premium", "Seasonal"];
const subCategoryOptions = [
    "Leafy",
    "Root",
    "Berries & small fruits",
    "Tropical fruits",
    "Summer",
    "Monsoon",
    "Winter",
    "Exotic",
    "Organic farm fresh",
];

const BuisnessScreen = () => {
    const formRef = useRef<FormikProps<formValues>>(null);
    // const params = useLocalSearchParams<{
    //     name: string;
    //     number: string;
    //     radioState: string;
    // }>();

    // const [paramState, setParamState] = useState({
    //     fullName: params.name ?? "",
    //     phoneNumber: params.number ?? "",
    //     radioState: params.radioState ?? "",
    // });

    // useEffect(() => {
    //     setParamState({
    //         fullName: params.name ?? "",
    //         phoneNumber: params.number ?? "",
    //         radioState: params.radioState ?? "",
    //     });
    // }, [params]);

    const params = useLocalSearchParams<{
        name: string;
        number: string;
        radioState: string;
    }>();

    // Destructure with default empty strings for safety and stability
    const { name = "", number = "", radioState = "" } = params;

    const [paramState, setParamState] = useState({
        fullName: name,
        phoneNumber: number,
        radioState: radioState,
    });

    useEffect(() => {
        // Only update if any value is different to prevent infinite loops
        setParamState((prevState) => {
            if (
                prevState.fullName === name &&
                prevState.phoneNumber === number &&
                prevState.radioState === radioState
            ) {
                // No change, avoid update
                return prevState;
            }
            // Update with new values
            return {
                fullName: name,
                phoneNumber: number,
                radioState: radioState,
            };
        });
    }, [name, number, radioState]);

    const handleSubmit = () => {
        setalertBoxVisibility(!alertBoxVisibility);
    };
    const handleEdit = () => {
        router.back();
        setalertBoxVisibility(!alertBoxVisibility);
    };
    const handleApiCall = () => {
        console.log(formRef.current?.values);
        if (paramState.radioState === "Supplier") {
            router.replace("/(retailer)/(tabs)/home");
        } else if (paramState.radioState === "Retailer") {
            router.replace("/(supplier)/(tabs)/dashboard");
        }
    };
    const [isCategoryVisible, setIsCategoryVisible] = useState(false);
    const [selectedItemsCategory, setSelectedItemsCategory] = useState<
        string[]
    >([]);

    const [isSubCategoryVisible, setIsSubCategoryVisible] = useState(false);
    const [selectedItemsSubCategory, setSelectedItemsSubCategory] = useState<
        string[]
    >([]);
    const [alertBoxVisibility, setalertBoxVisibility] = useState(false);

    const toggleDropdownCategory = () =>
        setIsCategoryVisible(!isCategoryVisible);
    const toggleDropdownSubCategory = () =>
        setIsSubCategoryVisible(!isSubCategoryVisible);

    const toggleItemCategory = (item: string) => {
        setSelectedItemsCategory((prev) =>
            prev.includes(item)
                ? prev.filter((i) => i !== item)
                : [...prev, item]
        );
    };

    const toggleItemSubCategory = (item: string) => {
        setSelectedItemsSubCategory((prev) =>
            prev.includes(item)
                ? prev.filter((i) => i !== item)
                : [...prev, item]
        );
    };
    const insets = useSafeAreaInsets();
    const confirmSelectionCategory = () => {
        toggleDropdownCategory();
        // Do something with selectedItems
    };

    const confirmSelectionSubCategory = () => {
        toggleDropdownSubCategory();
        // Do something with selectedItems
    };

    return (
        <View className="bg-surface-page flex-1">
            <View
                className="mx-4 flex-1 bg-surface-page"
                style={{ paddingBottom: insets.bottom }}
            >
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
                <View className="flex-1">
                    <Text className="text-heading-h5 font-primarysemibold text-text-headings">
                        Buisness Profile
                    </Text>
                    <Formik
                        initialValues={{
                            buisnessName: "",
                            buisnessAddress: "",
                            buisnessPhoneNumber: "",
                            city: "",
                            pinCode: "",
                            category: selectedItemsCategory ?? "",
                            subCategory: selectedItemsSubCategory,
                            fullName: paramState.fullName,
                            phoneNumber: paramState.phoneNumber,
                            radioState: paramState.radioState,
                        }}
                        innerRef={formRef}
                        onSubmit={() => handleSubmit()}
                        validateOnChange
                        validateOnMount
                        validationSchema={formSchema}
                    >
                        {({
                            handleChange,
                            values,
                            handleSubmit,
                            handleBlur,
                            errors,
                            touched,
                            isValid,
                            setFieldTouched,
                            setFieldValue,
                        }) => {
                            {
                                useEffect(() => {
                                    setFieldValue(
                                        "category",
                                        selectedItemsCategory
                                    );
                                }, [selectedItemsCategory]);
                                useEffect(() => {
                                    setFieldValue(
                                        "subCategory",
                                        selectedItemsSubCategory
                                    );
                                }, [selectedItemsSubCategory]);
                            }
                            return (
                                <View className="flex-1 justify-between">
                                    <View className="mt-6">
                                        <FormikTextInput
                                            name="buisnessName"
                                            fieldName="Buiness Name"
                                            placeholder="Buisness name "
                                            keyboardType="default"
                                        />
                                        <FormikTextInput
                                            name="buisnessAddress"
                                            fieldName="Buiness Address"
                                            placeholder="Buisness address "
                                            keyboardType="default"
                                        />
                                        <View className="mt-6">
                                            <View className="flex-row">
                                                <Text
                                                    className={`${
                                                        errors.buisnessPhoneNumber
                                                            ? "text-text-error"
                                                            : "text-text-action"
                                                    } text-sm font-primarymedium`}
                                                >
                                                    Buisness Phone number
                                                </Text>
                                                <Text className="text-sm font-primarymedium text-text-disabled">
                                                    {" "}
                                                    (optional)
                                                </Text>
                                            </View>
                                            <View
                                                className={`flex-row  border-xs px-[12] overflow-hidden bg-surface-pressed rounded-md ${
                                                    !touched.buisnessPhoneNumber
                                                        ? "border-border-disabled"
                                                        : touched.buisnessPhoneNumber &&
                                                            errors.buisnessPhoneNumber
                                                          ? "border-border-error"
                                                          : "border-border-success"
                                                }`}
                                            >
                                                <Text className="text-text-action mt-3.5 font-primarymedium ">
                                                    +91
                                                </Text>
                                                <TextInput
                                                    placeholder="Mobile number"
                                                    className="h-[44px] ml-4 w-full font-primary border-none focus:outline-none bg-surface-pressed "
                                                    placeholderTextColor={
                                                        "#AAB2B8"
                                                    }
                                                    onBlur={handleBlur(
                                                        "buisnessPhoneNumber"
                                                    )}
                                                    value={
                                                        values.buisnessPhoneNumber
                                                    }
                                                    keyboardType="numeric"
                                                    onChangeText={handleChange(
                                                        "buisnessPhoneNumber"
                                                    )}
                                                    onFocus={() =>
                                                        setFieldTouched(
                                                            "buisnessPhoneNumber",
                                                            true
                                                        )
                                                    }
                                                ></TextInput>
                                            </View>
                                            {/* {errors.buisnessPhoneNumber &&
                                        touched.buisnessPhoneNumber && (
                                            <Text className="text-text-error font-primarymedium">
                                                Phone number is not valid
                                            </Text>
                                        )} */}
                                        </View>
                                        <View className="mt-6 flex-row justify-between">
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
                                                                      ? "#F44336" // error color when touched and error exists
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
                                                            setFieldTouched(
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
                                        {((errors.buisnessPhoneNumber &&
                                            touched.buisnessPhoneNumber) ||
                                            (errors.pinCode &&
                                                touched.pinCode)) && (
                                            <View>
                                                <Text className="text-text-error">
                                                    Information is not valid
                                                </Text>
                                            </View>
                                        )}
                                        <View className="mt-6">
                                            {/* Label */}
                                            <Text className="text-sm text-text-success font-primarymedium">
                                                Business Category
                                            </Text>

                                            {/* Dropdown Trigger */}
                                            <TouchableOpacity
                                                onPress={toggleDropdownCategory}
                                                className={`border border-xs rounded-md ${
                                                    selectedItemsCategory.length >
                                                    0
                                                        ? "border-border-success"
                                                        : "border-border-disabled"
                                                }  bg-surface-pressed px-4 py-3 flex-row justify-between items-center`}
                                            >
                                                <Text
                                                    className={`${
                                                        selectedItemsCategory.length >
                                                        0
                                                            ? "text-text-body"
                                                            : "text-text-disabled"
                                                    }`}
                                                >
                                                    {selectedItemsCategory.length >
                                                    0
                                                        ? selectedItemsCategory.join(
                                                              ", "
                                                          )
                                                        : "Business Category"}
                                                </Text>
                                                <View>
                                                    <AntDesign
                                                        name="down"
                                                        size={15}
                                                        color="black"
                                                    />
                                                </View>
                                            </TouchableOpacity>

                                            {/* Modal Dropdown */}
                                            <Modal
                                                visible={isCategoryVisible}
                                                transparent
                                                animationType="fade"
                                                onRequestClose={
                                                    toggleDropdownCategory
                                                }
                                            >
                                                <Pressable
                                                    onPress={
                                                        toggleDropdownCategory
                                                    }
                                                    className="flex-1 bg-black/40 justify-center px-4"
                                                >
                                                    <View className="bg-surface-pressed rounded-xl p-4">
                                                        <FlatList
                                                            data={
                                                                CategoryOptions
                                                            }
                                                            keyExtractor={(
                                                                item
                                                            ) => item}
                                                            renderItem={({
                                                                item,
                                                            }) => (
                                                                <View className="flex-row items-center justify-between py-2">
                                                                    <View className="flex-row items-center">
                                                                        {item ===
                                                                        "Vegetable" ? (
                                                                            <Image
                                                                                source={require("../../assets/images/Vector.jpg")}
                                                                            ></Image>
                                                                        ) : (
                                                                            <Image
                                                                                source={require("../../assets/images/apple.jpg")}
                                                                            ></Image>
                                                                        )}
                                                                        <Text className="px-2 text-base text-text-body">
                                                                            {
                                                                                item
                                                                            }
                                                                        </Text>
                                                                    </View>
                                                                    <Checkbox
                                                                        status={
                                                                            selectedItemsCategory.includes(
                                                                                item
                                                                            )
                                                                                ? "checked"
                                                                                : "unchecked"
                                                                        }
                                                                        onPress={() =>
                                                                            toggleItemCategory(
                                                                                item
                                                                            )
                                                                        }
                                                                    />
                                                                </View>
                                                            )}
                                                        />

                                                        {/* Confirm Button */}
                                                        <TouchableOpacity
                                                            onPress={
                                                                confirmSelectionCategory
                                                            }
                                                            className="bg-success w-[50%] mx-auto rounded-md mt-4 py-3"
                                                        >
                                                            <Text className="text-text-on-action text-center font-medium">
                                                                Confirm
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </Pressable>
                                            </Modal>
                                        </View>
                                        <View className="mt-6">
                                            {/* Label */}
                                            <Text className="text-sm text-text-success font-primarymedium">
                                                Business Subcategory
                                            </Text>

                                            {/* Dropdown Trigger */}
                                            <TouchableOpacity
                                                onPress={
                                                    toggleDropdownSubCategory
                                                }
                                                className={`border border-xs rounded-md ${
                                                    selectedItemsSubCategory.length >
                                                    0
                                                        ? "border-border-success"
                                                        : "border-border-disabled"
                                                }  bg-surface-pressed px-4 py-3 flex-row justify-between items-center`}
                                            >
                                                <Text
                                                    className={`${
                                                        selectedItemsSubCategory.length >
                                                        0
                                                            ? "text-text-body"
                                                            : "text-text-disabled"
                                                    }`}
                                                >
                                                    {selectedItemsSubCategory.length >
                                                    0
                                                        ? selectedItemsSubCategory.join(
                                                              ", "
                                                          )
                                                        : "Business Category"}
                                                </Text>
                                                <View>
                                                    <AntDesign
                                                        name="down"
                                                        size={15}
                                                        color="black"
                                                    />
                                                </View>
                                            </TouchableOpacity>

                                            {/* Modal Dropdown */}
                                            <Modal
                                                visible={isSubCategoryVisible}
                                                transparent
                                                animationType="fade"
                                                onRequestClose={
                                                    toggleDropdownSubCategory
                                                }
                                            >
                                                <Pressable
                                                    onPress={
                                                        toggleDropdownSubCategory
                                                    }
                                                    className="flex-1 bg-black/40 justify-center px-4"
                                                >
                                                    <View className="bg-surface-pressed rounded-xl p-4">
                                                        <FlatList
                                                            data={
                                                                subCategoryOptions
                                                            }
                                                            keyExtractor={(
                                                                item
                                                            ) => item}
                                                            renderItem={({
                                                                item,
                                                            }) => (
                                                                <View className="flex-row items-center justify-between py-2">
                                                                    <View className="flex-row items-center">
                                                                        {item ===
                                                                        "Leafy" ? (
                                                                            <Image
                                                                                source={require("../../assets/images/Vector.jpg")}
                                                                            ></Image>
                                                                        ) : (
                                                                            <Image
                                                                                source={require("../../assets/images/apple.jpg")}
                                                                            ></Image>
                                                                        )}
                                                                        <Text className="text-base px-2 text-text-body">
                                                                            {
                                                                                item
                                                                            }
                                                                        </Text>
                                                                    </View>
                                                                    <Checkbox
                                                                        status={
                                                                            selectedItemsSubCategory.includes(
                                                                                item
                                                                            )
                                                                                ? "checked"
                                                                                : "unchecked"
                                                                        }
                                                                        onPress={() =>
                                                                            toggleItemSubCategory(
                                                                                item
                                                                            )
                                                                        }
                                                                    />
                                                                </View>
                                                            )}
                                                        />

                                                        {/* Confirm Button */}
                                                        <TouchableOpacity
                                                            onPress={
                                                                confirmSelectionSubCategory
                                                            }
                                                            className="bg-success w-[50%] mx-auto rounded-md mt-4 py-3"
                                                        >
                                                            <Text className="text-text-on-action text-center font-medium">
                                                                Confirm
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </Pressable>
                                            </Modal>
                                        </View>
                                    </View>
                                    <View>
                                        <Pressable
                                            className="justify-center  rounded-[12px] items-center h-[60] "
                                            disabled={
                                                isValid
                                                    ? selectedItemsCategory.length ==
                                                          0 ||
                                                      selectedItemsSubCategory.length ==
                                                          0
                                                        ? true
                                                        : false
                                                    : true
                                            }
                                            style={{
                                                backgroundColor:
                                                    isValid &&
                                                    selectedItemsCategory.length >
                                                        0 &&
                                                    selectedItemsSubCategory.length >
                                                        0
                                                        ? "#4CAF50"
                                                        : "#E0E0E0",
                                            }}
                                            onPress={() => handleSubmit()}
                                        >
                                            <Text
                                                className="text-[20px]  font-primarysemibold"
                                                style={{
                                                    color:
                                                        isValid &&
                                                        selectedItemsCategory.length >
                                                            0 &&
                                                        selectedItemsSubCategory.length >
                                                            0
                                                            ? "#F3FAF3"
                                                            : "#AAB2B8",
                                                }}
                                            >
                                                Continue
                                            </Text>
                                        </Pressable>
                                    </View>
                                    <Modal
                                        visible={alertBoxVisibility}
                                        animationType="fade"
                                        transparent
                                    >
                                        <View className="h-1/2 my-auto">
                                            <View className="justify-between bg-surface-page border-xs rounded-lg px-3 mx-4 my-auto  h-2/3">
                                                <Image
                                                    source={require("../../assets/images/mingcute_warning-line.png")}
                                                    className="mx-auto -mt-4"
                                                ></Image>
                                                <View>
                                                    <Text className="text-text-disabled font-primarymedium">
                                                        Once you click{" "}
                                                        <Text className="text-text-headings font-primarysemibold">
                                                            Confirm
                                                        </Text>
                                                        , your account type{" "}
                                                        <Text className="text-text-headings font-primarysemibold">
                                                            {paramState.radioState.toUpperCase()}
                                                        </Text>{" "}
                                                        will be locked and
                                                        cannot be changed after
                                                        registration.{" "}
                                                    </Text>
                                                    <Text className="mt-3 text-text-disabled font-primarymedium">
                                                        Please review your
                                                        details before
                                                        proceeding.
                                                    </Text>
                                                </View>
                                                <View className="flex-row my-4 ">
                                                    <Pressable
                                                        className="w-1/2"
                                                        onPress={handleEdit}
                                                    >
                                                        <View className="p-2">
                                                            <Text className="mx-auto">
                                                                Edit
                                                            </Text>
                                                        </View>
                                                    </Pressable>

                                                    <Pressable
                                                        className="w-1/2"
                                                        onPress={handleApiCall}
                                                    >
                                                        <View className="bg-orange-500 border-none rounded-lg p-2">
                                                            <Text className="text-text-on-action my-auto mx-auto">
                                                                Confirm
                                                            </Text>
                                                        </View>
                                                    </Pressable>
                                                </View>
                                            </View>
                                        </View>
                                    </Modal>
                                </View>
                            );
                        }}
                    </Formik>
                </View>
            </View>
        </View>
    );
};

export default BuisnessScreen;
