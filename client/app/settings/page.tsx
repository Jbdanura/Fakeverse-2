import { Navbar } from "@/components/navbar"
import { SettingsTabs } from "@/components/settings/settings-tabs"

export default function SettingsPage() {
  const baseUrl = "https://fakeverse-2.onrender.com"
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar baseUrl={baseUrl}/>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
          <SettingsTabs baseUrl={baseUrl}/>
        </div>
      </div>
    </div>
  )
}

