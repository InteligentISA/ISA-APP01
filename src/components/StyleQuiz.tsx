import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Star, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Trophy,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LoyaltyService } from "@/services/loyaltyService";

interface StyleQuizProps {
  user: any;
  onComplete?: () => void;
}

interface QuizQuestion {
  id: string;
  question_text: string;
  question_order: number;
  options: Array<{
    text: string;
    value: string;
  }>;
}

const StyleQuiz = ({ user, onComplete }: StyleQuizProps) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      loadQuizQuestions();
    }
  }, [user]);

  const loadQuizQuestions = async () => {
    try {
      // Get user's gender from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('gender')
        .eq('id', user.id)
        .single();

      const gender = profile?.gender || 'male'; // Default to male if not set

      // Load questions for the user's gender
      const questionsData = await LoyaltyService.getQuizQuestions(gender);
      setQuestions(questionsData as unknown as QuizQuestion[]);
    } catch (error) {
      console.error('Error loading quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, option: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast({
        title: "Incomplete Quiz",
        description: "Please answer all questions before submitting.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      // Check if user has already completed the quiz
      const hasCompleted = await LoyaltyService.hasCompletedQuiz(user.id);
      
      if (hasCompleted) {
        toast({
          title: "Quiz Already Completed",
          description: "You have already completed the style quiz and earned your points.",
          variant: "destructive"
        });
        setSubmitting(false);
        return;
      }

      // Save quiz responses
      const responses = Object.entries(answers).map(([questionId, option]) => ({
        user_id: user.id,
        question_id: questionId,
        selected_option: option
      }));

      await LoyaltyService.saveQuizResponses(user.id, responses);

      // Award points for quiz completion
      const pointsToAward = await LoyaltyService.awardQuizPoints(user.id);

      setPointsAwarded(pointsToAward);
      setShowCompletionDialog(true);
      
      if (onComplete) {
        onComplete();
      }

      toast({
        title: "Quiz Completed!",
        description: `You've earned ${pointsToAward} points for completing the style quiz.`
      });

    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="text-gray-500">No quiz questions available at the moment.</div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = answers[currentQuestion?.id];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple-800">
            <Sparkles className="w-6 h-6" />
            <span>ISA Style Quiz</span>
            <Badge className="bg-purple-500 text-white">
              {questions.length} Questions
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-purple-700">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-purple-600">
              Help us understand your style preferences to provide better recommendations and earn points!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {currentQuestion?.question_text}
              </h3>
            </div>

            <div className="space-y-3">
              {currentQuestion?.options.map((option, index) => (
                <Button
                  key={index}
                  variant={isAnswered?.value === option.value ? "default" : "outline"}
                  className={`w-full justify-start p-4 h-auto text-left ${
                    isAnswered?.value === option.value 
                      ? 'bg-purple-500 text-white border-purple-500' 
                      : 'hover:bg-purple-50 border-gray-200'
                  }`}
                  onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      isAnswered?.value === option.value 
                        ? 'bg-white border-white' 
                        : 'border-gray-300'
                    }`}>
                      {isAnswered?.value === option.value && (
                        <div className="w-2 h-2 bg-purple-500 rounded-full m-0.5"></div>
                      )}
                    </div>
                    <span className="text-sm">{option.text}</span>
                  </div>
                </Button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              {isLastQuestion ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!isAnswered || submitting}
                  className="bg-purple-500 hover:bg-purple-600 text-white flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Complete Quiz</span>
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!isAnswered}
                  className="bg-purple-500 hover:bg-purple-600 text-white flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center space-x-2 text-green-600">
              <Trophy className="w-6 h-6" />
              <span>Quiz Completed!</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Congratulations!
              </h3>
              <p className="text-gray-600 mb-4">
                You've completed the ISA Style Quiz and earned points!
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2">
                  <Star className="w-5 h-5 text-orange-600" />
                  <span className="text-lg font-bold text-orange-600">
                    +{pointsAwarded} Points Awarded
                  </span>
                </div>
                <p className="text-sm text-orange-700 mt-1">
                  Your points have been added to your wallet
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setShowCompletionDialog(false)}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StyleQuiz;


