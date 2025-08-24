'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, SkipForward, SkipBack, Volume2, ExternalLink } from 'lucide-react';

interface Track {
  id: number;
  title: string;
  duration: string;
  src: string;
}

const tracks: Track[] = [
  {
    id: 1,
    title: "Lace",
    duration: "2:34",
    src: "/Music/Christopher Larkin - Hollow Knight- Silksong (OST Sample) - 01 Lace.mp3"
  },
  {
    id: 2,
    title: "Bonebottom",
    duration: "3:12",
    src: "/Music/Christopher Larkin - Hollow Knight- Silksong (OST Sample) - 02 Bonebottom.mp3"
  }
];

export function SoundtrackSection() {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      nextTrack();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [currentTrack]);

  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-poppins text-white mb-6">
            Orchestral Soundtrack
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Experience the haunting melodies and epic compositions by Christopher Larkin 
            that bring the world of Silksong to life.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-black/40 backdrop-blur-sm border-white/20">
            <CardContent className="p-8">
              {/* Current Track Info */}
              <div className="text-center mb-8">
                <img 
                  src="/Music/cover.jpg" 
                  alt="Silksong OST Cover" 
                  className="w-48 h-48 mx-auto rounded-lg shadow-xl mb-6"
                />
                <h3 className="text-2xl font-bold text-white mb-2">
                  {tracks[currentTrack].title}
                </h3>
                <p className="text-gray-400">Christopher Larkin</p>
              </div>

              {/* Audio Element */}
              <audio ref={audioRef} preload="metadata">
                <source src={tracks[currentTrack].src} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{duration ? formatTime(duration) : tracks[currentTrack].duration}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-200"
                    style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6 mb-8">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-purple-400"
                  onClick={prevTrack}
                >
                  <SkipBack className="w-5 h-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="w-16 h-16 text-white hover:text-purple-400 bg-purple-600 hover:bg-purple-700 rounded-full"
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-purple-400"
                  onClick={nextTrack}
                >
                  <SkipForward className="w-5 h-5" />
                </Button>
              </div>

              {/* Track List */}
              <div className="space-y-2 mb-6">
                {tracks.map((track, index) => (
                  <button
                    key={track.id}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      index === currentTrack 
                        ? 'bg-purple-600/30 text-purple-400' 
                        : 'hover:bg-white/5 text-gray-300'
                    }`}
                    onClick={() => setCurrentTrack(index)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 flex items-center justify-center">
                        {index === currentTrack && isPlaying ? (
                          <Volume2 className="w-4 h-4" />
                        ) : (
                          <span className="text-sm">{track.id}</span>
                        )}
                      </div>
                      <span>{track.title}</span>
                    </div>
                    <span className="text-sm text-gray-500">{track.duration}</span>
                  </button>
                ))}
              </div>

              {/* External Links */}
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href="https://christopherlarkin.bandcamp.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-white border-white/30 hover:bg-white/10"
                  >
                    <ExternalLink className="w-4 h-4" />
                    More from Christopher Larkin
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}