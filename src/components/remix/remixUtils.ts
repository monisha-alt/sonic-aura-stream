export const effectTypeLabels = {
  bass_boost: "Bass Boost",
  tempo: "Tempo Change",
  echo: "Echo",
  reverb: "Reverb",
  filter: "Filter",
  distortion: "Distortion",
  lowpass: "Low Pass Filter",
  highpass: "High Pass Filter",
  bitcrush: "Bit Crusher"
};

export const shareOptions = [
  { id: 'facebook', label: 'Facebook', icon: 'share' },
  { id: 'twitter', label: 'Twitter', icon: 'share-2' },
  { id: 'email', label: 'Email', icon: 'mail' },
  { id: 'copy', label: 'Copy Link', icon: 'copy' }
];

export const shareAlbum = (albumId: string, platform: string) => {
  const baseUrl = window.location.origin;
  const albumUrl = `${baseUrl}/albums/${albumId}`;
  
  switch(platform) {
    case 'facebook':
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(albumUrl)}`, '_blank');
      break;
    case 'twitter':
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(albumUrl)}&text=Check out this amazing album!`, '_blank');
      break;
    case 'email':
      window.open(`mailto:?subject=Check out this album&body=${encodeURIComponent(albumUrl)}`, '_blank');
      break;
    case 'copy':
      navigator.clipboard.writeText(albumUrl);
      return 'Link copied to clipboard!';
    default:
      return null;
  }
};

export const applyPreset = (preset: string) => {
  const presets = {
    concert: [
      { type: "reverb" as const, value: 65 },
      { type: "bass_boost" as const, value: 50 },
      { type: "distortion" as const, value: 20 }
    ],
    lofi: [
      { type: "lowpass" as const, value: 60 },
      { type: "bitcrush" as const, value: 25 },
      { type: "echo" as const, value: 30 }
    ],
    club: [
      { type: "bass_boost" as const, value: 80 },
      { type: "tempo" as const, value: 110 },
      { type: "echo" as const, value: 20 }
    ]
  };

  return presets[preset as keyof typeof presets] || [];
};
