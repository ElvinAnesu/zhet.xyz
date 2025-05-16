import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request) {
  // Get the pathname from the request
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/confirm-email',
    '/'
  ];

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get the auth cookie
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // Create a Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: 'zhet-auth-token',
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  });

  try {
    // Check if the user is authenticated
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      // If not authenticated, redirect to the sign-in page
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    // User is authenticated, allow access to the protected route
    return NextResponse.next();
  } catch (error) {
    console.error('Error checking auth session:', error);
    // In case of error, redirect to sign-in page
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all routes except static files, api routes, and public routes
    '/((?!_next/static|_next/image|favicon.ico|api|auth/signin|auth/signup|auth/forgot-password|auth/reset-password|auth/confirm-email).*)',
  ],
}; 