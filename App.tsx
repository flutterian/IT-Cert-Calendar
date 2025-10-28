import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
  const markedDates = {
    '2025-10-27': {
      periods: [
        { title: 'SQLD', startingDay: true, endingDay: false, color: '#50cebb' }, // A 시작
      ]
    },
    '2025-10-28': {
      periods: [
        { title: 'SQLD', startingDay: false, endingDay: false, color: '#50cebb' }, // A 중간
        { title: 'DAsP', startingDay: true, endingDay: false, color: '#f08080' },  // B 시작
      ]
    },
    '2025-10-29': {
      periods: [
        { title: 'SQLD', startingDay: false, endingDay: true, color: '#50cebb' },  // A 끝
        { title: 'DAsP', startingDay: false, endingDay: false, color: '#f08080' }, // B 중간
      ]
    },
    '2025-10-30': {
      periods: [
        { title: ' ', color: 'transparent' },  // A 끝
        { title: 'DAsP', startingDay: false, endingDay: true, color: '#f08080' },  // B 끝
      ]
    },
    '2025-10-31': {
      periods: [
        { title: '정보처리기사', startingDay: true, endingDay: true, color: 'orange' },  // B 끝
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
        markingType="multi-dot"
        markedDates={markedDates}
        dayComponent={({ date, marking }) => {
          const dots = marking?.periods || [];

          return (
            <View style={{ alignItems: 'center', paddingVertical: 3 }}>
              {/* 날짜 */}
              <Text style={{ fontSize: 12 }}>{date?.day}</Text>

              {/* dot or title */}
              {dots.map((d, i) => (
                <View key={i} style={{ alignItems: 'center', marginTop: 2 }}>
                  {(d as any).title ? (
                    // 🔹 시작일이면 title 표시
                    <View
                      style={{
                        backgroundColor: d.color,
                        borderRadius: 8,
                        paddingHorizontal: 4,
                        paddingVertical: 2,
                      }}
                    >
                      <Text
                        style={{
                          color: 'white',
                          fontSize: 8,
                          fontWeight: '500',
                        }}
                        numberOfLines={1}
                      >
                        {(d as any).title}
                      </Text>
                    </View>
                  ) : (
                    // 🔹 일반일이면 dot 표시
                    <View
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 3,
                        backgroundColor: d.color,
                        marginTop: 1,
                      }}
                    />
                  )}
                </View>
              ))}
            </View>
          );
        }}
      />
      {/* <AgendaList
        sections={agendaData}
        renderItem={(item) => <Text>{(item as any).name}</Text>}
        sectionStyle={{ backgroundColor: '#eee', padding: 8 }}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, backgroundColor: '#fff' },
  title: { fontSize: 20, textAlign: 'center', marginBottom: 20, fontWeight: 'bold' },
});