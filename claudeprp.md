# TournaMind PRD - Petanque Tournament SaaS

## Project Overview

TournaMind is a specialized SaaS platform for creating and managing petanque tournaments. The platform provides tournament organizers with simple tools to set up competitions, manage registrations, track scores, and engage with the petanque community. Designed specifically for the unique requirements of petanque competitions and the community that plays them.

## Core Value Proposition

- **Petanque-specific tournament formats**: Pre-built templates for common petanque competition styles
- **Simple registration and payment**: Streamlined participant sign-up with integrated payments
- **Live scoring and results**: Real-time score tracking with automatic bracket progression
- **Community engagement**: Connect petanque players and clubs across regions
- **Mobile-optimized**: Works perfectly on smartphones at outdoor venues

## Target Users

### Primary
- Petanque club organizers
- Tournament directors
- Regional petanque associations
- Community center coordinators

### Secondary
- Petanque players (participants)
- Spectators and families
- Local sponsors and vendors

## Technical Architecture

### Frontend Requirements
- **Framework**: React/Next.js for web application
- **Mobile App**: React Native for iOS/Android
- **Styling**: Tailwind CSS for responsive design
- **State Management**: Zustand for client-side state
- **Forms**: React Hook Form with validation

### Backend Requirements
- **API**: Node.js/Express REST API
- **Database**: PostgreSQL for relational data
- **Authentication**: Auth0 or similar service
- **Payments**: Stripe integration for tournament fees
- **Email**: SendGrid for notifications and communications
- **File Storage**: AWS S3 for photos and documents

### Infrastructure
- **Hosting**: Vercel/Netlify for frontend, Railway/Render for backend
- **Database**: Hosted PostgreSQL (Railway, Supabase, or AWS RDS)
- **CDN**: Cloudflare for static assets
- **Monitoring**: Basic error tracking and analytics

## Core Features

### 1. Tournament Creation & Management
- **Tournament Templates**: 
  - Swiss system tournaments
  - Elimination brackets (single/double)
  - Round-robin formats
  - Mixed team competitions
- **Custom Rules**: Configure pointing systems, game length, terrain rules
- **Scheduling**: Automatic match scheduling with time slot management
- **Venue Management**: Multiple terrain tracking and assignments

### 2. Registration & Payments
- **Online Registration**: Simple form-based player/team sign-up
- **Payment Processing**: Integrated fee collection with Stripe
- **Team Formation**: Tools for creating and managing team compositions
- **Waitlist Management**: Handle over-registration automatically
- **Early Bird Pricing**: Tiered pricing based on registration timing

### 3. Live Tournament Management
- **Score Entry**: Mobile-optimized score input by referees or players
- **Live Brackets**: Real-time tournament bracket updates
- **Match Scheduling**: Dynamic rescheduling based on game completion
- **Results Publishing**: Automatic winner announcements and rankings
- **Photo Sharing**: Tournament photo gallery and social features

### 4. Community Features
- **Player Profiles**: Statistics, tournament history, achievements
- **Club Management**: Club registration and member management
- **Event Calendar**: Regional tournament calendar and discovery
- **Leaderboards**: Regional and seasonal player rankings
- **Communications**: Built-in messaging for organizers and participants

### 5. Reporting & Analytics
- **Tournament Reports**: Comprehensive results and statistics
- **Financial Reports**: Registration revenue and expense tracking
- **Player Analytics**: Performance trends and participation history
- **Export Options**: CSV/PDF exports for official records

## Technical Specifications

### Performance Requirements
- **Page Load**: <2 seconds on mobile networks
- **Concurrent Users**: Support 500+ simultaneous users per tournament
- **Data Storage**: Tournament history retained indefinitely
- **Uptime**: 99.5% availability during tournament seasons

### Mobile Optimization
- **Responsive Design**: Works on all screen sizes 320px+
- **Touch Interface**: Large tap targets for outdoor use
- **Offline Capability**: Basic score entry works without internet
- **Battery Efficient**: Optimized for all-day tournament use

## Database Schema

### Core Tables
```sql
-- Organizations/Clubs
tournaments
  id, name, type, format, start_date, end_date, 
  max_participants, entry_fee, status, rules_config

-- Participants
registrations
  id, tournament_id, player_name, email, phone,
  team_name, payment_status, registration_date

-- Competition Structure
matches
  id, tournament_id, round, terrain_number,
  team1_id, team2_id, score1, score2, status,
  scheduled_time, completed_time

-- Results
results
  id, tournament_id, player_id, final_position,
  points_scored, games_won, games_lost
```

### Key Relationships
- Tournaments → Registrations → Teams → Matches
- Matches → Scores → Results → Rankings
- Players → Tournaments (participation history)

## API Design

### Tournament Management
```
POST /api/tournaments
GET /api/tournaments/{id}
PUT /api/tournaments/{id}
DELETE /api/tournaments/{id}
POST /api/tournaments/{id}/publish
```

### Registration
```
POST /api/tournaments/{id}/register
GET /api/tournaments/{id}/registrations
PUT /api/registrations/{id}
POST /api/registrations/{id}/payment
```

### Live Tournament
```
POST /api/matches/{id}/score
GET /api/tournaments/{id}/bracket
GET /api/tournaments/{id}/live
PUT /api/matches/{id}/reschedule
```

## Development Phases

### Phase 1: Core Platform (6-8 weeks)
- User authentication and organization accounts
- Basic tournament creation with common formats
- Registration forms and payment processing
- Simple bracket generation and display

### Phase 2: Live Tournament Features (4-6 weeks)
- Score entry interface (mobile-optimized)
- Real-time bracket updates
- Match scheduling and management
- Basic reporting and results export

### Phase 3: Community Features (4-6 weeks)
- Player profiles and statistics
- Tournament discovery and calendar
- Photo sharing and social features
- Club management tools

### Phase 4: Advanced Features (3-4 weeks)
- Advanced tournament formats
- Comprehensive analytics dashboard
- Email automation and notifications
- Mobile app (if needed)

## Monetization Strategy

### Pricing Tiers
- **Free**: Up to 16 participants, basic features
- **Club ($29/month)**: Up to 64 participants, advanced features
- **Association ($99/month)**: Unlimited participants, multi-tournament management
- **Enterprise**: Custom pricing for large organizations

### Revenue Streams
- Monthly/annual subscription fees
- Transaction fees on payment processing (small percentage)
- Premium features (advanced analytics, custom branding)

## Success Metrics

### Product KPIs
- **Tournaments Created**: 100 tournaments in first 6 months
- **Active Organizers**: 50 paying customers by month 12
- **Tournament Completion Rate**: 95% of started tournaments complete
- **User Satisfaction**: 4.5+ rating from organizers

### Technical KPIs
- **System Uptime**: 99.5% availability
- **Page Load Speed**: <2s average load time
- **Mobile Usage**: 80%+ of score entries on mobile
- **Payment Success**: 98%+ successful payment processing

## Risk Assessment

### Technical Risks
- **Peak Load**: Multiple simultaneous tournaments overwhelming system
- **Payment Issues**: Failed payment processing disrupting registrations
- **Mobile Performance**: Slow performance on older devices outdoors
- **Data Loss**: Tournament data corruption or loss

### Business Risks
- **Market Size**: Limited petanque community size
- **Seasonal Usage**: High tournament season dependency
- **Competition**: Existing general sports tournament platforms
- **Adoption**: Resistance from traditional paper-based organizers

### Mitigation Strategies
- Implement robust load testing and auto-scaling
- Multiple payment provider options and retry logic
- Comprehensive mobile testing in outdoor conditions
- Regular automated backups and data recovery procedures
- Focus on petanque-specific features that general platforms lack

## Development Guidelines for Claude Code

### Project Structure
```
src/
├── components/
│   ├── tournament/     # Tournament-specific components
│   ├── registration/   # Registration flow components
│   ├── scoring/        # Live scoring interface
│   ├── common/         # Shared UI components
│   └── layout/         # Page layouts and navigation
├── pages/
│   ├── tournaments/    # Tournament management pages
│   ├── registration/   # Registration pages
│   ├── live/          # Live tournament pages
│   └── dashboard/      # Organization dashboard
├── services/
│   ├── api/           # API client functions
│   ├── auth/          # Authentication logic
│   └── payments/      # Payment processing
├── hooks/             # Custom React hooks
├── utils/             # Helper functions
├── stores/            # State management
└── types/             # TypeScript definitions
```

### Key Implementation Priorities
1. Tournament creation and basic bracket generation
2. Registration flow with payment integration
3. Mobile-optimized scoring interface
4. Real-time bracket updates
5. User authentication and organization management
6. Reporting and data export features

### Technology Choices
- **Frontend**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS for rapid development
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js or Auth0
- **Payments**: Stripe with webhook handling
- **Deployment**: Vercel for frontend, Railway for backend

This PRD focuses specifically on petanque tournaments as a SaaS product, removing AI features and emphasizing the practical needs of tournament organizers in the petanque community.