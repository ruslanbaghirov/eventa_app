# 🎉 Eventa App

> Event discovery platform - Connecting venues and attendees in Baku

![Status](https://img.shields.io/badge/Status-MVP%2095%25-green)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)

## 🚀 Live Demo

Coming soon (Phase 7 - Deployment)

## ✨ Features

### For Users

- 🔍 Browse upcoming events
- 💚 RSVP system (Interested/Going)
- 📊 Real-time capacity tracking
- 📞 Contact organizers directly
- 🔔 Transparent event updates

### For Venues

- ➕ Create and manage events
- ✏️ Flexible editing (trust-based)
- 📈 Live RSVP analytics
- 👥 Capacity management
- 🚫 Cancellation workflow

### For Admins

- ✅ Event approval system
- ❌ Quality control with reasons
- 🔄 Cancellation management
- 📊 Professional dashboard

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Deployment:** Vercel (planned)
- **Icons:** Lucide React
- **Notifications:** React Hot Toast

## 📖 Getting Started

### Prerequisites

- Node.js 18+
- Supabase account

### Installation

```bash
# Clone repository
git clone https://github.com/ruslanbaghirov/eventa_app.git
cd eventa_app

# Install dependencies
npm install

# Create .env.local
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📊 Project Status

- ✅ Phase 1: Project Setup
- ✅ Phase 2: Event Listing
- ✅ Phase 3: Authentication
- ✅ Phase 4: Venue Dashboard
- ✅ Phase 5: RSVP System
- 🚧 Phase 6: Search & Filters (Next)
- ⬜ Phase 7: Deployment

**Current Progress:** 95% Complete

See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for detailed documentation.

## 🎯 Key Design Decisions

### Trust-Based Edit Model

Venues can edit events anytime. Transparency through "Updated X ago" badges.

### Two-Type RSVP

- **Interested:** Unlimited, shows interest
- **Going:** Respects capacity, confirms attendance

### Admin Approval

- New events require approval
- Cancellations require approval
- Edits don't require approval (trust-based)

## 📁 Project Structure

```
eventa_app/
├── app/                    # Next.js App Router
│   ├── events/            # Public event pages
│   ├── dashboard/         # Venue dashboard
│   ├── admin/             # Admin panel
│   └── lib/               # Utilities
├── components/
│   └── events/            # Reusable components
└── PROJECT_STATUS.md      # Detailed docs
```

## 👨‍💻 Author

**Ruslan Baghirov**  
[@ruslanbaghirov](https://github.com/ruslanbaghirov)

Built with GitHub Copilot as a full-stack learning project.

## 📝 License

MIT License - See [LICENSE](LICENSE) for details

---

**⭐ Star this repo if you find it helpful!**

Built with ❤️ in Baku, Azerbaijan
