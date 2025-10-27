import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Calendar, LocaleConfig, AgendaList } from 'react-native-calendars';

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
    '2025-10-27': {
      periods: [
        { startingDay: true, endingDay: false, color: '#50cebb' }, // A 시작
      ]
    },
    '2025-10-28': {
      periods: [
        { startingDay: false, endingDay: false, color: '#50cebb' }, // A 중간
        { startingDay: true, endingDay: false, color: '#f08080' },  // B 시작
      ]
    },
    '2025-10-29': {
      periods: [
        { startingDay: false, endingDay: true, color: '#50cebb' },  // A 끝
        { startingDay: false, endingDay: false, color: '#f08080' }, // B 중간
      ]
    },
    '2025-10-30': {
      periods: [
        { color: 'transparent' },  // A 끝
        { startingDay: false, endingDay: true, color: '#f08080' },  // B 끝
      ]
    }
  }

  const agendaData = [
  {
    title: '2025-10-28',
    data: [
      { name: '출근 전 PT 운동', time: '07:30' },
      { name: '오전 회의', time: '10:00' },
      { name: '점심 약속', time: '12:30' },
    ],
  },
  {
    title: '2025-10-29',
    data: [
      { name: '프로젝트 디자인 리뷰', time: '09:00' },
      { name: '코드리뷰 회의', time: '15:00' },
    ],
  },
  {
    title: '2025-10-30',
    data: [], // 일정이 없는 날도 data는 빈 배열로 넣어야 합니다
  },
];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📘 IT 자격증 일정 안내</Text>
      <Calendar
        markingType="multi-period"
        markedDates={markedDates}
        onDayPress={(day) => Alert.alert(`${day.dateString} 일정 안내`, '해당 날짜의 시험 접수 또는 발표일 정보를 표시합니다.')}
        theme={{
          todayTextColor: '#2196f3',
          arrowColor: '#2196f3',
        }}
      />
       <AgendaList
        sections={agendaData}
        renderItem={(item) => <Text>{(item as any).name }</Text>}
        sectionStyle={{ backgroundColor: '#eee', padding: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, backgroundColor: '#fff' },
  title: { fontSize: 20, textAlign: 'center', marginBottom: 20, fontWeight: 'bold' },
});