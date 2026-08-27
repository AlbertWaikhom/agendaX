import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { EventService, EventFilter } from '../../services/eventService';
import { EventItem } from '../../types';
import { PageContainer } from '../../../components/page/PageContainer';
import { PageLockGuard } from '../../components/security/PageLockGuard';
import { EventCard } from '../../components/events/EventCard';
import { EventFormModal } from '../../components/events/EventFormModal';
import { EventDetailsModal } from '../../components/events/EventDetailsModal';
import { FloatingActionButton } from '../../components/common/FloatingActionButton';
import { createEventsStyles } from './EventsScreen.styles';

export const EventsScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createEventsStyles(colors), [colors]);

  const { events, addEvent, updateEvent, deleteEvent } = useWorkspace();

  const [viewMode, setViewMode] = useState<EventFilter>('upcoming');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const displayedEvents = useMemo(() => {
    return EventService.filterEvents(events, viewMode);
  }, [events, viewMode]);

  const handleSelectEvent = (event: EventItem) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  const handleEdit = (event: EventItem) => {
    setSelectedEvent(event);
    setShowDetailsModal(false);
    setShowFormModal(true);
  };

  const handleSave = (data: any) => {
    if (selectedEvent && showFormModal) {
      updateEvent({ ...selectedEvent, ...data });
    } else {
      addEvent(data);
    }
  };

  return (
    <PageContainer>
      <PageLockGuard pageId="Events" pageTitle="Calendar Events">
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Events & Schedule</Text>
              <Text style={styles.headerSubtitle}>{events.length} total events scheduled</Text>
            </View>
          </View>

          {/* View Mode Toggle */}
          <View style={styles.viewModeToggle}>
            {(['upcoming', 'today', 'this_week', 'all'] as const).map(mode => {
              const active = viewMode === mode;
              const label = mode === 'this_week' ? 'This Week' : mode.charAt(0).toUpperCase() + mode.slice(1);
              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setViewMode(mode)}
                  style={[styles.viewModeBtn, active && styles.viewModeBtnActive]}
                >
                  <Text style={[styles.viewModeText, active && styles.viewModeTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Events List */}
          <FlatList
            data={displayedEvents}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <EventCard
                event={item}
                onPress={() => handleSelectEvent(item)}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={48} color={colors.textMuted} style={styles.emptyIcon} />
                <Text style={styles.emptyTitle}>No events found</Text>
                <Text style={styles.emptySub}>Tap the + button to schedule a meeting or event.</Text>
              </View>
            }
          />
        </View>

        <FloatingActionButton
          onPress={() => {
            setSelectedEvent(null);
            setShowFormModal(true);
          }}
        />

        <EventFormModal
          visible={showFormModal}
          initialEvent={selectedEvent}
          onClose={() => {
            setShowFormModal(false);
            setSelectedEvent(null);
          }}
          onSave={handleSave}
        />

        <EventDetailsModal
          visible={showDetailsModal}
          event={selectedEvent}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedEvent(null);
          }}
          onEdit={handleEdit}
          onDelete={id => deleteEvent(id)}
        />
      </PageLockGuard>
    </PageContainer>
  );
};
