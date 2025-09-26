"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Volume2 } from "lucide-react"
import Image from "next/image"
import { InstallPrompt } from "@/components/install-prompt"

interface Updates {
  upcomingEvents: string
  weeklyReview: string
  aboutClub: string
  announcements: string
}

interface AdminCredentials {
  username: string
  password: string
}

export default function SchoolUpdatesApp() {
  const [currentView, setCurrentView] = useState("home")
  const [updates, setUpdates] = useState<Updates>({
    upcomingEvents: "Join us for our annual sports day on March 15th!",
    weeklyReview: "This week we had a successful parent-teacher meeting.",
    aboutClub:
      "Join the photography club to capture beautiful moments and improve your skills. We welcome all levels, from beginners to advanced photographers. Together, we will explore creativity and share our passion for photography!",
    announcements: "Stay tuned for important school announcements and updates!",
  })
  const [guestCount, setGuestCount] = useState(0)
  const [comments, setComments] = useState<string[]>([])
  const [loginForm, setLoginForm] = useState({ account: "", password: "", saveLogin: false })
  const [detailView, setDetailView] = useState({ title: "", content: "" })
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>({ username: "admin", password: "admin" })
  const [showWelcomePopup, setShowWelcomePopup] = useState(false)
  const [welcomeText, setWelcomeText] = useState("")
  const [isOnline, setIsOnline] = useState(true)

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedUpdates = localStorage.getItem("schoolUpdates")
    const savedGuestCount = localStorage.getItem("guestCount")
    const savedComments = localStorage.getItem("comments")
    const savedAdminCreds = localStorage.getItem("adminCredentials")
    const savedLoginInfo = localStorage.getItem("savedLoginInfo")

    if (savedUpdates) {
      setUpdates(JSON.parse(savedUpdates))
    }
    if (savedGuestCount) {
      setGuestCount(Number.parseInt(savedGuestCount))
    }
    if (savedComments) {
      setComments(JSON.parse(savedComments))
    }
    if (savedAdminCreds) {
      setAdminCredentials(JSON.parse(savedAdminCreds))
    }
    if (savedLoginInfo) {
      const loginInfo = JSON.parse(savedLoginInfo)
      setLoginForm((prev) => ({
        ...prev,
        account: loginInfo.account || "",
        password: loginInfo.password || "",
        saveLogin: true,
      }))
    }

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    setIsOnline(navigator.onLine)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("schoolUpdates", JSON.stringify(updates))
  }, [updates])

  useEffect(() => {
    localStorage.setItem("guestCount", guestCount.toString())
  }, [guestCount])

  useEffect(() => {
    localStorage.setItem("comments", JSON.stringify(comments))
  }, [comments])

  useEffect(() => {
    localStorage.setItem("adminCredentials", JSON.stringify(adminCredentials))
  }, [adminCredentials])

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    } else {
      alert("Sorry, your browser does not support text-to-speech.")
    }
  }

  const typeWelcomeText = (text: string, callback?: () => void) => {
    let i = 0
    setWelcomeText("")
    const typeChar = () => {
      if (i < text.length) {
        setWelcomeText((prev) => prev + text.charAt(i))
        i++
        setTimeout(typeChar, 70)
      } else if (callback) {
        callback()
      }
    }
    typeChar()
  }

  const showGuestWelcome = () => {
    setShowWelcomePopup(true)
    typeWelcomeText("Welcome Parent", () => {
      setTimeout(() => {
        setShowWelcomePopup(false)
      }, 600)
    })
  }

  const handleGuestAccess = () => {
    const newCount = guestCount + 1
    setGuestCount(newCount)
    setCurrentView("posts")
    showGuestWelcome()
  }

  const handleLogin = () => {
    const { account, password, saveLogin } = loginForm

    if (saveLogin) {
      localStorage.setItem("savedLoginInfo", JSON.stringify({ account, password }))
    } else {
      localStorage.removeItem("savedLoginInfo")
    }

    if (
      (account === "Wilsontkay" && password === "KayP") ||
      (account === adminCredentials.username && password === adminCredentials.password)
    ) {
      alert("Login successful! You can now edit updates.")
      setCurrentView("admin")
    } else {
      alert("Invalid account or password. Please try again.")
    }
  }

  const handleSaveUpdates = (newUpdates: Updates) => {
    setUpdates(newUpdates)
    alert("Updates saved successfully!")
  }

  const handleSubmitComment = (comment: string) => {
    if (comment.trim()) {
      setComments((prev) => [...prev, comment])
    }
  }

  const handleUpdateAdminCredentials = (username: string, password: string) => {
    setAdminCredentials({ username, password })
    alert("Admin credentials updated successfully!")
  }

  const viewDetail = (category: keyof Updates) => {
    const titles = {
      upcomingEvents: "Upcoming Events",
      weeklyReview: "Weekly Review (Vlog)",
      aboutClub: "About the Club",
      announcements: "Announcements",
    }
    setDetailView({ title: titles[category], content: updates[category] })
    setCurrentView("detail")
  }

  const OfflineIndicator = () => {
    if (isOnline) return null

    return (
      <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50">
        <span className="text-sm font-medium">📱 You are currently offline - All data is saved locally</span>
      </div>
    )
  }

  if (currentView === "home") {
    return (
      <div className="min-h-screen bg-gray-100">
        <OfflineIndicator />
        <InstallPrompt />
        <div className="border-[8px] sm:border-[12px] border-[#002147] min-h-screen">
          <div className="border-4 sm:border-8 border-white min-h-[calc(100vh-16px)] sm:min-h-[calc(100vh-24px)]">
            <header className="bg-[#002147] text-white p-3 sm:p-4 text-center border-b-2 border-white">
              <Image
                src="/elim-logo.png"
                alt="Elim Christian College Logo"
                width={70}
                height={70}
                className="mx-auto mb-2 rounded-2xl sm:w-[90px] sm:h-[90px]"
              />
              <h1 className="text-lg sm:text-xl font-bold">ELIM CHRISTIAN COLLEGE, BANKET📚</h1>
              <h2 className="text-xl sm:text-2xl font-serif">Gadziriro Yeramangwana</h2>
            </header>

            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 sm:p-8 text-center">
              <h1 className="text-2xl sm:text-4xl font-bold mb-4 px-2">Welcome to Elim Christian College, BANKET📚</h1>
              <p className="text-base sm:text-lg mb-4 px-2">
                Your webpage to stay updated on school activities, events, and announcements.
              </p>
              <p className="text-base sm:text-lg mb-8 px-2">Join us in nurturing a brighter future for our students!</p>
              <Button
                onClick={() => setCurrentView("login")}
                className="animate-bounce bg-[#002147] hover:bg-[#00112b] text-white px-6 sm:px-8 py-3 text-base sm:text-lg"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentView === "login") {
    return (
      <div className="min-h-screen bg-gray-100">
        <OfflineIndicator />
        <InstallPrompt />
        <div className="border-[8px] sm:border-[12px] border-[#002147] min-h-screen">
          <div className="border-4 sm:border-8 border-white min-h-[calc(100vh-16px)] sm:min-h-[calc(100vh-24px)]">
            <header className="bg-[#002147] text-white p-3 sm:p-4 text-center border-b-2 border-white">
              <Image
                src="/elim-logo.png"
                alt="Elim Christian College Logo"
                width={70}
                height={70}
                className="mx-auto mb-2 rounded-2xl sm:w-[90px] sm:h-[90px]"
              />
              <h1 className="text-lg sm:text-xl font-bold">ELIM CHRISTIAN COLLEGE, BANKET📚</h1>
              <h2 className="text-xl sm:text-2xl font-serif">Gadziriro Yeramangwana</h2>
            </header>

            <div className="flex items-center justify-center min-h-[60vh] p-4 sm:p-8">
              <Card className="w-full max-w-md border-2 border-white">
                <CardHeader>
                  <CardTitle className="text-center">Login</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Account"
                    value={loginForm.account}
                    onChange={(e) => setLoginForm((prev) => ({ ...prev, account: e.target.value }))}
                    onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                    onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="saveLogin"
                      checked={loginForm.saveLogin}
                      onCheckedChange={(checked) =>
                        setLoginForm((prev) => ({ ...prev, saveLogin: checked as boolean }))
                      }
                    />
                    <label htmlFor="saveLogin" className="text-sm">
                      Save login information
                    </label>
                  </div>
                  <div className="space-y-2">
                    <Button onClick={handleLogin} className="w-full">
                      Login
                    </Button>
                    <Button onClick={handleGuestAccess} variant="outline" className="w-full bg-transparent">
                      Continue as Guest
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {showWelcomePopup && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-2xl text-center animate-in zoom-in-50 duration-800 max-w-sm w-full">
              <div className="text-2xl sm:text-4xl text-blue-600 font-serif">{welcomeText}</div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (currentView === "posts") {
    return (
      <PostsView
        updates={updates}
        comments={comments}
        onViewDetail={viewDetail}
        onSubmitComment={handleSubmitComment}
        onBack={() => setCurrentView("login")}
        onReadText={speakText}
        isOnline={isOnline}
      />
    )
  }

  if (currentView === "detail") {
    return (
      <DetailView
        title={detailView.title}
        content={detailView.content}
        onBack={() => setCurrentView("posts")}
        onReadText={speakText}
        isOnline={isOnline}
      />
    )
  }

  if (currentView === "admin") {
    return (
      <AdminView
        updates={updates}
        comments={comments}
        guestCount={guestCount}
        adminCredentials={adminCredentials}
        onSaveUpdates={handleSaveUpdates}
        onUpdateCredentials={handleUpdateAdminCredentials}
        onBack={() => setCurrentView("login")}
        isOnline={isOnline}
      />
    )
  }

  return null
}

function PostsView({
  updates,
  comments,
  onViewDetail,
  onSubmitComment,
  onBack,
  onReadText,
  isOnline,
}: {
  updates: Updates
  comments: string[]
  onViewDetail: (category: keyof Updates) => void
  onSubmitComment: (comment: string) => void
  onBack: () => void
  onReadText: (text: string) => void
  isOnline: boolean
}) {
  const [newComment, setNewComment] = useState("")

  const handleSubmit = () => {
    if (newComment.trim()) {
      onSubmitComment(newComment)
      setNewComment("")
    } else {
      alert("Please enter a comment.")
    }
  }

  const OfflineIndicator = () => {
    if (isOnline) return null

    return (
      <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50">
        <span className="text-xs sm:text-sm font-medium">📱 You are currently offline - All data is saved locally</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <OfflineIndicator />
      <InstallPrompt />
      <div className="border-[8px] sm:border-[12px] border-[#002147] min-h-screen">
        <div className="border-4 sm:border-8 border-white min-h-[calc(100vh-16px)] sm:min-h-[calc(100vh-24px)]">
          <header className="bg-[#002147] text-white p-3 sm:p-4 text-center border-b-2 border-white">
            <Image
              src="/elim-logo.png"
              alt="Elim Christian College Logo"
              width={70}
              height={70}
              className="mx-auto mb-2 rounded-2xl sm:w-[90px] sm:h-[90px]"
            />
            <h1 className="text-lg sm:text-xl font-bold">ELIM CHRISTIAN COLLEGE, BANKET📚</h1>
            <h2 className="text-xl sm:text-2xl font-serif">Gadziriro Yeramangwana</h2>
          </header>

          <div className="p-3 sm:p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <Button onClick={onBack} variant="outline" size="sm">
                Back
              </Button>
              <h2 className="text-xl sm:text-2xl font-bold">Updates</h2>
              <div></div>
            </div>

            <div className="mb-4 sm:mb-6">
              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex-shrink-0 w-72 sm:w-80">
                  <Card
                    className="cursor-pointer hover:bg-blue-50 transition-colors h-full"
                    onClick={() => onViewDetail("upcomingEvents")}
                  >
                    <CardHeader className="pb-2 sm:pb-4">
                      <CardTitle className="flex items-center justify-between text-blue-600 text-base sm:text-lg">
                        Upcoming Events
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            onReadText(updates.upcomingEvents)
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm sm:text-base line-clamp-3">{updates.upcomingEvents}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex-shrink-0 w-72 sm:w-80">
                  <Card
                    className="cursor-pointer hover:bg-blue-50 transition-colors h-full"
                    onClick={() => onViewDetail("weeklyReview")}
                  >
                    <CardHeader className="pb-2 sm:pb-4">
                      <CardTitle className="flex items-center justify-between text-blue-600 text-base sm:text-lg">
                        Weekly Review (Vlog)
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            onReadText(updates.weeklyReview)
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm sm:text-base line-clamp-3">{updates.weeklyReview}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex-shrink-0 w-72 sm:w-80">
                  <Card
                    className="cursor-pointer hover:bg-blue-50 transition-colors h-full"
                    onClick={() => onViewDetail("aboutClub")}
                  >
                    <CardHeader className="pb-2 sm:pb-4">
                      <CardTitle className="flex items-center justify-between text-blue-600 text-base sm:text-lg">
                        About the Club
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            onReadText(updates.aboutClub)
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm sm:text-base line-clamp-3">{updates.aboutClub}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex-shrink-0 w-72 sm:w-80">
                  <Card
                    className="cursor-pointer hover:bg-blue-50 transition-colors h-full"
                    onClick={() => onViewDetail("announcements")}
                  >
                    <CardHeader className="pb-2 sm:pb-4">
                      <CardTitle className="flex items-center justify-between text-blue-600 text-base sm:text-lg">
                        Announcements
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            onReadText(updates.announcements)
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm sm:text-base line-clamp-3">{updates.announcements}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <Card>
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="flex items-center justify-between text-blue-600 text-base sm:text-lg">
                    Your Reviews
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        onReadText(comments.length > 0 ? `Reviews: ${comments.join(". ")}` : "No reviews yet.")
                      }
                      className="h-8 w-8 p-0"
                    >
                      <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 pt-0">
                  <Textarea
                    placeholder="Leave a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="text-sm sm:text-base"
                  />
                  <Button onClick={handleSubmit} size="sm" className="w-full sm:w-auto">
                    Submit
                  </Button>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {comments.map((comment, index) => (
                      <p key={index} className="text-xs sm:text-sm bg-gray-100 p-2 rounded">
                        {comment}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailView({
  title,
  content,
  onBack,
  onReadText,
  isOnline,
}: {
  title: string
  content: string
  onBack: () => void
  onReadText: (text: string) => void
  isOnline: boolean
}) {
  const OfflineIndicator = () => {
    if (isOnline) return null

    return (
      <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50">
        <span className="text-xs sm:text-sm font-medium">📱 You are currently offline - All data is saved locally</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <OfflineIndicator />
      <InstallPrompt />
      <div className="border-[8px] sm:border-[12px] border-[#002147] min-h-screen">
        <div className="border-4 sm:border-8 border-white min-h-[calc(100vh-16px)] sm:min-h-[calc(100vh-24px)]">
          <header className="bg-[#002147] text-white p-3 sm:p-4 text-center border-b-2 border-white">
            <Image
              src="/elim-logo.png"
              alt="Elim Christian College Logo"
              width={70}
              height={70}
              className="mx-auto mb-2 rounded-2xl sm:w-[90px] sm:h-[90px]"
            />
            <h1 className="text-lg sm:text-xl font-bold">ELIM CHRISTIAN COLLEGE, BANKET📚</h1>
            <h2 className="text-xl sm:text-2xl font-serif">Gadziriro Yeramangwana</h2>
          </header>

          <div className="p-3 sm:p-6">
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-2xl">{title}</CardTitle>
                  <Button size="sm" variant="ghost" onClick={() => onReadText(`${title}. ${content}`)}>
                    <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-base sm:text-lg leading-relaxed">{content}</p>
                <div className="mt-4 sm:mt-6">
                  <Button onClick={onBack} size="sm" className="w-full sm:w-auto">
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminView({
  updates,
  comments,
  guestCount,
  adminCredentials,
  onSaveUpdates,
  onUpdateCredentials,
  onBack,
  isOnline,
}: {
  updates: Updates
  comments: string[]
  guestCount: number
  adminCredentials: { username: string; password: string }
  onSaveUpdates: (updates: Updates) => void
  onUpdateCredentials: (username: string, password: string) => void
  onBack: () => void
  isOnline: boolean
}) {
  const [editedUpdates, setEditedUpdates] = useState(updates)
  const [newCredentials, setNewCredentials] = useState({ username: "", password: "" })

  const handleSave = () => {
    onSaveUpdates(editedUpdates)
  }

  const handleCredentialsUpdate = () => {
    if (newCredentials.username.trim() && newCredentials.password.trim()) {
      onUpdateCredentials(newCredentials.username, newCredentials.password)
      setNewCredentials({ username: "", password: "" })
    }
  }

  const OfflineIndicator = () => {
    if (isOnline) return null

    return (
      <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50">
        <span className="text-xs sm:text-sm font-medium">📱 You are currently offline - All data is saved locally</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <OfflineIndicator />
      <InstallPrompt />
      <div className="border-[8px] sm:border-[12px] border-[#002147] min-h-screen">
        <div className="border-4 sm:border-8 border-white min-h-[calc(100vh-16px)] sm:min-h-[calc(100vh-24px)]">
          <header className="bg-[#002147] text-white p-3 sm:p-4 text-center border-b-2 border-white">
            <Image
              src="/elim-logo.png"
              alt="Elim Christian College Logo"
              width={70}
              height={70}
              className="mx-auto mb-2 rounded-2xl sm:w-[90px] sm:h-[90px]"
            />
            <h1 className="text-lg sm:text-xl font-bold">ELIM CHRISTIAN COLLEGE, BANKET📚</h1>
            <h2 className="text-xl sm:text-2xl font-serif">Gadziriro Yeramangwana</h2>
          </header>

          <div className="p-3 sm:p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
              <Button onClick={onBack} variant="outline" size="sm">
                Back
              </Button>
              <h2 className="text-xl sm:text-2xl font-bold">Admin Panel</h2>
              <div className="text-xs sm:text-sm font-medium">Guests visited: {guestCount}</div>
            </div>

            <Tabs defaultValue="edit" className="w-full">
              <TabsList className="grid w-full grid-cols-3 text-xs sm:text-sm">
                <TabsTrigger value="edit" className="px-2">
                  Edit Updates
                </TabsTrigger>
                <TabsTrigger value="reviews" className="px-2">
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="account" className="px-2">
                  Account
                </TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="space-y-3 sm:space-y-4">
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" size="sm">
                  Save Changes
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  <Card>
                    <CardHeader className="pb-2 sm:pb-4">
                      <CardTitle className="text-base sm:text-lg">Upcoming Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={editedUpdates.upcomingEvents}
                        onChange={(e) => setEditedUpdates((prev) => ({ ...prev, upcomingEvents: e.target.value }))}
                        className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2 sm:pb-4">
                      <CardTitle className="text-base sm:text-lg">Weekly Review (Vlog)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={editedUpdates.weeklyReview}
                        onChange={(e) => setEditedUpdates((prev) => ({ ...prev, weeklyReview: e.target.value }))}
                        className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2 sm:pb-4">
                      <CardTitle className="text-base sm:text-lg">About the Club</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={editedUpdates.aboutClub}
                        onChange={(e) => setEditedUpdates((prev) => ({ ...prev, aboutClub: e.target.value }))}
                        className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2 sm:pb-4">
                      <CardTitle className="text-base sm:text-lg">Announcements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={editedUpdates.announcements}
                        onChange={(e) => setEditedUpdates((prev) => ({ ...prev, announcements: e.target.value }))}
                        className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Submitted Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {comments.length > 0 ? (
                        comments.map((comment, index) => (
                          <div key={index} className="p-2 sm:p-3 bg-gray-100 rounded border text-sm sm:text-base">
                            {comment}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm sm:text-base">No reviews submitted yet.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Change Admin Username & Password</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">New Username:</label>
                      <Input
                        type="text"
                        value={newCredentials.username}
                        onChange={(e) => setNewCredentials((prev) => ({ ...prev, username: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">New Password:</label>
                      <Input
                        type="password"
                        value={newCredentials.password}
                        onChange={(e) => setNewCredentials((prev) => ({ ...prev, password: e.target.value }))}
                      />
                    </div>
                    <Button
                      onClick={handleCredentialsUpdate}
                      className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                      size="sm"
                    >
                      Change Credentials
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
