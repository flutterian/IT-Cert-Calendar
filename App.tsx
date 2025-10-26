import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// 한국어 설정
LocaleConfig.locales['ko'] = {
  monthNames: [
    '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'
  ],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘'
};
LocaleConfig.defaultLocale = 'ko';

export default function App() {
  // const markedDates = {
  //   '2025-03-08': { marked: true, dotColor: '#2196f3', activeOpacity: 0 },
  //   '2025-03-15': { marked: true, dotColor: '#4caf50' },
  //   '2025-03-22': { marked: true, dotColor: '#ff5722' },
  //   '2025-03-30': {
  //     selected: true,
  //     marked: true,
  //     selectedColor: '#f48fb1',
  //     dotColor: '#f44336'
  //   },
  // };

  const markedDates = {
    '2025-10-27': { startingDay: true, color: '#50cebb', textColor: 'white' },
    '2025-10-28': { color: '#70d7c7', textColor: 'white' },
    '2025-10-29': { color: '#70d7c7', textColor: 'white' },
    '2025-10-30': { endingDay: true, color: '#50cebb', textColor: 'white' },
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📘 IT 자격증 일정 안내</Text>
      <Calendar
        markingType="period"
        markedDates={markedDates}
        onDayPress={(day) => Alert.alert(`${day.dateString} 일정 안내`, '해당 날짜의 시험 접수 또는 발표일 정보를 표시합니다.')}
        theme={{
          todayTextColor: '#2196f3',
          arrowColor: '#2196f3',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, backgroundColor: '#fff' },
  title: { fontSize: 20, textAlign: 'center', marginBottom: 20, fontWeight: 'bold' },
});