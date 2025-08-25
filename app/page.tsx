"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface Letter {
  id: number;
  title: string;
  imageUrl?: string;
  videoUrl?: string;
  textContent?: string;
  replies: Reply[];
}

interface Reply {
  id: string;
  text: string;
  timestamp: Date;
  author: string;
}

interface StoredReply {
  id: string;
  text: string;
  timestamp: string;
  author: string;
}

interface StoredLetter {
  id: number;
  title: string;
  imageUrl?: string;
  videoUrl?: string;
  textContent?: string;
  replies: StoredReply[];
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showInbox, setShowInbox] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyAuthor, setReplyAuthor] = useState("");
  const [showAddLetter, setShowAddLetter] = useState(false);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [newLetterTitle, setNewLetterTitle] = useState("");
  const [newLetterContent, setNewLetterContent] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [letters, setLetters] = useState<Letter[]>([
    {
      id: 5,
      title: "18. ágúst",
      imageUrl: "/images/bref3.png", // You'll upload this PNG
      replies: []
    },
    {
      id: 4,
      title: "Myndband dagsins",
      videoUrl: "https://www.youtube.com/embed/4YM2kwxFG8Y", // Replace with your actual video URL
      replies: []
    },
    {
      id: 3,
      title: "13. ágúst",
      imageUrl: "/images/today.png", // You'll upload this PNG
      replies: []
    },
    {
      id: 1,
      title: "Fyrsta bréf",
      imageUrl: "/images/rename.png", // You'll upload this PNG
      replies: []
    },
    {
      id: 2,
      title: "Skemmtileg mynd",
      imageUrl: "/images/skor.jpeg", // You'll upload this PNG
      replies: []
    },

    // Add more letters as needed
  ]);

  // JSONBin.io configuration for shared storage
  const JSONBIN_API_KEY = "$2a$10$HliQVCH.IEWx9XkiRH8hPumYRMjJxOrrPKqikEpBRNICljyEHQyii";
  const JSONBIN_BIN_ID = "68a470ead0ea881f405d6177";
  const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

  // Function to load shared replies from JSONBin.io
  const loadSharedReplies = useCallback(async () => {
    try {
      const response = await fetch(JSONBIN_URL, {
        headers: {
          'X-Master-Key': JSONBIN_API_KEY,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Load letters from shared storage if available
        if (data.record?.letters) {
          setLetters(data.record.letters.map((letter: StoredLetter) => ({
            ...letter,
            replies: letter.replies.map((reply: StoredReply) => ({
              ...reply,
              timestamp: new Date(reply.timestamp)
            }))
          })));
        } else {
          // Fallback to loading just replies for existing letters
          const savedReplies = data.record?.replies || {};
          setLetters(prevLetters => 
            prevLetters.map(letter => ({
              ...letter,
              replies: (savedReplies[letter.id] || []).map((reply: StoredReply) => ({
                ...reply,
                timestamp: new Date(reply.timestamp)
              }))
            }))
          );
        }
      }
    } catch (error) {
      console.log('Could not load replies:', error);
    }
  }, [JSONBIN_URL, JSONBIN_API_KEY]);

  // Function to save shared replies to JSONBin.io
  const saveSharedReplies = useCallback(async (updatedLetters: Letter[]) => {
    try {
      const repliesToSave: { [key: number]: Reply[] } = {};
      updatedLetters.forEach(letter => {
        repliesToSave[letter.id] = letter.replies;
      });

      await fetch(JSONBIN_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_API_KEY,
        },
        body: JSON.stringify({ replies: repliesToSave })
      });
    } catch (error) {
      console.log('Could not save replies:', error);
    }
  }, [JSONBIN_URL, JSONBIN_API_KEY]);

  useEffect(() => {
    // Check if user is already authenticated
    const auth = localStorage.getItem("marta-auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
    
    // Load shared replies
    loadSharedReplies();
    
    // Set up auto-refresh every 5 seconds to sync replies
    const interval = setInterval(() => {
      if (isAuthenticated) {
        loadSharedReplies();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, loadSharedReplies]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "reidhjol1") {
      setIsAuthenticated(true);
      localStorage.setItem("marta-auth", "true");
    } else {
      alert("Wrong password!");
      setPassword("");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowInbox(false);
    setSelectedLetter(null);
    localStorage.removeItem("marta-auth");
  };

  const handleReply = async () => {
    if (!selectedLetter || !replyText.trim() || !replyAuthor.trim()) return;
    
    const newReply: Reply = {
      id: Date.now().toString(),
      text: replyText.trim(),
      timestamp: new Date(),
      author: replyAuthor.trim()
    };
    
    // Update the letter with the new reply
    const updatedLetter = { ...selectedLetter, replies: [...selectedLetter.replies, newReply] };
    setSelectedLetter(updatedLetter);
    
    // Update the letters array
    setLetters(prevLetters => {
      const updatedLetters = prevLetters.map(letter => 
        letter.id === selectedLetter.id ? updatedLetter : letter
      );
      // Save to shared system
      saveSharedReplies(updatedLetters);
      return updatedLetters;
    });
    
    // Clear the reply form
    setReplyText("");
    setReplyAuthor("");
  };

  const handleAddLetter = async () => {
    if (!newLetterTitle.trim() || !newLetterContent.trim()) return;
    
    const newLetter: Letter = {
      id: Date.now(),
      title: newLetterTitle.trim(),
      textContent: newLetterContent.trim(),
      replies: []
    };
    
    // Add new letter to the beginning of the array
    const updatedLetters = [newLetter, ...letters];
    setLetters(updatedLetters);
    
    // Save to shared system - save the entire letters array, not just replies
    try {
      await fetch(JSONBIN_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_API_KEY,
        },
        body: JSON.stringify({ letters: updatedLetters })
      });
    } catch (error) {
      console.log('Could not save new letter:', error);
    }
    
    // Clear the form and close modal
    setNewLetterTitle("");
    setNewLetterContent("");
    setShowAddLetter(false);
  };

  const handleAddVideo = async () => {
    if (!newVideoTitle.trim() || !newVideoUrl.trim()) return;
    
    // Convert regular YouTube URL to embed URL if needed
    let embedUrl = newVideoUrl.trim();
    
    // Handle different YouTube URL formats
    if (embedUrl.includes('youtube.com/watch')) {
      const videoId = embedUrl.split('v=')[1]?.split('&')[0];
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    } else if (embedUrl.includes('youtu.be/')) {
      const videoId = embedUrl.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    } else if (embedUrl.includes('youtube.com/embed/')) {
      // Already in embed format, keep as is
    } else {
      alert('Please enter a valid YouTube URL');
      return;
    }
    
    // Validate the video ID
    if (!embedUrl.includes('/embed/')) {
      alert('Could not extract video ID from URL. Please check your YouTube URL.');
      return;
    }
    
    const newVideo: Letter = {
      id: Date.now(),
      title: newVideoTitle.trim(),
      videoUrl: embedUrl,
      replies: []
    };
    
    // Add the new video to the beginning of the array
    const updatedLetters = [newVideo, ...letters];
    setLetters(updatedLetters);
    
    // Save to JSONBin.io
    try {
      await fetch(JSONBIN_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_API_KEY,
        },
        body: JSON.stringify({ letters: updatedLetters })
      });
    } catch (error) {
      console.log('Could not save new video:', error);
    }
    
    // Clear form and close modal
    setNewVideoTitle("");
    setNewVideoUrl("");
    setShowAddVideo(false);
  };

  if (!isAuthenticated) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/misterlonely.jpg')", // You'll upload this image
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="p-8 rounded-lg max-w-md w-full mx-4">
          <h1 className="text-3xl font-bold text-center mb-6 text-white ">
            Pósthólf Mörtu
          </h1>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Enter Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-white bg-white/10 text-white placeholder-white/70"
                placeholder="Enter password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-white/20 text-white py-2 px-4 rounded-md hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 transition-colors border border-white/30"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Add Letter Modal - check this first
  if (showAddLetter) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-no-repeat p-4"
        style={{
          backgroundImage: "url('/images/misterlonely.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white font-serif">bréfaskrif </h2>
            <button
              onClick={() => setShowAddLetter(false)}
              className="text-white px-4 py-2 rounded-md hover:text-red-600 transition-colors"
            >
              ← Aftur
            </button>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Skrifa bréf
                </label>
                <div className="relative">
                  {/* Single paper background for both title and content */}
                  <div className="relative bg-white border-2 border-gray-300 shadow-lg overflow-hidden">
                    {/* Title and content on the same paper */}
                    <div className="relative z-10 p-6">
                      {/* Title input */}
                      <div className="mb-6">
                        <input
                          type="text"
                          value={newLetterTitle}
                          onChange={(e) => setNewLetterTitle(e.target.value)}
                          placeholder="Titill bréfs..."
                          className="w-full px-3 py-2 border-0 bg-transparent placeholder-blue-500/70 focus:outline-none font-serif text-base font-bold"
                          style={{ fontFamily: 'Georgia, serif', color: '#0000FF' }}
                        />
                      </div>
                      
                      {/* Content textarea with scrollable overflow */}
                      <div className="max-h-[32rem] overflow-y-auto">
                        <textarea
                          value={newLetterContent}
                          onChange={(e) => setNewLetterContent(e.target.value)}
                          placeholder="Skrifaðu bréfið þitt hér..."
                          rows={20}
                          className="w-full px-3 py-3 border-0 bg-transparent placeholder-blue-500/70 focus:outline-none resize-none font-serif text-sm leading-tight"
                          style={{ fontFamily: 'Georgia, serif', color: '#0000FF' }}
                        />
                      </div>
                    </div>
                    
                    {/* Red paper lines for the entire paper */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(100)].map((_, i) => (
                        <div 
                          key={i}
                          className="absolute left-0 right-0 h-px bg-red-400 opacity-60"
                          style={{ top: `${(i + 1) * 20}px` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
        
              </div>
              
              <button
                onClick={handleAddLetter}
                disabled={!newLetterTitle.trim() || !newLetterContent.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-blue-500 shadow-lg"
              >
                Senda bréf
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add Video Modal
  if (showAddVideo) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-no-repeat p-4"
        style={{
          backgroundImage: "url('/images/misterlonely.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white font-serif">myndband</h2>
            <button
              onClick={() => setShowAddVideo(false)}
              className="text-white px-4 py-2 rounded-md hover:text-red-600 transition-colors"
            >
              ← Aftur
            </button>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Bæta við myndbandi
                </label>
                <input
                  type="text"
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                  placeholder="Titill myndbands..."
                  className="w-full px-3 py-2 border border-white/30 rounded-md bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  YouTube URL
                </label>
                <input
                  type="url"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border border-white/30 rounded-md bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <p className="text-xs text-white/70 mt-1">
                  You can paste a regular YouTube URL, it will be converted to embed format automatically.
                  <br />
                  <strong>Supported formats:</strong> youtube.com/watch?v=..., youtu.be/..., or embed URLs
                </p>
              </div>
              
              <button
                onClick={handleAddVideo}
                disabled={!newVideoTitle.trim() || !newVideoUrl.trim()}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-red-500 shadow-lg"
              >
                Bæta við myndbandi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedLetter) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-no-repeat p-4"
        style={{
          backgroundImage: "url('/images/misterlonely.jpg')", // You'll upload this image
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setSelectedLetter(null)}
              className=" text-white px-4 py-2 rounded-md transition-colors"
            >
              ← Aftur í pósthólf
            </button>
          </div>
          
          <div className="">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
              {selectedLetter.title}
            </h2>
            <div className="flex justify-center mb-8">
              {selectedLetter.videoUrl ? (
                <div className="max-w-full">
                  <iframe
                    src={selectedLetter.videoUrl}
                    title={selectedLetter.title}
                    width="600"
                    height="400"
                    className="rounded-lg shadow-md"
                    allowFullScreen
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    onError={(e) => {
                      console.error("Video failed to load:", selectedLetter.videoUrl);
                    }}
                  />
                  <div className="mt-2 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      If the video doesn't load, try refreshing the page or check your internet connection.
                    </p>
                  </div>
                </div>
              ) : selectedLetter.imageUrl ? (
                <Image
                  src={selectedLetter.imageUrl}
                  alt={selectedLetter.title}
                  width={600}
                  height={300}
                  className="max-w-full h-auto rounded-lg shadow-md"
                  onError={(e) => {
                    console.error("Image failed to load:", selectedLetter.imageUrl);
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : selectedLetter.textContent ? (
                <div className="max-w-4xl mx-auto">
                  <div className="relative bg-white border-2 border-gray-300 shadow-lg transform rotate-1 hover:rotate-0 transition-transform duration-300 overflow-hidden">
                    {/* Letter content */}
                    <div className="relative z-10 p-8">
                      {/* Title line */}
                      <div className="mb-4">
                        <h3 className="text-base font-serif font-bold" style={{ fontFamily: 'Georgia, serif', color: '#0000FF' }}>
                          {selectedLetter.title}
                        </h3>
                      </div>
                      
                      {/* Date line */}
                      <div className="text-right mb-4">
                        <span className="text-xs font-serif italic" style={{ color: '#0000FF' }}>
                          {new Date().toLocaleDateString('fr-FR', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                      
                      {/* Letter text with scrollable content */}
                      <div className="font-serif leading-tight max-h-[32rem] overflow-y-auto">
                        <p className="text-sm whitespace-pre-wrap" style={{ fontFamily: 'Georgia, serif', color: '#0000FF' }}>
                          {selectedLetter.textContent}
                        </p>
                      </div>
                      
                      {/* Signature line */}
                      <div className="mt-6 pt-3 border-t border-red-400">
                        <div className="text-right">
                          <span className="text-xs font-serif italic" style={{ color: '#0000FF' }}>
                            Avec amour,
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Red paper lines - many more to cover the longer paper */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(100)].map((_, i) => (
                        <div 
                          key={i}
                          className="absolute left-0 right-0 h-px bg-red-400 opacity-60"
                          style={{ top: `${(i + 1) * 20}px` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Replies Section */}
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                Svör ({selectedLetter.replies.length})
              </h3>
              
              {/* Display existing replies */}
              <div className="space-y-4 mb-6">
                {selectedLetter.replies.map((reply) => (
                  <div key={reply.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-white">{reply.author}</span>
                      <span className="text-sm text-white/70">
                        {reply.timestamp.toLocaleDateString('is-IS')} {reply.timestamp.toLocaleTimeString('is-IS', {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className="text-white/90">{reply.text}</p>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <h4 className="text-lg font-medium mb-3 text-white">Svara bréfinu</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={replyAuthor}
                    onChange={(e) => setReplyAuthor(e.target.value)}
                    placeholder="Nafn þitt"
                    className="w-full px-3 py-2 border border-white/30 rounded-md bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Skrifaðu svar..."
                    rows={3}
                    className="w-full px-3 py-2 border border-white/30 rounded-md bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white resize-none"
                  />
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim() || !replyAuthor.trim()}
                    className="w-full bg-white/20 text-white py-2 px-4 rounded-md hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-white/30"
                  >
                    Senda svar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat p-4"
      style={{
        backgroundImage: "url('/images/postbox.png')", // You'll upload this image
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-32">
          <div className="flex space-x-4">
            <button
              onClick={handleLogout}
              className="text-red-600 px-2 py-2 rounded-md hover:text-red-700 transition-colors"
            >
              Logout
            </button>
            <button
              onClick={loadSharedReplies}
              className="text-blue-600 px-2 py-2 rounded-md hover:text-blue-700 transition-colors"
            >
              🔄 Uppfæra
            </button>
          </div>
        </div>

        {!showInbox ? (
          <div>
            {/* Add Letter and Video Buttons */}
            <div className="flex justify-center space-x-8 mb-8">
              <div className="text-center">
                <button
                  onClick={() => setShowAddLetter(true)}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full w-24 h-24 flex items-center justify-center transition-all transform hover:scale-105 border-2 border-white/30 shadow-lg"
                >
                  <span className="text-4xl font-bold">+</span>
                </button>
                <p className="text-white text-lg font-semibold drop-shadow-lg mt-2">Skrifa bréf</p>
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => setShowAddVideo(true)}
                  className="bg-red-500/20 hover:bg-red-500/30 text-white rounded-full w-24 h-24 flex items-center justify-center transition-all transform hover:scale-105 border-2 border-red-500/30 shadow-lg"
                >
                  <span className="text-4xl font-bold">▶</span>
                </button>
                <p className="text-white text-lg font-semibold drop-shadow-lg mt-2">Bæta myndbandi</p>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setShowInbox(true)}
                className="relative text-white rounded-full shadow-lg transition-all transform hover:scale-105"
              >
                <Image
                  src="/images/pngegg.png" // You'll upload this image
                  alt="Mail"
                  width={200}
                  height={200}
                />
                <div className="absolute top-10 -right-1 bg-red-500 text-white text-xs rounded-full w-10 h-10 flex items-center justify-center animate-pulse">
                  {letters.length}
                </div>
              </button>
            </div>
            <div className="text-center mt-4">
              <p className="text-white text-xl font-semibold drop-shadow-lg">You got mail!</p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                pósthólf
              </h2>
              <button
                onClick={() => setShowInbox(false)}
                className=" text-white px-2 py-2 rounded-md hover:text-red-600 transition-colors"
              >
                ← Back
              </button>
            </div>
            
            {/* Instructions for shared chat */}
            {/* <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3 mb-4">
              <p className="text-blue-200 text-sm">
                💬 <strong>Real Shared Chat:</strong> Both you and Marta can see and reply to letters. 
                Replies sync automatically every 5 seconds, or click "🔄 Uppfæra" to refresh manually.
              </p>
            </div> */}

            <div className="space-y-3">
              {letters.map((letter) => (
                <div
                  key={letter.id}
                  onClick={() => setSelectedLetter(letter)}
                  className="p-4 border border-white/30 rounded-lg hover:bg-white/10 cursor-pointer transition-colors bg-white/5"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-white drop-shadow-lg">
                        {letter.title}
                      </h3>
                      <p className="text-sm text-white/80 drop-shadow-lg">
                        opna
                      </p>
                    </div>
                    {letter.replies.length > 0 && (
                      <div className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        {letter.replies.length}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

}
