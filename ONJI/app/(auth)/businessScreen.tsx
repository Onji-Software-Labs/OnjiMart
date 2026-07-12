import FormikTextInput from '@/components/auth/FormikTextInput';
import { createRetailerBusiness} from '@/lib/api/retailer';
import { createSupplierBusiness, getCategories, getSubCategories } from '@/lib/api/supplier';
import { secureStorage } from '@/lib/secureStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from '@expo/vector-icons/AntDesign';
import { router, useLocalSearchParams } from 'expo-router';
import { Formik, FormikProps } from 'formik';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Checkbox from 'expo-checkbox';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Yup from 'yup';
interface formValues {
  businessName: string;
  businessAddress: string;
  businessPhoneNumber: string;
  city: string;
  pinCode: string;
  category: string[];
  subCategory: string[];
  phoneNumber: string;
  fullName: string;
  radioState: string;
}
const indianPhoneRegex = /^[6-9]\d{9}$/;
const businessNameRegex = /^[A-Za-z][A-Za-z0-9 ]*$/;

const formSchema = Yup.object().shape({
  businessName: Yup.string()
    .trim() .min(3, "Business name must contain at least 3 characters")
    .matches(
      businessNameRegex,
      "Start with alphabet. Only letters and numbers allowed")
    .required("Business name is required"),

  businessAddress: Yup.string()
    .trim() .min(3, "Business address must contain at least 3 characters")
    .matches(
      businessNameRegex,
      "Start with alphabet. Only letters and numbers allowed")
    .required("Business address is required"),

  businessPhoneNumber: Yup.string().matches(indianPhoneRegex),
  city: Yup.string().required().trim(),
  pinCode: Yup.string().required().min(6).max(6),
});

type SearchParamValue = string | string[] | undefined;

const readSearchParam = (value: SearchParamValue) =>
  Array.isArray(value) ? value[0] ?? '' : value ?? '';

const parseSearchArray = (value: SearchParamValue) => {
  const rawValue = readSearchParam(value);

  if (!rawValue) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return rawValue
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
};
// Remove these:
// const CategoryOptions = ['Vegetable', 'Fruits', 'Premium', 'Seasonal'];
// const subCategoryOptions = ['Leafy', 'Root', ...]



const BusinessScreen = () => {
  const [isCategoryVisible, setIsCategoryVisible] = useState(false);

  const [isSubCategoryVisible, setIsSubCategoryVisible] = useState(false);
  const [alertBoxVisibility, setalertBoxVisibility] = useState(false);
  const formRef = useRef<FormikProps<formValues>>(null);
  const params = useLocalSearchParams<{
    name?: SearchParamValue;
    number?: SearchParamValue;
    radioState?: SearchParamValue;
    profileImageUrl?: SearchParamValue;
    businessName?: SearchParamValue;
    businessAddress?: SearchParamValue;
    businessPhoneNumber?: SearchParamValue;
    city?: SearchParamValue;
    pinCode?: SearchParamValue;
    selectedItemsCategory?: SearchParamValue;
    selectedItemsSubCategory?: SearchParamValue;
    selectedCategoryIds?: SearchParamValue;
    selectedSubCategoryIds?: SearchParamValue;
  }>();

  // Destructure with default empty strings for safety and stability
  const name = readSearchParam(params.name);
  const number = readSearchParam(params.number);
  const radioState = readSearchParam(params.radioState);

  const [paramState, setParamState] = useState({
    fullName: name,
    phoneNumber: number,
    radioState: radioState,
  });

  const [businessName] = useState(() => readSearchParam(params.businessName));
  const [businessAddress] = useState(() => readSearchParam(params.businessAddress));
  const [businessPhoneNumber] = useState(() => readSearchParam(params.businessPhoneNumber));
  const [city] = useState(() => readSearchParam(params.city));
  const [pinCode] = useState(() => readSearchParam(params.pinCode));
  const [draftValues, setDraftValues] = useState(() => ({
    businessName: readSearchParam(params.businessName),
    businessAddress: readSearchParam(params.businessAddress),
    businessPhoneNumber: readSearchParam(params.businessPhoneNumber),
    city: readSearchParam(params.city),
    pinCode: readSearchParam(params.pinCode),
  }));
  const [selectedItemsCategory, setSelectedItemsCategory] = useState<string[]>(() =>
    parseSearchArray(params.selectedItemsCategory)
  );
  const [selectedItemsSubCategory, setSelectedItemsSubCategory] = useState<string[]>(() =>
    parseSearchArray(params.selectedItemsSubCategory)
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(() =>
    parseSearchArray(params.selectedCategoryIds)
  );
  const [selectedSubCategoryIds, setSelectedSubCategoryIds] = useState<string[]>(() =>
    parseSearchArray(params.selectedSubCategoryIds)
  );

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

  useEffect(() => {
    setDraftValues({
      businessName: readSearchParam(params.businessName),
      businessAddress: readSearchParam(params.businessAddress),
      businessPhoneNumber: readSearchParam(params.businessPhoneNumber),
      city: readSearchParam(params.city),
      pinCode: readSearchParam(params.pinCode),
    });
  }, [params.businessName, params.businessAddress, params.businessPhoneNumber, params.city, params.pinCode]);

  const handleSubmit = () => {
    setalertBoxVisibility(!alertBoxVisibility);
  };

  const buildDraftParams = () => {
    return {
      name,
      number,
      radioState: paramState.radioState,
      profileImageUrl: readSearchParam(params.profileImageUrl),
      businessName: draftValues.businessName,
      businessAddress: draftValues.businessAddress,
      businessPhoneNumber: draftValues.businessPhoneNumber,
      city: draftValues.city,
      pinCode: draftValues.pinCode,
      selectedItemsCategory: JSON.stringify(selectedItemsCategory),
      selectedItemsSubCategory: JSON.stringify(selectedItemsSubCategory),
      selectedCategoryIds: JSON.stringify(selectedCategoryIds),
      selectedSubCategoryIds: JSON.stringify(selectedSubCategoryIds),
    };
  };

  const handleEdit = () => {
    router.replace({
      pathname: '/(auth)/personalProfile',
      params: buildDraftParams(),
    });
  };
  const handleApiCall = async () => {
    try {
      const retailerId = await secureStorage.getItem('userId');

      if (!retailerId) {
        console.log('Retailer ID missing');
        return;
      }

      // Read the Cloudinary URL saved during profile image upload
      const profileImageUrl = (await AsyncStorage.getItem('profileImage')) ?? '';

      const Retailer = {
        retailerId: retailerId,
        name: draftValues.businessName,
        address: draftValues.businessAddress,
        city: draftValues.city,
        pincode: draftValues.pinCode,
        contactNumber: draftValues.businessPhoneNumber,
        userType: paramState.radioState,
        profileImageUrl,
      };

      const Supplier = {
        supplierId: retailerId,
        name: draftValues.businessName,
        address: draftValues.businessAddress,
        city: draftValues.city,
        pincode: draftValues.pinCode,
        contactNumber: draftValues.businessPhoneNumber,
        categoryIds: selectedCategoryIds,       
        subCategoryIds: selectedSubCategoryIds, 
        userType: paramState.radioState,
        profileImageUrl,
      };

      await secureStorage.setItem('userType', paramState.radioState); 

      // Navigate after success
      if (paramState.radioState === 'Retailer') {
      console.log('Sending payload:', Retailer);
      const response = await createRetailerBusiness(Retailer);
      console.log('Retailer Created:', response);
        router.replace('/(retailer)/(tabs)/home');
      } else if (paramState.radioState === 'Supplier') {
        console.log('Sending payload:', Supplier);
        const response = await createSupplierBusiness(Supplier);
        console.log('Supplier Created:', response);
        router.replace('/(supplier)/(tabs)/dashboard');
      }
    } catch (error: any) {
      console.log('Retailer creation failed:', error.response?.data || error.message);
    }
  };


// Add these:
interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  subCategories: SubCategory[];  

}

const [categories, setCategories] = useState<Category[]>([]);
const [allSubCategories, setAllSubCategories] = useState<SubCategory[]>([]);

  // Subcategories filtered by selected categories
const filteredSubCategories = allSubCategories.filter((sub) =>
  selectedItemsCategory.map((name) => 
    categories.find((c) => c.name === name)?.id
  ).includes(sub.categoryId)
);

useEffect(() => {
  const fetchData = async () => {
    const [cats, subs] = await Promise.all([
      getCategories(),
      getSubCategories(),
    ]);
    setCategories(cats);
    setAllSubCategories(subs);
  };
  fetchData();
}, []);

  const toggleDropdownCategory = () => setIsCategoryVisible(!isCategoryVisible);
  const toggleDropdownSubCategory = () => setIsSubCategoryVisible(!isSubCategoryVisible);

const toggleItemCategory = (categoryName: string) => {
  const updatedCategories = selectedItemsCategory.includes(categoryName)
    ? selectedItemsCategory.filter((i) => i !== categoryName)
    : [...selectedItemsCategory, categoryName];

  setSelectedItemsCategory(updatedCategories);

  // Valid subcategory names from still-selected categories
  const validSubNames = categories
    .filter((cat) => updatedCategories.includes(cat.name))
    .flatMap((cat) => cat.subCategories.map((sub) => sub.name)); // ← nested, no allSubCategories

  // Remove subcategories that no longer belong
  setSelectedItemsSubCategory((prev) =>
    prev.filter((subName) => validSubNames.includes(subName))
  );
};
const toggleItemSubCategory = (subCategoryName: string) => {
  setSelectedItemsSubCategory((prev) =>
    prev.includes(subCategoryName)
      ? prev.filter((i) => i !== subCategoryName) // deselect
      : [...prev, subCategoryName]                // select
  );
};
  const insets = useSafeAreaInsets();

const confirmSelectionCategory = () => {
  // Always replace with exactly what's currently selected
  const categoryIds = categories
    .filter((cat) => selectedItemsCategory.includes(cat.name))
    .map((cat) => cat.id);

  setSelectedCategoryIds(categoryIds); // ← full replace, not addAll
  toggleDropdownCategory();
  console.log('Selected Category IDs:', categoryIds);
};

const confirmSelectionSubCategory = () => {
  const subCategoryIds = categories
    .flatMap((cat) => cat.subCategories)
    .filter((sub) => selectedItemsSubCategory.includes(sub.name))
    .map((sub) => sub.id);

  setSelectedSubCategoryIds(subCategoryIds); // ← full replace, not addAll
  toggleDropdownSubCategory();
  console.log('Selected SubCategory IDs:', subCategoryIds);
};
  return (
    <View className="bg-surface-page flex-1">
      <View className="mx-4 flex-1 bg-surface-page" style={{ paddingBottom: insets.bottom }}>
        <SafeAreaView>
          <Pressable
            onPress={() => {
              router.replace({
                pathname: '/(auth)/personalProfile',
                params: buildDraftParams(),
              });
            }}
          >
            <Image source={require('../../assets/images/arrow_back.png')}></Image>
          </Pressable>
        </SafeAreaView>
        <View className="flex-1">
          <Text className="text-heading-h5 font-primarysemibold text-text-headings">
            Business Profile
          </Text>
          <Formik
            initialValues={{
              businessName: draftValues.businessName,
              businessAddress: draftValues.businessAddress,
              businessPhoneNumber: draftValues.businessPhoneNumber,
              city: draftValues.city,
              pinCode: draftValues.pinCode,
              category: selectedItemsCategory,
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
              return (
                <View className="flex-1 justify-between">
                  <View className="mt-6">
                    <FormikTextInput
                      name="businessName"
                      fieldName="Business Name"
                      placeholder="Business name "
                      keyboardType="default"
                      value={draftValues.businessName}
                      onBlur={() => setFieldTouched("businessName", true)}
                      onChangeText={(text) => {
                          const sanitized = text.replace(/[^A-Za-z0-9 ]/g, '');
                          setDraftValues((prev) => ({
                            ...prev,
                            businessName: sanitized.trimStart(),
                          }));
                          setFieldValue("businessName", sanitized.trimStart());
                        }}
                    />
                    {errors.businessName && touched.businessName && (
                          <Text className="mt-1 text-text-error font-primarymedium text-sm">
                            {errors.businessName}
                          </Text>
                        )}
                    <FormikTextInput
                      name="businessAddress"
                      fieldName="Business Address"
                      placeholder="Business address "
                      keyboardType="default"
                      value={draftValues.businessAddress}
                      onBlur={handleBlur('businessAddress')}
                      onChangeText={(text) => {
                        const sanitized = text.replace(/[^A-Za-z0-9 ]/g, '');

                        setDraftValues((prev) => ({
                          ...prev,
                          businessAddress: sanitized.trimStart(),
                        }));

                        setFieldValue("businessAddress", sanitized.trimStart());
                      }}
                      
                    />
                    {errors.businessAddress && touched.businessAddress && (
                      <Text className="mt-1 text-text-error font-primarymedium text-sm">
                        {errors.businessAddress}
                      </Text>
                    )}
                    <View className="mt-6">
                      <View className="flex-row">
                        <Text
                          className={`${
                            errors.businessPhoneNumber ? 'text-text-error' : 'text-text-action'
                          } text-sm font-primarymedium`}
                        >
                          Business Phone number
                        </Text>
                        <Text className="text-sm font-primarymedium text-text-disabled">
                          {' '}
                          (optional)
                        </Text>
                      </View>
                      <View
                        className={`flex-row  border-xs px-[12] overflow-hidden bg-surface-pressed rounded-md ${
                          !touched.businessPhoneNumber
                            ? 'border-border-disabled'
                            : touched.businessPhoneNumber && errors.businessPhoneNumber
                              ? 'border-border-error'
                              : 'border-border-success'
                        }`}
                      >
                        <Text className="text-text-action mt-3.5 font-primarymedium ">+91</Text>
                        <TextInput
                          placeholder="Mobile number"
                          className="h-[44px] ml-4 w-full font-primary border-none focus:outline-none bg-surface-pressed "
                          placeholderTextColor={'#AAB2B8'}
                          onBlur={handleBlur('businessPhoneNumber')}
                          value={draftValues.businessPhoneNumber}
                          keyboardType="numeric"
                          onChangeText={(text) => {
                            const digitsOnly = text.replace(/[^0-9]/g, '');
                            setDraftValues((prev) => ({
                              ...prev,
                              businessPhoneNumber: digitsOnly,
                            }));
                            setFieldValue('businessPhoneNumber', digitsOnly);
                          }}
                          onFocus={() => setFieldTouched('businessPhoneNumber', true)}
                        ></TextInput>
                      </View>
                      {errors.businessPhoneNumber && touched.businessPhoneNumber && (
                        <Text className="mt-1 text-text-error font-primarymedium text-sm">
                          Phone number is not valid
                        </Text>
                      )}
                    </View>
                    <View className="mt-6 flex-row justify-between">
                      <View
                        style={{
                          marginTop: -22,
                          width: '49.5%',
                        }}
                      >
                        <FormikTextInput
                          name="city"
                          fieldName="City"
                          placeholder="City"
                          keyboardType="default"
                          value={draftValues.city}
                          onChangeText={(text) => {
                            const sanitized = text.replace(/[^a-zA-Z\s]/g, '');
                            setDraftValues((prev) => ({ ...prev, city: sanitized.trimStart() }));
                            return sanitized;
                          }}
                        ></FormikTextInput>
                      </View>
                      <View className="w-[49.5%]">
                        <View className="h-[22px] ">
                          <Text
                            className={`text-sm ${errors.pinCode && touched.pinCode ? 'text-text-error' : 'text-text-action'} font-primarymedium`}
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
                                ? '#AAB2B8'
                                : errors.pinCode
                                  ? '#F44336' // error color when touched and error exists
                                  : '#4CAF50',
                            }}
                            placeholderTextColor={
                              errors.pinCode && touched.pinCode ? '#F44336' : '#AAB2B8'
                            }
                            value={draftValues.pinCode}
                            onChangeText={(text) => {
                              const digitsOnly = text.replace(/[^0-9]/g, '');
                              setDraftValues((prev) => ({ ...prev, pinCode: digitsOnly }));
                              setFieldValue('pinCode', digitsOnly);
                            }}
                            onFocus={() => setFieldTouched('pinCode', true)}
                            onBlur={handleBlur('pinCode')}
                            keyboardType="numeric"
                          ></TextInput>
                        </View>
                        {errors.pinCode && touched.pinCode && (
                          <Text className="mt-1 text-text-error font-primarymedium text-sm">
                            Pincode is not valid
                          </Text>
                        )}
                      </View>
                    </View>
                    {(paramState.radioState === 'Supplier')&&(<View className="mt-6">
                      {/* Label */}
                      <Text className="text-sm text-text-success font-primarymedium">
                        Business Category
                      </Text>

                      {/* Dropdown Trigger */}
                      <TouchableOpacity
                        onPress={toggleDropdownCategory}
                        className={`border-xs rounded-md ${
                          selectedItemsCategory.length > 0
                            ? 'border-border-success'
                            : 'border-border-disabled'
                        }  bg-surface-pressed px-4 py-3 flex-row justify-between items-center`}
                      >
                        <Text
                          className={`${
                            selectedItemsCategory.length > 0
                              ? 'text-text-body'
                              : 'text-text-disabled'
                          }`}
                        >
                          {selectedItemsCategory.length > 0
                            ? selectedItemsCategory.join(', ')
                            : 'Business Category'}
                        </Text>
                        <View>
                          <AntDesign name="down" size={15} color="black" />
                        </View>
                      </TouchableOpacity>

                      {/* Modal Dropdown */}
                      <Modal
                        visible={isCategoryVisible}
                        transparent
                        animationType="fade"
                        onRequestClose={toggleDropdownCategory}
                      >
                        <Pressable
                          // onPress={toggleDropdownCategory}
                          className="flex-1 bg-black/40 justify-center px-4"
                        >
                          <View className="bg-surface-pressed rounded-xl p-4">
<FlatList
  data={categories}                        // ← was CategoryOptions
  keyExtractor={(item) => item.id}         // ← was item (string)
  renderItem={({ item }) => (
    <View className="flex-row items-center justify-between py-2">
      <View className="flex-row items-center">
        {item.name === 'Vegetable' ? (
          <Image source={require('../../assets/images/Vector.jpg')} />
        ) : (
          <Image source={require('../../assets/images/apple.jpg')} />
        )}
        <Text className="px-2 text-base text-text-body">{item.name}</Text>
      </View>
<Checkbox
  value={selectedItemsCategory.includes(item.name)}
  onValueChange={() => toggleItemCategory(item.name)}
/>
    </View>
  )}
/>

                            {/* Confirm Button */}
                            <TouchableOpacity
                              onPress={confirmSelectionCategory}
                              className="bg-success w-[50%] mx-auto rounded-md mt-4 py-3"
                            >
                              <Text className="text-text-on-action text-center font-medium">
                                Confirm
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </Pressable>
                      </Modal>
                    </View>)}
                     { (paramState.radioState === 'Supplier')&&(
                    <View className="mt-6">
                      {/* Label */}
                      <Text className="text-sm text-text-success font-primarymedium">
                        Business Subcategory
                      </Text>

                      {/* Dropdown Trigger */}
                      <TouchableOpacity
                        onPress={toggleDropdownSubCategory}
                        className={`border-xs rounded-md ${
                          selectedItemsSubCategory.length > 0
                            ? 'border-border-success'
                            : 'border-border-disabled'
                        }  bg-surface-pressed px-4 py-3 flex-row justify-between items-center`}
                      >
                        <Text
                          className={`${
                            selectedItemsSubCategory.length > 0
                              ? 'text-text-body'
                              : 'text-text-disabled'
                          }`}
                        >
                          {selectedItemsSubCategory.length > 0
                            ? selectedItemsSubCategory.join(', ')
                            : 'Business Subcategory'}
                        </Text>
                        <View>
                          <AntDesign name="down" size={15} color="black" />
                        </View>
                      </TouchableOpacity>

                      {/* Modal Dropdown */}
                      <Modal
                        visible={isSubCategoryVisible}
                        transparent
                        animationType="fade"
                        onRequestClose={toggleDropdownSubCategory}
                      >
                        <Pressable
                          // onPress={toggleDropdownSubCategory}
                          className="flex-1 bg-black/40 justify-center px-4"
                        >
                          <View className="bg-surface-pressed rounded-xl p-4">
<FlatList
  data={filteredSubCategories}              // ← was subCategoryOptions
  keyExtractor={(item) => item.id}          // ← was item (string)
  ListEmptyComponent={
    <Text className="text-center text-text-disabled py-4">
      Select a category first
    </Text>
  }
  renderItem={({ item }) => (
    <View className="flex-row items-center justify-between py-2">
      <View className="flex-row items-center">
        {item.name === 'Leafy' ? (
          <Image source={require('../../assets/images/Vector.jpg')} />
        ) : (
          <Image source={require('../../assets/images/apple.jpg')} />
        )}
        <Text className="text-base px-2 text-text-body">{item.name}</Text>
      </View>
<Checkbox
  value={selectedItemsSubCategory.includes(item.name)}
  onValueChange={() => toggleItemSubCategory(item.name)}
/>
    </View>
  )}
/>

                            {/* Confirm Button */}
                            <TouchableOpacity
                              onPress={confirmSelectionSubCategory}
                              className="bg-success w-[50%] mx-auto rounded-md mt-4 py-3"
                            >
                              <Text className="text-text-on-action text-center font-medium">
                                Confirm
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </Pressable>
                      </Modal>
                    </View>)}
                  </View>
                  <View>
                    <Pressable
                      className="justify-center  rounded-[12px] items-center h-[60] "
                     disabled={
  !isValid ||
  (paramState.radioState === 'Supplier' &&
    (selectedItemsCategory.length === 0 ||
     selectedItemsSubCategory.length === 0))
}
                      style={{
                        backgroundColor:
                  isValid &&
(paramState.radioState !== 'Supplier' ||
 (selectedItemsCategory.length > 0 &&
  selectedItemsSubCategory.length > 0))
                            ? '#4CAF50'
                            : '#E0E0E0',
                      }}
                      onPress={() => handleSubmit()}
                    >
                      <Text
                        className="text-[20px]  font-primarysemibold"
                        style={{
                          color:
                             isValid &&
(paramState.radioState !== 'Supplier' ||
 (selectedItemsCategory.length > 0 &&
  selectedItemsSubCategory.length > 0))
                              ? '#F3FAF3'
                              : '#AAB2B8',
                        }}
                      >
                        Continue
                      </Text>
                    </Pressable>
                  </View>
                  <Modal visible={alertBoxVisibility} animationType="fade" transparent>
                    <View className="h-1/2 my-auto">
                      <View className="justify-between bg-surface-page border-xs rounded-lg px-3 mx-4 my-auto  h-2/3">
                        <Image
                          source={require('../../assets/images/mingcute_warning-line.png')}
                          className="mx-auto -mt-4"
                        ></Image>
                        <View>
                          <Text className="text-text-disabled font-primarymedium">
                            Once you click{' '}
                            <Text className="text-text-headings font-primarysemibold">Confirm</Text>
                            , your account type{' '}
                            <Text className="text-text-headings font-primarysemibold">
                              {paramState.radioState.toUpperCase()}
                            </Text>{' '}
                            will be locked and cannot be changed after registration.{' '}
                          </Text>
                          <Text className="mt-3 text-text-disabled font-primarymedium">
                            Please review your details before proceeding.
                          </Text>
                        </View>
                        <View className="flex-row my-4 ">
                          <Pressable className="w-1/2" onPress={handleEdit}>
                            <View className="p-2">
                              <Text className="mx-auto">Edit</Text>
                            </View>
                          </Pressable>

                          <Pressable className="w-1/2" onPress={handleApiCall}>
                            <View className="bg-orange-500 border-none rounded-lg p-2">
                              <Text className="text-text-on-action my-auto mx-auto">Confirm</Text>
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

export default BusinessScreen;
