
import PlaylistManager from "@/components/PlaylistManager";
import { useSongs } from "@/hooks/useSongs";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import AudioPlayerControls from "@/components/AudioPlayerControls";
import SongComments from "@/components/SongComments";

const PlaylistsPage = () => {
  const { data: songs = [], isLoading, error } = useSongs();
  
  const {
    isPlaying,
    currentSong,
    progress,
    volume,
    duration,
    isShuffled,
    repeatMode,
    playPlaylist,
    togglePlayPause,
    playNext,
    playPrevious,
    toggleShuffle,
    toggleRepeat,
    seekTo,
    setVolume,
    formatTime
  } = useAudioPlayer();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <p className="text-red-400">Error loading songs</p>
      </div>
    );
  }

  // Calculate current time for comments
  const currentTimeInSeconds = (progress[0] / 100) * duration;
  const currentTimeFormatted = formatTime(currentTimeInSeconds);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8 pb-24">
        {/* Playlist Manager */}
        <div className="mb-10">
          <PlaylistManager songs={songs} onPlayPlaylist={playPlaylist} />
        </div>
        
        {/* Current Song Comments */}
        {currentSong && (
          <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Current Song: {currentSong.title}</h2>
            <SongComments 
              songId={currentSong.id} 
              currentTime={currentTimeFormatted}
              onTimestampClick={(timestamp) => {
                const [mins, secs] = timestamp.split(':').map(Number);
                const seconds = (mins * 60) + (secs || 0);
                const progressPercent = (seconds / duration) * 100;
                seekTo([progressPercent]);
              }}
            />
          </div>
        )}
      </div>

      <AudioPlayerControls
        isPlaying={isPlaying}
        currentSong={currentSong}
        progress={progress}
        volume={volume}
        duration={duration}
        isShuffled={isShuffled}
        repeatMode={repeatMode}
        onPlayPause={togglePlayPause}
        onSeek={seekTo}
        onVolumeChange={setVolume}
        onNext={playNext}
        onPrevious={playPrevious}
        onToggleShuffle={toggleShuffle}
        onToggleRepeat={toggleRepeat}
        formatTime={formatTime}
      />
    </div>
  );
};

export default PlaylistsPage;
