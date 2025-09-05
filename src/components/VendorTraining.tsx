import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { HCaptchaComponent } from '@/components/ui/hcaptcha';
import { 
  BookOpen, 
  CheckCircle, 
  Play, 
  Phone, 
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  content?: string;
  module_order: number;
  is_active: boolean;
}

interface TrainingProgress {
  id: string;
  module_id: string;
  is_completed: boolean;
  completed_at?: string;
}

interface VendorTrainingProps {
  userId: string;
  onComplete: () => void;
  onProgressChange?: (progress: number) => void;
}

const VendorTraining = ({ userId, onComplete, onProgressChange }: VendorTrainingProps) => {
  // Use untyped supabase for tables not present in generated types
  const sb = supabase as any;
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [progress, setProgress] = useState<TrainingProgress[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  const [supportData, setSupportData] = useState({
    phone: '',
    message: ''
  });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCaptchaVerify = (token: string) => setCaptchaToken(token);
  const handleCaptchaError = () => setCaptchaToken(null);

  useEffect(() => {
    loadTrainingData();
  }, [userId]);

  const loadTrainingData = async () => {
    try {
      // Load training modules
      const { data: modulesData, error: modulesError } = await sb
        .from('training_modules')
        .select('*')
        .eq('is_active', true)
        .order('module_order', { ascending: true });

      if (modulesError) throw modulesError;

      // Load user progress
      const { data: progressData, error: progressError } = await sb
        .from('user_training_progress')
        .select('*')
        .eq('user_id', userId);

      if (progressError) throw progressError;

      setModules((modulesData || []) as TrainingModule[]);
      setProgress((progressData || []) as TrainingProgress[]);

      // Find first incomplete module
      const incompleteIndex = modulesData?.findIndex(module => 
        !progressData?.some(p => p.module_id === module.id && p.is_completed)
      ) ?? 0;
      
      setCurrentModuleIndex(incompleteIndex >= 0 ? incompleteIndex : 0);
    } catch (error) {
      console.error('Error loading training data:', error);
      toast({
        title: "Error",
        description: "Failed to load training modules",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markModuleComplete = async (moduleId: string) => {
    try {
      const { error } = await sb
        .from('user_training_progress')
        .upsert({
          user_id: userId,
          module_id: moduleId,
          is_completed: true,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update local progress
      setProgress(prev => {
        const existing = prev.find(p => p.module_id === moduleId);
        if (existing) {
          return prev.map(p => 
            p.module_id === moduleId 
              ? { ...p, is_completed: true, completed_at: new Date().toISOString() }
              : p
          );
        } else {
          return [...prev, {
            id: `temp-${Date.now()}`,
            module_id: moduleId,
            is_completed: true,
            completed_at: new Date().toISOString()
          }];
        }
      });

      toast({
        title: "Module Completed",
        description: "Great job! You've completed this training module."
      });

      // Check if all modules are completed
      const allCompleted = modules.every(module => 
        progress.some(p => p.module_id === module.id && p.is_completed) || 
        module.id === moduleId
      );

      if (allCompleted) {
        const hcaptchaEnabled = import.meta.env.VITE_ENABLE_HCAPTCHA === 'true';
        if (hcaptchaEnabled && !captchaToken) {
          toast({ title: "Verification required", description: "Please complete the captcha verification to finish training.", variant: "destructive" });
          return;
        }

        // Save training completion step
        await supabase
          .from('vendor_application_steps')
          .upsert({
            user_id: userId,
            step_name: 'training_completed',
            is_completed: true,
            completed_at: new Date().toISOString()
          });

        toast({
          title: "Training Completed!",
          description: "You've completed all training modules. You can now access the vendor dashboard once approved."
        });

        onComplete();
      }
    } catch (error) {
      console.error('Error marking module complete:', error);
      toast({
        title: "Error",
        description: "Failed to save progress",
        variant: "destructive"
      });
    }
  };

  const submitSupportRequest = async () => {
    if (!supportData.phone || !supportData.message) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await sb
        .from('support_requests')
        .insert({
          user_id: userId,
          phone_number: supportData.phone,
          message: supportData.message,
          request_type: 'training_help'
        });

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "An ISA agent will contact you shortly for assistance."
      });

      setShowSupportDialog(false);
      setSupportData({ phone: '', message: '' });
    } catch (error) {
      console.error('Error submitting support request:', error);
      toast({
        title: "Error",
        description: "Failed to submit support request",
        variant: "destructive"
      });
    }
  };

  const isModuleCompleted = (moduleId: string) => {
    return progress.some(p => p.module_id === moduleId && p.is_completed);
  };

  const completedCount = modules.filter(module => isModuleCompleted(module.id)).length;
  const progressPercentage = modules.length > 0 ? (completedCount / modules.length) * 100 : 0;

  // Update parent progress
  useEffect(() => {
    onProgressChange?.(progressPercentage);
  }, [progressPercentage, onProgressChange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentModule = modules[currentModuleIndex];

  return (
    <div className="w-full max-w-lg mx-auto space-y-4 p-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-xl">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <span className="text-blue-900 font-bold">Vendor Training</span>
            </div>
            <Dialog open={showSupportDialog} onOpenChange={setShowSupportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-blue-500 text-blue-600 hover:bg-blue-50">
                  <HelpCircle className="w-4 h-4 mr-1" />
                  Help
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Support Call</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+254 XXX XXX XXX"
                      value={supportData.phone}
                      onChange={(e) => setSupportData(prev => ({
                        ...prev,
                        phone: e.target.value
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Describe what you need help with..."
                      value={supportData.message}
                      onChange={(e) => setSupportData(prev => ({
                        ...prev,
                        message: e.target.value
                      }))}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowSupportDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={submitSupportRequest}>
                      Submit Request
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-blue-800">{completedCount} of {modules.length} modules completed</span>
              <span className="font-bold text-blue-900">{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-3 bg-blue-100" />
            <p className="text-sm text-blue-700 font-medium">
              Complete all training modules to access your vendor dashboard once approved.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Module Content */}
      {currentModule && (
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center space-x-3">
                <Play className="w-5 h-5 text-green-600" />
                <span className="font-bold">Module {currentModule.module_order}: {currentModule.title}</span>
              </div>
              <Badge variant={isModuleCompleted(currentModule.id) ? "default" : "secondary"} className="text-xs">
                {isModuleCompleted(currentModule.id) ? "Completed" : "In Progress"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            {currentModule.image_url && (
              <div className="w-full">
                <img 
                  src={currentModule.image_url} 
                  alt={currentModule.title}
                  className="w-full rounded-lg border"
                />
              </div>
            )}
            
            <div className="space-y-3">
              <p className="text-gray-600 text-sm">{currentModule.description}</p>
              {currentModule.content && (
                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: currentModule.content }} />
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentModuleIndex(prev => Math.max(0, prev - 1))}
                disabled={currentModuleIndex === 0}
                className="flex items-center justify-center order-2 sm:order-1"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 order-1 sm:order-2">
                {!isModuleCompleted(currentModule.id) && (
                  <div className="space-y-3">
                    <HCaptchaComponent
                      onVerify={handleCaptchaVerify}
                      onError={handleCaptchaError}
                    />
                    <Button
                      onClick={() => markModuleComplete(currentModule.id)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 flex items-center justify-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Complete
                    </Button>
                  </div>
                )}

                {currentModuleIndex < modules.length - 1 && (
                  <Button
                    onClick={() => setCurrentModuleIndex(prev => prev + 1)}
                    disabled={!isModuleCompleted(currentModule.id)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Module List */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-gray-900">All Training Modules</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {modules.map((module, index) => (
              <Card 
                key={module.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  index === currentModuleIndex ? 'bg-blue-50 border-blue-300 shadow-md' : 'hover:bg-gray-50'
                }`}
                onClick={() => setCurrentModuleIndex(index)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-blue-700">Module {module.module_order}</span>
                    {isModuleCompleted(module.id) && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <h4 className="font-semibold text-base mb-2 text-gray-900">{module.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{module.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Completion Message */}
      {completedCount === modules.length && modules.length > 0 && (
        <Card className="bg-green-50 border-green-200 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-900 mb-2">Training Complete!</h3>
                <p className="text-green-700">
                  Congratulations! You've completed all training modules. Your application will now be reviewed by our admin team.
                </p>
              </div>
              <Button 
                onClick={onComplete}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Continue to Approval
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorTraining;

