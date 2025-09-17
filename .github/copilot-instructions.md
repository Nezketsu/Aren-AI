{
  "project": {
    "name": "TournaMind",
    "tagline": "AI-Powered Tournament OS for Real-World Events",
    "description": "SaaS platform that automates tournament management for any physical event (sports, games, competitions) using AI for scheduling, dispute resolution, and community engagement.",
    "core_principles": [
      "Accessible on low-end devices",
      "Zero-code setup",
      "AI handles real-world chaos",
      "Community-first design"
    ]
  },
  "key_features": {
    "ai_event_architect": {
      "purpose": "Generates optimal schedules considering constraints (weather, resources, time)",
      "inputs": ["Team count", "Venue details", "Equipment", "Local constraints"],
      "outputs": ["Visual schedule", "Volunteer assignments", "PDF rulesheets"]
    },
    "dispute_resolver": {
      "purpose": "Computer vision analysis of media evidence for fair rulings",
      "workflow": [
        "User submits photos/videos via WhatsApp/email",
        "AI detects rule violations (offside, foot faults, etc)",
        "Generates evidence report with visual annotations"
      ]
    },
    "hype_generator": {
      "components": [
        "Multilingual voice commentary (text-to-speech)",
        "AI poster creator",
        "Social media snippet generator"
      ]
    },
    "resource_balancer": {
      "scenarios": ["Weather changes", "Volunteer no-shows", "Equipment failure"],
      "actions": ["Dynamic rescheduling", "Waitlist management", "SMS notifications"]
    }
  },
  "tech_stack": {
    "frontend": "PWA (Progressive Web App)",
    "ai_services": {
      "nlp": "GPT-4o",
      "computer_vision": "YOLOv8",
      "voice": "ElevenLabs API"
    },
    "comms": ["Twilio (SMS)", "WhatsApp Business API"],
    "deployment": "Cloudflare Workers (Edge network)"
  },
  "user_flows": {
    "organizer": [
      "1. Describe event → 2. Receive AI-optimized plan → 3. Customize → 4. Launch",
      "Real-time issue resolution dashboard"
    ],
    "participant": [
      "SMS/WhatsApp notifications",
      "Dispute submission via media",
      "Live leaderboard access"
    ],
    "spectator": [
      "AI-generated commentary",
      "Auto-shared social highlights"
    ]
  },
  "monetization": {
    "free_tier": "Basic scheduling + SMS alerts",
    "pro_tier": "$20/event - AI features + sponsorships",
    "revenue_streams": [
      "Per-event subscriptions",
      "Sponsorship commissions",
      "Local business ads"
    ]
  },
  "target_events": [
    "Village sports tournaments",
    "Local cooking/art competitions",
    "School olympics",
    "Corporate team-building events",
    "Community festival contests"
  ],
  "design_constraints": [
    "Must work offline on 2G networks",
    "Voice-first interface support",
    "QR-code accessible features",
    "Low-data consumption mode"
  ]
}