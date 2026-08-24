import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-[#14213D]">Admin Settings</h1>
      <Card><CardHeader><CardTitle>Application</CardTitle></CardHeader><CardContent className="space-y-4">
        <div><Label>Application name</Label><Input defaultValue="GPSR Listing Compliance" /></div>
        <div><Label>Upload limit (MB)</Label><Input defaultValue="10" type="number" /></div>
        <div><Label>Allowed file types</Label><Input defaultValue="PDF, DOC, DOCX, JPG, PNG, WebP" /></div>
        <div><Label>Maintenance mode</Label><div className="flex items-center gap-2"><input type="checkbox" /> <span className="text-sm">Enable maintenance</span></div></div>
        <Button>Save settings</Button>
        <p className="text-xs text-slate-500">Stored in SystemSettings table — key/value JSON. GPSR rules are configurable via GpsrRule table.</p>
      </CardContent></Card>
    </div>
  );
}
