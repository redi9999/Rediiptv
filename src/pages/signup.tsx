import type React from "react";
import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { fine } from "@/lib/fine";
import { auth, database } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, set } from "firebase/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.username) {
      newErrors.username = "Username is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const user = userCredential.user;
      
      // Update profile with username
      await updateProfile(user, {
        displayName: formData.username
      });
      
      // Save user data to Firebase Realtime Database
      await set(ref(database, `users/${user.uid}`), {
        email: formData.email,
        username: formData.username,
        createdAt: Date.now()
      });
      
      // Also sign up with Fine
      await fine.auth.signUp.email(
        {
          email: formData.email,
          password: formData.password,
          name: formData.username,
          callbackURL: "/",
        },
        {
          onSuccess: () => {
            toast({
              title: "Account created",
              description: "Your account has been created successfully.",
            });
            navigate("/chat");
          },
          onError: (ctx) => {
            toast({
              title: "Error",
              description: ctx.error.message,
              variant: "destructive",
            });
          },
        }
      );
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is already logged in
  const { isPending, data } = fine.auth.useSession();
  if (!isPending && data) return <Navigate to='/chat' />;

  return (
    <div className='container mx-auto flex h-screen items-center justify-center py-10'>
      <Card className='mx-auto w-full max-w-md'>
        <CardHeader>
          <CardTitle className='text-2xl'>Create an account</CardTitle>
          <CardDescription>Enter your details below to create your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='username'>Username</Label>
              <Input
                id='username'
                name='username'
                placeholder='johndoe'
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
                aria-invalid={!!errors.username}
              />
              {errors.username && <p className='text-sm text-destructive'>{errors.username}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                name='email'
                type='email'
                placeholder='john@example.com'
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className='text-sm text-destructive'>{errors.email}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                name='password'
                type='password'
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                aria-invalid={!!errors.password}
              />
              {errors.password && <p className='text-sm text-destructive'>{errors.password}</p>}
            </div>
          </CardContent>

          <CardFooter className='flex flex-col space-y-4'>
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Creating account...
                </>
              ) : (
                "Sign up"
              )}
            </Button>

            <p className='text-center text-sm text-muted-foreground'>
              Already have an account?{" "}
              <Link to='/login' className='text-primary underline underline-offset-4 hover:text-primary/90'>
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}