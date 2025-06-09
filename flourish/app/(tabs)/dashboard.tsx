import { useState, useRef } from "react"
import {
    View,
    ImageBackground,
    Text,
    TouchableOpacity,
    Image,
    FlatList,
    StyleSheet,
    Animated,
    PanResponder,
} from "react-native"
import { useRouter } from "expo-router"

interface Task {
    id: string
    text: string
    points: number
    icon: any // Changed from string to any to accommodate image requires
}

// Separate TaskItem component that can properly use hooks
const TaskItem = ({ item, activeTab, onSwipeComplete, onSwipeSkip }: any) => {
    const swipeAnim = useRef(new Animated.Value(0)).current
    const [isOpen, setIsOpen] = useState(false)

    const SWIPE_THRESHOLD = 20 // Smaller threshold to detect slight swipe
    const SWIPE_ACTION_WIDTH = 120 // Width of the swipe action container

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
            // Only allow swiping right (positive dx)
            if (gestureState.dx > 0) {
                swipeAnim.setValue(Math.min(gestureState.dx, SWIPE_ACTION_WIDTH))
            }
        },
        onPanResponderRelease: (_, gestureState) => {
            if (gestureState.dx > SWIPE_THRESHOLD) {
                // Auto-complete the swipe animation once threshold is crossed
                Animated.spring(swipeAnim, {
                    toValue: SWIPE_ACTION_WIDTH,
                    useNativeDriver: true,
                }).start()
                setIsOpen(true)
            } else {
                // Close swipe actions
                Animated.spring(swipeAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                }).start()
                setIsOpen(false)
            }
        },
    })

    // Close the swipe actions
    const closeSwipe = () => {
        Animated.spring(swipeAnim, {
            toValue: 0,
            useNativeDriver: true,
        }).start(() => setIsOpen(false))
    }

    // Handle "Skip" button press
    const handleSkip = () => {
        onSwipeSkip?.(item.id)
        closeSwipe()
    }

    // Handle "Complete" button press
    const handleComplete = () => {
        onSwipeComplete?.(item.id)
        closeSwipe()
    }

    return (
        <View style={styles.taskItemContainer}>
            {/* Swipe actions backdrop */}
            <View style={[styles.swipeActionsBackdrop, { backgroundColor: activeTab === "daily" ? "#78A88A" : "#68A1A1" }]}>
                {/* Swipe actions */}
                <View style={styles.swipeActionsContainer}>
                    <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                        <View
                            style={[
                                styles.actionButtonBackground,
                                { backgroundColor: activeTab === "daily" ? "#78B297" : "#68A1A1" },
                            ]}
                        >
                            <Image source={require("../assets/images/skip.png")} style={styles.skipIcon} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
                        <View
                            style={[
                                styles.actionButtonBackground,
                                { backgroundColor: activeTab === "daily" ? "#78B297" : "#68A1A1" },
                            ]}
                        >
                            <Image source={require("../assets/images/check.png")} style={styles.actionIcon} />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Task item */}
            <Animated.View
                {...panResponder.panHandlers}
                style={[
                    styles.taskItem,
                    {
                        backgroundColor: activeTab === "daily" ? "#68A1A1" : "#78A88A", // Alternate colors based on tab
                        transform: [{ translateX: swipeAnim }],
                    },
                ]}
            >
                <View style={styles.taskTextContainer}>
                    <View style={[styles.taskIconContainer, { backgroundColor: activeTab === "daily" ? "#78B297" : "#68A1A1" }]}>
                        <Image source={item.icon} style={styles.taskIcon} />
                    </View>
                    <Text style={styles.taskText}>{item.text}</Text>
                </View>
                <View style={styles.pointsWrapper}>
                    <Text style={styles.taskPoints}>{item.points}</Text>
                    <Image source={require("../assets/images/Waterdrop.png")} style={styles.pointsDropletIcon} />
                </View>
            </Animated.View>
        </View>
    )
}

const backgroundImage = require("../assets/images/sunshine.png")
const backgroundImage2 = require("../assets/images/base.png")
const backgroundImage3 = require("../assets/images/flower.png")

const dailyTasks: Task[] = [
    { id: "1", text: "Drink a glass of water", points: 5, icon: require("../assets/images/water glass.png") },
    { id: "2", text: "Take a 10-minute walk", points: 5, icon: require("../assets/images/exercise walking icon.png") },
    { id: "3", text: "Brush your teeth", points: 5, icon: require("../assets/images/Tooth icon.png") },
]

const personalTasks: Task[] = [
    { id: "1", text: "Clean one small area", points: 5, icon: require("../assets/images/broom task.png") },
    { id: "2", text: "Give a compliment", points: 5, icon: require("../assets/images/people task.png") },
    { id: "3", text: "Complete one task", points: 5, icon: require("../assets/images/tasks icons design.png") },
]

export default function Dashboard() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("daily")
    const toggleAnim = useRef(new Animated.Value(0)).current
    const taskListAnim = useRef(new Animated.Value(0)).current
    const waterPercentage = 50 // This could be dynamic

    // State for storing swipe action visibility
    const [swipedTaskId, setSwipedTaskId] = useState<string | null>(null)

    // Toggle between daily and personal tasks
    const toggleTaskType = () => {
        // Start with toggle animation
        Animated.timing(toggleAnim, {
            toValue: activeTab === "daily" ? 1 : 0,
            duration: 250,
            useNativeDriver: false,
        }).start()

        // Then animate the task list
        Animated.timing(taskListAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setActiveTab(activeTab === "daily" ? "personal" : "daily")
            taskListAnim.setValue(0)
        })
    }

    // Handle task completion
    const handleTaskComplete = (taskId: any) => {
        console.log(`Task completed: ${taskId}`)
        // Add your complete logic here
    }

    // Handle task skipping
    const handleTaskSkip = (taskId: any) => {
        console.log(`Task skipped: ${taskId}`)
        // Add your skip logic here
    }

    // Get current tasks based on active tab
    const currentTasks = activeTab === "daily" ? dailyTasks : personalTasks

    // Interpolate the toggle button position
    const togglePosition = toggleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0%", "50%"],
    })

    return (
        <View style={styles.container}>
            {/* Background Image */}
            <ImageBackground source={backgroundImage} style={styles.background} />

            <ImageBackground source={backgroundImage2} style={styles.table} />

            <ImageBackground source={backgroundImage3} style={styles.plant} />

            {/* Header with Profile, Gift and Bell icons */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.profileButton}>
                    <Image source={require("../assets/images/profile picture.png")} style={styles.profileIcon} />
                </TouchableOpacity>
                <View style={styles.rightIcons}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Image source={require("../assets/images/gift.png")} style={styles.headerIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Image source={require("../assets/images/bell.png")} style={styles.headerIcon} />
                        <View style={styles.notificationBadge}>
                            <Text style={styles.notificationText}></Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Middle Water Level Stats */}
            <View style={styles.waterLevelBarContainer}>
                <View style={styles.levelContainer}>
                    <Text style={styles.levelText}>Lv: 10</Text>
                </View>
                <View style={styles.waterBarWrapper}>
                    <View style={styles.waterBar}>
                        <View style={[styles.waterFill, { width: `${waterPercentage}%` }]} />
                        <View style={styles.waterBarContent}>
                            <Image source={require("../assets/images/Waterdrop.png")} style={styles.waterBarIcon} />
                            <View style={styles.waterPercentageContainer}>
                                <Text style={styles.waterPercentageText}>{waterPercentage}%</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={styles.pointsContainer}>
                    <Text style={styles.pointsText}>50</Text>
                    <Image source={require("../assets/images/Waterdrop.png")} style={styles.dropletIcon} />
                </View>
            </View>

            {/* Green House & Premium Butterfly Buttons */}
            <View style={styles.specialButtonsContainer}>
                <TouchableOpacity style={styles.specialButton}>
                    <Image source={require("../assets/images/home2.png")} style={styles.specialButtonIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.specialButton}>
                    <Image source={require("../assets/images/premium.png")} style={styles.specialButtonIcon} />
                </TouchableOpacity>
            </View>

            {/* Backdrop Panel */}
            <View style={styles.backdropPanel} />

            {/* Task Header with Icons */}
            <View style={styles.taskHeader}>
                <TouchableOpacity style={styles.hamburgerButton}>
                    <Image source={require("../assets/images/Menu Hamburger.png")} style={styles.hamburgerIcon} />
                </TouchableOpacity>
                <View style={styles.taskHeaderSpacer} />
                <TouchableOpacity style={styles.plusButton}>
                    <Image source={require("../assets/images/Plus.png")} style={styles.plusIcon} />
                </TouchableOpacity>
            </View>

            {/* Task Toggle */}
            <View style={styles.taskToggleContainer}>
                {/* Animated highlight that moves between Daily and Personal */}
                <Animated.View
                    style={[
                        styles.toggleHighlight,
                        {
                            left: togglePosition,
                            backgroundColor: "#68A1A1", // Always dark green
                        },
                    ]}
                />
                <TouchableOpacity style={styles.taskToggleButton} onPress={() => activeTab === "personal" && toggleTaskType()}>
                    <Text style={[styles.taskToggleText, activeTab === "daily" && styles.activeTaskText]}>Daily Task</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.taskToggleButton} onPress={() => activeTab === "daily" && toggleTaskType()}>
                    <Text style={[styles.taskToggleText, activeTab === "personal" && styles.activeTaskText]}>Personal Task</Text>
                </TouchableOpacity>
            </View>

            {/* Task List with Animation */}
            <View style={styles.taskContainer}>
                <Animated.View
                    style={[
                        {
                            opacity: taskListAnim.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [1, 0, 1],
                            }),
                            transform: [
                                {
                                    translateX: taskListAnim.interpolate({
                                        inputRange: [0, 0.5, 1],
                                        outputRange: [0, -50, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <FlatList
                        data={currentTasks}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{
                            flexGrow: 1,
                            paddingTop: 5,
                            paddingBottom: 5,
                        }}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TaskItem
                                item={item}
                                activeTab={activeTab}
                                onSwipeComplete={handleTaskComplete}
                                onSwipeSkip={handleTaskSkip}
                            />
                        )}
                    />
                </Animated.View>
            </View>

            {/* Bottom Navigation */}
            <View style={styles.navBar}>
                <TouchableOpacity style={styles.navButton}>
                    <Image source={require("../assets/images/home icon.png")} style={styles.icon} />
                    <Text style={styles.navText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton}>
                    <Image source={require("../assets/images/garden.png")} style={styles.icon} />
                    <Text style={styles.navText}>Garden</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton}>
                    <Image source={require("../assets/images/shop.png")} style={styles.icon} />
                    <Text style={styles.navText}>Shop</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton}>
                    <Image source={require("../assets/images/encyclopedia.png")} style={styles.icon} />
                    <Text style={styles.navText}>Encyclopedia</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#DEDED0",
    },
    background: {
        position: "absolute",
        width: "100%",
        height: "100%",
        top: "0%",
        resizeMode: "cover",
    },
    table: {
        position: "absolute",
        width: "100%",
        height: "100%",
        top: "-5%",
        resizeMode: "cover",
    },
    plant: {
        position: "absolute",
        width: "90%",
        height: "90%",
        top: "4%",
        left: "9%",
        resizeMode: "cover",
    },

    backdropPanel: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: "43%",
        backgroundColor: "#DEDED0",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,

        // Shadow for iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 3,

        // Shadow for Android
        elevation: 4,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        position: "absolute",
        top: 55,
        left: 15,
        right: 15,
        zIndex: 10,
    },
    profileButton: {},
    profileIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    rightIcons: {
        flexDirection: "row",
    },
    iconButton: {
        marginLeft: 15,
        position: "relative",
    },
    headerIcon: {
        width: 27,
        height: 27,
    },
    notificationBadge: {
        position: "absolute",
        top: -5,
        right: -5,
        backgroundColor: "#68A1A1",
        borderRadius: 10,
        width: 16,
        height: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    notificationText: {
        fontSize: 10,
        color: "white",
        fontWeight: "bold",
    },

    // Water level bar in the middle of the screen
    waterLevelBarContainer: {
        position: "absolute",
        top: "58.5%",
        width: "90%",
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 5,
    },
    levelContainer: {
        backgroundColor: "#68A1A1",
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    levelText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    waterBarWrapper: {
        flex: 1,
        paddingHorizontal: 10,
    },
    waterBar: {
        height: 18,
        backgroundColor: "#68A1A1",
        borderRadius: 4,
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
    },
    waterFill: {
        position: "absolute",
        left: 0,
        height: "100%",
        backgroundColor: "#468080",
        borderRadius: 4,
    },
    waterBarContent: {
        flexDirection: "row",
        alignItems: "center",
        position: "absolute",
        width: "100%",
        height: "100%",
        zIndex: 2,
        paddingHorizontal: 6,
    },
    waterBarIcon: {
        width: 14,
        height: 14,
        resizeMode: "contain",
    },
    waterPercentageContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        left: "-2%",
    },
    waterPercentageText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    pointsContainer: {
        flexDirection: "row",
        backgroundColor: "#68A1A1",
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 6,
        alignItems: "center",
    },
    pointsText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginRight: 2,
    },
    dropletIcon: {
        width: 14,
        height: 14,
        resizeMode: "contain",
    },

    // Special buttons (greenhouse and premium butterfly)
    specialButtonsContainer: {
        position: "absolute",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        top: "51%", // Adjust this value to position them above the backdrop panel
        zIndex: 10,
    },
    specialButton: {
        width: 45,
        height: 45,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 7,
        // Shadow for iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        // Shadow for Android
        elevation: 4,
    },
    specialButtonIcon: {
        width: 35,
        height: 35,
    },

    // Task Header with Hamburger and Plus icons
    taskHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        position: "absolute",
        top: "65.4%", // Just above the backdrop panel
        width: "90%",
        alignSelf: "center",
        zIndex: 10,
    },
    hamburgerButton: {
        padding: 5,
    },
    hamburgerIcon: {
        width: 22,
        height: 22,
    },
    taskHeaderSpacer: {
        flex: 1,
    },
    plusButton: {
        padding: 5,
    },
    plusIcon: {
        width: 22,
        height: 22,
    },

    // Task Toggle Buttons with Animation
    taskToggleContainer: {
        flexDirection: "row",
        position: "absolute",
        top: "65%",
        width: "48%",
        alignSelf: "center",
        backgroundColor: "#78A88A",
        borderRadius: 12,
        padding: 4,
        zIndex: 10,
        overflow: "hidden",
    },
    toggleHighlight: {
        position: "absolute",
        top: 6,
        marginLeft: 4,
        width: "50%",
        height: "88%",
        borderRadius: 8,
    },
    taskToggleButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: "center",
        zIndex: 1,
    },
    taskToggleText: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#000000",
    },
    activeTaskText: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#FFFFFF",
    },

    // Task List with Swipe Functionality
    taskContainer: {
        position: "absolute",
        top: "69.7%",
        width: "75%",
        height: "21.85%", // Adjusted to fit between toggle and navbar
        alignSelf: "center",
        zIndex: 5,
        overflow: "hidden",
    },
    taskItemContainer: {
        position: "relative",
        marginBottom: 14,
        height: 60,
    },
    swipeActionsBackdrop: {
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundColor: "#78A88A", // Lighter green color
        borderRadius: 8,
        zIndex: 1,
    },
    swipeActionsContainer: {
        position: "absolute",
        flexDirection: "row",
        height: "100%",
        left: 0,
        width: 120, // This is the SWIPE_ACTION_WIDTH
        zIndex: 2,
    },
    skipButton: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 5,
    },
    completeButton: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 5,
    },
    actionButtonBackground: {
        width: 36,
        height: 36,
        backgroundColor: "#78B297", // Both buttons use the same color now
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        // Shadow for iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        // Shadow for Android
        elevation: 3,
    },
    actionIcon: {
        width: 26,
        height: 26,
        tintColor: "white",
        resizeMode: "contain",
    },
    skipIcon: {
        width: 30,
        height: 30,
        tintColor: "white",
        resizeMode: "contain",
    },
    taskItem: {
        width: "100%",
        height: 60,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        backgroundColor: "#68A1A1",
        borderRadius: 8,
        zIndex: 2,

        // Shadow for iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,

        // Shadow for Android
        elevation: 4,
    },
    taskText: {
        fontSize: 14,
        color: "white",
        fontWeight: "bold",
    },
    pointsWrapper: {
        flexDirection: "row",
        alignItems: "center",
    },
    taskPoints: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
        marginRight: 4,
    },
    pointsDropletIcon: {
        width: 16,
        height: 16,
        resizeMode: "contain",
    },

    // Bottom Navigation
    navBar: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        paddingVertical: 15,
        padding: 10,
        backgroundColor: "#DEDED0",
        position: "absolute",
        bottom: 0,
        borderRadius: 12,

        // Shadow for iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,

        // Shadow for Android
        elevation: 5,
    },
    navButton: {
        flexDirection: "column",
        alignItems: "center",
        paddingHorizontal: 15,
    },
    icon: {
        width: 25,
        height: 25,
        marginBottom: 4,
    },
    navText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#164432",
    },
    taskTextContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    taskIconContainer: {
        width: 36,
        height: 36,
        backgroundColor: "#78B297",
        borderRadius: 9,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
        left: "-2%",

        // Shadow for iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,

        // Shadow for Android
        elevation: 5,
    },
    taskIcon: {
        width: 30,
        height: 30,
        resizeMode: "contain",
    },
})