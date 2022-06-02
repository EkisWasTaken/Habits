import React, { useLayoutEffect, useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList} from 'react-native';
import { Ionicons } from "@expo/vector-icons"
import { Calendar } from 'react-native-calendars';
import { auth, db } from '../utils/Config';
import { collection, query, where, getDocs} from "firebase/firestore";
import Colors from '../utils/Colors';
import moment from 'moment';

const openSettings = () => {
  return(
    <TouchableOpacity style={styles.settingsBtn} onPress={() => auth.signOut()}>
        <Ionicons name="log-out-outline" size={24} color='white'/>
    </TouchableOpacity>
  )
}

export default ({navigation}) => {
  const [markedDates, setMarkedDates] = useState({});
  const [habits, setHabits] = useState([]);
  const [habitsToday, setHabitsToday] = useState([]);
  
  useEffect(async () => {
    const q = query(collection(db, 'habits'), 
      where('userId', '==', auth.currentUser.uid)
      );

    const querySnapshot = await getDocs(q);
    
    let dates = { 'date': {}};
    let habits = [];
    let habitsT = []
    let date = moment(new Date()).format('YYYY-MM-DD')
    querySnapshot.forEach((doc) => {
      let habit = doc.data();
      habit.id = doc.id;
      if (habit.date === date) {
        habitsT.push(habit);
      }
      habits.push(habit);
      dates = {date: {
        marked: habit.isChecked,
        dotColor: habit.color
      }};

      delete Object.assign(dates, {[habit.date]: dates['date'] })['date'];
    });
    setHabitsToday(habitsT);
    setHabits(habits);
    setMarkedDates(dates);
  }, []);


  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => openSettings(navigation)
    })
  })

  return (
    <View style={styles.container}>
      <Calendar
        markingType={'multi-dot'}
        markedDates={markedDates}
        onDayPress={day => {
          navigation.navigate('Habits', {day})
        }}
        renderArrow={(direction) => {
          if (direction == 'left') {
              return (<Ionicons name="chevron-back" size={24} color={Colors.blue}/>)
          } else {
              return (<Ionicons name="chevron-forward" size={24} color={Colors.blue}/>)
          }
      }}
      />
      <View style={styles.box}>
        <Text style={styles.text}>Total Habits in motion: {habits.length}</Text>
        <FlatList 
          data={habits}
          renderItem={({item}) => {
            return(<Text style={styles.text}>{item.date}</Text>)
          }}
          keyExtractor={item => item.id}
        />
      </View>
      <View style={styles.box}>
        <Text style={styles.text}>Habits for today: {habitsToday.length}</Text>
        <FlatList 
          data={habitsToday}
          renderItem={({item}) => {
            return(<Text style={styles.text}>{!item.isChecked ? item.text : ''}</Text>)
          }}
          keyExtractor={item => item.id}
        />
      </View>
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
    color: 'white',
  }, 
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 100,
    flex: 1,
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 15,
  },
  icon: {
    padding: 5,
    fontStyle: 24,
  },
  settingsBtn: {
    justifyContent: 'center',
    marginRight: 10
  },
  box: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.teal,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 20,
    padding: 10,
    alignItems: 'center'
  },
  text: { 
    fontSize: 18, 
    fontWeight: '400',
    color: 'white'
  },
});