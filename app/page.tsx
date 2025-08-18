"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Letter {
  id: number;
  title: string;
  imageUrl?: string;
  videoUrl?: string;
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showInbox, setShowInbox] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);

  // Sample letters array - you can replace these with your actual letter images
  const letters: Letter[] = [
    {
      id: 5,
      title: "18. ágúst",
      imageUrl: "/images/bref3.png" // You'll upload this PNG
    },
    {
      id: 4,
      title: "Myndband dagsins",
      videoUrl: "https://www.youtube.com/embed/4YM2kwxFG8Y" // Replace with your actual video URL
    },
    {
      id: 3,
      title: "13. ágúst",
      imageUrl: "/images/today.png" // You'll upload this PNG
    },
    {
      id: 1,
      title: "Fyrsta bréf",
      imageUrl: "/images/rename.png" // You'll upload this PNG
    },
    {
      id: 2,
      title: "Skemmtileg mynd",
      imageUrl: "/images/skor.jpeg" // You'll upload this PNG
    },

    // Add more letters as needed
  ];

  useEffect(() => {
    // Check if user is already authenticated
    const auth = localStorage.getItem("marta-auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

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
            <div className="flex justify-center">
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
          <button
            onClick={handleLogout}
            className="text-red-600 px-2 py-2 rounded-md hover:text-red-700 transition-colors"
          >
            Logout
          </button>
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
                className=" text-white px-4 py-2 rounded-md hover:text-red-600 transition-colors"
              >
                ← Back
              </button>
            </div>
            
            <div className="space-y-3">
              {letters.map((letter) => (
                <div
                  key={letter.id}
                  onClick={() => setSelectedLetter(letter)}
                  className="p-4 border border-white/30 rounded-lg hover:bg-white/10 cursor-pointer transition-colors bg-white/5"
                >
                  <h3 className="text-lg font-medium text-white drop-shadow-lg">
                    {letter.title}
                  </h3>
                  <p className="text-sm text-white/80 drop-shadow-lg">
                    opna 
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
