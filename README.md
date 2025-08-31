# Vristo E-commerce Platform

A modern e-commerce platform built with Next.js, TypeScript, and Tailwind CSS.

## Features

### Current Status

The platform currently has a simplified structure without type-based conditional rendering to ensure database compatibility.

#### Shop and Product System

- **Shop Pages** (`app/shops/[id]/page.tsx`): Display shop information with a default content component
- **Product Pages** (`app/products/[id]/product-page.tsx`): Show product details with a default content component
- **Categories** (`components/home-categories.tsx`): Display product categories with language support
- **Special Offers** (`components/special-offers.tsx`): Show discounted products

#### Implementation Notes

1. **Shop Pages**: Currently show a default shop content component
2. **Product Pages**: Display products with a default product header
3. **Database Integration**: Uses Supabase for data fetching
4. **Multi-language Support**: Arabic, English, and Hebrew support in categories

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

2. Set up your environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── shops/[id]/          # Shop detail pages
│   ├── products/[id]/       # Product detail pages
│   └── ...
├── components/               # Reusable UI components
│   ├── home-categories.tsx  # Category display component
│   ├── special-offers.tsx   # Special offers component
│   └── ...
├── lib/
│   ├── type.ts             # Type definitions
│   └── ...
└── ...
```

## Future Enhancements

The platform is designed to support type-based conditional rendering in the future. When ready to implement:

1. Add `type` field to database tables for shops and products
2. Implement type-specific content components
3. Add type checking logic to render appropriate content

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
