import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient, Event, User, Participant } from '@prisma/client';

const prisma = new PrismaClient();

type EventWithDetails = Event & {
  owner: User;
  participants: (Participant & {
    user: User;
  })[];
};

/**
 * Type for authenticated user session
 */
export interface AuthenticatedUser {
  id: string;
  email?: string | null;
  name?: string | null;
}

/**
 * Type for authentication result
 */
export interface AuthResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
}

/**
 * Utility to get the current authenticated user from NextAuth session
 * @returns Promise<AuthResult> - Authentication result with user data or error
 */
export async function getAuthenticatedUser(): Promise<AuthResult> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }

    return {
      success: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'Authentication error'
    };
  }
}

/**
 * Middleware function to check authentication for API routes
 * Returns user data if authenticated, or NextResponse with error if not
 */
export async function withAuth(): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const authResult = await getAuthenticatedUser();
  
  if (!authResult.success || !authResult.user) {
    return NextResponse.json(
      { error: authResult.error || 'Not authenticated' }, 
      { status: 401 }
    );
  }

  return { user: authResult.user };
}

/**
 * Check if the authenticated user is the owner of a specific resource
 * @param resourceOwnerId - The ID of the resource owner
 * @param userId - The ID of the current user (optional, will get from session if not provided)
 * @returns Promise<boolean> - True if user is the owner, false otherwise
 */
export async function isOwner(resourceOwnerId: string, userId?: string): Promise<boolean> {
  let currentUserId = userId;
  
  if (!currentUserId) {
    const authResult = await getAuthenticatedUser();
    if (!authResult.success || !authResult.user) {
      return false;
    }
    currentUserId = authResult.user.id;
  }
  
  return currentUserId === resourceOwnerId;
}

/**
 * Middleware to check if user is authenticated and owns a specific event
 * @param eventId - The ID of the event to check ownership for
 * @returns Promise<{ user: AuthenticatedUser; event: EventWithDetails } | NextResponse>
 */
export async function withEventOwnership(eventId: string): Promise<{ user: AuthenticatedUser; event: EventWithDetails } | NextResponse> {
  // First check authentication
  const authCheck = await withAuth();
  if (authCheck instanceof NextResponse) {
    return authCheck; // Return the error response
  }

  const { user } = authCheck;

  try {
    // Check if event exists and get owner info
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        owner: true,
        participants: {
          include: {
            user: true
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' }, 
        { status: 404 }
      );
    }

    // Check ownership
    if (!await isOwner(event.ownerId, user.id)) {
      return NextResponse.json(
        { error: 'Not authorized - you must be the event owner' }, 
        { status: 403 }
      );
    }

    return { user, event };
  } catch (error) {
    console.error('Error checking event ownership:', error);
    return NextResponse.json(
      { error: 'Database error' }, 
      { status: 500 }
    );
  }
}

/**
 * Higher-order function that wraps an API handler with authentication
 * @param handler - The API handler function
 * @returns Wrapped handler with authentication
 */
export function withAuthHandler<T extends any[]>(
  handler: (user: AuthenticatedUser, ...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    const authCheck = await withAuth();
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }
    
    return handler(authCheck.user, ...args);
  };
}

/**
 * Higher-order function that wraps an API handler with event ownership check
 * @param handler - The API handler function
 * @param getEventId - Function to extract event ID from handler arguments
 * @returns Wrapped handler with authentication and ownership check
 */
export function withEventOwnershipHandler<T extends any[]>(
  handler: (user: AuthenticatedUser, event: EventWithDetails, ...args: T) => Promise<NextResponse>,
  getEventId: (...args: T) => string
) {
  return async (...args: T): Promise<NextResponse> => {
    const eventId = getEventId(...args);
    const ownershipCheck = await withEventOwnership(eventId);
    
    if (ownershipCheck instanceof NextResponse) {
      return ownershipCheck;
    }
    
    return handler(ownershipCheck.user, ownershipCheck.event, ...args);
  };
}

// Export prisma instance for use in API routes
export { prisma };