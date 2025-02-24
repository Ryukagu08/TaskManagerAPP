import { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Modal, TextInput, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const initialTasks = [
  { id: 1, title: 'Review project proposal', completed: false, priority: 'high', listId: 1 },
  { id: 2, title: 'Team meeting at 2 PM', completed: false, priority: 'medium', listId: 1 },
  { id: 3, title: 'Update documentation', completed: true, priority: 'low', listId: 2 },
];

const initialLists = [
  { id: 1, title: 'Work', color: '#FF9500', tasks: 12 },
  { id: 2, title: 'Personal', color: '#32D74B', tasks: 8 },
  { id: 3, title: 'Shopping', color: '#FF2D55', tasks: 3 },
];

const PriorityIcon = ({ priority }) => {
  switch (priority) {
    case 'high':
      return <Text style={[styles.priorityIcon, { transform: [{ rotate: '90deg' }], color: '#FF3B30' }]}>{'<'}</Text>;
    case 'medium':
      return <Text style={[styles.priorityIcon, { color: '#FF9500' }]}>—</Text>;
    case 'low':
      return <Text style={[styles.priorityIcon, { transform: [{ rotate: '270deg' }], color: '#32D74B' }]}>{'<'}</Text>;
    default:
      return null;
  }
};

export default function HomeScreen() {
  const [tasks, setTasks] = useState(initialTasks);
  const [lists, setLists] = useState(initialLists);
  const [selectedList, setSelectedList] = useState<number | null>(null);
  const [isAddListModalVisible, setIsAddListModalVisible] = useState(false);
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newListColor, setNewListColor] = useState('#007AFF');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isTasksEditing, setIsTasksEditing] = useState(false);
  const [isListsEditing, setIsListsEditing] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [listToDelete, setListToDelete] = useState(null);
  
  const menuAnimation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setIsMenuVisible(!isMenuVisible);
    Animated.spring(menuAnimation, {
      toValue: isMenuVisible ? 0 : 1,
      useNativeDriver: true,
    }).start();
  };

  const handleTaskToggle = (taskId: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setTasks(currentTasks => 
      currentTasks.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const handleAddList = () => {
    if (newListTitle.trim()) {
      const newList = {
        id: lists.length + 1,
        title: newListTitle,
        color: newListColor,
        tasks: 0,
      };
      setLists([...lists, newList]);
      setNewListTitle('');
      setNewListColor('#007AFF');
      setIsAddListModalVisible(false);
      toggleMenu();
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim() && selectedList) {
      const newTask = {
        id: tasks.length + 1,
        title: newTaskTitle,
        completed: false,
        priority: newTaskPriority,
        listId: selectedList,
      };
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
      setNewTaskPriority('medium');
      setIsAddTaskModalVisible(false);
      toggleMenu();
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const handleDeleteTask = (taskId) => {
    setTasks(currentTasks => currentTasks.filter(task => task.id !== taskId));
    setTaskToDelete(null);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleDeleteList = (listId) => {
    setLists(currentLists => currentLists.filter(list => list.id !== listId));
    setTasks(currentTasks => currentTasks.filter(task => task.listId !== listId));
    setListToDelete(null);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleTaskLongPress = (taskId) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsTasksEditing(true);
  };

  const handleListLongPress = (listId) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsListsEditing(true);
  };

  const filteredTasks = selectedList
    ? tasks.filter(task => task.listId === selectedList)
    : tasks;

  const completedTasksCount = filteredTasks.filter(task => task.completed).length;

  const colors = ['#FF9500', '#FF2D55', '#32D74B', '#007AFF', '#5856D6', '#FF3B30'];

  const renderTask = ({ item, drag, isActive }) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          onPress={() => !isTasksEditing && handleTaskToggle(item.id)}
          delayLongPress={200}
          style={[
            styles.taskItem,
            isActive && styles.taskItemActive
          ]}>
          <View style={styles.taskLeft}>
            <PriorityIcon priority={item.priority} />
            <Text
              style={[
                styles.taskTitle,
                item.completed && styles.taskTitleCompleted,
              ]}>
              {item.title}
            </Text>
          </View>
          <View style={styles.taskRight}>
            {isTasksEditing ? (
              <TouchableOpacity
                onPress={() => setTaskToDelete(item.id)}
                style={styles.deleteButton}>
                <Ionicons name="close-circle" size={24} color="#FF3B30" />
              </TouchableOpacity>
            ) : (
              <View
                style={[
                  styles.checkbox,
                  item.completed && styles.checkboxCompleted,
                ]}>
                {item.completed && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Good morning,</Text>
              <Text style={styles.name}>John Doe</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <Text style={styles.profileImage}>JD</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>Today's Progress</Text>
            <View style={styles.progressCard}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressPercentage}>
                  {filteredTasks.length > 0
                    ? Math.round((completedTasksCount / filteredTasks.length) * 100)
                    : 0}%
                </Text>
                <Text style={styles.progressText}>
                  {completedTasksCount} of {filteredTasks.length} tasks completed
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: filteredTasks.length > 0
                        ? `${(completedTasksCount / filteredTasks.length) * 100}%`
                        : '0%'
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          <View style={styles.tasksSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {selectedList 
                  ? `Tasks in ${lists.find(l => l.id === selectedList)?.title}`
                  : "All Tasks"}
              </Text>
              {filteredTasks.length > 0 && (
                <TouchableOpacity
                  onPress={() => setIsTasksEditing(!isTasksEditing)}
                  style={styles.editButton}>
                  <Text style={styles.editButtonText}>
                    {isTasksEditing ? 'Done' : 'Edit'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <DraggableFlatList
              data={filteredTasks}
              onDragEnd={({ data }) => setTasks(data)}
              keyExtractor={item => item.id.toString()}
              renderItem={renderTask}
            />
          </View>

          <View style={styles.listsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Lists</Text>
              {lists.length > 0 && (
                <TouchableOpacity
                  onPress={() => setIsListsEditing(!isListsEditing)}
                  style={styles.editButton}>
                  <Text style={styles.editButtonText}>
                    {isListsEditing ? 'Done' : 'Edit'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.listsScrollView}>
              <TouchableOpacity
                style={[styles.listCard, !selectedList && styles.listCardSelected]}
                onPress={() => setSelectedList(null)}>
                <View style={[styles.listColor, { backgroundColor: '#007AFF' }]} />
                <Text style={styles.listTitle}>All Tasks</Text>
                <Text style={styles.listCount}>{tasks.length} tasks</Text>
              </TouchableOpacity>
              {lists.map(list => (
                <TouchableOpacity
                  key={list.id}
                  style={[
                    styles.listCard,
                    selectedList === list.id && styles.listCardSelected,
                  ]}
                  onLongPress={() => handleListLongPress(list.id)}
                  onPress={() => !isListsEditing && setSelectedList(list.id)}>
                  <View
                    style={[styles.listColor, { backgroundColor: list.color }]}
                  />
                  {isListsEditing && (
                    <TouchableOpacity
                      onPress={() => setListToDelete(list.id)}
                      style={styles.listDeleteButton}>
                      <Ionicons name="close-circle" size={24} color="#FF3B30" />
                    </TouchableOpacity>
                  )}
                  <Text style={styles.listTitle}>{list.title}</Text>
                  <Text style={styles.listCount}>
                    {tasks.filter(t => t.listId === list.id).length} tasks
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        {/* Floating Menu */}
        <View style={styles.menuContainer}>
          {isMenuVisible && (
            <Animated.View
              style={[
                styles.menuContent,
                {
                  transform: [
                    {
                      scale: menuAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1],
                      }),
                    },
                  ],
                  opacity: menuAnimation,
                },
              ]}>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => {
                  setIsAddTaskModalVisible(true);
                  toggleMenu();
                }}>
                <Ionicons name="checkbox-outline" size={20} color="#fff" />
                <Text style={styles.menuButtonText}>Add Task</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => {
                  setIsAddListModalVisible(true);
                  toggleMenu();
                }}>
                <Ionicons name="list" size={20} color="#fff" />
                <Text style={styles.menuButtonText}>Add List</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
          <TouchableOpacity
            style={[styles.fab, isMenuVisible && styles.fabActive]}
            onPress={toggleMenu}>
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: menuAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '45deg'],
                    }),
                  },
                ],
              }}>
              <Ionicons name="add" size={24} color="#fff" />
            </Animated.View>
          </TouchableOpacity>
        </View>

        <Modal
          visible={isAddListModalVisible}
          animationType="slide"
          transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create New List</Text>
              <TextInput
                style={styles.input}
                placeholder="List Name"
                value={newListTitle}
                onChangeText={setNewListTitle}
              />
              <View style={styles.colorPicker}>
                {colors.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[styles.colorOption, { backgroundColor: color }]}
                    onPress={() => setNewListColor(color)}
                  />
                ))}
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setIsAddListModalVisible(false);
                    toggleMenu();
                  }}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.createButton]}
                  onPress={handleAddList}>
                  <Text style={styles.createButtonText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={isAddTaskModalVisible}
          animationType="slide"
          transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create New Task</Text>
              <TextInput
                style={styles.input}
                placeholder="Task Title"
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
              />
              <Text style={styles.priorityLabel}>Priority Level</Text>
              <View style={styles.priorityPicker}>
                <TouchableOpacity
                  style={[
                    styles.priorityOption,
                    newTaskPriority === 'low' && styles.prioritySelected,
                  ]}
                  onPress={() => setNewTaskPriority('low')}>
                  <PriorityIcon priority="low" />
                  <Text style={styles.priorityText}>Low</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.priorityOption,
                    newTaskPriority === 'medium' && styles.prioritySelected,
                  ]}
                  onPress={() => setNewTaskPriority('medium')}>
                  <PriorityIcon priority="medium" />
                  <Text style={styles.priorityText}>Medium</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.priorityOption,
                    newTaskPriority === 'high' && styles.prioritySelected,
                  ]}
                  onPress={() => setNewTaskPriority('high')}>
                  <PriorityIcon priority="high" />
                  <Text style={styles.priorityText}>High</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setIsAddTaskModalVisible(false);
                    toggleMenu();
                  }}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.createButton]}
                  onPress={handleAddTask}>
                  <Text style={styles.createButtonText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Delete Confirmation Modals */}
        <Modal
          visible={!!taskToDelete}
          transparent={true}
          animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Delete Task</Text>
              <Text style={styles.modalText}>
                Are you sure you want to delete this task?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setTaskToDelete(null)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={() => handleDeleteTask(taskToDelete)}>
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={!!listToDelete}
          transparent={true}
          animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Delete List</Text>
              <Text style={styles.modalText}>
                Are you sure you want to delete this list and all its tasks?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setListToDelete(null)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={() => handleDeleteList(listToDelete)}>
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 4,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 12,
  },
  progressText: {
    fontSize: 16,
    color: '#666',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e5e5',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  tasksSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 12,
    width: 20,
    textAlign: 'center',
  },
  taskTitle: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#007AFF',
  },
  listsSection: {
    marginTop: 32,
    paddingLeft: 24,
    marginBottom: 100,
  },
  listsScrollView: {
    paddingRight: 24,
  },
  listCard: {
    width: 160,
    height: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    marginRight: 16,
    padding: 16,
  },
  listCardSelected: {
    backgroundColor: '#e8f2ff',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  listColor: {
    width: 32,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  listCount: {
    fontSize: 14,
    color: '#666',
  },
  menuContainer: {
    position: 'absolute',
    right: 24,
    bottom: Platform.OS === 'ios' ? 100 : 80,
    alignItems: 'center',
  },
  menuContent: {
    position: 'absolute',
    right: 0,
    bottom: 70,
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 8,
    width: 160,
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 8,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  menuButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabActive: {
    backgroundColor: '#FF3B30',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 24,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  priorityPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  priorityOption: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 4,
    alignItems: 'center',
    flexDirection: 'column',
  },
  prioritySelected: {
    backgroundColor: '#e8f2ff',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  createButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  taskItemActive: {
    backgroundColor: '#f5f5f5',
    transform: [{ scale: 1.02 }],
  },
  taskRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 8,
  },
  listDeleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 1,
  },
});