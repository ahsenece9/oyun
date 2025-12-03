
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import { 
  Pencil, 
  Wand2, 
  Home, 
  Save, 
  Trash2, 
  Eraser, 
  Palette, 
  Loader2,
  Image as ImageIcon,
  Check,
  Undo,
  Gamepad2,
  Star,
  Circle,
  Square,
  Triangle,
  Cat,
  Dog,
  Fish,
  Rabbit,
  Bird,
  Snail,
  Hexagon,
  Diamond,
  Heart,
  Brain,
  Ghost,
  Sparkles,
  Grid2X2,
  Sun,
  Moon,
  Cloud,
  Umbrella,
  Flower,
  BookOpen,
  Trophy,
  Crown,
  ChevronLeft,
  ChevronRight,
  X,
  Rocket,
  Trees
} from 'lucide-react';

// --- Types & Constants ---

type ViewState = 'home' | 'draw' | 'magic' | 'puzzle' | 'memory' | 'shadow' | 'matrix' | 'gallery' | 'stories';

interface Character {
  id: string;
  url: string; // base64 or blob url
  type: 'drawing' | 'magic';
  timestamp: number;
}

const COLORS = [
  '#000000', '#FF0000', '#00FF00', '#0000FF', 
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF',
  '#FFA500', '#800080', '#A52A2A', '#FFC0CB'
];

// --- Helper Components ---

const Button = ({ onClick, children, className = '', color = 'bg-blue-500', disabled = false }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`${color} text-white rounded-2xl p-3 shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1 transition-all duration-150 flex flex-col items-center justify-center gap-1 font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

const IconButton = ({ onClick, icon: Icon, active = false, color = 'bg-white', size = 28 }: any) => (
  <button
    onClick={onClick}
    className={`${active ? 'ring-4 ring-yellow-400 scale-110' : ''} ${color} p-2 rounded-full shadow-[0_3px_0_rgba(0,0,0,0.1)] hover:scale-105 active:shadow-none active:translate-y-1 transition-all flex items-center justify-center`}
  >
    <Icon size={size} color="#333" />
  </button>
);

const SectionTitle = ({ icon: Icon, title, color, textColor = 'text-white' }: any) => (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${color} ${textColor} shadow-md border-2 border-white/50 mb-2`}>
        <Icon size={20} />
        <span className="font-black tracking-wide uppercase text-sm md:text-base drop-shadow-sm">{title}</span>
    </div>
);

// --- HUD Component ---

const ProfileHUD = ({ stars }: { stars: number }) => {
    // Level calculation: Level 1 starts at 0, Level 2 at 50, Level 3 at 100...
    const level = Math.floor(stars / 50) + 1;
    const progress = ((stars % 50) / 50) * 100;

    const getLevelTitle = (lvl: number) => {
        if(lvl === 1) return "Çırak";
        if(lvl === 2) return "Kaşif";
        if(lvl === 3) return "Usta";
        if(lvl === 4) return "Büyücü";
        return "Efsane";
    }

    return (
        <div className="fixed top-2 right-2 md:top-4 md:right-4 bg-white/90 backdrop-blur border-4 border-yellow-400 rounded-3xl p-1.5 pr-4 flex items-center gap-3 shadow-xl z-50 animate-fade-in pointer-events-none select-none">
            <div className="bg-gradient-to-br from-yellow-300 to-orange-400 p-2 rounded-full border-2 border-white shadow-sm relative">
                <Crown size={20} className="text-white" fill="white" />
                <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-white">
                    {level}
                </div>
            </div>
            <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{getLevelTitle(level)}</span>
                 <div className="flex items-center gap-1">
                     <Star size={16} className="text-yellow-400 fill-yellow-400" />
                     <span className="text-xl font-black text-gray-700">{stars}</span>
                 </div>
                 {/* Progress Bar */}
                 <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-0.5 overflow-hidden">
                     <div className="h-full bg-yellow-400 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                 </div>
            </div>
        </div>
    );
}

// --- Main App Component ---

function App() {
  const [view, setView] = useState<ViewState>('home');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [apiKey, setApiKey] = useState<string>(process.env.API_KEY || '');
  const [loadingKey, setLoadingKey] = useState(false);
  const [stars, setStars] = useState(0);

  // Load data
  useEffect(() => {
    const savedChars = localStorage.getItem('dream_weaver_chars');
    if (savedChars) setCharacters(JSON.parse(savedChars));

    const savedStars = localStorage.getItem('dream_weaver_stars');
    if (savedStars) setStars(parseInt(savedStars));

    checkApiKey();
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem('dream_weaver_chars', JSON.stringify(characters));
  }, [characters]);

  useEffect(() => {
    localStorage.setItem('dream_weaver_stars', stars.toString());
  }, [stars]);

  const addScore = (amount: number) => {
      setStars(prev => prev + amount);
  };

  const deleteCharacter = (id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
  };

  async function checkApiKey() {
    setLoadingKey(true);
    try {
      const win = window as any;
      if (win.aistudio && await win.aistudio.hasSelectedApiKey()) {
        setApiKey(process.env.API_KEY || ''); 
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingKey(false);
    }
  }

  async function requestApiKey() {
    const win = window as any;
    if (win.aistudio) {
      const success = await win.aistudio.openSelectKey();
      if (success) {
        window.location.reload(); 
      }
    }
  }

  const addCharacter = (url: string, type: 'drawing' | 'magic') => {
    const newChar: Character = {
      id: Date.now().toString(),
      url,
      type,
      timestamp: Date.now()
    };
    setCharacters([newChar, ...characters]);
    setView('home'); // Go back to home after saving
    addScore(5); // Creating characters gives a small reward
  };

  if (!apiKey && !loadingKey) {
    return (
      <div className="min-h-screen bg-sky-300 flex flex-col items-center justify-center p-4 font-sans text-center relative overflow-hidden">
         {/* Background Decoration */}
         <div className="absolute top-10 left-10 text-sky-200 animate-bounce"><Cloud size={100} /></div>
         <div className="absolute bottom-20 right-10 text-sky-200 animate-pulse"><Sun size={120} /></div>

        <div className="bg-white p-8 rounded-[3rem] shadow-2xl max-w-md w-full animate-scale-in border-8 border-sky-400 relative z-10">
          <div className="bg-sky-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Rocket size={40} className="text-sky-500" />
          </div>
          <h1 className="text-3xl font-black text-sky-600 mb-2">Hoşgeldiniz! 🚀</h1>
          <p className="text-gray-500 mb-8 font-medium">
            Maceraya başlamak için sihirli anahtarı seçmelisin.
          </p>
          <Button onClick={requestApiKey} color="bg-emerald-500 w-full hover:bg-emerald-400">
            Başla (Anahtar Seç)
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 font-sans select-none overflow-hidden touch-none">
      {/* VIBRANT BACKGROUND: SKY & GRASS */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-green-300 -z-20" />
      
      {/* Grass Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-[20vh] bg-green-400 rounded-t-[50%] scale-150 translate-y-10 -z-10 shadow-inner" />
      <div className="absolute bottom-0 left-0 right-0 h-[15vh] bg-green-500 rounded-t-[40%] scale-125 translate-y-10 opacity-70 -z-10" />

      {/* Clouds & Sun */}
      <div className="absolute top-10 left-10 text-white/60 animate-float-slow"><Cloud size={140} /></div>
      <div className="absolute top-20 right-20 text-white/40 animate-float"><Cloud size={100} /></div>
      <div className="absolute top-5 right-5 text-yellow-300 animate-spin-slow opacity-80"><Sun size={120} /></div>

      {/* Colorful Balloons */}
      <div className="absolute bottom-20 left-[10%] text-red-400 animate-float-slow opacity-80"><div className="w-12 h-16 bg-red-400 rounded-full rounded-b-md shadow-lg" /></div>
      <div className="absolute bottom-40 right-[15%] text-purple-400 animate-float opacity-80"><div className="w-10 h-14 bg-purple-400 rounded-full rounded-b-md shadow-lg" /></div>
      <div className="absolute top-40 left-[20%] text-yellow-400 animate-float-slow opacity-60"><div className="w-8 h-12 bg-yellow-400 rounded-full rounded-b-md shadow-lg" /></div>


      <ProfileHUD stars={stars} />

      {/* Header / Nav */}
      <div className="fixed top-0 left-0 p-4 z-40 pointer-events-none">
        {view !== 'home' && (
          <div className="pointer-events-auto animate-scale-in">
            <IconButton icon={Home} onClick={() => setView('home')} size={28} color="bg-white border-4 border-yellow-400" active />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="w-full h-full pt-16 pb-4 px-4 box-border relative z-10 overflow-hidden flex flex-col">
        {view === 'home' && <HomeMenu setView={setView} characters={characters} />}
        {view === 'draw' && <DrawingPad onSave={(url) => addCharacter(url, 'drawing')} />}
        {view === 'magic' && <MagicMaker onSave={(url) => addCharacter(url, 'magic')} apiKey={apiKey} />}
        {view === 'gallery' && <GalleryView characters={characters} onDelete={deleteCharacter} />}
        {view === 'stories' && <StoryBookView />}
        {view === 'puzzle' && <PuzzleGame characters={characters} onScore={() => addScore(15)} />}
        {view === 'memory' && <MemoryGame characters={characters} onScore={() => addScore(20)} />}
        {view === 'shadow' && <ShadowGame characters={characters} onScore={() => addScore(10)} />}
        {view === 'matrix' && <MatrixGame onScore={() => addScore(10)} />}
      </div>
    </div>
  );
}

// --- Views ---

function HomeMenu({ setView, characters }: { setView: (v: ViewState) => void, characters: Character[] }) {
  
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 animate-fade-in py-2">
      
      {/* LOGO (Compact) */}
      <div className="text-center shrink-0 z-10 mt-2">
        <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.2)] stroke-2 stroke-black" style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif', textShadow: '3px 3px 0px #FF6B6B' }}>
            Düşler Ülkesi
        </h1>
      </div>

      {/* MAIN DASHBOARD GRID */}
      <div className="flex-1 w-full max-w-5xl flex flex-col md:flex-row gap-6 items-stretch justify-center max-h-[70vh]">
        
        {/* Left Col: Creative */}
        <div className="flex-1 bg-white/60 backdrop-blur-md p-4 rounded-[2rem] border-4 border-white/80 shadow-xl flex flex-col gap-2 relative overflow-hidden group hover:scale-[1.02] transition-transform">
            <div className="absolute -bottom-10 -left-10 text-pink-200/50 rotate-12"><Palette size={150} /></div>
            <div className="flex justify-center"><SectionTitle icon={Wand2} title="Yaratıcı Stüdyo" color="bg-pink-500" /></div>
            
            <div className="flex-1 grid grid-cols-2 gap-3 items-center content-center">
                <Button onClick={() => setView('draw')} color="bg-gradient-to-br from-orange-400 to-amber-500 h-full max-h-36" className="group">
                    <Pencil size={36} className="text-white mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-base md:text-xl font-black">Çizim</span>
                </Button>
                <Button onClick={() => setView('magic')} color="bg-gradient-to-br from-purple-500 to-indigo-600 h-full max-h-36" className="group">
                    <Sparkles size={36} className="text-white mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-base md:text-xl font-black">Sihirbaz</span>
                </Button>
                <Button onClick={() => setView('gallery')} color="bg-gradient-to-br from-teal-400 to-cyan-600 h-full max-h-36" className="group">
                    <ImageIcon size={36} className="text-white mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-base md:text-xl font-black">Galeri</span>
                </Button>
                <Button onClick={() => setView('stories')} color="bg-gradient-to-br from-rose-400 to-pink-600 h-full max-h-36" className="group">
                    <BookOpen size={36} className="text-white mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-base md:text-xl font-black">Masallar</span>
                </Button>
            </div>
        </div>

        {/* Right Col: Games */}
        <div className="flex-1 bg-white/60 backdrop-blur-md p-4 rounded-[2rem] border-4 border-white/80 shadow-xl flex flex-col gap-2 relative overflow-hidden group hover:scale-[1.02] transition-transform">
             <div className="absolute -top-5 -right-5 text-emerald-200/50 -rotate-12"><Gamepad2 size={150} /></div>
             <div className="flex justify-center"><SectionTitle icon={Trophy} title="Oyun Odası" color="bg-emerald-500" /></div>
             
             <div className="flex-1 grid grid-cols-2 gap-3 items-center content-center">
                <Button onClick={() => setView('puzzle')} color="bg-gradient-to-br from-yellow-400 to-orange-500 h-full max-h-28" className="group">
                    <KeyIcon size={28} />
                    <span className="text-base font-black">Şifreler</span>
                </Button>
                <Button onClick={() => setView('matrix')} color="bg-gradient-to-br from-blue-400 to-cyan-500 h-full max-h-28" className="group">
                    <Grid2X2 size={28} className="text-white group-hover:rotate-90 transition-transform"/>
                    <span className="text-base font-black">Matris</span>
                </Button>
                 <Button onClick={() => setView('memory')} color="bg-gradient-to-br from-indigo-400 to-violet-600 h-full max-h-28" className="group">
                    <Brain size={28} className="text-white group-hover:scale-110 transition-transform"/>
                    <span className="text-base font-black">Hafıza</span>
                </Button>
                <Button onClick={() => setView('shadow')} color="bg-gradient-to-br from-rose-400 to-pink-600 h-full max-h-28" className="group">
                    <Ghost size={28} className="text-white group-hover:scale-110 transition-transform"/>
                    <span className="text-base font-black">Gölgeler</span>
                </Button>
             </div>
        </div>
      </div>
    </div>
  );
}

// Icon helper for puzzle
const KeyIcon = ({ size }: {size: number}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <circle cx="7.5" cy="15.5" r="5.5" />
        <path d="m21 2-9.6 9.6" />
        <path d="m15.5 7.5 3 3L22 7l-3-3" />
    </svg>
)

function GalleryView({ characters, onDelete }: { characters: Character[], onDelete: (id: string) => void }) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
        <div className="h-full flex flex-col gap-4 max-w-5xl mx-auto w-full relative">
             <div className="text-center shrink-0">
                <div className="inline-block bg-teal-500 text-white px-8 py-2 rounded-full shadow border-4 border-white">
                    <h2 className="text-2xl font-black flex items-center gap-2"><ImageIcon /> Sanat Galerim</h2>
                </div>
            </div>

            {characters.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-white/50 rounded-[2rem] border-4 border-dashed border-white m-4">
                    <Ghost size={64} className="mb-4 text-gray-400" />
                    <p className="text-xl font-bold">Henüz hiç resim yok!</p>
                    <p>Hadi gidip bir şeyler çizelim.</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 pb-20">
                    {characters.map(char => (
                        <div key={char.id} className="relative group aspect-square bg-white rounded-2xl shadow-md border-4 border-white overflow-hidden cursor-pointer transition-transform hover:scale-105" onClick={() => setSelectedId(char.id)}>
                            <img src={char.url} className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                {new Date(char.timestamp).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {selectedId && (
                <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white p-2 rounded-[2rem] max-w-lg w-full relative border-8 border-teal-200 shadow-2xl">
                         <button onClick={() => setSelectedId(null)} className="absolute -top-4 -right-4 bg-red-500 text-white p-2 rounded-full shadow border-2 border-white hover:scale-110">
                            <X size={24} />
                         </button>
                         
                         <img src={characters.find(c => c.id === selectedId)?.url} className="w-full rounded-2xl shadow-inner bg-gray-50" />
                         
                         <div className="mt-4 flex justify-center pb-2">
                             <Button onClick={() => { onDelete(selectedId); setSelectedId(null); }} color="bg-red-500 shadow-red-300">
                                 <Trash2 size={20} /> Sil
                             </Button>
                         </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function StoryBookView() {
    const [selectedStory, setSelectedStory] = useState<number | null>(null);
    const [page, setPage] = useState(0);
    const [imgLoading, setImgLoading] = useState(true);

    // Optimized URL generator with fixed seed per page/story for stability
    const getImgUrl = (prompt: string, seed: number) => `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + " children book illustration colorful cute flat vector art")}?width=800&height=600&nologo=true&seed=${seed}`;

    const STORIES = [
        {
            id: 1,
            title: "Uzaylı Zıpzıp",
            color: "bg-indigo-500",
            icon: Rocket,
            pages: [
                { text: "Zıpzıp, mor renkli küçük bir uzaylıydı. Gezegeni çok uzaktaydı.", img: getImgUrl("cute little purple alien standing on a purple planet surface craters", 101) },
                { text: "Bir gün kırmızı roketine bindi ve 'Vınnn!' diye uçtu.", img: getImgUrl("cute purple alien flying a red rocket ship in outer space stars", 102) },
                { text: "Dünya'yı gördü. 'Ne kadar mavi!' dedi şaşkınlıkla.", img: getImgUrl("view of planet earth from space blue and green continents cute style", 103) },
                { text: "Sonra evine döndü ve arkadaşlarına maceralarını anlattı.", img: getImgUrl("purple alien telling stories to other aliens around campfire purple planet", 104) }
            ]
        },
        {
            id: 2,
            title: "Kayıp Tavşan",
            color: "bg-green-500",
            icon: Rabbit,
            pages: [
                { text: "Pamuk, beyaz yumuşacık bir tavşandı. Havuçları çok severdi.", img: getImgUrl("cute fluffy white rabbit holding a big orange carrot green grass", 201) },
                { text: "Bir gün ormanda zıplarken yolunu kaybetti.", img: getImgUrl("sad cute white rabbit lost in a forest tall green trees", 202) },
                { text: "Bir kuş ona yolu gösterdi. 'Cik cik! Bu taraftan!'", img: getImgUrl("blue bird flying and guiding a white rabbit magical forest", 203) },
                { text: "Pamuk evine döndü ve annesine sarıldı. Mutlu son!", img: getImgUrl("baby white rabbit hugging mother rabbit happily flower meadow", 204) }
            ]
        },
        {
            id: 3,
            title: "Cesur Balık",
            color: "bg-blue-500",
            icon: Fish,
            pages: [
                { text: "Maviş, okyanusta yaşayan küçük bir balıktı.", img: getImgUrl("cute blue fish swimming in the deep blue ocean bubbles", 301) },
                { text: "Büyük bir mağara gördü. Herkes oradan korkardı.", img: getImgUrl("dark underwater cave entrance deep blue water mysterious", 302) },
                { text: "Ama Maviş içeri girdi! Orada parlayan inciler buldu.", img: getImgUrl("shining white pearls inside an underwater cave magical glow", 303) },
                { text: "Artık herkes ona 'Cesur Maviş' diyordu.", img: getImgUrl("cute blue fish wearing a small golden crown happy underwater", 304) }
            ]
        }
    ];

    useEffect(() => {
        setImgLoading(true);
    }, [page, selectedStory]);

    if (selectedStory === null) {
        return (
            <div className="h-full flex flex-col gap-6 max-w-4xl mx-auto items-center p-4">
                 <div className="bg-rose-500 text-white px-8 py-2 rounded-full shadow border-4 border-white mb-4">
                    <h2 className="text-2xl font-black flex items-center gap-2"><BookOpen /> Masal Kütüphanesi</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    {STORIES.map(story => (
                        <button 
                            key={story.id} 
                            onClick={() => { setSelectedStory(story.id); setPage(0); }}
                            className={`${story.color} h-64 rounded-[2rem] border-8 border-white shadow-xl flex flex-col items-center justify-center gap-4 text-white hover:scale-105 transition-transform group relative overflow-hidden`}
                        >
                             <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                             <story.icon size={80} className="drop-shadow-md group-hover:scale-110 transition-transform" />
                             <span className="text-2xl font-black drop-shadow-md">{story.title}</span>
                             <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">Oku</span>
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    const story = STORIES.find(s => s.id === selectedStory)!;
    const currentPageData = story.pages[page];

    return (
        <div className="h-full flex flex-col items-center justify-center max-w-5xl mx-auto w-full relative p-2">
            {/* Book Container */}
            <div className={`w-full max-w-4xl aspect-[4/3] bg-white rounded-[2rem] shadow-2xl border-8 border-amber-100 relative flex flex-col items-center overflow-hidden`}>
                
                {/* Image Section */}
                <div className="w-full h-[65%] bg-gray-100 relative overflow-hidden border-b-8 border-amber-100 flex items-center justify-center">
                    {imgLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                            <Loader2 className="animate-spin text-amber-400" size={48} />
                        </div>
                    )}
                    <img 
                        src={currentPageData.img} 
                        alt="Story Scene" 
                        className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoading ? 'opacity-0' : 'opacity-100'}`}
                        loading="eager"
                        onLoad={() => setImgLoading(false)}
                        onError={(e) => {
                            setImgLoading(false);
                            (e.target as HTMLImageElement).src = "https://placehold.co/800x600/orange/white?text=Resim+Yüklenemedi";
                        }}
                    />
                    
                    {/* Back Button */}
                    <button onClick={() => setSelectedStory(null)} className="absolute top-4 left-4 bg-black/30 p-2 rounded-full text-white hover:bg-black/50 backdrop-blur-md z-10">
                        <X size={24} />
                    </button>
                    {/* Page Indicator */}
                    <div className="absolute top-4 right-4 bg-black/30 px-3 py-1 rounded-full text-white font-black text-sm backdrop-blur-md z-10">
                        {page + 1} / {story.pages.length}
                    </div>
                </div>

                {/* Text Section */}
                <div className="flex-1 w-full flex items-center justify-center p-6 bg-amber-50 relative">
                     <p className="text-xl md:text-3xl font-bold text-amber-900 text-center leading-relaxed font-serif animate-fade-in">
                        {currentPageData.text}
                    </p>
                </div>
            </div>

            {/* Navigation Arrows */}
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none px-2 md:px-0">
                 <button 
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                    className="pointer-events-auto p-3 md:p-4 bg-white text-amber-600 rounded-full shadow-xl disabled:opacity-0 hover:scale-110 transition-all border-4 border-amber-100"
                 >
                     <ChevronLeft size={36} />
                 </button>

                 <button 
                    onClick={() => {
                        if (page < story.pages.length - 1) setPage(p => p + 1);
                        else setSelectedStory(null); // Finish
                    }}
                    className="pointer-events-auto p-3 md:p-4 bg-white text-amber-600 rounded-full shadow-xl hover:scale-110 transition-all border-4 border-amber-100"
                 >
                     {page === story.pages.length - 1 ? <Check size={36} className="text-green-500" /> : <ChevronRight size={36} />}
                 </button>
            </div>
        </div>
    )
}

function DrawingPad({ onSave }: { onSave: (url: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(10);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Fit canvas to screen
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    const context = canvas.getContext('2d');
    if (context) {
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, canvas.width, canvas.height); // White background
      setCtx(context);
    }
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent | any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: any) => {
    setIsDrawing(true);
    const { x, y } = getPos(e);
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
    }
  };

  const draw = (e: any) => {
    if (!isDrawing || !ctx) return;
    e.preventDefault(); // Prevent scrolling on touch
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (ctx) ctx.closePath();
    setIsDrawing(false);
  };

  const handleSave = () => {
    if (canvasRef.current) {
      onSave(canvasRef.current.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    if (canvasRef.current && ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 max-w-4xl mx-auto w-full">
      <div className="flex-1 bg-white rounded-[2rem] shadow-inner border-[6px] border-orange-300 overflow-hidden relative touch-none cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full"
        />
      </div>

      <div className="bg-white p-3 md:p-4 rounded-[2rem] shadow-xl flex flex-wrap items-center justify-between gap-4 border-4 border-white">
        <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-4 shadow-sm transition-transform ${color === c ? 'border-gray-800 scale-125 z-10' : 'border-white hover:scale-110'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
           <div className="flex gap-1 bg-gray-100 p-1.5 rounded-full">
            <button onClick={() => setBrushSize(5)} className={`p-2 rounded-full transition-all ${brushSize === 5 ? 'bg-white shadow scale-110' : ''}`}><div className="w-2 h-2 bg-black rounded-full" /></button>
            <button onClick={() => setBrushSize(15)} className={`p-2 rounded-full transition-all ${brushSize === 15 ? 'bg-white shadow scale-110' : ''}`}><div className="w-4 h-4 bg-black rounded-full" /></button>
            <button onClick={() => setBrushSize(30)} className={`p-2 rounded-full transition-all ${brushSize === 30 ? 'bg-white shadow scale-110' : ''}`}><div className="w-6 h-6 bg-black rounded-full" /></button>
          </div>

          <div className="h-8 w-[2px] bg-gray-200 mx-1"></div>

          <IconButton icon={Eraser} onClick={() => setColor('#FFFFFF')} active={color === '#FFFFFF'} color="bg-pink-100 text-pink-500" />
          <IconButton icon={Trash2} onClick={clearCanvas} color="bg-red-100 text-red-500" />
          <Button onClick={handleSave} color="bg-green-500 py-2 px-6 rounded-full shadow-green-200">
            <Check size={24} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function MagicMaker({ onSave, apiKey }: { onSave: (url: string) => void, apiKey: string }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { text: `A cute, colorful, cartoon-style children's character drawing of: ${prompt}. White background, simple shapes, vibrant colors, vector art style for 5 year olds.` }
          ]
        }
      });

      // Extract image
      const candidates = response.candidates;
      if (candidates && candidates.length > 0) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData) {
            setResult(`data:image/png;base64,${part.inlineData.data}`);
            break;
          }
        }
      }
    } catch (e: any) {
        console.error(e);
        const errMsg = (e.message || '').toLowerCase();
        if (errMsg.includes('404') || errMsg.includes('not found')) {
             const win = window as any;
             if (win.aistudio) {
                alert("Projenizde bir sorun var gibi görünüyor. Lütfen anahtarınızı kontrol edin.");
                await win.aistudio.openSelectKey();
             }
        } else {
             alert('Sihir bozuldu! İnternetini kontrol et veya tekrar dene.');
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 max-w-2xl mx-auto">
      <div className="bg-white/90 backdrop-blur p-8 rounded-[3rem] shadow-2xl w-full text-center border-8 border-purple-200 relative animate-scale-in">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-purple-500 text-white p-4 rounded-full shadow-lg border-4 border-white">
            <Wand2 size={40} />
        </div>
        <h2 className="text-3xl font-black text-purple-500 mb-6 mt-6">Sihirli Karakter Yapıcı</h2>
        
        {!result && (
          <div className="flex flex-col gap-6">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Buraya yaz (örn: 'Mavi uçan kedi')"
              className="w-full text-2xl p-6 border-4 border-purple-100 rounded-[2rem] focus:border-purple-400 outline-none text-center bg-purple-50 font-bold text-purple-900 placeholder:text-purple-200 transition-colors"
            />
            <Button onClick={generate} color="bg-gradient-to-r from-purple-500 to-indigo-500" disabled={loading || !prompt} className="h-20 shadow-purple-300">
              {loading ? <Loader2 className="animate-spin w-8 h-8" /> : <span className="flex items-center gap-2 text-2xl"><Sparkles /> OLUŞTUR! <Sparkles /></span>}
            </Button>
          </div>
        )}

        {result && (
          <div className="flex flex-col gap-6 animate-scale-in">
            <div className="bg-purple-50 p-4 rounded-3xl border-4 border-dashed border-purple-200">
                 <img src={result} alt="Generated" className="rounded-xl max-h-[40vh] object-contain mx-auto shadow-sm" />
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setResult(null)} color="bg-gray-400">
                <Undo /> Tekrar
              </Button>
              <Button onClick={() => onSave(result)} color="bg-green-500 w-full">
                <Check /> Kaydet
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Games ---

const getGameCharacters = (userChars: Character[]) => {
    const availableChars = userChars.map(c => ({
      id: c.id,
      content: <img src={c.url} alt="char" className="w-full h-full object-contain drop-shadow-md" />
    }));

    const mocks = [
      { id: 'cat', content: <Cat className="w-full h-full text-orange-500 drop-shadow-md" /> },
      { id: 'dog', content: <Dog className="w-full h-full text-amber-700 drop-shadow-md" /> },
      { id: 'fish', content: <Fish className="w-full h-full text-blue-400 drop-shadow-md" /> },
      { id: 'rabbit', content: <Rabbit className="w-full h-full text-pink-400 drop-shadow-md" /> },
      { id: 'bird', content: <Bird className="w-full h-full text-yellow-500 drop-shadow-md" /> },
      { id: 'snail', content: <Snail className="w-full h-full text-purple-400 drop-shadow-md" /> }
    ];
    
    let pool = [...availableChars];
    for(const mock of mocks) {
        if(pool.length >= 10) break;
        if(!pool.find(p => p.id === mock.id)) pool.push(mock);
    }
    return pool;
};

// 1. MEMORY GAME
function MemoryGame({ characters, onScore }: { characters: Character[], onScore: () => void }) {
    const [cards, setCards] = useState<{id: number, charId: string, content: any, flipped: boolean, matched: boolean}[]>([]);
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
    const [matches, setMatches] = useState(0);

    useEffect(() => {
        // Init Game
        const pool = getGameCharacters(characters).slice(0, 6); // Pick 6 distinct
        const deck = [...pool, ...pool] // Duplicate
            .map((item, i) => ({ 
                id: i, 
                charId: item.id, 
                content: item.content, 
                flipped: false, 
                matched: false 
            }))
            .sort(() => Math.random() - 0.5); // Shuffle
        
        setCards(deck);
        setMatches(0);
    }, [characters]);

    const handleCardClick = (idx: number) => {
        if (flippedIndices.length >= 2 || cards[idx].flipped || cards[idx].matched) return;
        
        const newCards = [...cards];
        newCards[idx].flipped = true;
        setCards(newCards);
        
        const newFlipped = [...flippedIndices, idx];
        setFlippedIndices(newFlipped);

        if (newFlipped.length === 2) {
            const [firstIdx, secondIdx] = newFlipped;
            if (cards[firstIdx].charId === cards[secondIdx].charId) {
                // Match
                setTimeout(() => {
                    newCards[firstIdx].matched = true;
                    newCards[secondIdx].matched = true;
                    setCards([...newCards]);
                    setFlippedIndices([]);
                    setMatches(m => m + 1);
                    if(matches + 1 === 6) onScore();
                }, 500);
            } else {
                // No Match
                setTimeout(() => {
                    newCards[firstIdx].flipped = false;
                    newCards[secondIdx].flipped = false;
                    setCards([...newCards]);
                    setFlippedIndices([]);
                }, 1000);
            }
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center">
            {matches === 6 ? (
                <div className="text-center animate-scale-in bg-white p-8 rounded-[3rem] shadow-2xl border-8 border-yellow-200">
                    <div className="relative inline-block">
                        <Star size={100} className="text-yellow-400 mx-auto animate-spin-slow mb-4 fill-yellow-400" />
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-black text-white">+20</span>
                    </div>
                    <h2 className="text-4xl font-black text-indigo-600 mb-2">HARİKA!</h2>
                    <p className="text-gray-400 mb-6 font-bold">Hafızan çok güçlü.</p>
                    <Button onClick={() => window.location.reload()} color="bg-indigo-500 shadow-indigo-300">Tekrar Oyna</Button>
                </div>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl w-full aspect-[3/4] sm:aspect-auto p-4">
                    {cards.map((card, idx) => (
                        <button
                            key={card.id}
                            onClick={() => handleCardClick(idx)}
                            className={`
                                relative aspect-square rounded-2xl shadow-[0_4px_0_rgba(0,0,0,0.1)] transition-all duration-300 transform perspective-1000
                                ${card.flipped || card.matched ? 'rotate-y-180 bg-white border-4 border-indigo-200' : 'bg-gradient-to-br from-indigo-400 to-blue-500 hover:scale-105 border-4 border-white'}
                            `}
                        >
                            <div className="absolute inset-0 flex items-center justify-center backface-hidden">
                                {card.flipped || card.matched ? (
                                    <div className="w-3/4 h-3/4 animate-scale-in">{card.content}</div>
                                ) : (
                                    <div className="text-white/30 font-black text-4xl">?</div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

// 2. SHADOW GAME
function ShadowGame({ characters, onScore }: { characters: Character[], onScore: () => void }) {
    const [levelData, setLevelData] = useState<{target: any, options: any[]} | null>(null);
    const [success, setSuccess] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const loadLevel = () => {
        setSuccess(false);
        setSelectedId(null);
        const pool = getGameCharacters(characters);
        const target = pool[Math.floor(Math.random() * pool.length)];
        // Get 3 options including target
        let options = [target];
        while(options.length < 3) {
            const r = pool[Math.floor(Math.random() * pool.length)];
            if (!options.find(o => o.id === r.id)) options.push(r);
        }
        options = options.sort(() => Math.random() - 0.5);
        setLevelData({ target, options });
    };

    useEffect(() => {
        loadLevel();
    }, [characters]);

    const handleSelect = (id: string) => {
        if (!levelData) return;
        setSelectedId(id);
        if (id === levelData.target.id) {
            setSuccess(true);
            onScore();
            setTimeout(loadLevel, 1500);
        }
    }

    if (!levelData) return null;

    return (
        <div className="h-full flex flex-col items-center justify-center gap-8 max-w-3xl mx-auto p-4">
             {/* Target Shadow */}
             <div className="flex flex-col items-center gap-4">
                 <div className="bg-rose-100 px-6 py-2 rounded-full border-2 border-rose-300 shadow-md">
                    <h2 className="text-xl font-bold text-rose-500 uppercase tracking-widest">Bu Kim?</h2>
                 </div>
                 <div className="w-56 h-56 bg-white rounded-full flex items-center justify-center p-8 shadow-2xl border-8 border-white ring-4 ring-rose-100">
                     <div className="w-full h-full transition-all duration-500" style={{ filter: success ? 'none' : 'brightness(0) grayscale(100%) opacity(0.8)' }}>
                        {levelData.target.content}
                     </div>
                 </div>
             </div>

             {/* Options */}
             <div className="grid grid-cols-3 gap-6 w-full">
                 {levelData.options.map(opt => (
                     <button
                        key={opt.id}
                        onClick={() => handleSelect(opt.id)}
                        className={`
                            bg-white p-4 rounded-[2rem] shadow-lg border-b-8 active:border-b-0 active:translate-y-2 transition-all aspect-square flex items-center justify-center
                            ${selectedId === opt.id && opt.id !== levelData.target.id ? 'bg-red-50 border-red-200 animate-shake' : 'border-gray-100 hover:border-rose-200'}
                            ${success && opt.id === levelData.target.id ? 'bg-green-50 border-green-300 scale-110 ring-4 ring-green-100' : ''}
                        `}
                     >
                         {opt.content}
                     </button>
                 ))}
             </div>
             
             {success && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-5xl font-black text-green-500 animate-bounce bg-white px-8 py-4 rounded-3xl shadow-xl border-4 border-green-100">Harika! +10</div>
                </div>
             )}
        </div>
    )
}

// 3. PUZZLE GAME (Existing - Refined)
const SHAPES = [
  { icon: Circle, color: 'text-red-500', name: 'circle' },
  { icon: Square, color: 'text-blue-500', name: 'square' },
  { icon: Triangle, color: 'text-green-500', name: 'triangle' },
  { icon: Star, color: 'text-yellow-500', name: 'star' },
  { icon: Hexagon, color: 'text-purple-500', name: 'hexagon' },
  { icon: Diamond, color: 'text-orange-500', name: 'diamond' },
  { icon: Heart, color: 'text-pink-500', name: 'heart' }
];

function PuzzleGame({ characters, onScore }: { characters: Character[], onScore: () => void }) {
  const [level, setLevel] = useState(0);
  const [shakeOption, setShakeOption] = useState<number | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Logic to generate level
  const gameData = useMemo(() => {
    // 1. Prepare Characters (Use user's chars + mocks)
    const activeChars = getGameCharacters(characters).sort(() => 0.5 - Math.random()).slice(0, 4);
    
    // Pick 4 Active Shapes (S1, S2, S3, S4)
    const activeShapes = [...SHAPES].sort(() => 0.5 - Math.random()).slice(0, 4);

    // Create Cipher Mapping: A->S1, B->S2, C->S3, D->S4
    const cipher = new Map<string, typeof SHAPES[0]>();
    activeChars.forEach((char, idx) => cipher.set(char.id, activeShapes[idx]));

    // Helper to generate a random sequence of length 4
    const generateSequence = () => {
        const seq = [];
        for(let i=0; i<4; i++) {
             seq.push(activeChars[Math.floor(Math.random() * activeChars.length)]);
        }
        return seq;
    };

    // 1. Generate Clue Rows (4 distinct rows)
    const clueAnimalRows = [];
    for(let i=0; i<4; i++) {
        clueAnimalRows.push(generateSequence());
    }

    // 2. Generate Corresponding Shape Rows for Clues
    const clueShapeRows = clueAnimalRows.map(row => 
        row.map(char => cipher.get(char.id)!)
    );
    // Shuffle the shape rows so they don't align visually
    const shuffledClueShapeRows = [...clueShapeRows].sort(() => 0.5 - Math.random());

    // 3. Generate Question
    const questionSequence = generateSequence();
    const correctShapeSequence = questionSequence.map(char => cipher.get(char.id)!);

    // 4. Generate Options (1 correct, 2 unique incorrect)
    const options = [{ id: 0, shapes: correctShapeSequence, isCorrect: true }];
    
    // Helper to compare two shape arrays
    const isSame = (arr1: any[], arr2: any[]) => {
        if(arr1.length !== arr2.length) return false;
        return arr1.every((s, i) => s.name === arr2[i].name);
    }

    // Helper to make random shape seq
    const randomShapeSeq = () => {
        const s = [];
        for(let i=0; i<4; i++) s.push(activeShapes[Math.floor(Math.random()*4)]);
        return s;
    };

    while(options.length < 3) {
        const wrongSeq = randomShapeSeq();
        // Check if unique from correct answer and other options
        const alreadyExists = options.some(opt => isSame(opt.shapes, wrongSeq));
        if(!alreadyExists) {
            options.push({ id: options.length, shapes: wrongSeq, isCorrect: false });
        }
    }
    
    // Shuffle Options
    const shuffledOptions = options.sort(() => 0.5 - Math.random());

    return { 
        clueAnimalRows,
        shuffledClueShapeRows,
        questionSequence,
        options: shuffledOptions
    };
  }, [level, characters]);

  // Reset state on level change
  useEffect(() => {
    setIsSuccess(false);
    setShakeOption(null);
  }, [gameData]);

  const handleOptionClick = (isCorrect: boolean, idx: number) => {
    if (isCorrect) {
        setIsSuccess(true);
        onScore();
        setTimeout(() => {
            setLevel(l => l + 1);
        }, 1500);
    } else {
        setShakeOption(idx);
        setTimeout(() => setShakeOption(null), 500);
    }
  };

  return (
    <div className="h-full flex flex-col items-center max-w-5xl mx-auto py-2 relative">
      {/* Header */}
      <div className="w-full flex justify-between items-center px-4 mb-2">
        <div className="bg-white px-6 py-2 rounded-full shadow border-2 border-orange-200 font-black text-orange-500 flex items-center gap-2">
            <Trophy size={20} />
            Seviye {level + 1}
        </div>
        <div className="bg-orange-100 text-orange-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
           🕵️‍♂️ Gizli Şifreyi Çöz
        </div>
      </div>

      <div className="flex-1 w-full overflow-y-auto px-2 pb-20 flex flex-col gap-4">
          
          {/* TOP SECTION: CLUES BOARD */}
          <div className="bg-white/80 backdrop-blur p-4 rounded-[2rem] border-4 border-white shadow-lg flex flex-col gap-2">
            <h3 className="text-center text-gray-400 font-bold uppercase text-xs tracking-widest mb-1 flex items-center justify-center gap-2"><Sparkles size={12}/> İpuçları (Analiz Et) <Sparkles size={12}/></h3>
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Left: Animal Patterns */}
                <div className="flex-1 flex flex-col gap-2">
                    {gameData.clueAnimalRows.map((row, i) => (
                        <div key={i} className="h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center p-1 border-2 border-indigo-50">
                             <div className="grid grid-cols-4 gap-1 w-full max-w-[200px]">
                                {row.map((char, j) => (
                                    <div key={j} className="w-full h-full aspect-square p-0.5">{char.content}</div>
                                ))}
                             </div>
                        </div>
                    ))}
                </div>
                
                {/* Right: Shape Patterns (Shuffled) */}
                <div className="flex-1 flex flex-col gap-2">
                    {gameData.shuffledClueShapeRows.map((row, i) => (
                        <div key={i} className="h-12 bg-gray-50 rounded-2xl shadow-inner flex items-center justify-center p-1 border-2 border-gray-100">
                             <div className="grid grid-cols-4 gap-1 w-full max-w-[200px]">
                                {row.map((Shape, j) => (
                                    <div key={j} className="w-full h-full aspect-square flex items-center justify-center">
                                        <Shape.icon className={`w-3/4 h-3/4 ${Shape.color}`} fill="currentColor" />
                                    </div>
                                ))}
                             </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          {/* BOTTOM SECTION: QUESTION & OPTIONS */}
          <div className="flex-1 flex flex-col justify-end gap-6">
             {/* The Question */}
             <div className="bg-white p-4 rounded-[2.5rem] shadow-xl border-4 border-blue-200 relative mx-auto w-full max-w-md">
                 <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold">SORU</div>
                 <div className="flex justify-center mt-2">
                     <div className="grid grid-cols-4 gap-3 sm:gap-6 w-full max-w-sm">
                        {gameData.questionSequence.map((char, i) => (
                            <div key={i} className="aspect-square bg-blue-50 rounded-2xl p-2 flex items-center justify-center border-2 border-blue-100">
                                {char.content}
                            </div>
                        ))}
                     </div>
                 </div>
             </div>

             {/* The Options */}
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 {gameData.options.map((opt, idx) => (
                     <button
                        key={idx}
                        onClick={() => handleOptionClick(opt.isCorrect, idx)}
                        className={`
                            h-20 bg-white rounded-3xl shadow-md border-b-8 active:border-b-0 active:translate-y-1 transition-all
                            flex items-center justify-center p-2
                            ${shakeOption === idx ? 'animate-shake border-red-400 bg-red-50' : 'border-gray-200 hover:border-blue-300'}
                        `}
                     >
                         <div className="grid grid-cols-4 gap-2 w-full max-w-[160px]">
                            {opt.shapes.map((Shape, i) => (
                                <div key={i} className="aspect-square flex items-center justify-center">
                                     <Shape.icon className={`w-full h-full ${Shape.color}`} fill="currentColor" />
                                </div>
                            ))}
                         </div>
                     </button>
                 ))}
             </div>
          </div>

      </div>

      {isSuccess && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] z-50 rounded-3xl pointer-events-none">
             <div className="bg-white p-8 rounded-[3rem] shadow-2xl animate-scale-in flex flex-col items-center border-8 border-yellow-200">
                <Star className="text-yellow-400 fill-yellow-400 w-32 h-32 animate-spin-slow" />
                <span className="text-4xl font-black text-indigo-600 mt-4">+15</span>
             </div>
        </div>
      )}
    </div>
  );
}

const ArrowDown = ({className, size}: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 5v14" />
        <path d="m19 12-7 7-7-7" />
    </svg>
)


// 4. MATRIX GAME (New - BİLSEM Style)
const MATRIX_ICONS = [
    { icon: Sun, name: 'sun' },
    { icon: Moon, name: 'moon' },
    { icon: Cloud, name: 'cloud' },
    { icon: Umbrella, name: 'umbrella' },
    { icon: Flower, name: 'flower' },
    { icon: Star, name: 'star' }
];

const MATRIX_COLORS = [
    { name: 'red', class: 'text-red-500' },
    { name: 'blue', class: 'text-blue-500' },
    { name: 'green', class: 'text-green-500' },
    { name: 'yellow', class: 'text-yellow-500' },
    { name: 'purple', class: 'text-purple-500' }
];

function MatrixGame({ onScore }: { onScore: () => void }) {
    const [level, setLevel] = useState(0);
    const [success, setSuccess] = useState(false);
    const [shake, setShake] = useState<number | null>(null);

    const levelData = useMemo(() => {
        // Randomly Select 2 Objects (A and B) and 2 Colors (C1 and C2)
        const shuffledIcons = [...MATRIX_ICONS].sort(() => 0.5 - Math.random()).slice(0, 2);
        const shuffledColors = [...MATRIX_COLORS].sort(() => 0.5 - Math.random()).slice(0, 2);

        const ObjA = shuffledIcons[0];
        const ObjB = shuffledIcons[1];
        const Col1 = shuffledColors[0];
        const Col2 = shuffledColors[1];

        // Logic: 
        // Row 1: A(C1) -> A(C2)  (Change Color)
        // Row 2: B(C1) -> ? (Should be B(C2))

        const cell1 = { Icon: ObjA.icon, Color: Col1 };
        const cell2 = { Icon: ObjA.icon, Color: Col2 };
        const cell3 = { Icon: ObjB.icon, Color: Col1 };
        const target = { Icon: ObjB.icon, Color: Col2 };

        // Generate Options
        const options = [
            { id: 0, content: target, correct: true }, // Correct
            { id: 1, content: { Icon: ObjB.icon, Color: Col1 }, correct: false }, // Wrong Color (Same as start)
            { id: 2, content: { Icon: ObjA.icon, Color: Col2 }, correct: false }  // Wrong Object (Same as top row end)
        ];

        return {
            grid: [cell1, cell2, cell3],
            options: options.sort(() => 0.5 - Math.random())
        };
    }, [level]);

    const handleSelect = (correct: boolean, idx: number) => {
        if(correct) {
            setSuccess(true);
            onScore();
            setTimeout(() => {
                setSuccess(false);
                setLevel(l => l+1);
            }, 1000);
        } else {
            setShake(idx);
            setTimeout(() => setShake(null), 500);
        }
    }

    // Extract elements to render them as components (Uppercase)
    const Cell1Icon = levelData.grid[0].Icon;
    const Cell2Icon = levelData.grid[1].Icon;
    const Cell3Icon = levelData.grid[2].Icon;

    return (
        <div className="h-full flex flex-col items-center justify-center max-w-lg mx-auto gap-6 p-4">
            <div className="bg-white px-8 py-3 rounded-full shadow-lg border-4 border-indigo-100 flex items-center gap-2">
                 <Grid2X2 className="text-indigo-400" />
                 <h2 className="text-xl md:text-2xl font-black text-indigo-500">
                    Örüntüyü Tamamla
                </h2>
            </div>

            {/* Matrix Grid */}
            <div className="flex-shrink-0 w-full max-w-[80vmin] aspect-square bg-white p-6 rounded-[2.5rem] shadow-2xl border-8 border-indigo-50 grid grid-cols-2 gap-4 sm:gap-6">
                 {/* Row 1 */}
                 <div className="bg-gray-50 rounded-3xl flex items-center justify-center border-4 border-gray-100 shadow-inner">
                    <Cell1Icon className={`w-1/2 h-1/2 ${levelData.grid[0].Color.class}`} fill="currentColor" />
                 </div>
                 <div className="bg-gray-50 rounded-3xl flex items-center justify-center border-4 border-gray-100 shadow-inner">
                     <Cell2Icon className={`w-1/2 h-1/2 ${levelData.grid[1].Color.class}`} fill="currentColor" />
                 </div>
                 
                 {/* Row 2 */}
                 <div className="bg-gray-50 rounded-3xl flex items-center justify-center border-4 border-gray-100 shadow-inner">
                    <Cell3Icon className={`w-1/2 h-1/2 ${levelData.grid[2].Color.class}`} fill="currentColor" />
                 </div>
                 <div className="bg-indigo-50 rounded-3xl flex items-center justify-center border-4 border-dashed border-indigo-300 relative">
                    <span className="text-7xl font-black text-indigo-200">?</span>
                 </div>
            </div>

            {/* Options */}
            <div className="flex gap-4 w-full justify-between max-w-[80vmin] shrink-0">
                {levelData.options.map((opt, i) => (
                    <button
                        key={i}
                        onClick={() => handleSelect(opt.correct, i)}
                        className={`
                            flex-1 aspect-square bg-white rounded-3xl shadow-lg flex items-center justify-center border-b-8 active:border-b-0 active:translate-y-2 transition-all
                            ${shake === i ? 'animate-shake border-red-200 bg-red-50' : 'border-gray-100 hover:border-indigo-200'}
                            ${success && opt.correct ? 'bg-green-100 border-green-300 scale-110 ring-4 ring-green-200' : ''}
                        `}
                    >
                         <opt.content.Icon className={`w-1/2 h-1/2 ${opt.content.Color.class}`} fill="currentColor" />
                    </button>
                ))}
            </div>

             {success && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
                     <div className="bg-white p-6 rounded-full shadow-2xl animate-scale-in">
                        <Star size={100} className="text-yellow-400 animate-spin-slow fill-yellow-400 drop-shadow-md" />
                     </div>
                </div>
            )}
        </div>
    )
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
