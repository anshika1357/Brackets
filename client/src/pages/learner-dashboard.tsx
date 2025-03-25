import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuestionBank } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, BookOpenIcon, Calendar, GraduationCap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LearnerDashboard() {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  // Fetch published question banks
  const { data: questionBanks, isLoading, error } = useQuery<QuestionBank[]>({
    queryKey: ["/api/question-banks/published"],
  });

  // Planet visualization data
  const planets = [
    { id: "sun", name: "The Sun", position: { top: "50%", left: "50%" }, size: "w-24 h-24", color: "bg-yellow-500", shadowColor: "shadow-yellow-500/50" },
    { id: "mercury", name: "Mercury", position: { top: "calc(50% - 75px)", left: "50%" }, size: "w-5 h-5", color: "bg-gray-400", shadowColor: "shadow-white/30" },
    { id: "venus", name: "Venus", position: { top: "50%", left: "calc(50% - 110px)" }, size: "w-8 h-8", color: "bg-yellow-600", shadowColor: "shadow-yellow-600/30" },
    { id: "earth", name: "Earth", position: { top: "calc(50% - 150px)", left: "50%" }, size: "w-10 h-10", color: "bg-blue-500", shadowColor: "shadow-blue-500/30" },
    { id: "mars", name: "Mars", position: { top: "50%", left: "calc(50% + 190px)" }, size: "w-7 h-7", color: "bg-red-500", shadowColor: "shadow-red-500/30" },
    { id: "jupiter", name: "Jupiter", position: { top: "calc(50% + 225px)", left: "50%" }, size: "w-16 h-16", color: "bg-yellow-700", shadowColor: "shadow-yellow-700/30" },
  ];

  // Filter question banks based on search and filters
  const filteredQuestionBanks = questionBanks?.filter(bank => {
    const matchesSearch = searchQuery === "" || 
      bank.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bank.organization.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  }) || [];

  const handleSelectPlanet = (planetId: string) => {
    setFilterSubject(planetId);
  };

  return (
    <PageLayout>
      <div className="container mx-auto py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Explore Educational Content</h1>
          <p className="text-muted-foreground">Select a question bank to start learning or explore by category</p>
        </div>

        {/* Planet Explorer */}
        <div className="relative h-[500px] mb-12 border border-border rounded-xl overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center -z-10"
            style={{ 
              backgroundImage: "url('https://images.unsplash.com/photo-1462332420958-a05d1e002413?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')",
              opacity: 0.2
            }}
          />
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm -z-10"></div>
          
          {/* Orbits */}
          <div className="planet-orbit absolute w-[150px] h-[150px] top-1/2 left-1/2 -mt-[75px] -ml-[75px] rounded-full border border-white/10"></div>
          <div className="planet-orbit absolute w-[220px] h-[220px] top-1/2 left-1/2 -mt-[110px] -ml-[110px] rounded-full border border-white/10"></div>
          <div className="planet-orbit absolute w-[300px] h-[300px] top-1/2 left-1/2 -mt-[150px] -ml-[150px] rounded-full border border-white/10"></div>
          <div className="planet-orbit absolute w-[380px] h-[380px] top-1/2 left-1/2 -mt-[190px] -ml-[190px] rounded-full border border-white/10"></div>
          <div className="planet-orbit absolute w-[450px] h-[450px] top-1/2 left-1/2 -mt-[225px] -ml-[225px] rounded-full border border-white/10"></div>
          
          {/* Planets */}
          {planets.map((planet) => (
            <div 
              key={planet.id}
              className="absolute group cursor-pointer"
              style={{ top: planet.position.top, left: planet.position.left }}
              onClick={() => handleSelectPlanet(planet.id)}
            >
              <div className={`${planet.size} rounded-full ${planet.color} hover:shadow-md hover:${planet.shadowColor} transition-all transform -translate-x-1/2 -translate-y-1/2`}></div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {planet.name}
              </div>
            </div>
          ))}
        </div>

        {/* Question Banks Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-semibold">Question Banks</h2>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search question banks..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center">
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList className="w-full md:w-auto grid grid-cols-3">
                <TabsTrigger value="all">All Topics</TabsTrigger>
                <TabsTrigger value="inner">Inner Planets</TabsTrigger>
                <TabsTrigger value="outer">Outer Planets</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex gap-2 w-full md:w-auto">
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Filter by Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="sun">The Sun</SelectItem>
                  <SelectItem value="mercury">Mercury</SelectItem>
                  <SelectItem value="venus">Venus</SelectItem>
                  <SelectItem value="earth">Earth</SelectItem>
                  <SelectItem value="mars">Mars</SelectItem>
                  <SelectItem value="jupiter">Jupiter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Question Banks Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">Failed to load question banks. Please try again.</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </CardContent>
            </Card>
          ) : filteredQuestionBanks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No question banks found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search query</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuestionBanks.map((bank) => (
                <Card key={bank.id} className="overflow-hidden hover:border-primary/50 transition-colors group cursor-pointer" onClick={() => navigate(`/learner/question-bank/${bank.id}`)}>
                  <div className="h-40 bg-gradient-to-br from-primary-900 to-primary-700 relative overflow-hidden">
                    <div className="w-full h-full bg-cover bg-center mix-blend-overlay opacity-60 group-hover:scale-105 transition-transform duration-500"
                      style={{ 
                        backgroundImage: bank.title.toLowerCase().includes('mars') ? 
                          "url('https://images.unsplash.com/photo-1573588028698-f4759befb09a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60')" :
                          "url('https://images.unsplash.com/photo-1614732414444-096e5f1122d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60')"
                      }}
                    ></div>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{bank.title}</h3>
                    
                    <div className="flex gap-2 items-center text-sm text-muted-foreground mb-3">
                      <GraduationCap className="h-4 w-4" />
                      <span>{bank.organization}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className="bg-muted/50">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(bank.createdAt).getFullYear()}
                      </Badge>
                    </div>
                    
                    <Button className="w-full" variant="default">
                      <BookOpenIcon className="h-4 w-4 mr-2" />
                      Start Learning
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
