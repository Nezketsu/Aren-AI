# Tournament Bracket Resolution System

## Overview

This application provides a comprehensive tournament bracket resolution system with the following core features:

- **Two-player score entry system** where both participants can input their match results independently
- **Dispute resolution mechanism** when players disagree on scores
- **Tournament owner/admin panel** for resolving disputes
- **Visual display** showing participant names with their scores
- **Real-time updates** and status tracking

## Features

### 1. Score Entry System
- Players can only enter scores for matches they're participating in
- Each player submits their version of the match score independently
- System automatically compares submissions and flags mismatches
- When both players agree on the score, the match is auto-completed

### 2. Dispute Resolution
- When players submit conflicting scores, the match enters "DISPUTED" status
- Disputed matches are queued for tournament owner review
- Tournament owners can override any score and set the official result
- Players are notified of the final resolution through the interface

### 3. Visual Tournament Bracket
- Clean, responsive bracket layout showing all rounds
- Match status indicators:
  - 🕐 **Pending**: Waiting for participants or setup
  - 👥 **In Progress**: Players can submit scores
  - ⚠️ **Disputed**: Conflicting scores submitted, needs owner resolution
  - 🏆 **Completed**: Final score confirmed and winner declared
- Score display format: "[Player Name] - [Score]"
- Connection lines between rounds (visual bracket structure)

### 4. User Role Management
- **Players**: Can submit scores only for their own matches
- **Tournament Owners**: Can resolve disputes and override any scores
- **Viewers**: Can see confirmed results only (read-only access)

## Demo Data

The application includes sample tournament data accessible at:
- **Sample Tournament ID**: `sample-tournament`
- **Tournament Owner**: `owner@example.com`
- **Sample Players**: 
  - `alice@example.com` (Alice Johnson)
  - `bob@example.com` (Bob Smith) 
  - `charlie@example.com` (Charlie Brown)
  - `diana@example.com` (Diana Prince)

## Usage Instructions

### For Players
1. Navigate to your tournament page
2. Find your match in the bracket
3. Click "Submit Score" when it's time to enter results
4. Enter scores for both players and submit
5. Wait for the other player to submit their score
6. If scores match, the match is automatically completed
7. If scores don't match, wait for tournament owner to resolve the dispute

### For Tournament Owners
1. Navigate to your tournament page
2. Look for matches with "Disputed" status (red badge with warning icon)
3. Review the conflicting score submissions
4. Click the appropriate "Player Wins" button to resolve the dispute
5. You can also override any match result using the "Owner Override" section

### Match Status Flow
```
PENDING → IN_PROGRESS → [DISPUTED] → COMPLETED
                    ↘ (if scores match) ↗
```

## Technical Implementation

### Database Schema
- **Match**: Core match entity with status tracking
- **ScoreEntry**: Individual score submissions by participants
- **Dispute**: Tracks conflicts and resolution status
- **Participant**: Links users to events with approval status

### API Endpoints
- `POST /api/events/[id]/matches/[matchId]/score` - Submit score entry
- `POST /api/events/[id]/matches/[matchId]/result` - Declare winner (owner only)
- `GET /api/events/[id]/bracket` - Fetch complete bracket data

### Real-time Features
- Automatic status updates when scores are submitted
- Visual indicators for different match states
- Responsive design for mobile and desktop viewing

## Security Features
- Role-based access control
- Players can only submit scores for their own matches
- Tournament owners have override capabilities
- Authentication required for all score submissions
- Input validation and sanitization

## Getting Started

1. **Setup Database**: Run `npm run db:push` to create tables
2. **Seed Data**: Run `npm run db:seed` to create sample tournament
3. **Start Server**: Run `npm run dev` to start development server
4. **Access Demo**: Visit `/events/sample-tournament` to see the system in action

## Testing the System

1. **Login as a Player**: Use one of the sample player emails
2. **Submit Score**: Find your match and enter a score
3. **Create Dispute**: Login as the other player and enter a different score
4. **Resolve Dispute**: Login as tournament owner and resolve the conflict
5. **View Results**: See the final bracket with completed matches

The system demonstrates all core functionality including score entry, dispute creation, and resolution workflows.