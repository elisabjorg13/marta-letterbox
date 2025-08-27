"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useLetters, Letter } from "./hooks/useLetters";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showInbox, setShowInbox] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [showAddLetter, setShowAddLetter] = useState(false);
  const [newLetterTitle, setNewLetterTitle] = useState("");
  const [newLetterContent, setNewLetterContent] = useState("");
  
  // Use Firebase letters hook
  const { letters, loading, error, addLetter, deleteLetter } = useLetters();

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

  const handleAddLetter = async () => {
    if (!newLetterTitle.trim() || !newLetterContent.trim()) return;
    
    try {
      console.log('Attempting to add letter to Firebase...');
      console.log('Letter data:', { title: newLetterTitle.trim(), content: newLetterContent.trim() });
      
      const result = await addLetter({
        title: newLetterTitle.trim(),
        imageUrl: "", // For now, we'll just store text content
        textContent: newLetterContent.trim()
      });
      
      console.log('Letter added successfully! Document ID:', result);
      
      // Clear form and close modal
      setNewLetterTitle("");
      setNewLetterContent("");
      setShowAddLetter(false);
      
      alert("Bréf sent successfully! Check your inbox.");
    } catch (error) {
      console.error('Error adding letter to Firebase:', error);
      alert("Error adding letter: " + (error as Error).message);
    }
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
              {selectedLetter.imageUrl ? (
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
                    
                    {/* Red paper lines - French school paper style */}
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
              ) : (
                <p className="text-gray-500">No content available for this letter.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add Letter Modal - French School Paper Style
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
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white font-serif">Écrire une lettre</h2>
            <button
              onClick={() => setShowAddLetter(false)}
              className="text-white px-4 py-2 rounded-md hover:text-red-600 transition-colors"
            >
              ← Retour
            </button>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Contenu de la lettre
                </label>
                <div className="relative">
                  {/* French School Paper Background */}
                  <div className="relative bg-white border-2 border-gray-300 shadow-lg overflow-hidden">
                    {/* Paper content */}
                    <div className="relative z-10 p-8">
                      {/* Title line */}
                      <div className="mb-4">
                        <input
                          type="text"
                          value={newLetterTitle}
                          onChange={(e) => setNewLetterTitle(e.target.value)}
                          placeholder="Titre de la lettre..."
                          className="w-full px-3 py-2 border-0 bg-transparent placeholder-blue-500/70 focus:outline-none font-serif text-base font-bold"
                          style={{ fontFamily: 'Georgia, serif', color: '#0000FF' }}
                        />
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
                        <textarea
                          value={newLetterContent}
                          onChange={(e) => setNewLetterContent(e.target.value)}
                          placeholder="Écrivez votre lettre ici..."
                          rows={20}
                          className="w-full px-3 py-3 border-0 bg-transparent placeholder-blue-500/70 focus:outline-none resize-none font-serif text-sm leading-tight"
                          style={{ fontFamily: 'Georgia, serif', color: '#0000FF' }}
                        />
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
                    
                    {/* Red paper lines - French school paper style */}
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
                Envoyer la lettre
              </button>
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
          <button
            onClick={() => {
              const subject = "Letterbox Updated";
              const body = "The letterbox has been updated with new content. Check it out at: https://litladaemid.online";
              const mailtoLink = `mailto:davidsson.elisa@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
              window.open(mailtoLink);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Notify Subscribers
          </button>
          <button
            onClick={() => setShowAddLetter(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Bæta við bréfi
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
                  {loading ? "..." : letters.length}
                </div>
              </button>
            </div>
            <div className="text-center mt-4">
              <p className="text-white text-xl font-semibold drop-shadow-lg">You got mail!</p>
            </div>
            {/* Debug info */}
            <div className="text-center mt-2 text-white/70 text-sm">
              <p>Letters from: {loading ? 'Loading...' : 'Firebase'}</p>
              <p>Total letters: {letters.length}</p>
              {error && <p className="text-red-400">Error: {error}</p>}
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
            


            <div className="space-y-3">
              {letters.map((letter) => (
                <div
                  key={letter.id}
                  className="p-4 border border-white/30 rounded-lg hover:bg-white/10 cursor-pointer transition-colors bg-white/5"
                >
                  <div className="flex justify-between items-start">
                    <div 
                      onClick={() => setSelectedLetter(letter)}
                      className="flex-1 cursor-pointer"
                    >
                      <h3 className="text-lg font-medium text-white drop-shadow-lg">
                        {letter.title}
                      </h3>
                      <p className="text-sm text-white/80 drop-shadow-lg">
                        lesa bréf
                      </p>
                      {/* Debug info */}
                      <p className="text-xs text-white/60 mt-1">
                        ID: {letter.id} | Type: {letter.imageUrl ? 'Image' : 'Text'}
                      </p>
                    </div>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm(`Delete "${letter.title}"?`)) {
                          try {
                            await deleteLetter(letter.id!);
                            alert('Letter deleted successfully!');
                          } catch (error) {
                            alert('Error deleting letter: ' + (error as Error).message);
                          }
                        }
                      }}
                      className="ml-2 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {/* Debug info */}
              <div className="text-center p-2 bg-white/10 rounded">
                <p className="text-xs text-white/70">
                  Source: {loading ? 'Loading...' : 'Firebase'} | 
                  Count: {letters.length} | 
                  {error && <span className="text-red-400">Error: {error}</span>}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

}

