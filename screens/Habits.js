import React, { useLayoutEffect, useState } from 'react';
import { CommonActions } from "@react-navigation/native";
import { StyleSheet, Modal, Text, View, TouchableOpacity, FlatList, TextInput } from 'react-native';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { Ionicons } from "@expo/vector-icons"
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore";
import { auth, db } from '../utils/Config';
import Colors from '../utils/Colors';
import ColorSelector from '../components/ColorSelect';

const renderAddListIcon = (set) => {
  return(
    <TouchableOpacity onPress={() => set(true)}>
      <Ionicons name='add' size={30} style={styles.icon} color='white'/>
    </TouchableOpacity>
  )
}

const colorList = [
  "blue",
  "teal",
  "green",
  "olive",
  "yellow",
  "orange",
  "red",
  "pink",
  "purple",
  "blueGray",
];

export default ({navigation, route}) => {
  const [text, setText] = useState('');
  const [color, setColor] = useState(Colors.blue);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [habits, setHabits] = useState([]);

  const loadHabitsList = async () => {
    const q = query(collection(db, 'habits'), 
      where('userId', '==', auth.currentUser.uid),
      where('date', '==', route.params.day.dateString)
      );

    const querySnapshot = await getDocs(q);

    let habits = [];
    querySnapshot.forEach((doc) => {
      let habit = doc.data();
      habit.id = doc.id;
      habits.push(habit);
    });

    setHabits(habits);
    setIsLoading(false);
    setIsRefreshing(false);
  }

  if (isLoading) {
    loadHabitsList();
  }

  let checkHabitChecked = (item, isChecked) => {
    const habitRef = doc(db, 'habits', item.id);
    setDoc(habitRef, { isChecked: isChecked }, { merge: true });
  };

  let deleteHabits = async (habitId) => {
    await deleteDoc(doc(db, "habits", habitId));
    let updatedHabit = [...habits].some((item) => item.id != habitId);
    setHabits(updatedHabit);
  };

  let showHabits = ({item}) => {
    return(
      <View style={styles.checkboxContainer}>
        <BouncyCheckbox
          isChecked={item.isChecked}
          onPress={(isChecked) => {checkHabitChecked(item, isChecked)}}
          text={item.text}
          size={35}
          fillColor={item.color}
        />
        <TouchableOpacity style={styles.icon} onPress={() => deleteHabits(item.id)}>
          <Ionicons name="trash-outline" size={30}/>
        </TouchableOpacity>
      </View>
    )
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => renderAddListIcon(setModalVisible)
    })
  })

  let addHabits = async () => {
    let habitsSave = {
      text: text,
      color: color,
      isChecked: false,
      date: route.params.day.dateString,
      userId: auth.currentUser.uid
    };
    const docRef = await addDoc(collection(db, "habits"), habitsSave);

    habitsSave.id = docRef.id;

    let updatedHabits = [...habits];
    updatedHabits.push(habitsSave);

    setHabits(updatedHabits);
  };

  return(
  <View style={styles.container}>
    <FlatList
      data={habits}
      refreshing={isRefreshing}
      onRefresh={() => {
        loadHabitsList();
        setIsRefreshing(true);
      }}
      renderItem={showHabits}
      keyExtractor={item => item.id}
    />
    <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TextInput 
              style={styles.modalText} 
              value={text} 
              onChangeText={setText}
              placeholder='Titel'
            />
            <ColorSelector
              onSelect={(color) => {
                  setColor(color);
                  navigation.dispatch(CommonActions.setParams({ color }));
              }}
              selectedColor={color}
              colorOptions={colorList}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => {text ? [addHabits(), setModalVisible(!modalVisible)] : setModalVisible(!modalVisible)}}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  itemTitle: {
    fontSize: 24,
    padding: 5,
  }, 
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cream,
    marginBottom: 5,
    padding: 8,
    borderRadius: 8,
  },
  icon: {
    padding: 5,
    fontStyle: 24,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    height: 250,
    width: '90%',
    margin: 20,
    backgroundColor: "lightgray",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    flexDirection: "row",
    borderRadius: 25,
    backgroundColor: 'lightblue',
    height: 48,
    width: 80,
    marginTop: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white", 
    fontSize: 24, 
    fontWeight: "bold"
  },
  modalText: {
    borderColor: "gray",
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    backgroundColor: 'white',
  }
});