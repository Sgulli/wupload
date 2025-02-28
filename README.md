# WUpload - Wine Data Enrichment Tool

WUpload is a specialized tool for enriching wine data in CSV format. It uses AI to intelligently fill in missing information about wines based on existing data.

## Features

- **CSV Processing**: Upload your wine database CSV files and get them enriched with detailed wine information
- **AI-Powered Enrichment**: Uses Google's Gemini AI model to generate accurate wine data
- **Multi-language Support**: Generate wine descriptions in Italian, English, French, German, or Spanish
- **CSV Preview**: View your data before processing to understand what will be enriched
- **Field Highlighting**: Clearly see which fields will be filled by the AI
- **Processing Summary**: Get statistics about how many fields were filled after processing
- **Automatic Download**: Processed files are automatically downloaded when complete

## How It Works

1. **Upload Your CSV**: Drag and drop or select your wine database CSV file
2. **Select Language**: Choose the language for the generated wine descriptions
3. **Preview Data**: See which fields will be filled by the AI
4. **Process**: Let our AI sommelier analyze and complete missing information
5. **Download**: Get your enriched CSV file with completed wine details

## Technical Details

This application is built with:

- Next.js 14 with App Router
- Vercel AI SDK for AI integration
- Google Gemini 2.0 Flash model for wine knowledge
- PapaParse for CSV parsing
- Tailwind CSS and shadcn/ui for the interface

## Getting Started

First, install the dependencies:

```bash
npm install
```

Create a `.env` file with your API keys:

```
GOOGLE_API_KEY=your_google_api_key_here
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Example Data

Check the `example` directory for sample CSV files that you can use to test the application.

## Protected Fields

The following fields are protected and will not be modified by the AI:
- Product ID, Handle, SKU, Barcode
- Inventory, Price, Weight, Dimensions
- Status, Category, Sales Channel
- And other non-wine specific metadata

## Deployment

The easiest way to deploy this application is to use the [Vercel Platform](https://vercel.com/new).

## License

This project is licensed under the MIT License.
