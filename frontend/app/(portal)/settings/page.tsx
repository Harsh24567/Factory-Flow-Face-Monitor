import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure system preferences and integrations.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">API Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Backend URL</span>
                <code className="rounded bg-muted px-2 py-0.5 text-xs text-foreground">
                  http://localhost:8000
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Polling Interval</span>
                <span className="text-xs text-foreground">5 seconds</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">Recognition Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Confidence Threshold</span>
                <span className="text-xs text-foreground">70%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Model</span>
                <span className="text-xs text-foreground">FaceNet v3.2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Auto Register Unknown</span>
                <span className="text-xs text-destructive">Disabled</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
