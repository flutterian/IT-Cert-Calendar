import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Linking, ScrollView } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { collection, onSnapshot } from 'firebase/firestore';
import { firestoreDb } from './firebaseConfig';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

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
  applyUrl?: string;
};

type ExamMarkedDates = Record<string, { periods: ExamPeriod[] }>;

type AgendaItem = {
  id: string;
  name: string;
  color: string;
  status: string;
  height: number;
  day: string;
  applyUrl?: string;
};

type FirestoreExamSchedule = {
  id: string;
  title?: string;
  name?: string;
  color?: string;
  startDate?: string;
  endDate?: string;
  applyUrl?: string;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const weekdayNames = ['일', '월', '화', '수', '목', '금', '토'];

const createUTCDate = (value: string | undefined) => {
  if (!value) {
    return null;
  }
  const [year, month, day] = value.split('-').map((part) => Number(part));
  if ([year, month, day].some((part) => Number.isNaN(part))) {
    return null;
  }
  return new Date(Date.UTC(year, month - 1, day));
};

const formatDateKey = (date: Date) => {
  return date.toISOString().split('T')[0] ?? '';
};

const mergeScheduleIntoMarkedDates = (acc: ExamMarkedDates, schedule: FirestoreExamSchedule) => {
  const startDate = createUTCDate(schedule.startDate);
  const endDate = schedule.endDate ? createUTCDate(schedule.endDate) : startDate;

  if (!startDate || !endDate) {
    return acc;
  }

  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / DAY_IN_MS) + 1;
  const label = schedule.title?.trim() || schedule.name?.trim() || '무제';
  const color = schedule.color?.trim() || '#2563eb';

  for (let dayIndex = 0; dayIndex < totalDays; dayIndex += 1) {
    const currentDate = new Date(startDate.getTime() + dayIndex * DAY_IN_MS);
    const dateKey = formatDateKey(currentDate);
    if (!dateKey) {
      continue;
    }

    const newPeriod: ExamPeriod = {
      title: label,
      color,
      startingDay: dayIndex === 0,
      endingDay: dayIndex === totalDays - 1,
      applyUrl: schedule.applyUrl,
    };

    acc[dateKey] = {
      periods: [...(acc[dateKey]?.periods ?? []), newPeriod],
    };
  }

  return acc;
};

const buildMarkedDatesFromSchedules = (schedules: FirestoreExamSchedule[]) => {
  return schedules.reduce<ExamMarkedDates>((acc, schedule) => mergeScheduleIntoMarkedDates(acc, schedule), {});
};

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

export default function App() {
  const [markedDates, setMarkedDates] = React.useState<ExamMarkedDates>({});
  const [selectedDate, setSelectedDate] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  useEffect(() => {
    registerForPushNotifications();
  }, []);

  async function registerForPushNotifications() {
    if (!Device.isDevice) return;

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('푸시 권한이 필요합니다.');
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("🚀 Expo Push Token:", token);
    alert("토큰 발급됨!\n" + token);
  }

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(firestoreDb, 'exams'),
      (snapshot) => {

        console.log("PROJECT:", firestoreDb.app.options.projectId);
        const schedules = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FirestoreExamSchedule));
        const validSchedules = schedules.filter((schedule) => Boolean(schedule.startDate));
        console.log({ snapshot, schedules, validSchedules });

        setMarkedDates(buildMarkedDatesFromSchedules(validSchedules));
        setIsLoading(false);
        setFetchError(null);
      },
      (error) => {
        console.error('Failed to load exam schedules', error);
        setFetchError('일정을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (selectedDate) {
      return;
    }
    const firstDate = Object.keys(markedDates).sort()[0];
    if (firstDate) {
      setSelectedDate(firstDate);
    }
  }, [markedDates, selectedDate]);

  const calendarMarkedDates = React.useMemo(() => {
    const base = Object.entries(markedDates).reduce<Record<string, any>>((acc, [dateKey, value]) => {
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

    const periods = markedDates[selectedDate]?.periods ?? [];
    return periods
      .filter((period) => period.title && period.title.trim().length > 0)
      .map((period, index) => ({
        id: `${selectedDate}-${index}`,
        name: period.title?.trim() ?? '',
        color: period.color,
        status: getPeriodStatus(period),
        height: 80,
        day: selectedDate,
        applyUrl: period.applyUrl,
      }));
  }, [selectedDate, markedDates]);

  const handleApplyPress = React.useCallback(async (subjectName: string, applyUrl?: string) => {
    if (applyUrl) {
      const supported = await Linking.canOpenURL(applyUrl);
      if (supported) {
        Linking.openURL(applyUrl);
        return;
      }
    }

    Alert.alert('신청 안내', `${subjectName} 접수 페이지로 이동합니다.`, [{ text: '확인' }]);
  }, []);

  const renderAgendaItem = React.useCallback(
    (item: AgendaItem) => {
      return (
        <View key={item.id} style={styles.agendaItem}>
          <View style={[styles.agendaColor, { backgroundColor: item.color }]} />
          <View style={styles.agendaDetails}>
            <Text style={styles.agendaTitle}>{item.name}</Text>
            <Text style={styles.agendaStatus}>{item.status}</Text>
          </View>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => handleApplyPress(item.name, item.applyUrl)}
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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>📘 IT 자격증 일정 안내</Text>
      <View style={styles.calendarWrapper}>
        <Calendar
          markingType="multi-dot"
          markedDates={calendarMarkedDates}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          dayComponent={({ date, marking }) => {
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
      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="small" color="#2563eb" />
          <Text style={styles.loadingText}>일정을 불러오는 중입니다...</Text>
        </View>
      ) : fetchError ? (
        <View style={styles.agendaHeader}>
          <Text style={styles.errorText}>{fetchError}</Text>
        </View>
      ) : selectedDate ? (
        <>
          <View style={styles.agendaHeader}>
            <Text style={styles.agendaHeaderDate}>{formatDisplayDate(selectedDate)}</Text>
          </View>
          <View style={styles.agendaContent}>
            {selectedSubjects.length ? (
              selectedSubjects.map((item) => renderAgendaItem(item))
            ) : (
              <View style={styles.emptyAgenda}>
                <Text style={styles.emptyAgendaText}>등록된 일정이 없습니다.</Text>
              </View>
            )}
          </View>
        </>
      ) : (
        <View style={styles.agendaHeader}>
          <Text style={styles.emptyAgendaText}>표시할 일정이 없습니다.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingTop: 60, paddingBottom: 40 },
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
  loadingWrapper: { marginTop: 32, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 8, fontSize: 13, color: '#6b7280' },
  errorText: { fontSize: 14, color: '#dc2626' },
});
