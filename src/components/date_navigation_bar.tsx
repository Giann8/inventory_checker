import React from 'react';
import { theme } from '../theme';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
interface DateNavigationBarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  showShiftIndicator?: boolean;
}

const DateNavigationBar: React.FC<DateNavigationBarProps> = ({ 
  currentDate, 
  onDateChange,
  showShiftIndicator = true 
}) => {
  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const formatDate = (date: Date) => {
    const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return { dayName, formatted: `${day} ${month} ${year}` };
  };

  const isToday = () => {
    const today = new Date();
    return currentDate.toDateString() === today.toDateString();
  };

  const isTodayOrFuture = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const current = new Date(currentDate);
    current.setHours(0, 0, 0, 0);
    return current >= today;
  };

  const getCurrentShift = () => {
    const hours = new Date().getHours();
    return hours < 14 ? 'Turno Mattina' : 'Turno Sera';
  };

  const { dayName, formatted } = formatDate(currentDate);

  return (
    <View style={styles.container}>
      <View style={styles.navigationRow}>
        <TouchableOpacity 
          style={styles.arrowButton} 
          onPress={goToPreviousDay}
        >
          <Text style={styles.arrowText}>◀</Text>
        </TouchableOpacity>

        <View style={styles.dateContainer}>
          <Text style={styles.dayName}>{dayName}</Text>
          <Text style={styles.dateText}>{formatted}</Text>
          {isToday() && showShiftIndicator && (
            <View style={styles.shiftBadge}>
              <Text style={styles.shiftText}>{getCurrentShift()}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.arrowButton, isTodayOrFuture() && styles.arrowButtonDisabled]} 
          onPress={goToNextDay}
          disabled={isTodayOrFuture()}
        >
          <Text style={[styles.arrowText, isTodayOrFuture() && styles.arrowTextDisabled]}>▶</Text>
        </TouchableOpacity>
      </View>

      {!isToday() && (
        <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
          <Text style={styles.todayButtonText}><Ionicons name="calendar" size={16} color={theme.colors.surface} /> Vai a Oggi</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primary,
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowButtonDisabled: {
    opacity: 0.3,
  },
  arrowText: {
    color: theme.colors.surface,
    fontSize: 20,
    fontWeight: 'bold',
  },
  arrowTextDisabled: {
    opacity: 0.5,
  },
  dateContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  dayName: {
    color: theme.colors.secondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateText: {
    color: theme.colors.surface,
    fontSize: 20,
    fontWeight: 'bold',
  },
  shiftBadge: {
    backgroundColor: theme.colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  shiftText: {
    color: theme.colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  todayButton: {
    backgroundColor: theme.colors.surface + '26',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 12,
    alignSelf: 'center',
  },
  todayButtonText: {
    color: theme.colors.surface,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default DateNavigationBar;
