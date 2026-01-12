import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { format, isSameDay } from 'date-fns';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Music, Plus, X, Clock, MapPin, Tag } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  location?: string;
  mood: 'Happy' | 'Calm' | 'Romantic' | 'Energetic' | 'Focus' | 'Party';
  description?: string;
}

const moodEmojis = {
  Happy: '😊',
  Calm: '😌',
  Romantic: '💕',
  Energetic: '⚡',
  Focus: '🎯',
  Party: '🎉'
};

const moodColors = {
  Happy: 'bg-yellow-500/20 border-yellow-500',
  Calm: 'bg-blue-500/20 border-blue-500',
  Romantic: 'bg-pink-500/20 border-pink-500',
  Energetic: 'bg-orange-500/20 border-orange-500',
  Focus: 'bg-purple-500/20 border-purple-500',
  Party: 'bg-green-500/20 border-green-500'
};

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    location: '',
    mood: 'Happy' as CalendarEvent['mood'],
    description: ''
  });

  // Load events from localStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem('aura-calendar-events');
    if (savedEvents) {
      const parsed = JSON.parse(savedEvents);
      setEvents(parsed.map((e: any) => ({ ...e, date: new Date(e.date) })));
    }
  }, []);

  // Save events to localStorage
  const saveEvents = (updatedEvents: CalendarEvent[]) => {
    setEvents(updatedEvents);
    localStorage.setItem('aura-calendar-events', JSON.stringify(updatedEvents));
  };

  // Get events for selected date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  // Get events for today
  const todayEvents = getEventsForDate(new Date());

  // Get upcoming events
  const upcomingEvents = events
    .filter(event => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  // Add new event
  const handleAddEvent = () => {
    if (!newEvent.title) return;

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: selectedDate,
      time: newEvent.time,
      location: newEvent.location,
      mood: newEvent.mood,
      description: newEvent.description
    };

    saveEvents([...events, event]);
    setNewEvent({
      title: '',
      time: '',
      location: '',
      mood: 'Happy',
      description: ''
    });
    setShowAddEvent(false);
  };

  // Delete event
  const handleDeleteEvent = (eventId: string) => {
    saveEvents(events.filter(e => e.id !== eventId));
  };

  // Get recommended songs based on mood
  const getMoodRecommendations = (mood: CalendarEvent['mood']) => {
    const recommendations: Record<CalendarEvent['mood'], string[]> = {
      Happy: ['Upbeat Pop', 'Feel Good Vibes', 'Sunshine Mix'],
      Calm: ['Ambient Chill', 'Relaxation Station', 'Peaceful Piano'],
      Romantic: ['Love Songs', 'Romantic Evening', 'Soulful Melodies'],
      Energetic: ['Workout Beats', 'High Energy', 'Power Hour'],
      Focus: ['Deep Focus', 'Study Music', 'Concentration Mix'],
      Party: ['Dance Party', 'Top Hits', 'Club Bangers']
    };
    return recommendations[mood];
  };

  // Check if date has events
  const tileContent = ({ date }: { date: Date }) => {
    const dateEvents = getEventsForDate(date);
    if (dateEvents.length > 0) {
      return (
        <div className="flex justify-center mt-1">
          <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CalendarIcon className="w-8 h-8 text-pink-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Music Calendar
            </h1>
          </div>
          <p className="text-gray-300">Plan your events and get personalized music recommendations</p>
          {events.length === 0 && (
            <p className="text-gray-400 text-sm mt-2">
              No events yet — click 'Add Event' to create one!
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6"
            >
              <div className="calendar-container">
                <Calendar
                  onChange={(value) => setSelectedDate(value as Date)}
                  value={selectedDate}
                  tileContent={tileContent}
                  className="react-calendar-custom"
                />
              </div>

              {/* Selected Date Events */}
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4">
                  Events for {format(selectedDate, 'MMMM d, yyyy')}
                </h3>

                <button
                  onClick={() => setShowAddEvent(true)}
                  className="mb-4 w-full px-4 py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg flex items-center justify-center gap-2 hover:from-pink-500 hover:to-purple-500 transition"
                >
                  <Plus className="w-5 h-5" />
                  Add Event
                </button>

                {/* Add Event Form */}
                {showAddEvent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-4 p-4 bg-black/20 rounded-lg border border-white/10"
                  >
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Event title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-pink-500"
                      />
                      <input
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-pink-500"
                      />
                      <input
                        type="text"
                        placeholder="Location (optional)"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-pink-500"
                      />
                      <select
                        value={newEvent.mood}
                        onChange={(e) => setNewEvent({ ...newEvent, mood: e.target.value as CalendarEvent['mood'] })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-pink-500"
                      >
                        {Object.keys(moodEmojis).map(mood => (
                          <option key={mood} value={mood}>
                            {moodEmojis[mood as CalendarEvent['mood']]} {mood}
                          </option>
                        ))}
                      </select>
                      <textarea
                        placeholder="Description (optional)"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-pink-500 h-20 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddEvent}
                          className="flex-1 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-500 transition"
                        >
                          Save Event
                        </button>
                        <button
                          onClick={() => setShowAddEvent(false)}
                          className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Event List */}
                <div className="space-y-3">
                  {getEventsForDate(selectedDate).length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No events for this day</p>
                  ) : (
                    getEventsForDate(selectedDate).map(event => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 rounded-lg border ${moodColors[event.mood]}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">{moodEmojis[event.mood]}</span>
                              <h4 className="text-lg font-semibold">{event.title}</h4>
                            </div>
                            {event.time && (
                              <div className="flex items-center gap-2 text-sm text-gray-300 mb-1">
                                <Clock className="w-4 h-4" />
                                {event.time}
                              </div>
                            )}
                            {event.location && (
                              <div className="flex items-center gap-2 text-sm text-gray-300 mb-1">
                                <MapPin className="w-4 h-4" />
                                {event.location}
                              </div>
                            )}
                            {event.description && (
                              <p className="text-sm text-gray-300 mt-2">{event.description}</p>
                            )}
                            <div className="mt-3">
                              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                <Music className="w-4 h-4" />
                                Recommended Playlists:
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {getMoodRecommendations(event.mood).map((playlist, idx) => (
                                  <span key={idx} className="px-3 py-1 bg-white/5 rounded-full text-xs">
                                    {playlist}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition"
                          >
                            <X className="w-5 h-5 text-red-400" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6"
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-pink-400" />
                Today's Events
              </h3>
              {todayEvents.length === 0 ? (
                <p className="text-gray-400 text-sm">No events today</p>
              ) : (
                <div className="space-y-3">
                  {todayEvents.map(event => (
                    <div key={event.id} className={`p-3 rounded-lg border ${moodColors[event.mood]}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span>{moodEmojis[event.mood]}</span>
                        <span className="font-semibold text-sm">{event.title}</span>
                      </div>
                      {event.time && (
                        <div className="text-xs text-gray-300">{event.time}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Upcoming Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6"
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-purple-400" />
                Upcoming Events
              </h3>
              {upcomingEvents.length === 0 ? (
                <p className="text-gray-400 text-sm">No upcoming events</p>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="p-3 bg-black/20 rounded-lg border border-white/10">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{moodEmojis[event.mood]}</span>
                        <span className="font-semibold text-sm">{event.title}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {format(event.date, 'MMM d, yyyy')}
                        {event.time && ` • ${event.time}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Mood Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6"
            >
              <h3 className="text-xl font-semibold mb-4">Mood Overview</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(moodEmojis).map(([mood, emoji]) => {
                  const count = events.filter(e => e.mood === mood).length;
                  return (
                    <div key={mood} className="p-3 bg-black/20 rounded-lg text-center">
                      <div className="text-2xl mb-1">{emoji}</div>
                      <div className="text-xs text-gray-400">{mood}</div>
                      <div className="text-lg font-semibold text-pink-400">{count}</div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <style>{`
        .react-calendar-custom {
          background: transparent !important;
          border: none !important;
          color: white !important;
          width: 100% !important;
          font-family: inherit !important;
        }
        
        .react-calendar-custom .react-calendar__tile {
          color: white !important;
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 8px !important;
          margin: 4px !important;
          padding: 12px !important;
          transition: all 0.2s !important;
        }
        
        .react-calendar-custom .react-calendar__tile:hover {
          background: rgba(236, 72, 153, 0.2) !important;
          border-color: rgba(236, 72, 153, 0.5) !important;
        }
        
        .react-calendar-custom .react-calendar__tile--active {
          background: rgba(236, 72, 153, 0.3) !important;
          border-color: rgba(236, 72, 153, 0.8) !important;
        }
        
        .react-calendar-custom .react-calendar__tile--now {
          background: rgba(168, 85, 247, 0.2) !important;
          border-color: rgba(168, 85, 247, 0.5) !important;
        }
        
        .react-calendar-custom .react-calendar__month-view__weekdays {
          color: rgba(255, 255, 255, 0.6) !important;
          font-weight: 600 !important;
          font-size: 14px !important;
        }
        
        .react-calendar-custom .react-calendar__navigation button {
          color: white !important;
          background: rgba(255, 255, 255, 0.05) !important;
          border-radius: 8px !important;
          margin: 4px !important;
          font-size: 16px !important;
          font-weight: 600 !important;
        }
        
        .react-calendar-custom .react-calendar__navigation button:hover {
          background: rgba(236, 72, 153, 0.2) !important;
        }
      `}</style>
    </div>
  );
}

