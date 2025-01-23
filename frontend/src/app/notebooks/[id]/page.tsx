"use client";

import { useState, useEffect, use, Usable } from "react";
import { db } from "../../firebase";
import { doc, onSnapshot, collection, addDoc, getDocs } from "firebase/firestore";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { generatePodcast, generatePodcastV2 } from "@/app/genkit/actions";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

const MAX_SOURCES = 300;

export default function NotebookDetailPage({ params }: { params: Usable<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const [title, setTitle] = useState("");
  const [sources, setSources] = useState<Array<{ id: string; title: string; content: string }>>([]);
  const [newSourceTitle, setNewSourceTitle] = useState("");
  const [newSourceContent, setNewSourceContent] = useState("");
  const [messages, setMessages] = useState<Array<{ id: string; content: string; sender: 'user' | 'ai' }>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [notes, setNotes] = useState<Array<{ id: string; content: string }>>([]);
  const [newNote, setNewNote] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [addSourceView, setAddSourceView] = useState<'main' | 'paste'>('main');
  const [scriptSections, setScriptSections] = useState<Array<{ speaker: string; lines: string[] }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const sampleText = `The Rise of Artificial Intelligence in Modern Society

  Artificial Intelligence (AI) has become an integral part of our daily lives, transforming how we work, communicate, and solve problems. From virtual assistants like Siri and Alexa to sophisticated algorithms that power social media feeds and recommend content, AI technologies are reshaping our interaction with digital systems.

  Recent advances in machine learning, particularly in natural language processing and computer vision, have led to breakthrough applications in healthcare, finance, and education. Medical professionals now use AI to assist in diagnosis and treatment planning, while financial institutions employ AI algorithms for fraud detection and risk assessment.

  However, the rapid adoption of AI also raises important ethical considerations. Questions about privacy, bias in AI systems, and the impact on employment have sparked crucial debates about responsible AI development. As we continue to integrate AI into more aspects of society, finding the balance between innovation and ethical considerations remains a key challenge.`;

  useEffect(() => {
    if (!id || Array.isArray(id)) return;
    
    // Notebook document listener
    const notebookDoc = doc(db, "notebooks", id);
    const unsubscribeNotebook = onSnapshot(notebookDoc, (snapshot) => {
      const data = snapshot.data();
      if (data) {
        setTitle(data.title || "");
      }
    });

    // Sources collection listener
    const sourcesCollection = collection(db, "notebooks", id, "sources");
    const unsubscribeSources = onSnapshot(sourcesCollection, (snapshot) => {
      const sourcesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as { title: string; content: string }
      }));
      setSources(sourcesData);
    });

    return () => {
      unsubscribeNotebook();
      unsubscribeSources();
    };
  }, [id]);

  const handleAddSource = async () => {
    if (!id || !newSourceTitle || !newSourceContent) return;
    
    try {
      const sourcesCollection = collection(db, "notebooks", id, "sources");
      await addDoc(sourcesCollection, {
        title: newSourceTitle,
        content: newSourceContent,
        createdAt: new Date(),
      });
      
      // Reset form
      setNewSourceTitle("");
      setNewSourceContent("");
    } catch (error) {
      console.error("Error adding source:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user' as const
    };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // TODO: Implement AI response logic here
    // For now, we'll add a mock response
    const aiMessage = {
      id: (Date.now() + 1).toString(),
      content: "This is a mock AI response. Implement actual AI logic here.",
      sender: 'ai' as const
    };
    setTimeout(() => {
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    const note = {
      id: Date.now().toString(),
      content: newNote
    };
    setNotes(prev => [...prev, note]);
    setNewNote("");
  };

  const handlePasteTextSubmit = async () => {
    if (!id || !pastedText.trim()) return;
    
    try {
      const sourcesCollection = collection(db, "notebooks", id, "sources");
      await addDoc(sourcesCollection, {
        title: `Text Source ${new Date().toLocaleString()}`,
        content: pastedText,
        createdAt: new Date(),
      });
      
      // Reset form and view
      setPastedText("");
      setAddSourceView('main');
    } catch (error) {
      console.error("Error adding pasted text source:", error);
    }
  };

  const handleGenerateScript = async () => {
    try {
      setIsGenerating(true);

      const pdfPath = 'test.pdf';
      const result = await generatePodcast({ pdfPath });
      setScriptSections(result.scriptSections);
      console.log(result);
    } catch (error) {
      console.error('Error generating script:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  
  const handleGenerateScriptV2 = async () => {
    try {
      setIsGenerating(true);
      setAudioUrl(null); // Reset audio URL when generating new content

      // Fetch sources from the database
      const sourcesCollection = collection(db, "notebooks", id, "sources");
      const sourcesSnapshot = await getDocs(sourcesCollection);
      const sources = sourcesSnapshot.docs.map((doc, index) => {
        return `===== START SOURCE ${index + 1} =====\n${doc.data().content}\n===== END SOURCE ${index + 1} ======`;
      });

      const sourceText = sources.join("\n\n");

      const result = await generatePodcastV2({ sourceText });
      setScriptSections(result.scriptSections);
      
      // Get the signed URL for the audio file
      if (result.storageUrl) {
        const storage = getStorage();
        const audioRef = ref(storage, result.storageUrl);
        const url = await getDownloadURL(audioRef);
        setAudioUrl(url);
      }
      
      console.log(result);
    } catch (error) {
      console.error('Error generating script:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <div className="flex items-center p-6 border-b backdrop-blur-sm bg-background/50 sticky top-0 z-10">
        <Link 
          href="/notebooks" 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>←</span>
          <span>Back to Notebooks</span>
        </Link>
        <h1 className="text-xl font-semibold ml-6">{title}</h1>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-8 p-6 overflow-auto">
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <Card className="backdrop-blur-sm bg-background/50 border shadow-md">
            <CardHeader className="space-y-1.5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Sources</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      Add Source
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[900px]">
                    <DialogHeader>
                      {addSourceView === 'paste' ? (
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setAddSourceView('main')}
                          >
                            ←
                          </Button>
                          <DialogTitle>Paste copied text</DialogTitle>
                        </div>
                      ) : (
                        <>
                          <DialogTitle>Add sources</DialogTitle>
                          <DialogDescription>
                            Sources let NotebookLM base its responses on the information that matters most to you.
                            (Examples: marketing plans, course reading, research notes, meeting transcripts, sales documents, etc.)
                          </DialogDescription>
                        </>
                      )}
                    </DialogHeader>
                    
                    {addSourceView === 'paste' ? (
                      <>
                        <div className="mt-4">
                          <textarea
                            value={pastedText}
                            onChange={(e) => setPastedText(e.target.value)}
                            placeholder="Paste text here*"
                            className="w-full h-[300px] p-4 rounded-md border bg-background resize-none"
                          />
                        </div>
                        <DialogFooter>
                          <Button onClick={handlePasteTextSubmit}>Add Source</Button>
                        </DialogFooter>
                      </>
                    ) : (
                      <div className="mt-8">
                        <div className="grid grid-cols-3 gap-4">
                          <Card className="p-4">
                            <div className="flex items-center gap-2 mb-4">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M7 21h10a2 2 0 0 0 2-2V9.414a1 1 0 0 0-.293-.707l-5.414-5.414A1 1 0 0 0 12.586 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z"/>
                              </svg>
                              <span className="font-medium">Google Drive</span>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="w-full">Google Docs</Button>
                              <Button variant="outline" size="sm" className="w-full">Google Slides</Button>
                            </div>
                          </Card>
                          
                          <Card className="p-4">
                            <div className="flex items-center gap-2 mb-4">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                              </svg>
                              <span className="font-medium">Link</span>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="w-full">Website</Button>
                              <Button variant="outline" size="sm" className="w-full">YouTube</Button>
                            </div>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center gap-2 mb-4">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                              </svg>
                              <span className="font-medium">Text</span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => setAddSourceView('paste')}
                            >
                              Paste text
                            </Button>
                          </Card>
                        </div>

                        <div className="mt-8 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Source limit</span>
                            <span>{sources.length} / {MAX_SOURCES}</span>
                          </div>
                          <div 
                            className="h-2 bg-secondary rounded-full" 
                            style={{ width: `${(sources.length / 300) * 100}%` }} 
                          />
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sources.map((source) => (
                  <Collapsible key={source.id}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-accent/50 rounded-md transition-colors">
                      <span className="font-medium">{source.title}</span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4 py-3 text-sm text-muted-foreground">
                      {source.content}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-6">
          <Card className="h-full flex flex-col backdrop-blur-sm bg-background/50 border shadow-md">
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-semibold">Chat</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-4">
                    <div className="flex items-start gap-4">
                      {message.sender === 'ai' && (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                          {/* AI icon here */}
                        </div>
                      )}
                      <div className={`flex-1 ${message.sender === 'user' ? 'ml-12' : ''}`}>
                        <div className={`rounded-lg p-4 shadow-sm ${
                          message.sender === 'user' 
                            ? 'bg-primary text-primary-foreground ml-auto max-w-[80%]' 
                            : 'bg-muted/50 backdrop-blur-sm max-w-[80%]'
                        }`}>
                          {message.content}
                        </div>
                        <div className="flex gap-2 mt-2 opacity-0 hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="text-xs">Save to note</Button>
                          <Button variant="ghost" size="sm" className="text-xs">Copy</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t p-4 bg-background/50 backdrop-blur-sm">
                <div className="relative flex items-center">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Start typing..."
                    className="flex-1 px-4 py-6 pr-12 focus:ring-2 focus:ring-primary/20"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button 
                    size="sm"
                    onClick={handleSendMessage}
                    className="absolute right-2 rounded-full w-8 h-8 p-0 hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-3 space-y-6">
          <Card className="backdrop-blur-sm bg-background/50 border shadow-md">
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-semibold">Studio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Audio Overview</h3>
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-muted rounded-full">
                      {/* Icon */}
                    </div>
                    <div>
                      <h4 className="font-medium">Deep Dive conversation</h4>
                      <p className="text-sm text-muted-foreground">Two hosts (English only)</p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button variant="outline" className="flex-1 hover:bg-accent">Customize</Button>
                    <Button 
                      className="flex-1" 
                      onClick={handleGenerateScriptV2}
                      disabled={isGenerating}
                    >
                      {isGenerating ? "Generating..." : "Generate"}
                    </Button>
                  </div>
                  {audioUrl && (
                    <div className="mt-4">
                      <audio 
                        controls 
                        className="w-full"
                        src={audioUrl}
                      >
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                </Card>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
              <div className="space-y-3">
                  {notes.map((note) => (
                    <Card key={note.id} className="p-4 hover:shadow-md transition-shadow">
                      <p className="text-sm">{note.content}</p>
                    </Card>
                  ))}
                  {notes.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="mb-3 text-2xl">📝</div>
                      <p className="font-medium">Saved notes will appear here</p>
                      <p className="text-sm mt-2">Save a chat message to create a new note, or click Add note above.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 focus:ring-2 focus:ring-primary/20"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddNote();
                    }
                  }}
                />
                <Button onClick={handleAddNote}>Add</Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="hover:bg-accent">Study guide</Button>
                <Button variant="outline" size="sm" className="hover:bg-accent">FAQ</Button>
                <Button variant="outline" size="sm" className="hover:bg-accent">Briefing doc</Button>
                <Button variant="outline" size="sm" className="hover:bg-accent">Timeline</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 