import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
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

type ExamPeriod = {
  title?: string;
  color: string;
  startingDay?: boolean;
  endingDay?: boolean;
};

type ExamMarkedDates = Record<string, { periods: ExamPeriod[] }>;

type AgendaItem = {
  id: string;
  name: string;
  color: string;
  status: string;
  height: number;
  day: string;
};

type AgendaRow = AgendaItem | { id: string; isEmpty: true };

const MARKED_DATES: ExamMarkedDates = {
  '2025-10-27': {
    periods: [
      { title: 'SQLD', startingDay: true, endingDay: false, color: '#50cebb' }, // A 시작
    ],
  },
  '2025-10-28': {
    periods: [
      { title: 'SQLD', startingDay: false, endingDay: false, color: '#50cebb' }, // A 중간
      { title: 'DAsP', startingDay: true, endingDay: false, color: '#f08080' }, // B 시작
    ],
  },
  '2025-10-29': {
    periods: [
      { title: 'SQLD', startingDay: false, endingDay: true, color: '#50cebb' }, // A 끝
      { title: 'DAsP', startingDay: false, endingDay: false, color: '#f08080' }, // B 중간
    ],
  },
  '2025-10-30': {
    periods: [
      { title: 'DAsP', startingDay: false, endingDay: true, color: '#f08080' }, // B 끝
    ],
  },
  '2025-10-31': {
    periods: [
      { title: '정보처리산업기사', startingDay: true, endingDay: true, color: 'orange' }, // C 일정
    ],
  },
};

const weekdayNames = ['일', '월', '화', '수', '목', '금', '토'];

const formatDisplayDate = (dateString: string) => {
  if (!dateString) {
    return '';
  }
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = weekdayNames[date.getDay()];
  return `${year}년 ${month}월 ${day}일 (${weekday})`;
};

const getPeriodStatus = (period: ExamPeriod) => {
  if (period.startingDay && period.endingDay) {
    return '당일 일정';
  }
  if (period.startingDay) {
    return '접수 시작일';
  }
  if (period.endingDay) {
    return '접수 마감일';
  }
  return '진행 중';
};

const isAgendaItem = (item: AgendaRow): item is AgendaItem => {
  return (item as AgendaItem).name !== undefined;
};

export default function App() {
  const dateKeys = React.useMemo(() => Object.keys(MARKED_DATES), []);
  const [selectedDate, setSelectedDate] = React.useState<string>(dateKeys[0] ?? '');

  const calendarMarkedDates = React.useMemo(() => {
    const base = Object.entries(MARKED_DATES).reduce<Record<string, any>>((acc, [dateKey, value]) => {
      acc[dateKey] = { ...value };
      return acc;
    }, {});

    if (selectedDate) {
      base[selectedDate] = {
        ...(base[selectedDate] ?? {}),
        selected: true,
      };
    }

    return base;
  }, [selectedDate]);

  const selectedSubjects = React.useMemo(() => {
    if (!selectedDate) {
      return [] as AgendaItem[];
    }

    const periods = MARKED_DATES[selectedDate]?.periods ?? [];
    return periods
      .filter((period) => period.title && period.title.trim().length > 0)
      .map((period, index) => ({
        id: `${selectedDate}-${index}`,
        name: period.title?.trim() ?? '',
        color: period.color,
        status: getPeriodStatus(period),
        height: 80,
        day: selectedDate,
      }));
  }, [selectedDate]);

  const agendaSections = React.useMemo(
    () =>
      selectedDate
        ? [
          {
            title: formatDisplayDate(selectedDate),
            data: selectedSubjects.length
              ? (selectedSubjects as AgendaRow[])
              : ([{ id: `${selectedDate}-empty`, isEmpty: true }] as AgendaRow[]),
          },
        ]
        : [],
    [selectedDate, selectedSubjects],
  );

  const handleApplyPress = React.useCallback((subjectName: string) => {
    Alert.alert('신청 안내', `${subjectName} 접수 페이지로 이동합니다.`, [{ text: '확인' }]);
  }, []);

  const renderAgendaItem = React.useCallback(
    (item: AgendaRow) => {
      if (!isAgendaItem(item)) {
        return (
          <View style={styles.emptyAgenda}>
            <Text style={styles.emptyAgendaText}>등록된 일정이 없습니다.</Text>
          </View>
        );
      }

      return (
        <View style={styles.agendaItem}>
          <View style={[styles.agendaColor, { backgroundColor: item.color }]} />
          <View style={styles.agendaDetails}>
            <Text style={styles.agendaTitle}>{item.name}</Text>
            <Text style={styles.agendaStatus}>{item.status}</Text>
          </View>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => handleApplyPress(item.name)}
            activeOpacity={0.8}
          >
            <Text style={styles.applyButtonText}>신청하기</Text>
          </TouchableOpacity>
        </View>
      );
    },
    [handleApplyPress],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📘 IT 자격증 일정 안내</Text>
      <View style={styles.calendarWrapper}>
        <Calendar
          markingType="multi-dot"
          markedDates={calendarMarkedDates}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          dayComponent={({ date, marking, state }) => {
            console.log({ state })
            if (!date) {
              return null;
            }
            const periods = marking?.periods ?? [];
            const isSelected = date.dateString === selectedDate;

            return (
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.dayContainer, isSelected && styles.selectedDayContainer]}
                onPress={() => setSelectedDate(date.dateString)}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    isSelected && styles.selectedDayLabel,
                  ]}
                >
                  {date.day}
                </Text>

                {periods.map((period: ExamPeriod, index: number) => {
                  const hasTitle = period.title && period.title.trim().length > 0;
                  return hasTitle ? (
                    <View
                      key={`${date.dateString}-${index}`}
                      style={[styles.dayChip, { backgroundColor: period.color }]}
                    >
                      <Text style={styles.dayChipText} numberOfLines={1}>
                        {period.title}
                      </Text>
                    </View>
                  ) : (
                    <View
                      key={`${date.dateString}-${index}`}
                      style={[styles.dot, { backgroundColor: period.color }]}
                    />
                  );
                })}
              </TouchableOpacity>
            );
          }}
        />
      </View>
      {selectedDate ? (
        <>
          <View style={styles.agendaHeader}>
            <Text style={styles.agendaHeaderDate}>{formatDisplayDate(selectedDate)}</Text>
          </View>
          <AgendaList
            sections={agendaSections}
            renderItem={(item) => renderAgendaItem(item.item as AgendaRow)}
            keyExtractor={(item) => (item as AgendaRow).id}
            sectionStyle={styles.sectionHeader}
            contentContainerStyle={styles.agendaContent}
            dayFormatter={(dateString) => formatDisplayDate(dateString)}
          />
        </>
      ) : (
        <View style={styles.agendaHeader}>
          <Text style={styles.emptyAgendaText}>표시할 일정이 없습니다.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, backgroundColor: '#fff' },
  title: { fontSize: 20, textAlign: 'center', marginBottom: 16, fontWeight: 'bold' },
  calendarWrapper: { paddingHorizontal: 16 },
  dayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 10,
    minHeight: 60,
  },
  selectedDayContainer: { backgroundColor: '#1d4ed8' },
  dayLabel: { fontSize: 12, color: '#1f2937', fontWeight: '500' },
  outsideMonthLabel: { color: '#9ca3af' },
  selectedDayLabel: { color: '#fff' },
  dayChip: {
    marginTop: 2,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
  },
  dayChipText: { color: '#fff', fontSize: 8, fontWeight: '600' },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
  agendaHeader: { marginTop: 24, marginBottom: 8, paddingHorizontal: 20 },
  agendaHeaderDate: { fontSize: 16, fontWeight: '600', color: '#111827' },
  agendaContent: { paddingHorizontal: 20, paddingBottom: 32 },
  sectionHeader: { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 8 },
  agendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  agendaColor: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  agendaDetails: { flex: 1 },
  agendaTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  agendaStatus: { marginTop: 4, fontSize: 12, color: '#6b7280' },
  applyButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  applyButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  emptyAgenda: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyAgendaText: { fontSize: 14, color: '#6b7280' },
});
