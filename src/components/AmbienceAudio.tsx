import React, { useRef, useState, useEffect } from 'react';
import { AUDIO_TRACKS } from '../data/quotesData';
import { Volume2, VolumeX, Play, Pause, SkipForward, X, Music } from 'lucide-react';

interface AmbienceAudioProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onShowToast: (text: string, type?: 'success' | 'favorite' | 'share' | 'info') => void;
}

export const AmbienceAudio: React.FC<AmbienceAudioProps> = ({
  isPlaying,
  onTogglePlay,
  onShowToast
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.6);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);

  const track = AUDIO_TRACKS[currentTrackIndex];

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.warn('Audio autoplay prevented or unavailable:', err);
        onShowToast('انقر تشغيل لبدء الاستماع إلى التلاوة الخاشعة', 'info');
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % AUDIO_TRACKS.length);
  };

  const handleAudioEnded = () => {
    handleNextTrack();
  };

  if (!isPlaying && !isPlayerExpanded) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 animate-in slide-in-from-bottom-5 duration-300">
      <audio
        ref={audioRef}
        src={track.url}
        onEnded={handleAudioEnded}
        onError={() => {
          onShowToast('جاري تحديث مشغّل الصوت...', 'info');
        }}
      />

      {isPlayerExpanded ? (
        <div className="p-4 rounded-3xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md shadow-2xl border border-emerald-500/30 text-stone-900 dark:text-stone-100 w-72 sm:w-80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500">
                <Music className="w-4 h-4 animate-bounce" />
              </div>
              <span className="text-xs font-bold">صوت السكينة والقرآن</span>
            </div>
            <button
              onClick={() => setIsPlayerExpanded(false)}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="my-2 p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-900/40">
            <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 truncate">
              {track.title}
            </p>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              {track.reciter}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1.5">
              <button
                onClick={onTogglePlay}
                className="p-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-amber-200 shadow-sm"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-amber-200" />}
              </button>

              <button
                onClick={handleNextTrack}
                className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800"
                title="التلاوة التالية"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-stone-400 hover:text-stone-600"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  setIsMuted(false);
                }}
                className="w-16 accent-emerald-600 cursor-pointer h-1"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Floating Compact Pill */
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-emerald-900/90 hover:bg-emerald-900 text-stone-100 backdrop-blur-md shadow-xl border border-emerald-500/40 text-xs font-medium cursor-pointer transition-transform hover:scale-105">
          <button onClick={() => setIsPlayerExpanded(true)} className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="hidden sm:inline-block max-w-[130px] truncate">{track.title}</span>
            <span className="sm:hidden">صوت السكينة</span>
          </button>
          <button
            onClick={onTogglePlay}
            className="p-1 rounded-full bg-emerald-800 hover:bg-emerald-700 text-amber-200 mr-1"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
};
