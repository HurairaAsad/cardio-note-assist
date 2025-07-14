import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface ApiKeyManagerProps {
  onApiKeySet: (apiKey: string) => void;
}

export const ApiKeyManager = ({ onApiKeySet }: ApiKeyManagerProps) => {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [hasStoredKey, setHasStoredKey] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('openai_api_key');
    if (storedKey) {
      setHasStoredKey(true);
      setApiKey(storedKey);
      onApiKeySet(storedKey);
    }
  }, [onApiKeySet]);

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      toast.error("Please enter a valid OpenAI API key (starts with 'sk-')");
      return;
    }

    localStorage.setItem('openai_api_key', apiKey);
    setHasStoredKey(true);
    onApiKeySet(apiKey);
    toast.success("API key saved successfully");
  };

  const handleRemoveKey = () => {
    localStorage.removeItem('openai_api_key');
    setApiKey("");
    setHasStoredKey(false);
    onApiKeySet("");
    toast.success("API key removed");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          OpenAI API Configuration
        </CardTitle>
        <CardDescription>
          Enter your OpenAI API key to enable AI-powered clinical note generation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">OpenAI API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="api-key"
                  type={showKey ? "text" : "password"}
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <Button onClick={handleSaveKey} disabled={!apiKey.trim()}>
                Save
              </Button>
            </div>
          </div>
          
          {hasStoredKey && (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm text-green-800">
                ✓ API key is configured and ready to use
              </div>
              <Button variant="outline" size="sm" onClick={handleRemoveKey}>
                Remove Key
              </Button>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p>Your API key is stored locally in your browser and never sent to our servers.</p>
            <p>Get your API key from: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Platform</a></p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};