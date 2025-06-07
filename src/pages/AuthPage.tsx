
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Mail, Lock, User } from 'lucide-react';

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      console.log('User is authenticated, redirecting to home');
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('Submitting login form...');

    const { error } = await signIn(loginEmail, loginPassword);

    if (error) {
      let errorMessage = error.message;
      
      if (error.message.includes('Email not confirmed')) {
        errorMessage = "Please check your email and click the confirmation link before signing in.";
      } else if (error.message.includes('Invalid login credentials')) {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      navigate('/');
    }

    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupEmail || !signupPassword) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    if (signupPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('Submitting signup form...');

    const { error } = await signUp(signupEmail, signupPassword, username, displayName);

    if (error) {
      let errorMessage = error.message;
      
      if (error.message.includes('already registered')) {
        errorMessage = "This email is already registered. Please try logging in instead.";
      }
      
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome to MusicAI!",
        description: "Please check your email to verify your account before signing in.",
      });
      // Clear the form
      setSignupEmail('');
      setSignupPassword('');
      setUsername('');
      setDisplayName('');
    }

    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    console.log('Attempting Google signin...');
    
    const { error } = await signInWithGoogle();
    
    if (error) {
      let errorMessage = error.message;
      
      if (error.message.includes('provider is not enabled')) {
        errorMessage = "Google authentication is not properly configured. Please contact support or try email/password login.";
      }
      
      toast({
        title: "Google Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="h-8 w-8 text-purple-500" />
            <CardTitle className="text-2xl font-bold text-white">MusicAI</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Sign in to access your music library and AI-powered features
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-700">
              <TabsTrigger value="login" className="text-gray-300">Login</TabsTrigger>
              <TabsTrigger value="signup" className="text-gray-300">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4 mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-800 px-2 text-gray-400">Or continue with</span>
                </div>
              </div>
              
              <Button 
                onClick={handleGoogleSignIn}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={isLoading}
              >
                Continue with Google
              </Button>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4 mt-6">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Username (optional)"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Display Name (optional)"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="Password (min 6 characters)"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-800 px-2 text-gray-400">Or continue with</span>
                </div>
              </div>
              
              <Button 
                onClick={handleGoogleSignIn}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={isLoading}
              >
                Continue with Google
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
