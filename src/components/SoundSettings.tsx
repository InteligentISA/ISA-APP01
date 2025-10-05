import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Volume2, VolumeX, Play, Settings } from "lucide-react";
import { soundService, SoundConfig } from "@/services/soundService";
import { useToast } from "@/hooks/use-toast";

interface SoundSettingsProps {
  onClose?: () => void;
}

const SoundSettings = ({ onClose }: SoundSettingsProps) => {
  const [config, setConfig] = useState<SoundConfig>(soundService.getConfig());
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setConfig(soundService.getConfig());
  }, []);

  const handleConfigChange = (updates: Partial<SoundConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    soundService.updateConfig(updates);
  };

  const handleVolumeChange = (volume: number[]) => {
    const newVolume = volume[0];
    handleConfigChange({ volume: newVolume });
  };

  const handleSoundToggle = (soundType: keyof SoundConfig['sounds']) => {
    const newSounds = { ...config.sounds, [soundType]: !config.sounds[soundType] };
    handleConfigChange({ sounds: newSounds });
  };

  const testSound = async (soundType: string) => {
    setIsTesting(true);
    try {
      const success = await soundService.testSound(soundType as any);
      if (success) {
        toast({
          title: "Sound Test",
          description: "Sound played successfully!",
        });
      } else {
        toast({
          title: "Sound Test",
          description: "Could not play sound. Check your browser settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Sound Test Failed",
        description: "Unable to play test sound.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const soundOptions = [
    { key: 'like', label: 'Like/Unlike Products', description: 'Play when you like or unlike items' },
    { key: 'addToCart', label: 'Add to Cart', description: 'Play when adding items to cart' },
    { key: 'removeFromCart', label: 'Remove from Cart', description: 'Play when removing items from cart' },
    { key: 'checkout', label: 'Checkout', description: 'Play during checkout process' },
    { key: 'success', label: 'Success Actions', description: 'Play for successful operations' },
    { key: 'error', label: 'Error Actions', description: 'Play for error notifications' },
    { key: 'notification', label: 'General Notifications', description: 'Play for app notifications' },
    { key: 'message', label: 'Messages', description: 'Play for chat messages' },
  ] as const;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Sound Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master Sound Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-medium">Enable Sounds</Label>
            <p className="text-sm text-gray-600">Turn all notification sounds on or off</p>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(enabled) => handleConfigChange({ enabled })}
          />
        </div>

        <Separator />

        {/* Volume Control */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Volume</Label>
            <div className="flex items-center gap-2">
              {config.volume === 0 ? (
                <VolumeX className="w-4 h-4 text-gray-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-gray-600" />
              )}
              <span className="text-sm text-gray-600 w-12 text-right">
                {Math.round(config.volume * 100)}%
              </span>
            </div>
          </div>
          <Slider
            value={[config.volume]}
            onValueChange={handleVolumeChange}
            max={1}
            min={0}
            step={0.1}
            className="w-full"
            disabled={!config.enabled}
          />
        </div>

        <Separator />

        {/* Individual Sound Controls */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Sound Effects</Label>
          <p className="text-sm text-gray-600">Choose which actions should play sounds</p>
          
          <div className="space-y-3">
            {soundOptions.map((option) => (
              <div key={option.key} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">{option.label}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => testSound(option.key)}
                      disabled={!config.enabled || isTesting}
                      className="h-6 w-6 p-0"
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </div>
                <Switch
                  checked={config.sounds[option.key]}
                  onCheckedChange={() => handleSoundToggle(option.key)}
                  disabled={!config.enabled}
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Test All Sounds */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Test Sounds</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => testSound('like')}
              disabled={!config.enabled || isTesting}
            >
              Test Like
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testSound('addToCart')}
              disabled={!config.enabled || isTesting}
            >
              Test Cart
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testSound('success')}
              disabled={!config.enabled || isTesting}
            >
              Test Success
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testSound('notification')}
              disabled={!config.enabled || isTesting}
            >
              Test Notification
            </Button>
          </div>
        </div>

        {/* Browser Compatibility Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> Some browsers may require user interaction before playing sounds. 
            If sounds don't work, try clicking a button or interacting with the page first.
          </p>
        </div>

        {/* Close Button */}
        {onClose && (
          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>
              Done
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SoundSettings;

