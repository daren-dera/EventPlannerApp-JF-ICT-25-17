# EventPlannerApp-JF-ICT-25-17
# Event Planner App

**Name:** Philip Krishanth Daren
**Index Number:** JF/ICT/25/17
**Module:** Mobile Application Development (K72T001M15)
**Assessment:** Continual Assessment (30%), Individual Self-Study Project

---

## App Description

Event Planner is a mobile application that helps a user create, organize and be reminded of events. The user can add an event with a name, date, time and description, view upcoming events in date order, edit or delete events, search for events by name or date, and receive a notification reminder at the event time.

All data is stored locally on the phone, so events are still there after the app is closed and reopened.

---

## Features Implemented

1. **Create event** with name, date, time and description.
   - Input validation: the event name is required, and the date and time must be in the future. Invalid input shows an alert and does not crash the app.
2. **View upcoming events**, sorted by date and time.
   - Past events are shown in a separate "Past Events" section.
   - An empty state message appears when there are no events.
3. **Edit and delete events**.
   - Edit loads the event into the form so any detail can be updated.
   - A confirmation dialog appears before an event is deleted.
4. **Search** events by name or by date (format `YYYY-MM-DD`).
5. **Reminders / notifications**.
   - A notification is scheduled for the event time when "Remind me" is switched on.
   - Notification permission is requested properly (required on Android 13 and newer).
   - Reminders are cancelled or rescheduled when an event is deleted or edited.

---

## Tools and Technologies Used

- React Native (JavaScript) with Expo
- `@react-native-async-storage/async-storage` for local data storage
- `@react-native-community/datetimepicker` for choosing the date and time
- `expo-notifications` for scheduling reminders
- Expo Go for running the app on a phone
- Visual Studio Code, Git and GitHub

---

## How to Run the App

**Requirements:** Node.js (LTS), Git, and the **Expo Go** app on an Android phone.

1. Clone the repository:
   ```
   git clone https://github.com/daren-dera/EventPlannerApp-JF-ICT-25-17.git
   cd EventPlannerApp-JF-ICT-25-17
   ```
2. Install the dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npx expo start
   ```
4. Open **Expo Go** on your phone and scan the QR code shown in the terminal. The phone and the computer must be on the same Wi-Fi network.
5. When the app opens, allow notifications when Android asks for permission.

---

## Screenshots

| Add event form | Upcoming events list |
|---|---|
| ![Add event](screenshots/add-event.png) | ![Event list](screenshots/event-list.png) |

| Delete confirmation | Search |
|---|---|
| ![Delete confirmation](screenshots/delete-confirm.png) | ![Search](screenshots/search.png) |

| Notification permission / reminder |
|---|
| ![Notification](screenshots/notification.png) |

---

## Testing

| # | Test | Expected result | Result |
|---|------|-----------------|--------|
| 1 | Add an event with an empty name | Alert "Event name is required", nothing saved | |
| 2 | Add an event with a past date or time | Alert asking for a future date and time | |
| 3 | Add a valid event | Event appears in the Upcoming list | |
| 4 | Close and reopen the app | Saved events are still shown | |
| 5 | Add several events in mixed order | Upcoming list is sorted by date and time | |
| 6 | Edit an event and press Update | Changes are shown in the list | |
| 7 | Press Delete, then Cancel | Event is not deleted | |
| 8 | Press Delete, then confirm | Event is removed | |
| 9 | Search by part of an event name | Only matching events are shown | |
| 10 | Search by date (`YYYY-MM-DD`) | Only events on that date are shown | |
| 11 | Search for text that matches nothing | "No upcoming events" message, no crash | |
| 12 | Add an event 2 minutes ahead with reminder on | Notification appears at the event time | |

---

## Project Structure

```
EventPlannerApp-JF-ICT-25-17/
├── App.js            # Main app: all screens, logic and styles
├── index.js          # App entry point
├── app.json          # Expo configuration
├── package.json      # Dependencies
└── screenshots/      # Screenshots used in this README
```

---

## Academic Integrity

This is my own individual work for the Mobile Application Development module. I used official documentation and tutorials for reference and can explain every part of the code.