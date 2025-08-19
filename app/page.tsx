"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface Letter {
  id: number;
  title: string;
  imageUrl?: string;
  videoUrl?: string;
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

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showInbox, setShowInbox] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyAuthor, setReplyAuthor] = useState("");
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

  // Function to load shared replies from localStorage
  const loadSharedReplies = useCallback(() => {
    const savedReplies = localStorage.getItem("marta-shared-replies");
    if (savedReplies) {
      const parsedReplies = JSON.parse(savedReplies);
      setLetters(prevLetters => 
        prevLetters.map(letter => ({
          ...letter,
          replies: (parsedReplies[letter.id] || []).map((reply: StoredReply) => ({
            ...reply,
            timestamp: new Date(reply.timestamp)
          }))
        }))
      );
    }
  }, []);

  // Function to save shared replies to localStorage
  const saveSharedReplies = useCallback((updatedLetters: Letter[]) => {
    const repliesToSave: { [key: number]: Reply[] } = {};
    updatedLetters.forEach(letter => {
      repliesToSave[letter.id] = letter.replies;
    });
    localStorage.setItem("marta-shared-replies", JSON.stringify(repliesToSave));
  }, []);

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

  const handleReply = () => {
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
                  />
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
                    <div className="flex justify-between items-start mb-2">
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
            {/* <button
              onClick={loadSharedReplies}
              className="text-blue-600 px-2 py-2 rounded-md hover:text-blue-700 transition-colors"
            >
              🔄 Uppfæra
            </button>
            <button
              onClick={clearAllReplies}
              className="text-yellow-600 px-2 py-2 rounded-md hover:text-yellow-700 transition-colors"
            >
              Hreinsa svör
            </button> */}
          </div>
        </div>

        {!showInbox ? (
          <div>
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
                💬 <strong>Shared Chat:</strong> Both you and Marta can see and reply to letters. 
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
