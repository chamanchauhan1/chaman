import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export function ClearAuthData() {
  const { clearAllStoredAuth } = useAuth();
  const [isClearing, setIsClearing] = useState(false);
  const [isCleared, setIsCleared] = useState(false);

  const handleClearAuthData = async () => {
    setIsClearing(true);
    try {
      await clearAllStoredAuth();
      setIsCleared(true);
      // Refresh the page to ensure all auth state is reset
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Clear Authentication Data</CardTitle>
        <CardDescription>
          Click the button below to clear all stored login information and authentication tokens.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This will:
          </p>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>Sign you out of the application</li>
            <li>Clear all stored authentication tokens</li>
            <li>Remove login data from localStorage and sessionStorage</li>
            <li>Clear authentication cookies</li>
          </ul>
          
          <Button
            onClick={handleClearAuthData}
            disabled={isClearing || isCleared}
            variant="destructive"
            className="w-full"
          >
            {isClearing ? "Clearing..." : isCleared ? "Cleared!" : "Clear All Login Data"}
          </Button>
          
          {isCleared && (
            <div className="text-sm text-green-600 text-center">
              ✅ All authentication data has been cleared!
              <br />
              Page will refresh automatically...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}