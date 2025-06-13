// app/(app)/tasks/form.tsx
import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Switch,
    Text,
    TextInput,
    Dimensions,
    TouchableOpacity,
    Image,
    FlatList,
    StyleSheet,
    Modal,
    Platform,
    Alert,
} from "react-native";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { useNavigation, useRoute } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { router } from 'expo-router';
import { useAuthStore } from "../../../src/store/authStore";
import { useTasksStore } from "../../../src/store/tasksStore";
import { taskService } from "../../../src/lib/appwrite";
import { theme } from "../../../src/styles";
import { LoadingSpinner } from "../../../src/components/ui";
import type { NavigationProps, Suggestion, TaskFormData } from "../../../src/types";

// Asset mapping for icons
const assetMap: Record<string, any> = {
    '24 hours': require("../../../assets/images/24 hours.png"),
    'bag': require("../../../assets/images/bag.png"),
    'bellring': require("../../../assets/images/bellring.png"),
    'burger': require("../../../assets/images/burger.png"),
    'call': require("../../../assets/images/call.png"),
    'car': require("../../../assets/images/car.png"),
    'cheers': require("../../../assets/images/cheers.png"),
    'chef': require("../../../assets/images/chef.png"),
    'cart': require("../../../assets/images/cart.png"),
    'computer': require("../../../assets/images/computer.png"),
    'cycle': require("../../../assets/images/cycle.png"),
    'doctor': require("../../../assets/images/doctor.png"),
    'email': require("../../../assets/images/email.png"),
    'food': require("../../../assets/images/food.png"),
    'game': require("../../../assets/images/game.png"),
    'grad': require("../../../assets/images/grad.png"),
    'guitar': require("../../../assets/images/guitar.png"),
    'gym': require("../../../assets/images/gym.png"),
    'heart': require("../../../assets/images/heart.png"),
    'home': require("../../../assets/images/home.png"),
    'paint': require("../../../assets/images/paint.png"),
    'pet': require("../../../assets/images/pet.png"),
    'pizza': require("../../../assets/images/pizza.png"),
    'profile': require("../../../assets/images/profile.png"),
    'ringbell': require("../../../assets/images/ringbell.png"),
    'shopping': require("../../../assets/images/shopping.png"),
    'video': require("../../../assets/images/video.png"),
    'tea': require("../../../assets/images/tea.png"),
};

type IconName =
    | "24 hours"
    | "bag"
    | "bellring"
    | "burger"
    | "call"
    | "car"
    | "cheers"
    | "chef"
    | "cart"
    | "computer"
    | "cycle"
    | "doctor"
    | "email"
    | "food"
    | "game"
    | "grad"
    | "guitar"
    | "gym"
    | "heart"
    | "home"
    | "paint"
    | "pet"
    | "pizza"
    | "profile"
    | "ringbell"
    | "shopping"
    | "video"
    | "tea";

const iconImages: Record<IconName, { imageSource: any; fileId: string | null }> = {
    "24 hours": { imageSource: assetMap['24 hours'], fileId: null },
    bag: { imageSource: assetMap['bag'], fileId: null },
    bellring: { imageSource: assetMap['bellring'], fileId: null },
    burger: { imageSource: assetMap['burger'], fileId: null },
    call: { imageSource: assetMap['call'], fileId: null },
    car: { imageSource: assetMap['car'], fileId: null },
    cheers: { imageSource: assetMap['cheers'], fileId: null },
    chef: { imageSource: assetMap['chef'], fileId: null },
    cart: { imageSource: assetMap['cart'], fileId: null },
    computer: { imageSource: assetMap['computer'], fileId: null },
    cycle: { imageSource: assetMap['cycle'], fileId: null },
    doctor: { imageSource: assetMap['doctor'], fileId: null },
    email: { imageSource: assetMap['email'], fileId: null },
    food: { imageSource: assetMap['food'], fileId: null },
    game: { imageSource: assetMap['game'], fileId: null },
    grad: { imageSource: assetMap['grad'], fileId: null },
    guitar: { imageSource: assetMap['guitar'], fileId: null },
    gym: { imageSource: assetMap['gym'], fileId: null },
    heart: { imageSource: assetMap['heart'], fileId: null },
    home: { imageSource: assetMap['home'], fileId: null },
    paint: { imageSource: assetMap['paint'], fileId: null },
    pet: { imageSource: assetMap['pet'], fileId: null },
    pizza: { imageSource: assetMap['pizza'], fileId: null },
    profile: { imageSource: assetMap['profile'], fileId: null },
    ringbell: { imageSource: assetMap['ringbell'], fileId: null },
    shopping: { imageSource: assetMap['shopping'], fileId: null },
    video: { imageSource: assetMap['video'], fileId: null },
    tea: { imageSource: assetMap['tea'], fileId: null },
};

const availableIcons: IconItem[] = [
    { id: "8", iconName: "24 hours", name: "24 Hours", imageSource: iconImages["24 hours"].imageSource, fileId: iconImages["24 hours"].fileId },
    { id: "9", iconName: "bag", name: "Bag", imageSource: iconImages["bag"].imageSource, fileId: iconImages["bag"].fileId },
    { id: "10", iconName: "bellring", name: "Bell Ring", imageSource: iconImages["bellring"].imageSource, fileId: iconImages["bellring"].fileId },
    { id: "11", iconName: "burger", name: "Burger", imageSource: iconImages["burger"].imageSource, fileId: iconImages["burger"].fileId },
    { id: "12", iconName: "call", name: "Call", imageSource: iconImages["call"].imageSource, fileId: iconImages["call"].fileId },
    { id: "13", iconName: "car", name: "Car", imageSource: iconImages["car"].imageSource, fileId: iconImages["car"].fileId },
    { id: "14", iconName: "cheers", name: "Cheers", imageSource: iconImages["cheers"].imageSource, fileId: iconImages["cheers"].fileId },
    { id: "15", iconName: "chef", name: "Chef", imageSource: iconImages["chef"].imageSource, fileId: iconImages["chef"].fileId },
    { id: "16", iconName: "cart", name: "Cart", imageSource: iconImages["cart"].imageSource, fileId: iconImages["cart"].fileId },
    { id: "17", iconName: "computer", name: "Computer", imageSource: iconImages["computer"].imageSource, fileId: iconImages["computer"].fileId },
    { id: "18", iconName: "cycle", name: "Cycle", imageSource: iconImages["cycle"].imageSource, fileId: iconImages["cycle"].fileId },
    { id: "19", iconName: "doctor", name: "Doctor", imageSource: iconImages["doctor"].imageSource, fileId: iconImages["doctor"].fileId },
    { id: "20", iconName: "email", name: "Email", imageSource: iconImages["email"].imageSource, fileId: iconImages["email"].fileId },
    { id: "21", iconName: "food", name: "Food", imageSource: iconImages["food"].imageSource, fileId: iconImages["food"].fileId },
    { id: "22", iconName: "game", name: "Game", imageSource: iconImages["game"].imageSource, fileId: iconImages["game"].fileId },
    { id: "23", iconName: "grad", name: "Graduation", imageSource: iconImages["grad"].imageSource, fileId: iconImages["grad"].fileId },
    { id: "24", iconName: "guitar", name: "Guitar", imageSource: iconImages["guitar"].imageSource, fileId: iconImages["guitar"].fileId },
    { id: "25", iconName: "gym", name: "Gym", imageSource: iconImages["gym"].imageSource, fileId: iconImages["gym"].fileId },
    { id: "26", iconName: "heart", name: "Heart", imageSource: iconImages["heart"].imageSource, fileId: iconImages["heart"].fileId },
    { id: "27", iconName: "home", name: "Home", imageSource: iconImages["home"].imageSource, fileId: iconImages["home"].fileId },
    { id: "28", iconName: "paint", name: "Paint", imageSource: iconImages["paint"].imageSource, fileId: iconImages["paint"].fileId },
    { id: "29", iconName: "pet", name: "Pet", imageSource: iconImages["pet"].imageSource, fileId: iconImages["pet"].fileId },
    { id: "30", iconName: "pizza", name: "Pizza", imageSource: iconImages["pizza"].imageSource, fileId: iconImages["pizza"].fileId },
    { id: "31", iconName: "profile", name: "Profile", imageSource: iconImages["profile"].imageSource, fileId: iconImages["profile"].fileId },
    { id: "32", iconName: "ringbell", name: "Ring Bell", imageSource: iconImages["ringbell"].imageSource, fileId: iconImages["ringbell"].fileId },
    { id: "33", iconName: "shopping", name: "Shopping", imageSource: iconImages["shopping"].imageSource, fileId: iconImages["shopping"].fileId },
    { id: "34", iconName: "video", name: "Video", imageSource: iconImages["video"].imageSource, fileId: iconImages["video"].fileId },
    { id: "35", iconName: "tea", name: "Tea", imageSource: iconImages["tea"].imageSource, fileId: iconImages["tea"].fileId },
];

const { width, height } = Dimensions.get("window");

const FIGMA_WIDTH = 412;
const FIGMA_HEIGHT = 917;

interface FormState {
    title: string;
    selectedDate: Date;
    isAllDay: boolean;
    repeatOption: string;
}

interface IconItem {
    id: string;
    name: string;
    iconName: IconName;
    imageSource: any;
    fileId: string | null;
}

export default function TaskFormScreen() {
    const navigation = useNavigation<NavigationProps>();
    const { user } = useAuthStore();
    const { suggestions, fetchSuggestions, createTask } = useTasksStore();

    const [activeTab, setActiveTab] = useState<"Daily" | "Personal">("Daily");
    const [dailyForm, setDailyForm] = useState<FormState>({
        title: "",
        selectedDate: new Date(),
        isAllDay: true,
        repeatOption: "Does not repeat",
    });
    const [personalForm, setPersonalForm] = useState<FormState>({
        title: "",
        selectedDate: new Date(),
        isAllDay: true,
        repeatOption: "Does not repeat",
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showRepeatDropdown, setShowRepeatDropdown] = useState(false);
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dailySelectedIcon, setDailySelectedIcon] = useState<IconName | null>(null);
    const [personalSelectedIcon, setPersonalSelectedIcon] = useState<IconName | null>(null);
    const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
    const titleInputRef = useRef<TextInput>(null);

    const repeatOptions = ["Does not repeat", "Daily", "Weekly", "Monthly", "Yearly"];

    useEffect(() => {
        if (user?.$id) {
            fetchSuggestions(user.$id);
        }
    }, [user?.$id, fetchSuggestions]);

    const currentForm = activeTab === "Daily" ? dailyForm : personalForm;
    const setCurrentForm = activeTab === "Daily" ? setDailyForm : setPersonalForm;
    const selectedIcon = activeTab === "Daily" ? dailySelectedIcon : personalSelectedIcon;
    const setSelectedIcon = activeTab === "Daily" ? setDailySelectedIcon : setPersonalSelectedIcon;

    const onDateChange = (event: any, newDate?: Date) => {
        setShowDatePicker(false);
        if (newDate) setCurrentForm((prev) => ({ ...prev, selectedDate: newDate }));
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatDateForBackend = (date: Date) => date.toISOString();

    const selectRepeatOption = (option: string) => {
        setCurrentForm((prev) => ({ ...prev, repeatOption: option }));
        setShowRepeatDropdown(false);
    };

    const selectIcon = (icon: IconItem) => {
        setSelectedIcon(icon.iconName);
        setUploadedFileId(icon.fileId);
        setShowIconPicker(false);
    };

    const completeSuggestion = (suggestionId: string) => {
        const selectedSuggestion = suggestions.find((s) => s.$id === suggestionId);
        if (selectedSuggestion) {
            setCurrentForm((prev) => ({ ...prev, title: selectedSuggestion.title }));
        }
    };

    const skipSuggestion = (suggestionId: string) => {
        console.log(`Suggestion ${suggestionId} skipped`);
    };

    const handleSubmit = async () => {
        if (!user?.$id) {
            Alert.alert("Error", "User not authenticated");
            return;
        }

        if (!currentForm.title) {
            Alert.alert("Error", "Please enter a task title.");
            return;
        }

        if (!selectedIcon) {
            Alert.alert("Error", "Please select an icon for the task.");
            return;
        }

        setLoading(true);
        try {
            let fileId = uploadedFileId;

            // If no fileId, upload the icon
            if (!fileId && selectedIcon) {
                const iconItem = availableIcons.find(icon => icon.iconName === selectedIcon);
                if (iconItem) {
                    // For now, we'll use a placeholder fileId
                    // In a real app, you'd upload the actual image
                    fileId = `icon_${selectedIcon}_${Date.now()}`;
                    setUploadedFileId(fileId);
                }
            }

            // Create the task
            const taskData = {
                category_type: activeTab,
                Title: currentForm.title,
                icon: fileId,
                userId: user.$id,
                isFavorite: false,
                status: 'active',
                points: 5,
            };

            await createTask(taskData);

            // Create task detail if needed
            const taskDetailData = {
                Date: formatDateForBackend(currentForm.selectedDate),
                All_day: currentForm.isAllDay,
                Recurrence_type: currentForm.repeatOption,
                userId: user.$id,
            };

            Alert.alert("Success", "Task created successfully!");

            // Reset form
            if (activeTab === "Daily") {
                setDailyForm({
                    title: "",
                    selectedDate: new Date(),
                    isAllDay: true,
                    repeatOption: "Does not repeat",
                });
                setDailySelectedIcon(null);
            } else {
                setPersonalForm({
                    title: "",
                    selectedDate: new Date(),
                    isAllDay: true,
                    repeatOption: "Does not repeat",
                });
                setPersonalSelectedIcon(null);
            }
            setUploadedFileId(null);

            // Navigate back
            router.back();
        } catch (error: any) {
            console.error("Submit error:", error);
            Alert.alert("Error", `Failed to create task: ${error.message || "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    const openIconPicker = () => {
        setShowIconPicker(true);
    };

    const renderLeftActions = (progress: any, dragX: any, id: string, isSuggestion: boolean = false) => {
        return (
            <View
                style={[
                    styles.leftActionsContainer,
                    activeTab === "Daily" ? styles.leftActionsContainerDaily : styles.leftActionsContainerPersonal,
                ]}
            >
                <View style={styles.leftActions}>
                    <TouchableOpacity
                        style={styles.skipButton}
                        onPress={() => skipSuggestion(id)}
                    >
                        <Text style={styles.actionText}>Skip</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.completeButton}
                        onPress={() => completeSuggestion(id)}
                    >
                        <Text style={styles.actionText}>✓</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderSuggestion = ({ item }: { item: Suggestion }) => {
        const iconSource = item.icon && typeof item.icon === 'string' && item.icon.trim() !== ''
            ? { uri: `https://cloud.appwrite.io/v1/storage/buckets/67e227bf00075deadffc/files/${item.icon}/view?project=67cfa24f0031e006fba3` }
            : require("../../../assets/images/Waterdrop.png");

        return (
            <Swipeable renderLeftActions={(progress, dragX) => renderLeftActions(progress, dragX, item.$id, true)}>
                <View style={styles.taskWrapper}>
                    <TouchableOpacity
                        style={activeTab === "Daily" ? styles.taskbutton : styles.taskbuttonPersonal}
                        onPress={() => completeSuggestion(item.$id)}
                    >
                        <View
                            style={[
                                styles.taskIconContainer,
                                activeTab === "Daily" ? styles.taskIconContainerDaily : styles.taskIconContainerPersonal,
                            ]}
                        >
                            <Image
                                source={iconSource}
                                style={styles.taskIcon}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.taskText}>{item.title}</Text>
                        <Text style={styles.points}>{item.points || 5}</Text>
                        <Image source={require("../../../assets/images/Waterdrop.png")} style={styles.drop} />
                    </TouchableOpacity>
                </View>
            </Swipeable>
        );
    };

    const renderIcon = ({ item }: { item: IconItem }) => {
        return (
            <TouchableOpacity style={styles.iconPickerItem} onPress={() => selectIcon(item)}>
                <View style={styles.iconPickerWrapper}>
                    <Image
                        source={item.imageSource}
                        style={styles.iconPickerImage}
                        resizeMode="contain"
                    />
                </View>
            </TouchableOpacity>
        );
    };

    if (!user) {
        return (
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={styles.containerDaily}>
                    <Text style={styles.loadingText}>User not authenticated. Please log in.</Text>
                </View>
            </GestureHandlerRootView>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={activeTab === "Daily" ? styles.containerDaily : styles.containerPersonal}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.headerButton}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>New Task</Text>
                    <TouchableOpacity onPress={handleSubmit} disabled={loading}>
                        <Text style={[styles.headerButton, loading && styles.disabledText]}>
                            {loading ? "Saving..." : "Save"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Container */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === "Daily" && styles.activeTabDaily]}
                        onPress={() => setActiveTab("Daily")}
                    >
                        <Text style={[styles.tabText, activeTab === "Daily" && styles.activeTabTextDaily]}>Daily</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === "Personal" && styles.activeTabPersonal]}
                        onPress={() => setActiveTab("Personal")}
                    >
                        <Text style={[styles.tabText, activeTab === "Personal" && styles.activeTabTextPersonal]}>Personal</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.contentWrapper}>
                    <View style={styles.largeblock}>
                        {/* All Day Toggle */}
                        <View style={styles.allDayContainer}>
                            <Image source={require("../../../assets/images/Clock.png")} style={styles.clock} />
                            <Text style={styles.day}>All-day</Text>
                            <Switch
                                trackColor={{ false: theme.colors.primary[900], true: theme.colors.primary[900] }}
                                thumbColor="#B4E49E"
                                ios_backgroundColor={theme.colors.primary[900]}
                                value={currentForm.isAllDay}
                                onValueChange={(value) => setCurrentForm((prev) => ({ ...prev, isAllDay: value }))}
                                style={styles.allDaySwitch}
                            />
                        </View>

                        {/* Date Picker */}
                        <TouchableOpacity style={styles.dateContainer} onPress={() => setShowDatePicker(true)}>
                            <Image source={require("../../../assets/images/calendar_month.png")} style={styles.calendar} />
                            <Text style={styles.date}>{formatDate(currentForm.selectedDate)}</Text>
                            <Image source={require("../../../assets/images/Down arrow.png")} style={styles.downarrow} />
                        </TouchableOpacity>

                        {/* Repeat Option */}
                        <TouchableOpacity style={styles.repeatContainer} onPress={() => setShowRepeatDropdown(true)}>
                            <Image source={require("../../../assets/images/Repeat.png")} style={styles.loop} />
                            <Text style={styles.repeat}>{currentForm.repeatOption}</Text>
                            <Image source={require("../../../assets/images/Down arrow.png")} style={styles.downarrow2} />
                        </TouchableOpacity>

                        {/* Icon Selection */}
                        <TouchableOpacity style={styles.iconchange} onPress={openIconPicker}>
                            <Image
                                source={
                                    selectedIcon
                                        ? iconImages[selectedIcon].imageSource
                                        : require("../../../assets/images/Waterdrop.png")
                                }
                                style={styles.selectedIcon}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.iconplus} onPress={openIconPicker} disabled={loading}>
                            <Image source={require("../../../assets/images/wplus.png")} style={[styles.plus, loading && styles.disabledImage]} />
                        </TouchableOpacity>

                        {/* Title Input */}
                        <View style={styles.titlespace}>
                            <TextInput
                                ref={titleInputRef}
                                style={styles.titleInput}
                                value={currentForm.title}
                                onChangeText={(text) => setCurrentForm((prev) => ({ ...prev, title: text }))}
                                placeholderTextColor={theme.colors.primary[900]}
                            />
                            {!currentForm.title && (
                                <TouchableOpacity style={styles.placeholderOverlay} onPress={() => titleInputRef.current?.focus()}>
                                    <Text style={styles.titlePlaceholder}>Add title</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Suggestions */}
                    <View style={styles.suggestionblock}>
                        <Text style={styles.sectionHeader}>Suggestions</Text>
                        <FlatList
                            data={suggestions.filter((s) => s.category_type.toLowerCase() === activeTab.toLowerCase())}
                            renderItem={renderSuggestion}
                            keyExtractor={(item) => item.$id}
                            contentContainerStyle={styles.suggestionScrollContent}
                            showsVerticalScrollIndicator={true}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>No suggestions available for {activeTab}</Text>
                            }
                        />
                    </View>

                    {/* Search Button */}
                    <TouchableOpacity style={styles.mglass} onPress={() => console.log("Search pressed")}>
                        <Image source={require("../../../assets/images/MagnifyingGlass.png")} style={styles.glassicon} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Date Picker Modal */}
            <Modal visible={showDatePicker} transparent={true} animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowDatePicker(false)}>
                    <View style={styles.datePickerContainer}>
                        <DateTimePicker
                            value={currentForm.selectedDate}
                            mode="date"
                            display={Platform.OS === "ios" ? "inline" : "calendar"}
                            onChange={onDateChange}
                            style={styles.datePicker}
                            textColor={theme.colors.primary[900]}
                            accentColor="#78A88A"
                        />
                        {Platform.OS === "ios" && (
                            <TouchableOpacity style={styles.closeButton} onPress={() => setShowDatePicker(false)}>
                                <Text style={styles.closeButtonText}>Done</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Repeat Options Modal */}
            <Modal
                visible={showRepeatDropdown}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowRepeatDropdown(false)}
            >
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowRepeatDropdown(false)}>
                    <View style={styles.repeatDropdown}>
                        {repeatOptions.map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={styles.repeatOption}
                                onPress={() => selectRepeatOption(option)}
                            >
                                <Text style={styles.repeatOptionText}>{option}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Icon Picker Modal */}
            <Modal visible={showIconPicker} transparent={true} animationType="slide" onRequestClose={() => setShowIconPicker(false)}>
                <TouchableOpacity style={styles.iconPickerModalContainer} activeOpacity={1} onPress={() => setShowIconPicker(false)}>
                    <View style={styles.iconPickerModalContent} onStartShouldSetResponder={() => true}>
                        <Text style={styles.iconPickerTitle}>Choose an Icon</Text>
                        <FlatList
                            data={availableIcons}
                            renderItem={renderIcon}
                            keyExtractor={(item) => item.id}
                            numColumns={3}
                            contentContainerStyle={styles.iconPickerList}
                        />
                        <TouchableOpacity style={styles.iconPickerCloseButton} onPress={() => setShowIconPicker(false)}>
                            <Text style={styles.iconPickerCloseButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {loading && (
                <View style={styles.loadingOverlay}>
                    <LoadingSpinner message="Creating task..." />
                </View>
            )}
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    containerDaily: {
        flex: 1,
        backgroundColor: "#B3CCA4"
    },
    containerPersonal: {
        flex: 1,
        backgroundColor: "#68A1A1"
    },
    loadingText: {
        fontFamily: theme.typography.fonts.primary,
        fontSize: 16,
        color: theme.colors.primary[900],
        textAlign: "center",
        marginTop: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerButton: {
        fontSize: 16,
        color: theme.colors.primary[900],
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.medium,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.primary[900],
    },
    disabledText: {
        opacity: 0.6,
    },
    tabContainer: {
        flexDirection: "row",
        marginTop: (20 / FIGMA_HEIGHT) * height,
        marginLeft: (40 / FIGMA_WIDTH) * width,
        zIndex: 10,
    },
    tabButton: {
        width: (65 / FIGMA_WIDTH) * width,
        height: (32 / FIGMA_HEIGHT) * height,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        borderColor: theme.colors.primary[900],
        borderWidth: (0.69 / FIGMA_WIDTH) * width,
        marginRight: (13 / FIGMA_WIDTH) * width,
    },
    activeTabDaily: {
        backgroundColor: "#78A88A",
        borderWidth: 0
    },
    activeTabPersonal: {
        backgroundColor: "#78A88A",
        borderWidth: 0
    },
    tabText: {
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.bold,
        fontSize: 14,
        color: theme.colors.primary[900]
    },
    activeTabTextDaily: {
        color: "#FFFFFF"
    },
    activeTabTextPersonal: {
        color: "#FFFFFF"
    },
    contentWrapper: {
        flex: 1,
        marginTop: (20 / FIGMA_HEIGHT) * height,
        marginLeft: (29 / FIGMA_WIDTH) * width,
        marginRight: (29 / FIGMA_WIDTH) * width,
    },
    largeblock: {
        width: (354 / FIGMA_WIDTH) * width,
        height: (465 / FIGMA_HEIGHT) * height,
        backgroundColor: theme.colors.primary[100],
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
        position: "absolute",
        top: 0,
        left: 0,
    },
    allDayContainer: {
        flexDirection: "row",
        alignItems: "center",
        position: "absolute",
        top: (262 / FIGMA_HEIGHT) * height,
        left: (31 / FIGMA_WIDTH) * width,
        width: (300 / FIGMA_WIDTH) * width,
        justifyContent: "space-between",
    },
    clock: {
        resizeMode: "contain",
        width: (25.07 / FIGMA_WIDTH) * width,
        height: (25.07 / FIGMA_HEIGHT) * height,
    },
    day: {
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.medium,
        fontSize: 14,
        color: theme.colors.primary[900],
        marginLeft: (10 / FIGMA_WIDTH) * width,
        marginRight: (150 / FIGMA_WIDTH) * width,
    },
    allDaySwitch: {
        transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
        marginRight: (10 / FIGMA_WIDTH) * width,
    },
    dateContainer: {
        flexDirection: "row",
        alignItems: "center",
        position: "absolute",
        top: (312 / FIGMA_HEIGHT) * height,
        left: (31 / FIGMA_WIDTH) * width,
    },
    calendar: {
        resizeMode: "contain",
        width: (25.07 / FIGMA_WIDTH) * width,
        height: (25.07 / FIGMA_HEIGHT) * height,
    },
    date: {
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.black,
        fontSize: 20,
        color: theme.colors.primary[900],
        marginLeft: (10 / FIGMA_WIDTH) * width,
    },
    downarrow: {
        resizeMode: "contain",
        width: (12 / FIGMA_WIDTH) * width,
        height: (12 / FIGMA_HEIGHT) * height,
        marginLeft: (10 / FIGMA_WIDTH) * width,
    },
    // Add other missing styles here as needed
});