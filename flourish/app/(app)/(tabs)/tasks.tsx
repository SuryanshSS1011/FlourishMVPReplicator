// app/(app)/(tabs)/tasks.tsx
import React, { useState, useCallback } from "react";
import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import {
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    Image,
    SectionList,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Animated,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { Swipeable } from "react-native-gesture-handler";
import { useAuthStore } from "../../../src/store/authStore";
import { useTasksStore } from "../../../src/store/tasksStore";
import { theme } from "../../../src/styles";
import { LoadingSpinner } from "../../../src/components/ui";
import type { Task, NavigationProps } from "../../../src/types";

const { width, height } = Dimensions.get("window");

const FIGMA_WIDTH = 412;
const FIGMA_HEIGHT = 917;

type TabType = "favorite" | "active" | "completed";

const getTaskIconUrl = (fileId: string | null) => {
    if (!fileId || fileId.trim() === "") {
        return "https://via.placeholder.com/150";
    }
    return `https://cloud.appwrite.io/v1/storage/buckets/67e227bf00075deadffc/files/${fileId}/view?project=67cfa24f0031e006fba3`;
};

export default function TasksScreen() {
    const navigation = useNavigation<NavigationProps>();
    const { user } = useAuthStore();
    const {
        tasks,
        loading,
        error,
        fetchTasks,
        updateTask,
        deleteTask,
        toggleFavorite,
        markCompleted
    } = useTasksStore();

    const [activeTab, setActiveTab] = useState<TabType>("active");

    useFocusEffect(
        useCallback(() => {
            if (user?.$id) {
                fetchTasks(user.$id);
            }
        }, [user?.$id, fetchTasks])
    );

    const handleRefresh = async () => {
        if (user?.$id) {
            await fetchTasks(user.$id);
        }
    };

    const handleToggleFavorite = async (taskId: string, currentFavorite: boolean) => {
        try {
            await toggleFavorite(taskId);
        } catch (err: any) {
            Alert.alert("Error", "Failed to update favorite status");
        }
    };

    const handleMarkTaskCompleted = async (taskId: string) => {
        try {
            await markCompleted(taskId);
        } catch (err: any) {
            Alert.alert("Error", "Failed to mark task as completed");
        }
    };

    const handleSkipTask = async (taskId: string) => {
        try {
            await updateTask(taskId, { status: "skipped" });
        } catch (err: any) {
            Alert.alert("Error", "Failed to skip task");
        }
    };

    const handleDeleteTask = async (taskId: string, taskTitle: string) => {
        Alert.alert(
            "Delete Task",
            `Are you sure you want to delete "${taskTitle}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteTask(taskId);
                            Alert.alert("Success", "Task deleted successfully");
                        } catch (err: any) {
                            Alert.alert("Error", "Failed to delete task");
                        }
                    },
                },
            ]
        );
    };

    const renderLeftActions = (
        progress: Animated.AnimatedInterpolation<number>,
        dragX: Animated.AnimatedInterpolation<number>,
        taskId: string,
        taskTitle: string,
        categoryType: string
    ) => {
        const trans = dragX.interpolate({
            inputRange: [0, 200],
            outputRange: [0, -130],
            extrapolate: "clamp",
        });

        const backgroundColor = "#C7C7CC";

        return (
            <View style={[styles.leftActionsContainer, { backgroundColor }]}>
                <Animated.View style={[styles.leftActions, { transform: [{ translateX: trans }] }]}>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteTask(taskId, taskTitle)}
                        accessibilityLabel="Delete task"
                        accessibilityRole="button"
                    >
                        <Image
                            source={require("../../../assets/images/bag.png")}
                            style={styles.actionIcon}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.completeButton}
                        onPress={() => handleMarkTaskCompleted(taskId)}
                        accessibilityLabel="Mark task as completed"
                        accessibilityRole="button"
                    >
                        <Text style={styles.actionText}>✓</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        );
    };

    const getTaskStyles = (tab: TabType) => ({
        taskButtonStyle: tab === "completed" ? styles.completedTaskButton : null,
        taskIconContainerStyle: tab === "completed" ? styles.completedTaskIconContainer : null,
        textStyle: tab === "completed" ? styles.completedText : null,
    });

    const renderTasks = () => {
        if (!tasks || !Array.isArray(tasks)) {
            return <Text style={styles.emptyText}>No tasks available</Text>;
        }

        const filteredTasks = tasks.filter((task) => {
            const isFavorite = task.isFavorite || false;
            const status = task.status || "active";

            if (activeTab === "favorite") {
                return isFavorite;
            }
            if (activeTab === "active") {
                return status !== "completed" && status !== "skipped";
            }
            if (activeTab === "completed") {
                return status === "completed";
            }
            return false;
        });

        if (activeTab === "active") {
            const dailyTasks = filteredTasks.filter((task) =>
                task.category_type?.toLowerCase().trim() === "daily"
            );
            const personalTasks = filteredTasks.filter((task) =>
                task.category_type?.toLowerCase().trim() === "personal"
            );

            const sections = [
                {
                    title: "Daily Tasks",
                    data: dailyTasks,
                },
                {
                    title: "Personal Tasks",
                    data: personalTasks,
                },
            ];

            const taskStyles = getTaskStyles(activeTab);

            return (
                <SectionList
                    sections={sections}
                    keyExtractor={(item) => item.$id}
                    renderItem={({ item, section }) => {
                        const taskBackgroundColor = section.title === "Daily Tasks" ? "#68A1A1" : "#78A88A";
                        const iconSource = item.icon && typeof item.icon === 'string' && item.icon.trim() !== ''
                            ? { uri: getTaskIconUrl(item.icon) }
                            : require("../../../assets/images/Waterdrop.png");

                        return (
                            <Swipeable
                                renderLeftActions={(progress, dragX) =>
                                    renderLeftActions(progress, dragX, item.$id, item.Title, item.category_type)
                                }
                                overshootLeft={false}
                                overshootRight={false}
                                friction={2}
                            >
                                <View style={styles.taskWrapper}>
                                    <TouchableOpacity
                                        style={[styles.taskbutton, taskStyles.taskButtonStyle, { backgroundColor: taskBackgroundColor }]}
                                        onPress={() => console.log(`${item.Title} task pressed`)}
                                        accessibilityLabel={`Task: ${item.Title}`}
                                        accessibilityRole="button"
                                    >
                                        <View style={[styles.t1image, taskStyles.taskIconContainerStyle, {
                                            backgroundColor: taskBackgroundColor === "#68A1A1" ? "#78A88A" : "#68A1A1"
                                        }]}>
                                            <Image
                                                source={iconSource}
                                                style={styles.taskIcon}
                                                resizeMode="contain"
                                                defaultSource={require("../../../assets/images/Waterdrop.png")}
                                            />
                                        </View>
                                        <View style={styles.taskTextContainer}>
                                            <Text style={[styles.drink, taskStyles.textStyle]}>
                                                {item.Title}
                                            </Text>
                                        </View>
                                        <Text style={[styles.points, taskStyles.textStyle, { marginLeft: (10 / FIGMA_WIDTH) * width }]}>
                                            {item.points || 5}
                                        </Text>
                                        <Image
                                            source={require("../../../assets/images/Waterdrop.png")}
                                            style={[styles.drop, { marginLeft: (5 / FIGMA_WIDTH) * width }]}
                                        />
                                        <TouchableOpacity
                                            style={[styles.favoriteButton, { marginLeft: (10 / FIGMA_WIDTH) * width }]}
                                            onPress={() => handleToggleFavorite(item.$id, item.isFavorite)}
                                            accessibilityLabel={item.isFavorite ? "Remove from favorites" : "Add to favorites"}
                                            accessibilityRole="button"
                                        >
                                            <Text style={styles.favoriteIcon}>
                                                {item.isFavorite ? "★" : "☆"}
                                            </Text>
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                </View>
                            </Swipeable>
                        );
                    }}
                    renderSectionHeader={({ section: { title, data } }) =>
                        data.length > 0 ? (
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>{title}</Text>
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No tasks available</Text>
                    }
                    stickySectionHeadersEnabled={true}
                />
            );
        }

        const taskStyles = getTaskStyles(activeTab);

        return (
            <FlatList
                data={filteredTasks}
                keyExtractor={(item) => item.$id}
                renderItem={({ item }) => {
                    const taskBackgroundColor = item.category_type?.toLowerCase().trim() === "daily" ? "#68A1A1" : "#78A88A";
                    const iconSource = item.icon && typeof item.icon === 'string' && item.icon.trim() !== ''
                        ? { uri: getTaskIconUrl(item.icon) }
                        : require("../../../assets/images/Waterdrop.png");

                    return (
                        <Swipeable
                            renderLeftActions={(progress, dragX) =>
                                renderLeftActions(progress, dragX, item.$id, item.Title, item.category_type)
                            }
                            overshootLeft={false}
                            overshootRight={false}
                            friction={2}
                        >
                            <View style={styles.taskWrapper}>
                                <TouchableOpacity
                                    style={[styles.taskbutton, taskStyles.taskButtonStyle, { backgroundColor: taskBackgroundColor }]}
                                    onPress={() => console.log(`${item.Title} task pressed`)}
                                    accessibilityLabel={`Task: ${item.Title}`}
                                    accessibilityRole="button"
                                >
                                    <View style={[styles.t1image, taskStyles.taskIconContainerStyle, {
                                        backgroundColor: taskBackgroundColor === "#68A1A1" ? "#78A88A" : "#68A1A1"
                                    }]}>
                                        <Image
                                            source={iconSource}
                                            style={styles.taskIcon}
                                            resizeMode="contain"
                                            defaultSource={require("../../../assets/images/Waterdrop.png")}
                                        />
                                    </View>
                                    <View style={styles.taskTextContainer}>
                                        <Text style={[styles.drink, taskStyles.textStyle]}>
                                            {item.Title}
                                        </Text>
                                    </View>
                                    <Text style={[styles.points, taskStyles.textStyle, { marginLeft: (10 / FIGMA_WIDTH) * width }]}>
                                        {item.points || 5}
                                    </Text>
                                    <Image
                                        source={require("../../../assets/images/Waterdrop.png")}
                                        style={[styles.drop, { marginLeft: (5 / FIGMA_WIDTH) * width }]}
                                    />
                                    <TouchableOpacity
                                        style={[styles.favoriteButton, { marginLeft: (10 / FIGMA_WIDTH) * width }]}
                                        onPress={() => handleToggleFavorite(item.$id, item.isFavorite)}
                                        accessibilityLabel={item.isFavorite ? "Remove from favorites" : "Add to favorites"}
                                        accessibilityRole="button"
                                    >
                                        <Text style={styles.favoriteIcon}>
                                            {item.isFavorite ? "★" : "☆"}
                                        </Text>
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            </View>
                        </Swipeable>
                    );
                }}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No tasks available</Text>
                }
            />
        );
    };

    if (!user) {
        return (
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={styles.container}>
                    <Text style={styles.errorText}>User not authenticated. Please log in.</Text>
                </View>
            </GestureHandlerRootView>
        );
    }

    if (error) {
        return (
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={styles.container}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.refresh}
                        onPress={handleRefresh}
                        accessibilityLabel="Refresh tasks"
                        accessibilityRole="button"
                    >
                        <Text style={styles.tabText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </GestureHandlerRootView>
        );
    }

    let dTitle: string;
    if (activeTab === "favorite") {
        dTitle = "Favorite Tasks";
    } else if (activeTab === "active") {
        dTitle = "";
    } else {
        dTitle = "Completed Tasks";
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                <View style={styles.topoptions}>
                    <TouchableOpacity
                        style={styles.back}
                        onPress={() => navigation.goBack()}
                        accessibilityLabel="Go back to previous screen"
                        accessibilityRole="button"
                    >
                        <Image source={require("../../../assets/images/back-button.png")} style={styles.arrow} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.search}
                        onPress={() => console.log("Search pressed")}
                        accessibilityLabel="Search tasks"
                        accessibilityRole="button"
                    >
                        <Image source={require("../../../assets/images/MagnifyingGlass.png")} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.plus}
                        onPress={() => {
                            if (user?.$id) {
                                navigation.push("TaskFormScreen", { userId: user.$id });
                            }
                        }}
                        accessibilityLabel="Create new task"
                        accessibilityRole="button"
                    >
                        <Image source={require("../../../assets/images/Plus.png")} />
                    </TouchableOpacity>
                </View>

                <View style={styles.Tblock}>
                    <Text style={styles.Ttitle}>Tasks</Text>
                </View>

                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === "favorite" ? styles.activeTab : null]}
                        onPress={() => setActiveTab("favorite")}
                        accessibilityLabel="View Favorite Tasks"
                        accessibilityRole="tab"
                    >
                        <Text style={[styles.tabText, activeTab === "favorite" ? styles.activeTabText : null]}>
                            ★
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === "active" ? styles.activeTab : null]}
                        onPress={() => setActiveTab("active")}
                        accessibilityLabel="View Active Tasks"
                        accessibilityRole="tab"
                    >
                        <Text style={[styles.tabText, activeTab === "active" ? styles.activeTabText : null]}>
                            Active Task
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === "completed" ? styles.activeTab : null]}
                        onPress={() => setActiveTab("completed")}
                        accessibilityLabel="View Completed Tasks"
                        accessibilityRole="tab"
                    >
                        <Text style={[styles.tabText, activeTab === "completed" ? styles.activeTabText : null]}>
                            Completion
                        </Text>
                    </TouchableOpacity>
                </View>

                {activeTab !== "active" && (
                    <View style={styles.Dblock}>
                        <Text style={styles.Dtitle}>{dTitle}</Text>
                    </View>
                )}

                <View style={[styles.taskContainer, {
                    marginTop: activeTab === "active" ? (230 / FIGMA_HEIGHT) * height : (238 / FIGMA_HEIGHT) * height
                }]}>
                    {loading ? (
                        <LoadingSpinner />
                    ) : (
                        renderTasks()
                    )}
                </View>
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.primary[100],
    },
    topoptions: {
        position: "absolute",
        left: (9 / FIGMA_WIDTH) * width,
        top: (42 / FIGMA_HEIGHT) * height,
        width: (393 / FIGMA_WIDTH) * width,
        height: (45 / FIGMA_HEIGHT) * height,
    },
    back: {
        position: "absolute",
        width: (40 / FIGMA_WIDTH) * width,
        height: (40 / FIGMA_HEIGHT) * height,
        top: -20,
        left: (10 / FIGMA_WIDTH) * width,
    },
    arrow: {
        position: "absolute",
        left: (-45 / FIGMA_WIDTH) * width,
    },
    search: {
        resizeMode: "contain",
        position: "relative",
        width: (20 / FIGMA_WIDTH) * width,
        height: (20 / FIGMA_HEIGHT) * height,
        top: -15,
        left: (270 / FIGMA_WIDTH) * width,
    },
    plus: {
        resizeMode: "contain",
        position: "relative",
        width: (50 / FIGMA_WIDTH) * width,
        height: (50 / FIGMA_HEIGHT) * height,
        top: -20,
        left: (358 / FIGMA_WIDTH) * width,
        zIndex: 1000,
    },
    refresh: {
        resizeMode: "contain",
        position: "relative",
        width: (20 / FIGMA_WIDTH) * width,
        height: (20 / FIGMA_HEIGHT) * height,
        top: -20,
        left: (320 / FIGMA_WIDTH) * width,
    },
    Tblock: {
        position: "absolute",
        left: (28 / FIGMA_WIDTH) * width,
        top: (105 / FIGMA_HEIGHT) * height,
        width: (66 / FIGMA_WIDTH) * width,
        height: (22 / FIGMA_HEIGHT) * height,
    },
    Ttitle: {
        position: "absolute",
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.bold,
        fontSize: 22,
        color: theme.colors.primary[900],
        letterSpacing: -0.41,
    },
    Dblock: {
        position: "absolute",
        left: (28 / FIGMA_WIDTH) * width,
        top: (195 / FIGMA_HEIGHT) * height,
        width: (200 / FIGMA_WIDTH) * width,
        height: (22 / FIGMA_HEIGHT) * height,
    },
    Dtitle: {
        position: "absolute",
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.bold,
        fontSize: 22,
        color: theme.colors.primary[900],
        letterSpacing: -0.41,
    },
    tabContainer: {
        flexDirection: "row",
        position: "absolute",
        left: (28 / FIGMA_WIDTH) * width,
        top: (143 / FIGMA_HEIGHT) * height,
        width: (300 / FIGMA_WIDTH) * width,
        justifyContent: "space-between",
    },
    tab: {
        paddingHorizontal: (10 / FIGMA_WIDTH) * width,
        paddingVertical: (5 / FIGMA_HEIGHT) * height,
        borderRadius: 5,
    },
    activeTab: {},
    tabText: {
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.bold,
        fontSize: 17,
        color: theme.colors.primary[900],
    },
    activeTabText: {
        color: "#68A1A1",
    },
    taskContainer: {
        flex: 1,
        paddingHorizontal: (48 / FIGMA_WIDTH) * width,
        marginTop: (230 / FIGMA_HEIGHT) * height,
    },
    taskWrapper: {
        overflow: "visible",
    },
    taskbutton: {
        width: (305.61 / FIGMA_WIDTH) * width,
        height: (80 / FIGMA_HEIGHT) * height,
        backgroundColor: "#68A1A1",
        borderRadius: 7.3,
        marginVertical: (10 / FIGMA_HEIGHT) * height,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: (10 / FIGMA_WIDTH) * width,
    },
    completedTaskButton: {
        backgroundColor: "#79A88A",
    },
    t1image: {
        width: (43 / FIGMA_WIDTH) * width,
        height: (43 / FIGMA_HEIGHT) * height,
        backgroundColor: "#78A88A",
        borderRadius: 13,
        shadowColor: "#000",
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.25,
        elevation: 4,
        justifyContent: "center",
        alignItems: "center",
    },
    taskIcon: {
        width: (24 / FIGMA_WIDTH) * width,
        height: (24 / FIGMA_HEIGHT) * height,
    },
    completedTaskIconContainer: {
        backgroundColor: "#68A1A1",
    },
    taskTextContainer: {
        flex: 1,
        marginLeft: (10 / FIGMA_WIDTH) * width,
    },
    drink: {
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.extrabold,
        fontSize: 14,
        color: "#FFFFFF",
    },
    points: {
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.extrabold,
        fontSize: 16,
        color: "#FFFFFF",
    },
    drop: {
        resizeMode: "contain",
        width: (22 / FIGMA_WIDTH) * width,
        height: (22 / FIGMA_HEIGHT) * height,
    },
    favoriteButton: {
        padding: (5 / FIGMA_WIDTH) * width,
    },
    favoriteIcon: {
        fontSize: 20,
        color: theme.colors.primary[900],
    },
    completedText: {
        color: "#E0E0E0",
    },
    emptyText: {
        fontFamily: theme.typography.fonts.primary,
        fontSize: 16,
        color: theme.colors.primary[900],
        textAlign: "center",
        marginTop: (20 / FIGMA_HEIGHT) * height,
    },
    errorText: {
        fontFamily: theme.typography.fonts.primary,
        fontSize: 16,
        color: theme.colors.error,
        textAlign: "center",
        marginTop: (20 / FIGMA_HEIGHT) * height,
    },
    leftActionsContainer: {
        top: 10,
        height: (80 / FIGMA_HEIGHT) * height,
        width: 130,
        justifyContent: "center",
        alignItems: "center",
    },
    leftActions: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: (5 / FIGMA_WIDTH) * width,
    },
    completeButton: {
        right: -90,
        backgroundColor: theme.colors.primary[100],
        justifyContent: "center",
        alignItems: "center",
        width: (45 / FIGMA_WIDTH) * width,
        height: (45 / FIGMA_HEIGHT) * height,
        borderRadius: 7.3,
        marginHorizontal: (3 / FIGMA_WIDTH) * width,
        marginVertical: (5 / FIGMA_HEIGHT) * height,
        padding: (5 / FIGMA_HEIGHT) * height,
    },
    deleteButton: {
        right: -80,
        backgroundColor: "#FF4040",
        justifyContent: "center",
        alignItems: "center",
        width: (45 / FIGMA_WIDTH) * width,
        height: (45 / FIGMA_HEIGHT) * height,
        borderRadius: 7.3,
        marginHorizontal: (3 / FIGMA_WIDTH) * width,
        marginVertical: (5 / FIGMA_HEIGHT) * height,
        padding: (5 / FIGMA_HEIGHT) * height,
    },
    actionIcon: {
        width: (20 / FIGMA_WIDTH) * width,
        height: (20 / FIGMA_HEIGHT) * height,
        resizeMode: "contain",
    },
    actionText: {
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.bold,
        fontSize: 16,
        color: theme.colors.primary[900],
    },
    sectionHeader: {
        paddingVertical: (10 / FIGMA_HEIGHT) * height,
        paddingHorizontal: (10 / FIGMA_WIDTH) * width,
        backgroundColor: theme.colors.primary[100],
    },
    sectionTitle: {
        fontFamily: theme.typography.fonts.primary,
        fontWeight: theme.typography.weights.bold,
        fontSize: 22,
        color: theme.colors.primary[900],
        letterSpacing: -0.41,
    },
});