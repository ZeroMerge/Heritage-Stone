# 🪨 Heritage Stone Studio

**Heritage Stone Studio** is a premium, production-ready brand management platform built for modern agencies and brand designers. It centralizes brand identities, assets, and collaboration into a single, intuitive interface.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E.svg)](https://supabase.com/)

---

## ✨ Features

- **🎯 Brand Document Editor**: 8 specialized sections for Introduction, Strategy, Logos, Typography, Colors, and more.
- **⚡ Debounced Auto-Save**: Never lose a change with built-in persistence to Supabase.
- **🏗️ Sub-brand Inheritance**: Powerful engine to inherit or override brand elements for sub-brands and subsidiaries.
- **🖼️ Asset Management**: Integrated Cloudinary support for high-performance image and asset hosting.
- **💬 Real-time Collaboration**: Dedicated team roles and threaded chat for every project.
- **🚀 Brand Portal**: One-click publishing to a beautiful, public-facing brand guidelines site.
- **🔒 Secure Auth**: Robust user management and access controls powered by Supabase Auth.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 7, TypeScript 5
- **Styling**: Tailwind CSS, Framer Motion (animations), Shadcn UI (components)
- **State Management**: Zustand
- **Backend & DB**: Supabase (PostgreSQL, Auth, Real-time)
- **Infrastructure**: Cloudinary (Asset Hosting), Lucide React (icons)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- NPM or PNPM
- A Supabase Project
- A Cloudinary Account

### 1. Clone the repository
```bash
git clone https://github.com/ZeroMerge/Heritage-Stone.git
cd Heritage-Stone/app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the `app` directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### 4. Run Development Server
```bash
npm run dev
```

---

## 📂 Project Structure

```text
HS/
├── app/                  # Main Frontend Application
│   ├── src/
│   │   ├── components/   # UI & Shared Components
│   │   ├── hooks/        # Custom React Hooks
│   │   ├── lib/          # Core Logic (Inheritance Engine, Supabase)
│   │   ├── pages/        # Route-level Components
│   │   ├── store/        # Zustand State Management
│   │   └── types/        # TypeScript Definitions
├── LICENSE               # MIT License
└── README.md             # This file
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git checkout -b feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Built by ZeroMerge for the Heritage Stone Ecosystem.**
