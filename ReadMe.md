# Structure of File for FE


```txt
ONJI/
├── .vscode/                    # VSCode settings
├── app/
│   ├── (auth)/                 # Authentication flow
│   │   ├── login.tsx
│   │   ├── otp.tsx
│   │   ├── otpverify.tsx
│   │   ├── signup.tsx
│   │   ├── _layout.tsx
│   │   └── _layout_new.tsx
│   ├── (retailer)/             # Retailer flow (tabs)
│   │   └── (tabs)/
│   │       ├── _layout.tsx
│   │       ├── _layout_new.tsx
│   │       ├── home.tsx
│   │       ├── orders.tsx
│   │       └── profile.tsx
│   ├── (supplier)/             # Supplier flow (tabs)
│   │   └── (tabs)/
│   │       ├── _layout.tsx
│   │       ├── dashboard.tsx
│   │       ├── inventory.tsx
│   │       └── profile.tsx
│   ├── +not-found.tsx          # 404 page
│   └── _layout.tsx             # Root layout
├── assets/
│   ├── fonts/
│   │   └── SpaceMono-Regular.ttf
│   └── images/
│       ├── adaptive-icon.png
│       ├── favicon.png
│       ├── icon.png
│       ├── partial-react-logo.png
│       ├── react-logo.png
│       ├── react-logo@2x.png
│       ├── react-logo@3x.png
│       ├── onji_logo.jpg
│       ├── otp_screen.png
│       └── splash-icon.png
├── components/
│   ├── auth/                   # Auth-specific components
│   ├── retailer/               # Retailer-specific components
│   ├── supplier/               # Supplier-specific components
│   └── ui/                     # Common UI components
│       ├── IconSymbol.ios.tsx
│       ├── IconSymbol.tsx
│       ├── TabBarBackground.ios.tsx
│       ├── TabBarBackground.tsx
│       ├── Collapsible.tsx
│       ├── ExternalLink.tsx
│       ├── HapticTab.tsx
│       ├── HelloWave.tsx
│       ├── ParallaxScrollView.tsx
│       ├── ThemedText.tsx
│       └── ThemedView.tsx
├── constants/
│   ├── Colors.ts
│   └── Routes.ts               # Route constants
├── contexts/                   # React contexts
│   ├── AuthContext.tsx         # Auth context
│   └── UserContext.tsx         # User type context
├── hooks/
│   ├── useAuth.ts              # Custom auth hook
│   ├── useColorScheme.ts
│   ├── useColorScheme.web.ts
│   └── useThemeColor.ts
├── lib/                        # Utility functions
│   ├── api/                    # API clients
│   │   ├── retailer.ts
│   │   └── supplier.ts
│   └── utils.ts                # Helper functions
├── scripts/
│   └── reset-project.js
├── .gitignore
├── README.md
├── app.json
├── eslint.config.js
├── package-lock.json
├── package.json
└── tsconfig.json
