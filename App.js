import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';

const STORAGE_KEY = 'events';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});


const fmtDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fmtTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function App() {
  const [events, setEvents] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [remind, setRemind] = useState(true);
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');


  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) setEvents(JSON.parse(saved));
      try {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Event reminders',
          importance: Notifications.AndroidImportance.MAX,
        });
      } catch (e) {
        console.log('Channel setup skipped');
      }
      await Notifications.requestPermissionsAsync();
    })();
  }, []);


  const saveEvents = async (list) => {
    setEvents(list);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const scheduleReminder = async () => {
    if (!remind) return null;
    try {
      return await Notifications.scheduleNotificationAsync({
        content: { title: 'Event reminder', body: name.trim() },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
      });
    } catch (e) {
      Alert.alert('Error', 'Could not schedule the reminder.');
      return null;
    }
  };

  const cancelReminder = async (id) => {
    if (id) await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setDate(new Date());
    setRemind(true);
    setEditingId(null);
  };

  const submitEvent = async () => {
    if (name.trim() === '') {
      Alert.alert('Invalid input', 'Event name is required.');
      return;
    }
    if (date <= new Date()) {
      Alert.alert('Invalid input', 'Please choose a future date and time.');
      return;
    }
    if (editingId) {
      const old = events.find((e) => e.id === editingId);
      await cancelReminder(old.notificationId);
      const notificationId = await scheduleReminder();
      await saveEvents(
        events.map((e) =>
          e.id === editingId
            ? { ...e, name: name.trim(), description: description.trim(), dateTime: date.toISOString(), notificationId }
            : e
        )
      );
    } else {
      const notificationId = await scheduleReminder();
      await saveEvents([
        ...events,
        {
          id: Date.now().toString(),
          name: name.trim(),
          description: description.trim(),
          dateTime: date.toISOString(),
          notificationId,
        },
      ]);
    }
    resetForm();
  };

  const startEdit = (e) => {
    setEditingId(e.id);
    setName(e.name);
    setDescription(e.description);
    setDate(new Date(e.dateTime));
  };


  const deleteEvent = (e) => {
    Alert.alert('Delete event', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await cancelReminder(e.notificationId);
          if (editingId === e.id) resetForm();
          await saveEvents(events.filter((x) => x.id !== e.id));
        },
      },
    ]);
  };


  const onDateChange = (ev, selected) => {
    setShowDate(false);
    if (ev.type === 'set' && selected) {
      const d = new Date(date);
      d.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
      setDate(d);
    }
  };
  const onTimeChange = (ev, selected) => {
    setShowTime(false);
    if (ev.type === 'set' && selected) {
      const d = new Date(date);
      d.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      setDate(d);
    }
  };


  const q = search.trim().toLowerCase();
  const filtered = events.filter(
    (e) => q === '' || e.name.toLowerCase().includes(q) || fmtDate(new Date(e.dateTime)).includes(q)
  );
  const now = new Date();
  const upcoming = filtered
    .filter((e) => new Date(e.dateTime) > now)
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  const past = filtered.filter((e) => new Date(e.dateTime) <= now);

  const renderCard = (e, isPast) => {
    const d = new Date(e.dateTime);
    return (
      <View key={e.id} style={[styles.card, isPast && { opacity: 0.5 }]}>
        <Text style={styles.cardTitle}>{e.name}</Text>
        <Text>{fmtDate(d)}  {fmtTime(d)}</Text>
        {e.description !== '' && <Text>{e.description}</Text>}
        <View style={styles.row}>
          {!isPast && <Button title="Edit" onPress={() => startEdit(e)} />}
          <Button title="Delete" color="red" onPress={() => deleteEvent(e)} />
        </View>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Event Planner</Text>

      <TextInput style={styles.input} placeholder="Event name" value={name} onChangeText={setName} />
      <TextInput
        style={[styles.input, { height: 70 }]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Date: {fmtDate(date)}</Text>
      <Button title="Pick date" onPress={() => setShowDate(true)} />
      <Text style={styles.label}>Time: {fmtTime(date)}</Text>
      <Button title="Pick time" onPress={() => setShowTime(true)} />
      {showDate && <DateTimePicker value={date} mode="date" minimumDate={new Date()} onChange={onDateChange} />}
      {showTime && <DateTimePicker value={date} mode="time" onChange={onTimeChange} />}

      <View style={styles.row}>
        <Text style={styles.label}>Remind me at event time</Text>
        <Switch value={remind} onValueChange={setRemind} />
      </View>

      <Button title={editingId ? 'Update Event' : 'Add Event'} onPress={submitEvent} />
      {editingId && <Button title="Cancel Edit" color="gray" onPress={resetForm} />}

      <TextInput
        style={[styles.input, { marginTop: 20 }]}
        placeholder="Search by name or date (YYYY-MM-DD)"
        value={search}
        onChangeText={setSearch}
      />

      <Text style={styles.subtitle}>Upcoming Events</Text>
      {upcoming.length === 0 ? (
        <Text style={styles.empty}>No upcoming events.</Text>
      ) : (
        upcoming.map((e) => renderCard(e, false))
      )}

      {past.length > 0 && <Text style={styles.subtitle}>Past Events</Text>}
      {past.map((e) => renderCard(e, true))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60, paddingBottom: 60 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 12 },
  subtitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#999', borderRadius: 6, padding: 10, marginBottom: 12 },
  label: { marginVertical: 8, fontSize: 16 },
  empty: { color: '#777', fontStyle: 'italic' },
  card: { backgroundColor: '#eef2ff', padding: 12, borderRadius: 8, marginBottom: 10 },
  cardTitle: { fontWeight: 'bold', fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 6 },
});