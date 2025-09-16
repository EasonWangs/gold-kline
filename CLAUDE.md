# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production 
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint on TypeScript and JavaScript files
- `npm run lint:fix` - Run ESLint with auto-fix

## Architecture Overview

This is a React 18 + TypeScript application for real-time gold price monitoring with K-line charts. Built with Vite for development and optimized for modern browsers.

### Key Technologies
- **Frontend**: React 18, TypeScript, TradingView Lightweight Charts
- **Styling**: Tailwind CSS with custom gold color palette
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Date Handling**: Day.js
- **Icons**: Lucide React

### Core Components Structure
- `App.tsx` - Main app with currency state management and 30-second price updates
- `GoldChart.tsx` - TradingView chart integration with historical data
- `PriceInfo.tsx` - Real-time price display panel
- `Header.tsx` - Application header
- `CurrencySwitch.tsx` - USD/CNY currency toggle

### API Service Architecture
The `goldApi.ts` service implements a multi-source fallback system:

1. **Primary**: GoldAPI.io with API key from `VITE_GOLDAPI_KEY`
2. **Backup Real-time**: Coinbase free exchange rates API
3. **Backup Historical**: Alpha Vantage with `VITE_ALPHAVANTAGE_KEY`

**Key API Features**:
- Automatic quota detection and fallback switching
- Currency conversion (USD/ounce ↔ CNY/gram using 31.1035 conversion factor)
- Batch historical data fetching with rate limiting
- Error handling for network issues and API limits

### Data Types
- `GoldPrice` - Real-time price data with 24h stats
- `CandlestickData` - OHLCV historical chart data
- Currency support: USD (per ounce) and CNY (per gram)

### Environment Variables
- `VITE_GOLDAPI_KEY` - GoldAPI.io API key (optional, has fallback)
- `VITE_ALPHAVANTAGE_KEY` - Alpha Vantage API key (optional, has fallback)

## Development Notes

### Styling System
Uses Tailwind with custom gold color palette (gold-50 to gold-900) and responsive grid layout.

### State Management
Simple React state with useEffect for 30-second polling intervals that reset on currency changes.

### Error Handling
Comprehensive error handling for API failures, quota exceeded, and network issues with user-friendly fallbacks.